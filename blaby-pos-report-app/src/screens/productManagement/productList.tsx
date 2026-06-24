import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import LoadingBox from '../../components/skeleton/Loading';
import Empty from '../../components/alertBox/empty';
import AlertBox from '../../components/alertBox';
import BranchPickerModal from '../../components/branchPicker';
import CategoryPickerModal from '../../components/categoryPicker';
import MultiBranchResultModal, {
  BranchOutcome,
} from '../../components/multiBranchResult';
import {GET, POST, DELETE} from '../../utils/apiCalls';
import API from '../../config/api';

const ALL_CATEGORIES_OPTION = {id: 'all', category: 'All Categories'};

const getErrorMessage = (message: any, fallback: string = 'Something went wrong'): string => {
  if (!message) return fallback;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'object') {
    return message.message || JSON.stringify(message);
  }
  return fallback;
};

function ProductListScreen(props: any) {
  const Dropdown = useSelector((state: any) => state?.Dropdown?.branches);
  const authUser = useSelector((state: any) => state?.Auth?.user);

  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branch, setBranch] = useState<any>(
    Dropdown?.length ? Dropdown[0] : null,
  );
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Category filter
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(ALL_CATEGORIES_OPTION);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Multi-select / bulk-delete
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Multi-branch delete result
  const [resultOpen, setResultOpen] = useState(false);
  const [resultBranches, setResultBranches] = useState<BranchOutcome[]>([]);
  const [resultSummary, setResultSummary] = useState('');

  useEffect(() => {
    if (branch?.companyId) {
      getProducts();
      getCategories();
      // Reset filters when branch changes
      setSelectedCategory(ALL_CATEGORIES_OPTION);
      exitSelectionMode();
    } else {
      setLoading(false);
    }
  }, [branch]);

  useEffect(() => {
    let result = products;

    // Filter by category first
    if (selectedCategory && selectedCategory.id !== 'all') {
      result = result.filter((p: any) => {
        const catId =
          p?.product_category ??
          p?.productCategory?.id ??
          p?.category?.id ??
          null;
        return Number(catId) === Number(selectedCategory.id);
      });
    }

    // Then filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p: any) => {
        const name = p?.idescription || p?.productName || '';
        return name.toLowerCase().includes(q);
      });
    }

    setFilteredProducts(result);
  }, [searchQuery, products, selectedCategory]);

  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      if (!loading && branch?.companyId && now - lastFetchTime > 2000) {
        getProducts();
      }
    }, [branch, loading, lastFetchTime]),
  );

  const getProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${API.PRODUCT_MASTER_LIST}?branchId=${branch?.companyId}`;
      const response: any = await GET(url);

      if (response?.success) {
        setProducts(response?.data || []);
        setLastFetchTime(Date.now());
      } else {
        setError(response?.message);
      }
    } catch (err) {
      setError('Oops. Something went wrong');
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  const getCategories = async () => {
    try {
      const url = `${API.CATEGORIES_LIST}?branchId=${branch?.companyId}`;
      const response: any = await GET(url);
      if (response?.success) {
        setCategories(response?.data || []);
      }
    } catch (err) {
      // Non-fatal — filter still works without categories
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    getProducts();
    getCategories();
  };

  const handleEdit = (product: any) => {
    props.navigation.navigate('AddProduct', {
      branch: branch,
      product: {
        id: product.id,
        productName: product.idescription || product.productName,
        category: product.productCategory || product.category,
        sp_price: product.sp_price,
        costprice: product.costprice,
        stock: product.stock,
      },
    });
  };

  // ---- Selection mode helpers ----
  const enterSelectionMode = (initialId?: number) => {
    setSelectionMode(true);
    setSelectedIds(initialId ? [initialId] : []);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const toggleSelected = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const selectAllVisible = () => {
    setSelectedIds(filteredProducts.map((p: any) => Number(p.id)));
  };

  // ---- Delete actions ----
  const confirmSingleDelete = (product: any) => {
    const name = product?.idescription || product?.productName || 'this product';
    Alert.alert(
      'Delete product',
      `Delete "${name}" — from this branch only, or from every branch?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'This branch only',
          onPress: () => doSingleDelete(product),
        },
        {
          text: 'All branches',
          style: 'destructive',
          onPress: () => doMultiBranchDelete(product),
        },
      ],
    );
  };

  const doSingleDelete = async (product: any) => {
    try {
      setDeleting(true);
      const url = `${API.PRODUCT_DELETE}${product.id}?branchId=${branch?.companyId}`;
      const response: any = await DELETE(url);
      if (response?.success) {
        setProducts(prev => prev.filter((p: any) => Number(p.id) !== Number(product.id)));
        Alert.alert('Deleted', response?.message || 'Product deleted');
      } else {
        Alert.alert('Error', getErrorMessage(response?.message, 'Could not delete product'));
      }
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err?.message, 'Could not delete product'));
    } finally {
      setDeleting(false);
    }
  };

  const doMultiBranchDelete = async (product: any) => {
    const matchByName = product?.idescription || product?.productName || '';
    if (!matchByName) {
      Alert.alert('Error', 'Could not determine product name to match by.');
      return;
    }
    try {
      setDeleting(true);
      const response: any = await POST(API.PRODUCT_MULTI_BRANCH_DELETE, {
        matchByName,
      });
      const branchesRes: BranchOutcome[] = response?.branches || [];
      setResultBranches(branchesRes);
      setResultSummary(response?.message || '');
      setResultOpen(true);
      // Remove from local list if the current branch was one of the successes
      const deletedHere = branchesRes.some(
        (b) =>
          b.success && Number(b.branchId) === Number(branch?.companyId),
      );
      if (deletedHere) {
        setProducts(prev =>
          prev.filter(
            (p: any) =>
              (p?.idescription || '').trim().toLowerCase() !==
              matchByName.trim().toLowerCase(),
          ),
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Error',
        getErrorMessage(err?.message, 'Multi-branch delete failed'),
      );
    } finally {
      setDeleting(false);
    }
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      'Delete products',
      `Delete ${selectedIds.length} selected product(s) — from this branch only, or from every branch?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'This branch only',
          onPress: doBulkDelete,
        },
        {
          text: 'All branches',
          style: 'destructive',
          onPress: doMultiBranchBulkDelete,
        },
      ],
    );
  };

  const doBulkDelete = async () => {
    try {
      setDeleting(true);
      const url = `${API.PRODUCT_BULK_DELETE}?branchId=${branch?.companyId}`;
      const response: any = await POST(url, {ids: selectedIds});
      if (response?.success) {
        const deleted: number[] = response?.deleted_ids || selectedIds;
        setProducts(prev =>
          prev.filter((p: any) => !deleted.map(Number).includes(Number(p.id))),
        );
        Alert.alert(
          'Deleted',
          response?.message || `${deleted.length} product(s) deleted`,
        );
        exitSelectionMode();
      } else {
        Alert.alert('Error', getErrorMessage(response?.message, 'Bulk delete failed'));
      }
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err?.message, 'Bulk delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  // Multi-branch bulk delete — ONE round-trip. Send all selected product
  // names; server fans out per branch and returns aggregated counts.
  const doMultiBranchBulkDelete = async () => {
    try {
      setDeleting(true);
      const selected = products.filter((p: any) =>
        selectedIds.includes(Number(p.id)),
      );
      const names = selected
        .map(
          (p: any) =>
            (p?.idescription || p?.productName || '').toString().trim(),
        )
        .filter((s: string) => s.length > 0);

      if (names.length === 0) {
        Alert.alert(
          'Error',
          'Could not read product names from the selection.',
        );
        return;
      }

      const response: any = await POST(
        API.PRODUCT_MULTI_BRANCH_DELETE_BULK,
        {names},
      );
      const branchesRes: BranchOutcome[] = response?.branches || [];

      setResultBranches(branchesRes);
      setResultSummary(
        response?.message ||
          `${names.length} product(s) processed across ${branchesRes.length} branch(es)`,
      );
      setResultOpen(true);

      // Drop deleted products from the current branch's list visually
      const lowerNames = names.map((n: string) => n.toLowerCase());
      setProducts(prev =>
        prev.filter(
          (p: any) =>
            !lowerNames.includes(
              ((p?.idescription || p?.productName || '') as string)
                .toLowerCase()
                .trim(),
            ),
        ),
      );
      exitSelectionMode();
    } catch (err: any) {
      Alert.alert(
        'Error',
        getErrorMessage(err?.message, 'Multi-branch bulk delete failed'),
      );
    } finally {
      setDeleting(false);
    }
  };

  // ---- Renderers ----
  const renderProductItem = ({item}: any) => {
    const productName = item?.idescription || item?.productName || 'Unnamed Product';
    const categoryObj = item?.productCategory || item?.category;

    let categoryName = 'No Category';
    if (typeof categoryObj === 'object' && categoryObj !== null) {
      categoryName =
        categoryObj?.category || categoryObj?.categoryName || categoryObj?.name || 'No Category';
    } else if (typeof categoryObj === 'string') {
      categoryName = categoryObj;
    } else if (item?.product_category || item?.categoryId) {
      categoryName = `Category ID: ${item?.product_category || item?.categoryId}`;
    }

    const sellingPrice = item?.sp_price || item?.price || item?.rate || 0;
    const formattedPrice = `₹${parseFloat(sellingPrice).toFixed(2)}`;

    const id = Number(item?.id);
    const isSelected = selectedIds.includes(id);

    const onPressRow = () => {
      if (selectionMode) {
        toggleSelected(id);
      }
    };

    const onLongPressRow = () => {
      if (!selectionMode) {
        enterSelectionMode(id);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={selectionMode ? 0.7 : 1}
        onPress={onPressRow}
        onLongPress={onLongPressRow}
        style={[styles.productItem, isSelected && styles.productItemSelected]}>
        {selectionMode ? (
          <View style={styles.checkbox}>
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={22}
              color={isSelected ? COLOR.PRIMARY : COLOR.GREY2}
            />
          </View>
        ) : null}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.productCategory}>{categoryName}</Text>
          <Text style={styles.productPrice}>{formattedPrice}</Text>
        </View>
        {!selectionMode ? (
          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEdit(item)}>
              <Ionicons name="create-outline" size={20} color={COLOR.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => confirmSingleDelete(item)}>
              <Ionicons name="trash-outline" size={20} color={'#D32F2F'} />
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  // Build selectable categories list with the synthetic 'All' entry on top
  const categoryOptions = [ALL_CATEGORIES_OPTION, ...categories];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />

      {loading ? (
        <LoadingBox />
      ) : (
        <>
          {/* Selection-mode toolbar replaces normal header actions */}
          {selectionMode ? (
            <View style={styles.selectionBar}>
              <TouchableOpacity onPress={exitSelectionMode} style={styles.selectionBarBtn}>
                <Ionicons name="close" size={22} color={COLOR.GREY1} />
              </TouchableOpacity>
              <Text style={styles.selectionBarTitle}>{selectedIds.length} selected</Text>
              <TouchableOpacity
                onPress={selectAllVisible}
                style={styles.selectionBarBtn}>
                <Text style={styles.selectionBarLink}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmBulkDelete}
                disabled={selectedIds.length === 0 || deleting}
                style={[
                  styles.selectionBarDelete,
                  (selectedIds.length === 0 || deleting) && {opacity: 0.4},
                ]}>
                <Ionicons name="trash" size={18} color={'#fff'} />
                <Text style={styles.selectionBarDeleteText}>
                  Delete{selectedIds.length ? ` (${selectedIds.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.header}>
            {/* Branch selector */}
            <TouchableOpacity
              style={styles.branchSelector}
              onPress={() => setBranchModalOpen(true)}
              disabled={selectionMode}>
              <Ionicons name="business-outline" size={20} color={COLOR.PRIMARY} />
              <Text style={styles.branchText}>
                {branch ? branch.bname : 'Select Branch'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLOR.GREY2} />
            </TouchableOpacity>

            {!branch?.companyId && (
              <View style={styles.warningBox}>
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color={COLOR.WARNING || '#FFA500'}
                />
                <Text style={styles.warningText}>
                  Please select a branch to view products
                </Text>
              </View>
            )}

            {/* Category filter */}
            {branch?.companyId ? (
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setCategoryModalOpen(true)}>
                <Ionicons name="pricetag-outline" size={18} color={COLOR.PRIMARY} />
                <Text style={styles.categoryText} numberOfLines={1}>
                  {selectedCategory?.category || 'All Categories'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLOR.GREY2} />
              </TouchableOpacity>
            ) : null}

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={COLOR.GREY2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor={COLOR.GREY2}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLOR.GREY2} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Total + Select button */}
            <View style={styles.totalRow}>
              <Text style={styles.headerText}>
                Total: {filteredProducts.length} products
              </Text>
              {!selectionMode && filteredProducts.length > 0 ? (
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => enterSelectionMode()}>
                  <Ionicons
                    name="checkbox-outline"
                    size={16}
                    color={COLOR.PRIMARY}
                  />
                  <Text style={styles.selectBtnText}>Select</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={<Empty />}
            refreshControl={
              <RefreshControl
                refreshing={refresh}
                onRefresh={onRefresh}
                enabled={!selectionMode}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      {error ? <AlertBox message={error} onChange={() => onRefresh()} /> : null}

      <BranchPickerModal
        open={branchModalOpen}
        close={() => setBranchModalOpen(false)}
        value={branch}
        onChange={(selectedBranch: any) => setBranch(selectedBranch)}
      />

      <CategoryPickerModal
        open={categoryModalOpen}
        close={() => setCategoryModalOpen(false)}
        value={selectedCategory}
        categories={categoryOptions}
        onChange={(cat: any) => setSelectedCategory(cat)}
      />

      {!selectionMode ? (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            props.navigation.navigate('AddProduct', {branch: branch})
          }>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      ) : null}

      <MultiBranchResultModal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title="Multi-branch delete result"
        summary={resultSummary}
        branches={resultBranches}
      />

      {/* Blocking loading overlay during any delete op */}
      <Modal
        visible={deleting}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => null}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLOR.PRIMARY} />
            <Text style={styles.loadingText}>Deleting…</Text>
            <Text style={styles.loadingSubText}>
              Please wait, this can take a few seconds
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
  },
  branchSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.LIGHT,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  branchText: {
    flex: 1,
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.PRIMARY,
    marginLeft: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.GREY4,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  categoryText: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY1,
    marginLeft: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 10,
  },
  warningText: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: '#856404',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.GREY4,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: COLOR.GREY1,
    marginLeft: 8,
    padding: 0,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: COLOR.GREY1,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR.PRIMARY,
  },
  selectBtnText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: COLOR.PRIMARY,
    marginLeft: 4,
  },
  listContent: {
    padding: 15,
    flexGrow: 1,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLOR.GREY4,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  productItemSelected: {
    borderColor: COLOR.PRIMARY,
    backgroundColor: '#E8F0FE',
  },
  checkbox: {
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
  },
  productCategory: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY2,
    marginTop: 4,
  },
  productPrice: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: COLOR.PRIMARY,
    marginTop: 4,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLOR.PRIMARY,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
  },
  selectionBarBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  selectionBarTitle: {
    flex: 1,
    marginLeft: 6,
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
  },
  selectionBarLink: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.PRIMARY,
  },
  selectionBarDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  selectionBarDeleteText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: '#fff',
    marginLeft: 6,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 6,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 15,
    color: COLOR.GREY1,
  },
  loadingSubText: {
    marginTop: 4,
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    textAlign: 'center',
  },
});

export default ProductListScreen;
