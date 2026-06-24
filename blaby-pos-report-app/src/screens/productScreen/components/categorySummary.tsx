import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../../config/color';
import FONTS from '../../../config/fonts';

interface Summary {
  totalCategories: number;
  totalProducts: number;
  grandTotalAmount: number;
  grandTotalSold: number;
}

interface CategorySummaryProps {
  summary: Summary;
}

function CategorySummary({summary}: CategorySummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.statBox}>
          <View style={[styles.iconBox, {backgroundColor: '#E3F2FD'}]}>
            <Ionicons name="grid-outline" size={20} color="#1976D2" />
          </View>
          <View style={styles.statTextBox}>
            <Text style={styles.statValue}>{summary.totalCategories}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.iconBox, {backgroundColor: '#E8F5E9'}]}>
            <Ionicons name="cube-outline" size={20} color="#388E3C" />
          </View>
          <View style={styles.statTextBox}>
            <Text style={styles.statValue}>{summary.totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.statBox}>
          <View style={[styles.iconBox, {backgroundColor: '#FFF3E0'}]}>
            <Ionicons name="cash-outline" size={20} color="#F57C00" />
          </View>
          <View style={styles.statTextBox}>
            <Text style={styles.statValue}>
              {Number(summary.grandTotalAmount).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.iconBox, {backgroundColor: '#F3E5F5'}]}>
            <Ionicons name="analytics-outline" size={20} color="#7B1FA2" />
          </View>
          <View style={styles.statTextBox}>
            <Text style={styles.statValue}>{summary.grandTotalSold}</Text>
            <Text style={styles.statLabel}>Units Sold</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GREY6,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statTextBox: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONTS.BOLD,
    color: COLORS.GREY1,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.REGULAR,
    color: COLORS.GREY2,
    marginTop: 2,
  },
});

export default CategorySummary;
