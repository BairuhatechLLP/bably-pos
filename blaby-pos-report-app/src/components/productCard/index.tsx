import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

export default function ProductCard(props: any) {
  const {item} = props;
  const [expanded, setExpanded] = useState(false);

  // Format currency
  const formatCurrency = (value: any) => {
    const num = parseFloat(value) || 0;
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format number
  const formatNumber = (value: any) => {
    const num = parseInt(value) || 0;
    return num.toLocaleString('en-IN');
  };

  // Format date
  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}>
      <LinearGradient
        colors={['#ffffff', '#f5f9ff']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}>
        {/* Product Header */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="pricetag" size={24} color={COLOR.PRIMARY} />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.productName} numberOfLines={2}>
              {item?.productName || 'Unknown Product'}
            </Text>
            {item?.category && (
              <Text style={styles.category}>{item.category}</Text>
            )}
            {item?.barcode && (
              <Text style={styles.barcode}>Barcode: {item.barcode}</Text>
            )}
          </View>
        </View>

        {/* Summary Metrics */}
        <View style={styles.metricsContainer}>
          {/* Total Quantity */}
          <View style={styles.metricBox}>
            <View style={[styles.metricIconBox, {backgroundColor: '#e3f2fd'}]}>
              <Ionicons name="cube-outline" size={18} color="#1976d2" />
            </View>
            <Text style={styles.metricLabel}>Quantity</Text>
            <Text style={styles.metricValue}>
              {formatNumber(item?.totalQuantity)}
            </Text>
          </View>

          {/* Total Revenue */}
          <View style={styles.metricBox}>
            <View style={[styles.metricIconBox, {backgroundColor: '#e8f5e9'}]}>
              <Ionicons name="cash-outline" size={18} color="#388e3c" />
            </View>
            <Text style={styles.metricLabel}>Revenue</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(item?.totalRevenue)}
            </Text>
          </View>

          {/* Order Count */}
          <View style={styles.metricBox}>
            <View style={[styles.metricIconBox, {backgroundColor: '#fff3e0'}]}>
              <Ionicons name="receipt-outline" size={18} color="#f57c00" />
            </View>
            <Text style={styles.metricLabel}>Orders</Text>
            <Text style={styles.metricValue}>
              {formatNumber(item?.orderCount)}
            </Text>
          </View>
        </View>

        {/* Unit Price */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Unit Price:</Text>
          <Text style={styles.priceValue}>
            {formatCurrency(item?.unitPrice)}
          </Text>
        </View>

        {/* Expandable Order Details */}
        {item?.orders && item.orders.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setExpanded(!expanded)}>
              <Text style={styles.expandButtonText}>
                {expanded ? 'Hide' : 'Show'} Order Details ({item.orders.length})
              </Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLOR.PRIMARY}
              />
            </TouchableOpacity>

            {expanded && (
              <View style={styles.ordersContainer}>
                {item.orders.map((order: any, index: number) => (
                  <View key={index} style={styles.orderItem}>
                    {/* Token Number and Status */}
                    <View style={styles.orderHeader}>
                      <View style={styles.tokenContainer}>
                        <Ionicons
                          name="ticket-outline"
                          size={16}
                          color={COLOR.PRIMARY}
                        />
                        <Text style={styles.tokenText}>
                          Token: {order.tokenNumber || 'N/A'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              order.orderStatus === 'finished'
                                ? '#e8f5e9'
                                : order.orderStatus === 'started'
                                ? '#fff3e0'
                                : '#e3f2fd',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                order.orderStatus === 'finished'
                                  ? '#388e3c'
                                  : order.orderStatus === 'started'
                                  ? '#f57c00'
                                  : '#1976d2',
                            },
                          ]}>
                          {order.orderStatus}
                        </Text>
                      </View>
                    </View>

                    {/* Order Date */}
                    <View style={styles.orderDateRow}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={COLOR.GREY2}
                      />
                      <Text style={styles.orderDateText}>
                        {formatDateTime(order.orderDate)}
                      </Text>
                    </View>

                    {/* Order Details Grid */}
                    <View style={styles.orderDetailsGrid}>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Quantity</Text>
                        <Text style={styles.detailGridValue}>
                          {order.quantity}
                        </Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Unit Price</Text>
                        <Text style={styles.detailGridValue}>
                          {formatCurrency(order.price)}
                        </Text>
                      </View>
                      <View style={[styles.detailGridItem, styles.totalGridItem]}>
                        <Text style={styles.detailGridLabel}>Item Total</Text>
                        <Text
                          style={[
                            styles.detailGridValue,
                            styles.totalValue,
                          ]}>
                          {formatCurrency(order.itemTotal)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    padding: 15,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
    borderRadius: 12,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLOR.LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  productName: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
    marginBottom: 4,
  },
  category: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.PRIMARY,
    marginBottom: 2,
  },
  barcode: {
    fontFamily: FONTS.REGULAR,
    fontSize: 11,
    color: COLOR.GREY2,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: 11,
    color: COLOR.GREY2,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: COLOR.GREY1,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  priceLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: 13,
    color: COLOR.GREY2,
  },
  priceValue: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 15,
    color: COLOR.PRIMARY,
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLOR.GREY3,
  },
  expandButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.PRIMARY,
    marginRight: 5,
  },
  ordersContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLOR.GREY3,
  },
  orderItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  tokenText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.PRIMARY,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  orderDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  orderDateText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
  },
  orderDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  detailGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalGridItem: {
    backgroundColor: '#e8f5e9',
    marginLeft: 8,
    borderRadius: 6,
    paddingVertical: 4,
  },
  detailGridLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: 10,
    color: COLOR.GREY2,
    marginBottom: 4,
  },
  detailGridValue: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: COLOR.GREY1,
  },
  totalValue: {
    color: COLOR.PRIMARY,
    fontSize: 14,
  },
});
