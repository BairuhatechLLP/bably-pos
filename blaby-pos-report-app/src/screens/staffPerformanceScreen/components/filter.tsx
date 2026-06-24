import React, {useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';
import BranchPickerModal from '../../../components/branchPicker';
import DateRangePickerModal from '../../../components/dateRangePicker';

export default function Filters(props: any) {
  const branches = useSelector((state: any) => state?.Dropdown?.branches);
  const [openBranchModal, setOpenBranchModal] = useState(false);
  const [openDateModal, setOpenDateModal] = useState(false);

  return (
    <View style={styles.Filters}>
      {/* Result Count */}
      <View style={styles.resultCount}>
        <Text style={styles.resultText}>
          {props?.loading ? (
            <ActivityIndicator size="small" color={COLOR.PRIMARY} />
          ) : (
            <>
              <Text style={styles.countNumber}>{props?.dataCount || 0}</Text>
              {' staff members'}
            </>
          )}
        </Text>
      </View>

      {/* Filter Buttons Row */}
      <View style={styles.filterRow}>
        {/* Branch Filter */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setOpenBranchModal(true)}>
          <View style={styles.filterIconBox}>
            <Ionicons name="business" size={16} color={COLOR.PRIMARY} />
          </View>
          <View style={styles.filterTextBox}>
            <Text style={styles.filterLabel}>Branch</Text>
            <Text style={styles.filterValue} numberOfLines={1}>
              {props?.branch?.bname || 'All Branches'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={COLOR.GREY2} />
        </TouchableOpacity>

        {/* Date Filter */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setOpenDateModal(true)}>
          <View style={styles.filterIconBox}>
            <Ionicons name="calendar" size={16} color={COLOR.PRIMARY} />
          </View>
          <View style={styles.filterTextBox}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <Text style={styles.filterValue} numberOfLines={1}>
              {props?.date?.key || 'Select Date Range'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={COLOR.GREY2} />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <BranchPickerModal
        open={openBranchModal}
        close={() => setOpenBranchModal(false)}
        value={props?.branch}
        onChange={(value: any) => props?.setBranch(value)}
      />

      <DateRangePickerModal
        open={openDateModal}
        close={() => setOpenDateModal(false)}
        value={props?.date}
        onChange={(value: any) => props?.setDate(value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  Filters: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: COLOR.GREY4,
  },
  resultCount: {
    marginBottom: 12,
  },
  resultText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
    color: COLOR.GREY2,
  },
  countNumber: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLOR.PRIMARY,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  filterIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLOR.LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  filterTextBox: {
    flex: 1,
  },
  filterLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: 11,
    color: COLOR.GREY2,
    marginBottom: 2,
  },
  filterValue: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY1,
  },
});
