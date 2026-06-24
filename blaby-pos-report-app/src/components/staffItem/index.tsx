import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

export default function StaffItem(props: any) {
  const {item} = props;
  const navigation = useNavigation<any>();

  // Extract data from nested structure
  const staffInfo = item?.staffInfo || {};
  const summary = item?.summary || {};

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
  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'});
    } catch {
      return dateStr;
    }
  };

  // Navigate to staff products screen
  const handlePress = () => {
    navigation.navigate('StaffProducts', {
      staffInfo: staffInfo,
      dateRange: item?.dateRange,
      filter: item?.dateRange?.filter || 'day',
    });
  };

  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={handlePress}>
      <LinearGradient
        colors={['#ffffff', '#f5fff9']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}>

        {/* Staff Name Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={24} color={COLOR.PRIMARY} />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.staffName} numberOfLines={1}>
              {staffInfo?.staffName || 'Unknown Staff'}
            </Text>
            <Text style={styles.staffId}>ID: {staffInfo?.staffId || 'N/A'}</Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsContainer}>
          {/* Total Orders */}
          <View style={styles.metricBox}>
            <View style={[styles.metricIconBox, {backgroundColor: '#e3f2fd'}]}>
              <Ionicons name="receipt-outline" size={18} color="#1976d2" />
            </View>
            <Text style={styles.metricLabel}>Orders</Text>
            <Text style={styles.metricValue}>{formatNumber(summary?.totalOrders)}</Text>
          </View>

          {/* Total Sales */}
          <View style={styles.metricBox}>
            <View style={[styles.metricIconBox, {backgroundColor: '#e8f5e9'}]}>
              <Ionicons name="cash-outline" size={18} color="#388e3c" />
            </View>
            <Text style={styles.metricLabel}>Sales</Text>
            <Text style={styles.metricValue}>{formatCurrency(summary?.totalSales)}</Text>
          </View>

          {/* Average Order Value */}
          <View style={styles.metricBox}>
            <View style={[styles.metricIconBox, {backgroundColor: '#fff3e0'}]}>
              <Ionicons name="trending-up-outline" size={18} color="#f57c00" />
            </View>
            <Text style={styles.metricLabel}>Avg Order</Text>
            <Text style={styles.metricValue}>{formatCurrency(summary?.avgOrderValue)}</Text>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.footerSection}>
          <View style={styles.infoItem}>
            <Ionicons name="business-outline" size={14} color={COLOR.GREY2} />
            <Text style={styles.infoText}>Branch: {staffInfo?.branchName || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color={COLOR.GREY2} />
            <Text style={styles.infoText}>Last Sale: {formatDate(item?.dateRange?.endDate)}</Text>
          </View>
        </View>

        {/* View Products Button */}
        <View style={styles.viewProductsButton}>
          <Ionicons name="pricetag-outline" size={16} color={COLOR.PRIMARY} />
          <Text style={styles.viewProductsText}>View Products</Text>
          <Ionicons name="chevron-forward" size={16} color={COLOR.PRIMARY} />
        </View>

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
    alignItems: 'center',
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
  staffName: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
    marginBottom: 4,
  },
  staffId: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
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
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLOR.GREY3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 11,
    color: COLOR.GREY2,
    marginLeft: 4,
  },
  viewProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.LIGHT,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLOR.PRIMARY,
  },
  viewProductsText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: COLOR.PRIMARY,
    marginLeft: 6,
    marginRight: 6,
  },
});
