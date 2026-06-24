import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import InputItem from '../../components/inputText';
import PrimaryButton from '../../components/buttons/primary';
import CategoryPickerModal from '../../components/categoryPicker';
import BranchPickerModal from '../../components/branchPicker';
import MultiBranchResultModal, {
  BranchOutcome,
} from '../../components/multiBranchResult';
import {GET, POST, PUT} from '../../utils/apiCalls';
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

function AddProductScreen(props: any) {
  const isEditMode = props?.route?.params?.product ? true : false;
  const productData = props?.route?.params?.product;
  const passedBranch = props?.route?.params?.branch;

  // Get all branches from Redux store (fetched from BRANCHES_PICKER API)
  // Branch structure: { id, bname, companyId, adminId }
  // User selects a branch, then we use that branch's adminId and companyId
  const Dropdown = useSelector((state: any) => state?.Dropdown?.branches);

  // Get logged-in user data from Redux store (needed for adminId fallback)
  const authUser = useSelector((state: any) => state?.Auth?.user);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);

  // Selected branch - contains: id, bname, companyId, adminId
  // Use passed branch from navigation if available, otherwise default to first dropdown
  const [branch, setBranch] = useState<any>(
    passedBranch || (Dropdown?.length ? Dropdown[0] : null),
  );
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<any>(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('0');

  const [errors, setErrors] = useState<any>({});

  // Multi-branch fan-out state
  const [applyToAll, setApplyToAll] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultBranches, setResultBranches] = useState<BranchOutcome[]>([]);
  const [resultSummary, setResultSummary] = useState('');

  // Track if this is the first render for branch effect
  const isFirstBranchEffect = useRef(true);

  useEffect(() => {
    // Initialize form data for edit mode
    if (isEditMode && productData) {
      setProductName(productData?.productName || '');
      setCategory(productData?.category || null);
      setSellingPrice(productData?.sp_price?.toString() || '');
      setCostPrice(productData?.costprice?.toString() || '');
      setStock(productData?.stock?.toString() || '0');
    }
  }, []);

  useEffect(() => {
    if (branch?.companyId) {
      getCategories();
      // Reset category when branch changes, but NOT on the first render
      // On first render, we want to keep the category from edit mode
      if (isFirstBranchEffect.current) {
        isFirstBranchEffect.current = false;
      } else {
        // User changed the branch, reset category
        setCategory(null);
      }
    }
  }, [branch]);

  const getCategories = async () => {
    try {
      const url = `${API.CATEGORIES_LIST}?branchId=${branch?.companyId}`;
      const response: any = await GET(url);

      if (response?.success) {
        const loadedCategories = response?.data || [];
        setCategories(loadedCategories);

        // Validate selected category after loading categories
        if (category) {
          const categoryExists = loadedCategories.some((cat: any) => cat.id === category.id);

          if (!categoryExists) {
            // Category doesn't exist in this branch, reset it
            setCategory(null);
            Alert.alert(
              'Category Reset',
              'The previously selected category is not available for this branch. Please select a category again.'
            );
          }
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!branch) {
      newErrors.branch = 'Please select a branch';
    }

    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    } else {
      // Check if the selected category exists in the current branch's category list
      const categoryExists = categories.some((cat: any) => cat.id === category.id);

      if (!categoryExists) {
        newErrors.category = 'Selected category is not valid for this branch. Please select again.';
        // Auto-reset the category
        setCategory(null);
      }
    }

    if (!sellingPrice || sellingPrice.trim() === '') {
      newErrors.sellingPrice = 'Selling price is required';
    } else {
      const parsedPrice = parseFloat(sellingPrice);
      if (isNaN(parsedPrice)) {
        newErrors.sellingPrice = 'Please enter a valid number';
      } else if (parsedPrice <= 0) {
        newErrors.sellingPrice = 'Selling price must be greater than 0';
      } else if (parsedPrice > 9999999) {
        newErrors.sellingPrice = 'Selling price is too high';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    // Double check category exists in our loaded list
    const categoryExists = categories.some((cat: any) => cat.id === category?.id);

    if (!categoryExists) {
      Alert.alert('Error', 'Selected category is not valid. Please select a category again.');
      setCategory(null);
      return;
    }

    setLoading(true);

    // Get userid from the loaded categories (most reliable source)
    // Categories are fetched for this specific branch, so their userid is correct
    const userIdFromCategories = categories?.[0]?.userid;
    const companyIdFromCategories = categories?.[0]?.companyid;

    // Validate companyId/branchId (this is the company/branch where the product will be created)
    const companyId = companyIdFromCategories || branch?.companyId;
    if (!companyId || isNaN(Number(companyId))) {
      setLoading(false);
      Alert.alert('Error', 'Company ID is missing or invalid. Please select a valid branch.');
      return;
    }

    // Get userId from categories (same approach as category management screen)
    // userId and adminId are the same
    const userId = userIdFromCategories || authUser?.staff?.id || authUser?.id;
    const adminId = userId; // adminId is same as userId
    const branchId = companyId; // branchId is the companyId

    if (!userId || isNaN(Number(userId))) {
      setLoading(false);
      Alert.alert('Error', 'User ID is missing. Please ensure categories exist for this branch.');
      return;
    }

    // API expects specific field names
    const parsedCostPrice = costPrice && !isNaN(parseFloat(costPrice)) ? parseFloat(costPrice) : 0;
    const parsedSellingPrice = parseFloat(sellingPrice);

    const payload = {
      idescription: productName.trim(),
      product_category: category?.id,
      categoryId: category?.id, // Add this as alternative field name
      sp_price: parsedSellingPrice,
      costprice: parsedCostPrice,
      rate: parsedSellingPrice, // Same as sp_price
      price: parsedSellingPrice, // Same as sp_price
      c_price: parsedCostPrice, // Same as costprice
      stock: parseInt(stock) || 0,
      itemtype: 'Stock',
      active: 1,
      userid: userId, // Add userid to payload body as well
      companyid: companyId, // Add companyid to payload body as well
    };

    try {
      // ---- Multi-branch fan-out path ----
      if (applyToAll) {
        let response: any;
        if (isEditMode) {
          const body = {
            matchByName: productData?.productName || '',
            idescription: productName.trim(),
            sp_price: parsedSellingPrice,
            categoryName: category?.category,
          };
          response = await PUT(`${API.PRODUCT_MULTI_BRANCH_UPDATE}`, body);
        } else {
          const body = {
            idescription: productName.trim(),
            sp_price: parsedSellingPrice,
            categoryName: category?.category,
            stock: parseInt(stock) || undefined,
            itemtype: 'Stock',
            active: 1,
            userid: parseInt(String(userId), 10),
          };
          const url = `${API.PRODUCT_MULTI_BRANCH_CREATE}?adminid=${parseInt(String(adminId), 10)}`;
          response = await POST(url, body);
        }

        const branchesRes: BranchOutcome[] = response?.branches || [];
        setResultBranches(branchesRes);
        setResultSummary(response?.message || '');
        setResultOpen(true);
        return;
      }

      // ---- Original single-branch path (unchanged) ----
      let response: any;
      const userIdNum = parseInt(String(userId), 10);
      const adminIdNum = parseInt(String(adminId), 10);
      const branchIdNum = parseInt(String(branchId), 10);

      if (isNaN(userIdNum) || isNaN(adminIdNum) || isNaN(branchIdNum)) {
        setLoading(false);
        Alert.alert('Error', 'ID conversion failed. Please try again.');
        return;
      }

      const queryParams = `?branchId=${branchIdNum}&userid=${userIdNum}&adminid=${adminIdNum}`;

      if (isEditMode) {
        response = await PUT(`${API.PRODUCT_UPDATE}${productData?.id}${queryParams}`, payload);
      } else {
        response = await POST(`${API.PRODUCT_CREATE}${queryParams}`, payload);
      }

      if (response?.success) {
        Alert.alert(
          'Success',
          `Product ${isEditMode ? 'updated' : 'added'} successfully!`,
          [
            {
              text: 'OK',
              onPress: () => props.navigation.goBack(),
            },
          ],
        );
      } else {
        Alert.alert('Error', getErrorMessage(response?.message, 'Something went wrong'));
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.data?.message || getErrorMessage(error?.data?.message, 'Failed to save product');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeResultModal = () => {
    setResultOpen(false);
    // Once the user dismisses the result, go back if at least one branch succeeded
    const anySuccess = resultBranches.some((b) => b.success);
    if (anySuccess) {
      props.navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Branch Selection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Branch Selection</Text>
            <View style={[styles.sectionLine, {flex: 1}]} />
          </View>

          {/* Branch Selector */}
          <View>
            <Text style={styles.label}>
              Select Branch <Text style={{color: 'red'}}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setBranchModalOpen(true)}>
              <Text
                style={[
                  styles.dropdownText,
                  !branch && {color: 'grey'},
                ]}>
                {branch ? branch.bname : 'Select branch'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={COLOR.GREY2}
              />
            </TouchableOpacity>
            {errors.branch ? (
              <Text style={styles.error}>{errors.branch}</Text>
            ) : null}
          </View>
        </View>

        {/* Product Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Product Information</Text>
            <View style={[styles.sectionLine, {flex: 1}]} />
          </View>

          <InputItem
            label="Product Name"
            placeholder="Enter product name"
            value={productName}
            onChange={(value: string) => {
              setProductName(value);
              if (errors.productName) {
                setErrors({...errors, productName: ''});
              }
            }}
            required
            error={errors.productName}
          />

          {/* Category Selector */}
          <View>
            <Text style={styles.label}>
              Product Category <Text style={{color: 'red'}}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                if (categories.length === 0) {
                  Alert.alert(
                    'No Categories',
                    'No categories available for this branch. Please create a category first in Category Management.',
                    [{text: 'OK'}]
                  );
                } else {
                  setCategoryModalOpen(true);
                }
              }}>
              <Text
                style={[
                  styles.dropdownText,
                  !category && {color: 'grey'},
                ]}>
                {category ? category.category : categories.length === 0 ? 'No categories available' : 'Select category'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={COLOR.GREY2}
              />
            </TouchableOpacity>
            {errors.category ? (
              <Text style={styles.error}>{errors.category}</Text>
            ) : null}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Pricing & Stock</Text>
            <View style={[styles.sectionLine, {flex: 1}]} />
          </View>

          <InputItem
            label="Selling Price"
            placeholder="Enter selling price"
            value={sellingPrice}
            onChange={(value: string) => {
              // Only allow numbers and one decimal point
              const filtered = value.replace(/[^0-9.]/g, '');
              // Prevent multiple decimal points
              const parts = filtered.split('.');
              const sanitized = parts.length > 2
                ? parts[0] + '.' + parts.slice(1).join('')
                : filtered;
              setSellingPrice(sanitized);
              if (errors.sellingPrice) {
                setErrors({...errors, sellingPrice: ''});
              }
            }}
            keyboardType="decimal-pad"
            required
            error={errors.sellingPrice}
          />

          {/* <InputItem
            label="Cost Price"
            placeholder="Enter cost price"
            value={costPrice}
            onChange={(value: string) => {
              setCostPrice(value);
              if (errors.costPrice) {
                setErrors({...errors, costPrice: ''});
              }
            }}
            keyboardType="decimal-pad"
            required
            error={errors.costPrice}
          /> */}

          {/* <InputItem
            label="Stock Quantity"
            placeholder="Enter stock quantity"
            value={stock}
            onChange={(value: string) => {
              setStock(value);
            }}
            keyboardType="number-pad"
          /> */}
        </View>

        {/* Apply to all branches */}
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
              {isEditMode
                ? `Update this product in every branch where "${productData?.productName}" exists. Category matched by name per branch.`
                : 'Create this product in every branch. Each branch must already have a category with the same name.'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            label={
              applyToAll
                ? isEditMode
                  ? 'UPDATE IN ALL BRANCHES'
                  : 'SUBMIT TO ALL BRANCHES'
                : isEditMode
                  ? 'UPDATE'
                  : 'SUBMIT'
            }
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </ScrollView>

      <MultiBranchResultModal
        open={resultOpen}
        onClose={closeResultModal}
        title={isEditMode ? 'Multi-branch update result' : 'Multi-branch create result'}
        summary={resultSummary}
        branches={resultBranches}
      />

      {/* Branch Picker Modal */}
      <BranchPickerModal
        open={branchModalOpen}
        close={() => setBranchModalOpen(false)}
        value={branch}
        onChange={(selectedBranch: any) => {
          setBranch(selectedBranch);
          setCategory(null); // Reset category when branch changes
          if (errors.branch) {
            setErrors({...errors, branch: ''});
          }
        }}
      />

      {/* Category Picker Modal */}
      <CategoryPickerModal
        open={categoryModalOpen}
        close={() => setCategoryModalOpen(false)}
        categories={categories}
        value={category}
        onChange={(selectedCategory: any) => {
          setCategory(selectedCategory);
          if (errors.category) {
            setErrors({...errors, category: ''});
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  sectionLine: {
    height: 1,
    backgroundColor: COLOR.PRIMARY,
    width: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: COLOR.GREY2,
    marginHorizontal: 10,
  },
  label: {
    fontFamily: FONTS.MEDIUM,
    color: '#000',
    fontSize: 12,
    marginBottom: 5,
    marginTop: 15,
    marginLeft: 2,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 4,
    borderColor: COLOR.GREY2,
    borderWidth: 1,
    padding: 13,
    paddingLeft: 10,
  },
  dropdownText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  error: {
    color: 'red',
    fontFamily: FONTS.Regular,
    marginTop: 3,
    fontSize: 13,
    marginLeft: 2,
  },
  buttonContainer: {
    marginTop: 30,
  },
  applyAllRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 10,
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
});

export default AddProductScreen;
