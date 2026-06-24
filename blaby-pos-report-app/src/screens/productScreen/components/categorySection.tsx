import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../../config/color';
import FONTS from '../../../config/fonts';

interface StatusItem {
  status: string;
  qty: number;
}

interface Product {
  productId: number;
  totalAmount: number;
  totalSold: number;
  branchId: number;
  statusBreakdown?: StatusItem[];
  paymentBreakdown?: any[];
  productMaster: {
    idescription: string;
    sp_price: string;
    current_price: string;
    average_price: string;
  };
}

interface Category {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
  totalSold: number;
  productCount: number;
  products: Product[];
  paymentBreakdown?: any[];
}

interface CategorySectionProps {
  category: Category;
  defaultExpanded?: boolean;
}

const STATUS_CONFIG: Record<string, {label: string; color: string; dot: string}> = {
  sold:      {label: 'Sold',      color: '#792113', dot: '#792113'},
  pending:   {label: 'Pending',   color: '#f57c00', dot: '#f57c00'},
  cancelled: {label: 'Cancelled', color: '#E04F5F', dot: '#E04F5F'},
  unmarked:  {label: 'Unmarked',  color: '#9e9e9e', dot: '#9e9e9e'},
};

function CategorySection({category, defaultExpanded = false}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const navigation: any = useNavigation();

  const renderProductItem = ({item, index}: {item: Product; index: number}) => {
    const hasCancelled = item?.statusBreakdown?.some(s => s.status === 'cancelled');
    const hasPending   = item?.statusBreakdown?.some(s => s.status === 'pending');
    const accentColor  = hasCancelled ? '#E04F5F' : hasPending ? '#f57c00' : COLORS.PRIMARY;
    const visiblePayments = item?.paymentBreakdown?.filter(p => p.method !== 'Unmarked') || [];
    const isLast = index === category.products.length - 1;

    return (
      <TouchableOpacity
        style={[styles.productItem, isLast && styles.productItemLast]}
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate('ProductDetails', {
            id: item?.productId,
            branchId: item?.branchId,
          })
        }>
        {/* Left accent dot */}
        <View style={[styles.itemAccent, {backgroundColor: accentColor}]} />

        <View style={styles.itemBody}>
          {/* Name + amount */}
          <View style={styles.itemTopRow}>
            <Text style={styles.productName} numberOfLines={2}>
              {item?.productMaster?.idescription}
            </Text>
            <Text style={styles.productAmount}>
              {Number(item?.totalAmount || 0).toFixed(2)}
            </Text>
          </View>

          {/* Price info + units */}
          <View style={styles.itemMidRow}>
            <Text style={styles.productPrice}>
              Price {item?.productMaster?.sp_price}
            </Text>
            <Text style={styles.productSold}>
              {item?.totalSold || 0} {item?.totalSold > 1 ? 'units' : 'unit'} sold
            </Text>
          </View>

          {/* Status breakdown */}
          {item?.statusBreakdown && item.statusBreakdown.length > 0 && (
            <View style={styles.statusRow}>
              {item.statusBreakdown.map((s: StatusItem, i: number) => {
                const cfg = STATUS_CONFIG[s.status] || {
                  label: s.status,
                  color: COLORS.GREY2,
                  dot: COLORS.GREY2,
                };
                return (
                  <React.Fragment key={s.status}>
                    {i > 0 && <Text style={styles.statusSep}>·</Text>}
                    <View style={styles.statusChip}>
                      <View style={[styles.dot, {backgroundColor: cfg.dot}]} />
                      <Text style={[styles.statusText, {color: cfg.color}]}>
                        {cfg.label}: {s.qty}
                      </Text>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          )}

          {/* Payment chips */}
          {visiblePayments.length > 0 && (
            <View style={styles.paymentRow}>
              {visiblePayments.map((p: any, i: number) => (
                <View key={i} style={styles.paymentChip}>
                  <Text style={styles.paymentChipText}>
                    {p.method}: {Number(p.amount || 0).toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const visibleCategoryPayments = category.paymentBreakdown?.filter(
    p => p.method !== 'Unmarked',
  ) || [];

  return (
    <View style={styles.container}>
      {/* Category header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <View style={styles.categoryIcon}>
            <Ionicons name="grid-outline" size={16} color={COLORS.PRIMARY} />
          </View>
          <View style={styles.headerTextBox}>
            <Text style={styles.categoryName} numberOfLines={1}>
              {category.categoryName}
            </Text>
            <Text style={styles.productCount}>
              {category.productCount} product{category.productCount !== 1 ? 's' : ''}
              {'  ·  '}
              {category.totalSold} units sold
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.totalAmount}>
            {Number(category.totalAmount).toFixed(2)}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.GREY2}
          />
        </View>
      </TouchableOpacity>

      {/* Category payment bar */}
      {visibleCategoryPayments.length > 0 && (
        <View style={styles.paymentBar}>
          {visibleCategoryPayments.map((p: any, i: number) => (
            <View key={i} style={styles.categoryPaymentChip}>
              <Ionicons
                name={p.method === 'Cash' ? 'cash-outline' : 'phone-portrait-outline'}
                size={11}
                color={COLORS.PRIMARY}
              />
              <Text style={styles.categoryPaymentText}>
                {p.method}: {Number(p.amount || 0).toFixed(0)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Expanded product list */}
      {expanded && (
        <View style={styles.productsContainer}>
          <FlatList
            data={category.products}
            renderItem={renderProductItem}
            keyExtractor={(item, index) => `${item.productId}-${index}`}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  // ── Category Header ──────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.GREY6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTextBox: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: FONTS.SEMI_BOLD,
    color: COLORS.GREY1,
  },
  productCount: {
    fontSize: 11,
    fontFamily: FONTS.REGULAR,
    color: COLORS.GREY2,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalAmount: {
    fontSize: 15,
    fontFamily: FONTS.BOLD,
    color: COLORS.PRIMARY,
  },

  // ── Category Payment Bar ─────────────────────────────
  paymentBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.GREY3,
    backgroundColor: '#fff',
  },
  categoryPaymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.GREY6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryPaymentText: {
    fontSize: 11,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.PRIMARY,
  },

  // ── Product Items ────────────────────────────────────
  productsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.GREY3,
  },
  productItem: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY4,
  },
  productItemLast: {
    borderBottomWidth: 0,
  },
  itemAccent: {
    width: 3,
  },
  itemBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.SEMI_BOLD,
    color: COLORS.GREY1,
    lineHeight: 19,
  },
  productAmount: {
    fontSize: 14,
    fontFamily: FONTS.BOLD,
    color: COLORS.PRIMARY,
    textAlign: 'right',
    marginTop: 1,
  },
  itemMidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 11,
    fontFamily: FONTS.REGULAR,
    color: COLORS.GREY2,
  },
  productSold: {
    fontSize: 11,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.GREY1,
  },

  // ── Status Row ───────────────────────────────────────
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 7,
    gap: 4,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: FONTS.MEDIUM,
  },
  statusSep: {
    fontSize: 11,
    color: COLORS.GREY3,
    marginHorizontal: 2,
  },

  // ── Payment Row ──────────────────────────────────────
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 7,
  },
  paymentChip: {
    backgroundColor: COLORS.GREY6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paymentChipText: {
    fontSize: 10,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.PRIMARY,
  },
});

export default CategorySection;
