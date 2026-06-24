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
  Modal,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import InputItem from '../../components/inputText';
import PrimaryButton from '../../components/buttons/primary';
import LoadingBox from '../../components/skeleton/Loading';
import Empty from '../../components/alertBox/empty';
import AlertBox from '../../components/alertBox';
import BranchPickerModal from '../../components/branchPicker';
import KitchenDisplayPickerModal from '../../components/kitchenDisplayPicker';
import MultiBranchResultModal, {
  BranchOutcome,
} from '../../components/multiBranchResult';
import {GET, POST, PUT, DELETE} from '../../utils/apiCalls';
import API from '../../config/api';

// Helper function to safely convert API messages to strings
const getErrorMessage = (message: any, fallback: string = 'Something went wrong'): string => {
  if (!message) return fallback;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'object') {
    return message.message || JSON.stringify(message);
  }
  return fallback;
};

function CategoryManagementScreen(props: any) {
  // Get all branches from Redux store (fetched from BRANCHES_PICKER API)
  // Branch structure: { id, bname, companyId, adminId }
  // User selects a branch, then we use that branch's adminId and companyId
  const Dropdown = useSelector((state: any) => state?.Dropdown?.branches);

  const [loading, setLoading] = useState(false); // Changed to false initially
  const [refresh, setRefresh] = useState(false);
  const [categories, setCategories] = useState<any>([]);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  // Selected branch - contains: id, bname, companyId, adminId
  const [branch, setBranch] = useState<any>(
    Dropdown?.length ? Dropdown[0] : null,
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Kitchen Display states
  const [kitchenDisplays, setKitchenDisplays] = useState<any[]>([]);
  const [selectedKitchenDisplay, setSelectedKitchenDisplay] = useState<any>(null);
  const [kitchenDisplayModalOpen, setKitchenDisplayModalOpen] = useState(false);
  const [displayIdError, setDisplayIdError] = useState('');

  // Multi-branch fan-out state
  const [applyToAll, setApplyToAll] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultBranches, setResultBranches] = useState<BranchOutcome[]>([]);
  const [resultSummary, setResultSummary] = useState('');

  // Multi-select / bulk-delete
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Single flag used across all delete paths to drive the loading overlay
  const [deletingBulk, setDeletingBulk] = useState(false);

  useEffect(() => {
    // Component mounted
  }, []);

  useEffect(() => {
    if (branch?.companyId) {
      getCategories();
      getKitchenDisplays();
    } else if (branch) {
      // If branch exists but no companyId, still stop loading to show UI
      setLoading(false);
      setKitchenDisplays([]);
    } else {
      setLoading(false);
      setKitchenDisplays([]);
    }
  }, [branch]);

  const getCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${API.CATEGORIES_LIST}?branchId=${branch?.companyId}`;
      const response: any = await GET(url);
      if (response?.success) {
        setCategories(response?.data || []);
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

  const getKitchenDisplays = async () => {
    try {
      const url = `${API.KITCHEN_DISPLAYS}?branchId=${branch?.companyId}`;
      const response: any = await GET(url);
      if (response?.success) {
        setKitchenDisplays(response?.data || []);
      } else {
        setKitchenDisplays([]);
      }
    } catch (err) {
      setKitchenDisplays([]);
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    getCategories();
    getKitchenDisplays();
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedCategory(null);
    setCategoryName('');
    setCategoryError('');
    // Reset kitchen display selection
    setSelectedKitchenDisplay(null);
    setDisplayIdError('');
    setApplyToAll(false);
    setModalVisible(true);
  };

  const openEditModal = (category: any) => {
    setEditMode(true);
    setSelectedCategory(category);
    // Use 'category' field as the category name
    setCategoryName(category?.category || '');
    setCategoryError('');
    // Find and set the kitchen display for editing
    const displayId = category?.display_id;
    if (displayId) {
      const display = kitchenDisplays.find((kd: any) => kd.id === displayId);
      setSelectedKitchenDisplay(display || null);
    } else {
      setSelectedKitchenDisplay(null);
    }
    setDisplayIdError('');
    setApplyToAll(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCategoryName('');
    setCategoryError('');
    setSelectedKitchenDisplay(null);
    setDisplayIdError('');
    setSelectedCategory(null);
  };

  const handleSubmit = async () => {
    // Validate category name
    if (!categoryName.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    // Validate kitchen display selection
    if (!selectedKitchenDisplay) {
      setDisplayIdError('Kitchen Display is required');
      return;
    }

    const displayIdNumber = selectedKitchenDisplay.id;

    // Get userid and companyid from existing categories first (most reliable source)
    // If no categories exist, fallback to branch data
    const userIdFromCategories = categories?.[0]?.userid;
    const companyIdFromCategories = categories?.[0]?.companyid;

    const userId = userIdFromCategories || branch?.userId || branch?.adminId;
    const companyId = companyIdFromCategories || branch?.companyId;

    if (!userId) {
      Alert.alert('Error', 'User ID is missing. Please reselect the branch or add categories from another device first.');
      return;
    }

    if (!companyId) {
      Alert.alert('Error', 'Company ID is missing. Please reselect the branch.');
      return;
    }

    setModalLoading(true);

    // ---- Multi-branch fan-out path ----
    if (applyToAll) {
      try {
        let response: any;
        if (editMode) {
          const body = {
            matchByName: selectedCategory?.category || '',
            category: categoryName.trim(),
            kitchenDisplayName: selectedKitchenDisplay?.name,
          };
          response = await PUT(API.CATEGORY_MULTI_BRANCH_UPDATE, body);
        } else {
          const body = {
            category: categoryName.trim(),
            kitchenDisplayName: selectedKitchenDisplay?.name,
            userid: userId,
            is_show_in_report: false,
          };
          response = await POST(API.CATEGORY_MULTI_BRANCH_CREATE, body);
        }
        const branchesRes: BranchOutcome[] = response?.branches || [];
        setResultBranches(branchesRes);
        setResultSummary(response?.message || '');
        setResultOpen(true);
        closeModal();
        if (branchesRes.some((b) => b.success)) {
          getCategories();
        }
      } catch (err: any) {
        Alert.alert('Error', getErrorMessage(err?.message, 'Failed to save'));
      } finally {
        setModalLoading(false);
      }
      return;
    }

    const payload = {
      category: categoryName.trim(),
      display_id: displayIdNumber,
      userid: userId, // Note: lowercase 'userid' to match backend field name
      companyid: companyId, // Note: lowercase 'companyid' to match backend field name
      is_show_in_report: false, // Default value
    };

    // Optimistic update: update UI immediately
    let previousCategories = [...categories];

    if (editMode) {
      // Update existing category in state
      setCategories(categories.map((cat: any) =>
        cat.id === selectedCategory?.id
          ? { ...cat, category: categoryName.trim(), display_id: displayIdNumber }
          : cat
      ));
    } else {
      // Add new category to state with temporary ID
      const tempCategory = {
        id: Date.now(), // Temporary ID
        category: categoryName.trim(),
        display_id: displayIdNumber,
        userid: userId,
        companyid: companyId,
        is_show_in_report: false,
      };
      setCategories([...categories, tempCategory]);
    }

    try {
      let response: any;
      const queryParams = `?branchId=${branch?.companyId}`;

      if (editMode) {
        response = await PUT(`${API.CATEGORY_UPDATE}${selectedCategory?.id}${queryParams}`, payload);
      } else {
        response = await POST(`${API.CATEGORY_CREATE}${queryParams}`, payload);
      }

      if (response?.success) {
        Alert.alert(
          'Success',
          `Category ${editMode ? 'updated' : 'added'} successfully!`,
        );
        closeModal();
        // Refresh to get correct IDs from server
        getCategories();
      } else {
        // Revert optimistic update on error
        setCategories(previousCategories);
        Alert.alert('Error', getErrorMessage(response?.message, 'Something went wrong'));
      }
    } catch (error) {
      // Revert optimistic update on error
      setCategories(previousCategories);
      Alert.alert('Error', 'Failed to save category');
    } finally {
      setModalLoading(false);
    }
  };


  const confirmDeleteCategory = (category: any) => {
    const name = category?.category || 'this category';
    Alert.alert(
      'Delete category',
      `Delete "${name}" — from this branch only, or from every branch? Products linked to it will lose their category.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'This branch only',
          onPress: () => doDeleteCategory(category),
        },
        {
          text: 'All branches',
          style: 'destructive',
          onPress: () => doMultiBranchDeleteCategory(category),
        },
      ],
    );
  };

  const doDeleteCategory = async (category: any) => {
    const previousCategories = [...categories];
    // Optimistic remove
    setCategories(categories.filter((c: any) => c.id !== category.id));
    setDeletingBulk(true);

    try {
      const url = `${API.CATEGORY_DELETE}${category.id}?branchId=${branch?.companyId}`;
      const response: any = await DELETE(url);
      if (response?.success) {
        Alert.alert('Deleted', response?.message || 'Category deleted');
      } else {
        setCategories(previousCategories);
        Alert.alert('Error', getErrorMessage(response?.message, 'Could not delete category'));
      }
    } catch (err: any) {
      setCategories(previousCategories);
      Alert.alert('Error', getErrorMessage(err?.message, 'Could not delete category'));
    } finally {
      setDeletingBulk(false);
    }
  };

  const doMultiBranchDeleteCategory = async (category: any) => {
    const matchByName = category?.category || '';
    if (!matchByName) {
      Alert.alert('Error', 'Could not determine category name to match by.');
      return;
    }
    setDeletingBulk(true);
    try {
      const response: any = await POST(API.CATEGORY_MULTI_BRANCH_DELETE, {
        matchByName,
      });
      const branchesRes: BranchOutcome[] = response?.branches || [];
      setResultBranches(branchesRes);
      setResultSummary(response?.message || '');
      setResultOpen(true);
      const deletedHere = branchesRes.some(
        (b) =>
          b.success && Number(b.branchId) === Number(branch?.companyId),
      );
      if (deletedHere) {
        setCategories(
          (categories as any[]).filter(
            (c: any) =>
              (c?.category || '').trim().toLowerCase() !==
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
      setDeletingBulk(false);
    }
  };

  // ── Selection-mode helpers ─────────────────────────────────────────
  const enterSelectionMode = (initialId?: number) => {
    setSelectionMode(true);
    setSelectedIds(initialId ? [Number(initialId)] : []);
  };
  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };
  const toggleSelected = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const selectAllVisible = () => {
    setSelectedIds(filteredCategories.map((c: any) => Number(c.id)));
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      'Delete categories',
      `Delete ${selectedIds.length} selected category(s) — from this branch only, or from every branch?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'This branch only', onPress: doBulkDelete},
        {
          text: 'All branches',
          style: 'destructive',
          onPress: doMultiBranchBulkDeleteCategories,
        },
      ],
    );
  };

  const doBulkDelete = async () => {
    try {
      setDeletingBulk(true);
      const url = `${API.CATEGORY_BULK_DELETE}?branchId=${branch?.companyId}`;
      const response: any = await POST(url, {ids: selectedIds});
      if (response?.success) {
        const deleted: number[] = response?.deleted_ids || selectedIds;
        setCategories((prev: any[]) =>
          prev.filter(
            (c: any) => !deleted.map(Number).includes(Number(c.id)),
          ),
        );
        Alert.alert(
          'Deleted',
          response?.message || `${deleted.length} category(s) deleted`,
        );
        exitSelectionMode();
      } else {
        Alert.alert(
          'Error',
          getErrorMessage(response?.message, 'Bulk delete failed'),
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Error',
        getErrorMessage(err?.message, 'Bulk delete failed'),
      );
    } finally {
      setDeletingBulk(false);
    }
  };

  // Multi-branch bulk delete — ONE round-trip. Send all selected names.
  const doMultiBranchBulkDeleteCategories = async () => {
    try {
      setDeletingBulk(true);
      const selected = (categories as any[]).filter((c: any) =>
        selectedIds.includes(Number(c.id)),
      );
      const names = selected
        .map((c: any) => (c?.category || '').toString().trim())
        .filter((s: string) => s.length > 0);

      if (names.length === 0) {
        Alert.alert('Error', 'Could not read category names from the selection.');
        return;
      }

      const response: any = await POST(
        API.CATEGORY_MULTI_BRANCH_DELETE_BULK,
        {names},
      );
      const branchesRes: BranchOutcome[] = response?.branches || [];
      setResultBranches(branchesRes);
      setResultSummary(
        response?.message ||
          `${names.length} category(s) processed across ${branchesRes.length} branch(es)`,
      );
      setResultOpen(true);

      const lowerNames = names.map((n: string) => n.toLowerCase());
      setCategories((prev: any[]) =>
        prev.filter(
          (c: any) =>
            !lowerNames.includes(
              ((c?.category || '') as string).toLowerCase().trim(),
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
      setDeletingBulk(false);
    }
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const categoryName = (item?.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return categoryName.includes(query);
  });

  const renderCategoryItem = ({item}: any) => {
    const displayName = item?.category || 'Unnamed Category';
    const id = Number(item?.id);
    const isSelected = selectedIds.includes(id);

    const onPressRow = () => {
      if (selectionMode) toggleSelected(id);
    };
    const onLongPressRow = () => {
      if (!selectionMode) enterSelectionMode(id);
    };

    return (
      <TouchableOpacity
        activeOpacity={selectionMode ? 0.7 : 1}
        onPress={onPressRow}
        onLongPress={onLongPressRow}
        style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}>
        {selectionMode ? (
          <View style={styles.checkbox}>
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={22}
              color={isSelected ? COLOR.PRIMARY : COLOR.GREY2}
            />
          </View>
        ) : null}
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{displayName}</Text>
        </View>
        {!selectionMode ? (
          <View style={styles.categoryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}>
              <Ionicons name="create-outline" size={20} color={COLOR.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => confirmDeleteCategory(item)}>
              <Ionicons name="trash-outline" size={20} color={'#D32F2F'} />
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />

      {loading ? (
        <LoadingBox />
      ) : (
        <>
          {/* Selection-mode toolbar */}
          {selectionMode ? (
            <View style={styles.selectionBar}>
              <TouchableOpacity onPress={exitSelectionMode} style={styles.selectionBarBtn}>
                <Ionicons name="close" size={22} color={COLOR.GREY1} />
              </TouchableOpacity>
              <Text style={styles.selectionBarTitle}>
                {selectedIds.length} selected
              </Text>
              <TouchableOpacity onPress={selectAllVisible} style={styles.selectionBarBtn}>
                <Text style={styles.selectionBarLink}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmBulkDelete}
                disabled={selectedIds.length === 0 || deletingBulk}
                style={[
                  styles.selectionBarDelete,
                  (selectedIds.length === 0 || deletingBulk) && {opacity: 0.4},
                ]}>
                <Ionicons name="trash" size={18} color={'#fff'} />
                <Text style={styles.selectionBarDeleteText}>
                  Delete{selectedIds.length ? ` (${selectedIds.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.header}>
            {/* Branch Selector */}
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

            {/* Warning when no branch selected */}
            {!branch?.companyId && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color={COLOR.WARNING || '#FFA500'} />
                <Text style={styles.warningText}>
                  Please select a branch to view categories
                </Text>
              </View>
            )}

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={COLOR.GREY2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search categories..."
                placeholderTextColor={COLOR.GREY2}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLOR.GREY2} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.headerRow}>
              <Text style={styles.headerText}>
                {searchQuery ? `Found: ${filteredCategories.length}` : `Total Categories: ${categories.length}`}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                {!selectionMode && filteredCategories.length > 0 ? (
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => enterSelectionMode()}>
                    <Ionicons
                      name="checkbox-outline"
                      size={11}
                      color={COLOR.PRIMARY}
                    />
                    <Text style={styles.selectBtnText}>Select</Text>
                  </TouchableOpacity>
                ) : null}
                {!selectionMode ? (
                  <TouchableOpacity
                    style={[styles.addButton, !branch?.companyId && styles.addButtonDisabled]}
                    onPress={openAddModal}
                    disabled={!branch?.companyId}>
                    <Ionicons name="add-circle" size={24} color={!branch?.companyId ? COLOR.GREY2 : COLOR.PRIMARY} />
                    <Text style={[styles.addButtonText, !branch?.companyId && styles.addButtonTextDisabled]}>Add Category</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={<Empty />}
            refreshControl={
              <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      {error ? <AlertBox message={error} onChange={() => onRefresh()} /> : null}

      {/* Branch Picker Modal */}
      <BranchPickerModal
        open={branchModalOpen}
        close={() => setBranchModalOpen(false)}
        value={branch}
        onChange={(selectedBranch: any) => {
          setBranch(selectedBranch);
        }}
      />

      {/* Add/Edit Category Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}>
        <StatusBar
          backgroundColor={'rgba(72, 72, 72, 0.25)'}
          barStyle={'dark-content'}
        />
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={COLOR.GREY1} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <InputItem
                label="Category Name"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(value: string) => {
                  setCategoryName(value);
                  if (categoryError) setCategoryError('');
                }}
                required
                error={categoryError}
              />

              {/* Kitchen Display Selector */}
              <View style={{marginBottom: 15}}>
                <Text style={styles.inputLabel}>
                  Kitchen Display <Text style={{color: COLOR.PRIMARY}}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.displaySelector,
                    displayIdError ? styles.displaySelectorError : null
                  ]}
                  onPress={() => setKitchenDisplayModalOpen(true)}>
                  <Ionicons name="restaurant-outline" size={20} color={COLOR.PRIMARY} />
                  <Text style={[
                    styles.displaySelectorText,
                    !selectedKitchenDisplay && styles.displaySelectorPlaceholder
                  ]}>
                    {selectedKitchenDisplay ? selectedKitchenDisplay.name : 'Select Kitchen Display'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={COLOR.GREY2} />
                </TouchableOpacity>
                {displayIdError ? (
                  <Text style={styles.errorText}>{displayIdError}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.applyAllRow}
                onPress={() => setApplyToAll((v) => !v)}>
                <Ionicons
                  name={applyToAll ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={applyToAll ? COLOR.PRIMARY : COLOR.GREY2}
                />
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={styles.applyAllTitle}>Apply to all branches</Text>
                  <Text style={styles.applyAllSub}>
                    {editMode
                      ? `Update "${selectedCategory?.category}" in every branch where it exists. Kitchen display matched by name per branch.`
                      : `Create this category in every branch. Each branch must already have a kitchen display named "${selectedKitchenDisplay?.name || '—'}".`}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <PrimaryButton
                  label={
                    applyToAll
                      ? editMode
                        ? 'UPDATE IN ALL BRANCHES'
                        : 'ADD TO ALL BRANCHES'
                      : editMode
                        ? 'UPDATE'
                        : 'ADD'
                  }
                  onPress={handleSubmit}
                  loading={modalLoading}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <MultiBranchResultModal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title={editMode ? 'Multi-branch update result' : 'Multi-branch create result'}
        summary={resultSummary}
        branches={resultBranches}
      />

      {/* Blocking loading overlay during any delete op */}
      <Modal
        visible={deletingBulk}
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

      {/* Kitchen Display Picker Modal */}
      <KitchenDisplayPickerModal
        open={kitchenDisplayModalOpen}
        close={() => setKitchenDisplayModalOpen(false)}
        value={selectedKitchenDisplay}
        onChange={(display: any) => {
          setSelectedKitchenDisplay(display);
          if (displayIdError) setDisplayIdError('');
        }}
        kitchenDisplays={kitchenDisplays}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: COLOR.GREY1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.PRIMARY,
    marginLeft: 5,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonTextDisabled: {
    color: COLOR.GREY2,
  },
  listContent: {
    padding: 15,
    flexGrow: 1,
  },
  categoryItem: {
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
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(72, 72, 72, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
  },
  modalTitle: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 18,
    color: COLOR.GREY1,
  },
  modalContent: {
    padding: 20,
  },
  modalButtons: {
    marginTop: 20,
  },
  inputLabel: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.GREY1,
    marginBottom: 8,
  },
  displaySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.LIGHT,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  displaySelectorError: {
    borderColor: COLOR.PRIMARY,
  },
  displaySelectorText: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: COLOR.GREY1,
    marginLeft: 8,
  },
  displaySelectorPlaceholder: {
    color: COLOR.GREY2,
  },
  errorText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.PRIMARY,
    marginTop: 5,
  },
  applyAllRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
    backgroundColor: COLOR.GREY4,
  },
  applyAllTitle: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.GREY1,
  },
  applyAllSub: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    marginTop: 3,
  },
  // Selection mode
  categoryItemSelected: {
    borderColor: COLOR.PRIMARY,
    backgroundColor: '#E8F0FE',
  },
  checkbox: {
    marginRight: 10,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 5,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLOR.PRIMARY,
  },
  selectBtnText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 9,
    lineHeight: 10,
    color: COLOR.PRIMARY,
    marginLeft: 2,
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
    gap: 4,
  },
  selectionBarDeleteText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: '#fff',
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

export default CategoryManagementScreen;
