import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import COLORS from '../../config/color';
import FONTS from '../../config/fonts';

const STATUS_CONFIG: Record<string, {label: string; color: string; dot: string}> = {
  sold:      {label: 'Sold',      color: '#792113', dot: '#792113'},
  pending:   {label: 'Pending',   color: '#f57c00', dot: '#f57c00'},
  cancelled: {label: 'Cancelled', color: '#E04F5F', dot: '#E04F5F'},
  unmarked:  {label: 'Unmarked',  color: '#9e9e9e', dot: '#9e9e9e'},
};

function ProductItem(props: any) {
  const navigation: any = useNavigation();
  const item = props?.item;

  const hasCancelled = item?.statusBreakdown?.some((s: any) => s.status === 'cancelled');
  const hasPending   = item?.statusBreakdown?.some((s: any) => s.status === 'pending');
  const accentColor  = hasCancelled ? '#E04F5F' : hasPending ? '#f57c00' : COLORS.PRIMARY;

  const visiblePayments = item?.paymentBreakdown?.filter(
    (p: any) => p.method !== 'Unmarked',
  ) || [];

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() =>
        navigation.navigate('ProductDetails', {
          id: item?.productId,
          branchId: item?.branchId,
        })
      }>
      {/* Left accent bar */}
      <View style={[styles.accentBar, {backgroundColor: accentColor}]} />

      <View style={styles.body}>
        {/* Top row — name + amount */}
        <View style={styles.topRow}>
          <Text style={styles.productName} numberOfLines={2}>
            {item?.productMaster?.idescription}
          </Text>
          <Text style={styles.amount}>
            {Number(item?.totalAmount || 0).toFixed(2)}
          </Text>
        </View>

        {/* Middle row — price info + units sold */}
        <View style={styles.midRow}>
          <Text style={styles.priceInfo}>
            Price {item?.productMaster?.sp_price}
            {'  ·  '}
            Avg {item?.productMaster?.average_price}
          </Text>
          <Text style={styles.unitsSold}>
            {item?.totalSold || 0}{' '}
            {item?.totalSold > 1 ? 'units' : 'unit'} sold
          </Text>
        </View>

        {/* Status row */}
        {item?.statusBreakdown?.length > 0 && (
          <View style={styles.statusRow}>
            {item.statusBreakdown.map((s: any, i: number) => {
              const cfg = STATUS_CONFIG[s.status] || {
                label: s.status,
                color: COLORS.GREY2,
                dot: COLORS.GREY2,
              };
              return (
                <React.Fragment key={s.status}>
                  {i > 0 && <Text style={styles.separator}>·</Text>}
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

        {/* Payment row */}
        {visiblePayments.length > 0 && (
          <View style={styles.paymentRow}>
            {visiblePayments.map((p: any, i: number) => (
              <View key={i} style={styles.paymentChip}>
                <Text style={styles.paymentText}>
                  {p.method}: {Number(p.amount || 0).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default ProductItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY3,
  },
  accentBar: {
    width: 4,
    borderRadius: 0,
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.SEMI_BOLD,
    color: COLORS.GREY1,
    lineHeight: 21,
  },
  amount: {
    fontSize: 16,
    fontFamily: FONTS.BOLD,
    color: COLORS.PRIMARY,
    textAlign: 'right',
    marginTop: 1,
  },
  midRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  priceInfo: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: COLORS.GREY2,
  },
  unitsSold: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.GREY1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
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
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  separator: {
    fontSize: 12,
    color: COLORS.GREY3,
    marginHorizontal: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  paymentChip: {
    backgroundColor: COLORS.GREY6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  paymentText: {
    fontSize: 11,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.PRIMARY,
  },
});
