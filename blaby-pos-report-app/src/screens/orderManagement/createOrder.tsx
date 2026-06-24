import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import LoadingBox from '../../components/skeleton/Loading';
import CategoryPickerModal from '../../components/categoryPicker';
import {GET, POST, PUT} from '../../utils/apiCalls';
import API from '../../config/api';

const ALL_CATEGORIES = {id: 'all', category: 'All Categories'};

// Every report-app order is treated as a parcel order:
//  - Each item flagged parcel_option = 'parcel' so the KDS shows it as parcel
//  - PARCEL_CHARGE_PER_ITEM added per unit to the order total
const PARCEL_CHARGE_PER_ITEM = 5;
const PARCEL_OPTION = 'parcel';

type CartItem = {
  productId: number;
  idescription: string;
  sp_price: number;
  quantity: number;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 10;
const GRID_PADDING = 14;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

function CreateOrderScreen() {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const branch = route?.params?.branch;
  const editOrder = route?.params?.editOrder;

  const authUser = useSelector((state: any) => state?.Auth?.user);
  const isEdit = !!editOrder?.id;

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<any>(ALL_CATEGORIES);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (!editOrder?.orderItems) return [];
    return editOrder.orderItems.map((it: any) => ({
      productId: Number(it.productId),
      idescription: it.idescription || it.productMaster?.idescription || '',
      sp_price: Number(it.sp_price) || 0,
      quantity: Number(it.quantity) || 1,
    }));
  });

  const [narration, setNarration] = useState<string>(
    editOrder?.cooking_instructions || '',
  );
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEdit ? 'Edit Order' : 'New Order',
    });
  }, [isEdit, navigation]);

  useEffect(() => {
    if (!branch?.companyId) return;
    Promise.all([
      GET(`${API.PRODUCT_MASTER_LIST}?branchId=${branch.companyId}`),
      GET(`${API.CATEGORIES_LIST}?branchId=${branch.companyId}`),
    ])
      .then(([prodRes, catRes]: any) => {
        if (prodRes?.success) setProducts(prodRes.data || []);
        if (catRes?.success) setCategories(catRes.data || []);
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to load products. Try again.');
      })
      .finally(() => setLoading(false));
  }, [branch?.companyId]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory && selectedCategory.id !== 'all') {
      list = list.filter(
        (p) =>
          Number(p?.product_category ?? p?.productCategory?.id) ===
          Number(selectedCategory.id),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p: any) =>
        (p?.idescription || p?.productName || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, selectedCategory, search]);

  const subtotal = useMemo(
    () => cart.reduce((sum, it) => sum + it.sp_price * it.quantity, 0),
    [cart],
  );
  const cartItemCount = useMemo(
    () => cart.reduce((sum, it) => sum + it.quantity, 0),
    [cart],
  );
  const parcelCharge = useMemo(
    () => cartItemCount * PARCEL_CHARGE_PER_ITEM,
    [cartItemCount],
  );
  const total = useMemo(
    () => subtotal + parcelCharge,
    [subtotal, parcelCharge],
  );

  const addToCart = (product: any) => {
    setCart((prev) => {
      const pid = Number(product.id);
      const idx = prev.findIndex((c) => c.productId === pid);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {...copy[idx], quantity: copy[idx].quantity + 1};
        return copy;
      }
      return [
        ...prev,
        {
          productId: pid,
          idescription: product.idescription || product.productName || '',
          sp_price: Number(product.sp_price ?? product.price ?? 0),
          quantity: 1,
        },
      ];
    });
  };

  const decFromCart = (productId: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.productId === productId);
      if (idx < 0) return prev;
      const copy = [...prev];
      if (copy[idx].quantity <= 1) {
        copy.splice(idx, 1);
      } else {
        copy[idx] = {...copy[idx], quantity: copy[idx].quantity - 1};
      }
      return copy;
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const qtyInCart = (productId: number) =>
    cart.find((c) => c.productId === productId)?.quantity || 0;

  const submit = async () => {
    if (cart.length === 0) {
      Alert.alert('Add at least one item', 'Your cart is empty.');
      return;
    }
    if (!branch?.companyId) {
      Alert.alert('No branch', 'Select a branch before placing the order.');
      return;
    }

    const adminHint = branch?.adminId || authUser?.id;
    const body: any = {
      staffId: Number(authUser?.id) || undefined,
      cooking_instructions: narration.trim() || '',
      total,
      ac_room: false,
      orderItems: cart.map((c) => ({
        productId: c.productId,
        quantity: c.quantity,
        sp_price: c.sp_price,
        idescription: c.idescription,
        parcel_option: PARCEL_OPTION,
      })),
    };
    if (adminHint) body.adminId = Number(adminHint);

    setSubmitting(true);
    try {
      let response: any;
      if (isEdit) {
        const url = `${API.ORDER_UPDATE}${editOrder.id}?branchId=${branch.companyId}`;
        response = await PUT(url, body);
      } else {
        const url = `${API.ORDER_CREATE}?branchId=${branch.companyId}`;
        response = await POST(url, body);
      }
      if (response?.success) {
        Alert.alert(
          'Success',
          response?.message ||
            (isEdit
              ? 'Order updated'
              : `Order placed. Token #${response?.data?.tokenNo}`),
          [{text: 'OK', onPress: () => navigation.goBack()}],
        );
      } else {
        Alert.alert('Error', response?.message || 'Could not save the order');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save the order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingBox />;

  const categoryOptions = [ALL_CATEGORIES, ...categories];

  const renderProductCard = ({item}: any) => {
    const qty = qtyInCart(Number(item.id));
    const name = item?.idescription || item?.productName || 'Unnamed product';
    const price = Number(item?.sp_price ?? item?.price ?? 0);
    return (
      <TouchableOpacity
        style={[styles.gridCard, qty > 0 && styles.gridCardSelected]}
        activeOpacity={0.8}
        onPress={() => addToCart(item)}>
        {qty > 0 ? (
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyBadgeText}>{qty}</Text>
          </View>
        ) : null}
        <Text style={styles.cardName} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>₹{price.toFixed(2)}</Text>
          {qty > 0 ? (
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyTouchTarget}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                onPress={() => decFromCart(Number(item.id))}>
                <Ionicons
                  name="remove-circle"
                  size={30}
                  color={COLOR.PRIMARY}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.qtyTouchTarget}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                onPress={() => addToCart(item)}>
                <Ionicons
                  name="add-circle"
                  size={30}
                  color={COLOR.PRIMARY}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.plusBtn}>
              <Ionicons name="add" size={18} color={'#fff'} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />

      <View style={styles.topBar}>
        <Text style={styles.branchText}>{branch?.bname}</Text>
        <View style={styles.parcelBadge}>
          <Ionicons name="cube-outline" size={12} color={'#fff'} />
          <Text style={styles.parcelBadgeText}>Parcel</Text>
        </View>
        <TouchableOpacity
          style={styles.categoryChip}
          onPress={() => setCategoryPickerOpen(true)}>
          <Ionicons name="pricetag-outline" size={14} color={COLOR.PRIMARY} />
          <Text style={styles.categoryChipText} numberOfLines={1}>
            {selectedCategory?.category}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLOR.GREY2} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLOR.GREY2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLOR.GREY2}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLOR.GREY2} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Product grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProductCard}
        numColumns={2}
        columnWrapperStyle={{gap: GRID_GAP}}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          <Text style={styles.empty}>No products match this filter.</Text>
        }
      />

      {/* Narration + cart bar pinned to the bottom */}
      <View style={styles.bottomDock}>
        <View style={styles.narrationRow}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={COLOR.GREY2}
          />
          <TextInput
            style={styles.narrationInput}
            placeholder="Add narration (optional) — e.g. less spice, extra packing"
            placeholderTextColor={COLOR.GREY2}
            value={narration}
            onChangeText={setNarration}
            multiline
          />
          {narration ? (
            <TouchableOpacity onPress={() => setNarration('')}>
              <Ionicons name="close-circle" size={18} color={COLOR.GREY2} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.cartBar}>
          <TouchableOpacity
            style={styles.cartBarLeft}
            onPress={() => setCartOpen(true)}
            disabled={cart.length === 0}>
            <Ionicons name="cart" size={20} color={COLOR.PRIMARY} />
            <View style={{marginLeft: 8}}>
              <Text style={styles.cartBarTotal}>₹{total.toFixed(2)}</Text>
              <Text style={styles.cartBarItems}>
                {cartItemCount} item{cartItemCount === 1 ? '' : 's'}
                {cart.length > 0 ? ' · tap to review' : ''}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.placeBtn, submitting && {opacity: 0.6}]}
            disabled={submitting}
            onPress={submit}>
            <Ionicons
              name={isEdit ? 'save' : 'send'}
              size={16}
              color={'#fff'}
            />
            <Text style={styles.placeBtnText}>
              {submitting
                ? 'Saving...'
                : isEdit
                  ? 'Update'
                  : 'Place'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <CategoryPickerModal
        open={categoryPickerOpen}
        close={() => setCategoryPickerOpen(false)}
        value={selectedCategory}
        categories={categoryOptions}
        onChange={(c: any) => setSelectedCategory(c)}
      />

      {/* Cart review modal */}
      {cartOpen ? (
        <View style={styles.cartOverlay}>
          <View style={styles.cartSheet}>
            <View style={styles.cartSheetHeader}>
              <Text style={styles.cartSheetTitle}>Review order</Text>
              <TouchableOpacity onPress={() => setCartOpen(false)}>
                <Ionicons name="close" size={22} color={COLOR.GREY1} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{maxHeight: 280}}
              keyboardShouldPersistTaps="handled">
              {cart.length === 0 ? (
                <Text style={styles.cartEmpty}>No items yet.</Text>
              ) : (
                cart.map((c) => (
                  <View key={c.productId} style={styles.cartItem}>
                    <Text style={styles.cartItemName} numberOfLines={1}>
                      {c.idescription}
                    </Text>
                    <View style={styles.cartItemQty}>
                      <TouchableOpacity
                        style={styles.qtyTouchTarget}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                        onPress={() => decFromCart(c.productId)}>
                        <Ionicons
                          name="remove-circle"
                          size={30}
                          color={COLOR.PRIMARY}
                        />
                      </TouchableOpacity>
                      <Text style={styles.cartItemQtyText}>{c.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyTouchTarget}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                        onPress={() =>
                          setCart((prev) =>
                            prev.map((p) =>
                              p.productId === c.productId
                                ? {...p, quantity: p.quantity + 1}
                                : p,
                            ),
                          )
                        }>
                        <Ionicons
                          name="add-circle"
                          size={30}
                          color={COLOR.PRIMARY}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cartItemAmt}>
                      ₹{(c.sp_price * c.quantity).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                      onPress={() => removeFromCart(c.productId)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={'#D32F2F'}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryAmt}>
                ₹{subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Parcel ({cartItemCount} item{cartItemCount === 1 ? '' : 's'} × ₹
                {PARCEL_CHARGE_PER_ITEM})
              </Text>
              <Text style={styles.summaryAmt}>
                ₹{parcelCharge.toFixed(2)}
              </Text>
            </View>
            <View style={styles.cartSheetTotalRow}>
              <Text style={styles.cartSheetTotalLabel}>Total</Text>
              <Text style={styles.cartSheetTotalAmt}>
                ₹{total.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cartSheetCloseBtn}
              onPress={() => setCartOpen(false)}>
              <Text style={styles.cartSheetCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
  },
  branchText: {
    flex: 1,
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.PRIMARY,
  },
  parcelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F57C00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    marginRight: 8,
  },
  parcelBadgeText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.3,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.GREY4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
    gap: 4,
    maxWidth: 220,
  },
  categoryChipText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 12,
    color: COLOR.GREY1,
    marginHorizontal: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 10,
    backgroundColor: COLOR.GREY4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY1,
    padding: 0,
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 12,
    paddingBottom: 200, // leave room for the floating cart bar + narration
    gap: GRID_GAP,
  },
  empty: {
    fontFamily: FONTS.REGULAR,
    color: COLOR.GREY2,
    textAlign: 'center',
    marginTop: 30,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
    paddingTop: 14,
    paddingBottom: 10,
    minHeight: 100,
    position: 'relative',
  },
  gridCardSelected: {
    borderColor: COLOR.PRIMARY,
    backgroundColor: '#F0F7FF',
  },
  qtyBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLOR.PRIMARY,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    zIndex: 2,
  },
  qtyBadgeText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 12,
    color: '#fff',
  },
  cardName: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.GREY1,
    paddingHorizontal: 12,
    paddingRight: 36, // avoid clashing with qty badge
    minHeight: 38,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  cardPrice: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: COLOR.PRIMARY,
  },
  plusBtn: {
    backgroundColor: COLOR.PRIMARY,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyTouchTarget: {
    padding: 4,
  },
  // Bottom dock — narration row + cart bar, both pinned
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLOR.GREY3,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: -3},
    shadowRadius: 5,
  },
  narrationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLOR.GREY4,
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
    gap: 8,
  },
  narrationInput: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY1,
    padding: 0,
    minHeight: 22,
    maxHeight: 60,
  },
  cartBar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartBarLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBarTotal: {
    fontFamily: FONTS.BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
  },
  cartBarItems: {
    fontFamily: FONTS.REGULAR,
    fontSize: 11,
    color: COLOR.GREY2,
  },
  placeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  placeBtnText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: '#fff',
  },
  // Cart review modal
  cartOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  cartSheet: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cartSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
    marginBottom: 10,
  },
  cartSheetTitle: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
  },
  cartEmpty: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    paddingVertical: 14,
    textAlign: 'center',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
  },
  cartItemName: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY1,
  },
  cartItemQty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartItemQtyText: {
    minWidth: 18,
    textAlign: 'center',
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: COLOR.GREY1,
  },
  cartItemAmt: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: COLOR.PRIMARY,
    width: 70,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY2,
  },
  summaryAmt: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY1,
  },
  cartSheetTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: COLOR.GREY3,
    marginTop: 6,
  },
  cartSheetTotalLabel: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 15,
    color: COLOR.GREY1,
  },
  cartSheetTotalAmt: {
    fontFamily: FONTS.BOLD,
    fontSize: 18,
    color: COLOR.PRIMARY,
  },
  cartSheetCloseBtn: {
    marginTop: 14,
    backgroundColor: COLOR.GREY4,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  cartSheetCloseText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.GREY1,
  },
});

export default CreateOrderScreen;
