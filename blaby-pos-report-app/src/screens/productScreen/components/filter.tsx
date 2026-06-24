import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import {debounce} from 'lodash';

import COLORS from '../../../config/color';
import FONTS from '../../../config/fonts';
import DatePickerModal from '../../../components/datePicker';
import BranchPickerModal from '../../../components/branchPicker';
import CustomDateRangePicker from '../../../components/customDateRangePicker';

function Filters(props: any) {
  const [showModal, setShowModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [query, setQuery] = useState(props?.query);
  const format = `YYYY-MM-DD HH:mm:ss`;

  // Date filter options: Today, Yesterday, This Month, Custom
  const dateOptions = [
    {
      key: 'Today',
      from_date: moment().startOf('day').format(format),
      to_date: moment().endOf('day').format(format),
    },
    {
      key: 'Yesterday',
      from_date: moment().subtract(1, 'day').startOf('day').format(format),
      to_date: moment().subtract(1, 'day').endOf('day').format(format),
    },
    {
      key: 'This Month',
      from_date: moment().startOf('month').format(format),
      to_date: moment().endOf('month').format(format),
    },
  ];

  const dateChange = (date: any) => {
    props?.setDate(date);
  };

  const handleCustomDateRange = (dateRange: any) => {
    props?.setDate(dateRange);
  };

  const onValuesChange = useCallback(
    debounce((value: any) => {
      props?.setQuery(value);
    }, 500),
    [],
  );

  const Clear = () => {
    props?.setDate({
      key: 'Today',
      from_date: moment().startOf('day').format(format),
      to_date: moment().endOf('day').format(format),
    });
    props?.setQuery(null);
    setQuery(null);
  };

  const isCustomRange = props?.date?.key === 'Custom Range';

  // Format date display text
  const getDateDisplayText = () => {
    if (props?.date?.key === 'Today') {
      return moment(props?.date?.from_date).format('ll');
    } else if (props?.date?.key === 'Yesterday') {
      return moment(props?.date?.from_date).format('ll');
    } else {
      return `${moment(props?.date?.from_date).format('ll')} to ${moment(
        props?.date?.to_date,
      ).format('ll')}`;
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.branchFilter}
        onPress={() => setShowBranchModal(true)}>
        <Ionicons name="storefront" size={16} color={'grey'} />
        <View style={{flex: 1}}>
          <Text style={styles.branchText} numberOfLines={1}>
            {props?.branchId?.bname || 'Select branch'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={'grey'} />
      </TouchableOpacity>
      <View style={styles.Filters}>
        <View style={styles.FilterBox}>
          <View style={styles.inputBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.GREY2} />
            <TextInput
              placeholder="Search products . . ."
              style={styles.input}
              value={query}
              placeholderTextColor={"grey"}
              onChangeText={text => {
                setQuery(text);
                onValuesChange(text);
              }}
            />
          </View>
          <TouchableOpacity onPress={() => setShowRangeModal(true)}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={isCustomRange ? COLORS.PRIMARY : COLORS.GREY1}
            />
          </TouchableOpacity>
        </View>

        {/* Date Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dateOptions?.map((item: any, index: any) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => dateChange(item)}
                style={[
                  props?.date?.key === item?.key
                    ? styles.FilterItemActive
                    : styles.FilterItem,
                ]}>
                <Text
                  style={[
                    props?.date?.key === item?.key
                      ? styles.FilterTextActive
                      : styles.FilterText,
                  ]}>
                  {item?.key}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* Custom Range Button */}
          <TouchableOpacity
            onPress={() => setShowRangeModal(true)}
            style={[
              isCustomRange
                ? styles.FilterItemActive
                : styles.FilterItem,
              styles.customRangeItem,
            ]}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isCustomRange ? '#fff' : COLORS.GREY1}
            />
            <Text
              style={[
                isCustomRange
                  ? styles.FilterTextActive
                  : styles.FilterText,
              ]}>
              Custom
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.FilterBox2}>
          <Text style={styles.FilterText2}>
            {props?.dataConunt} products{' '}
            {props?.query ? `for '${props?.query}'` : ''}{' '}
            on {getDateDisplayText()}
          </Text>
          {props?.loading ? (
            <ActivityIndicator size={'small'} color={COLORS?.PRIMARY} />
          ) : (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
              {props?.query || props?.date?.key !== 'Today' ? (
                <TouchableOpacity onPress={() => Clear()}>
                  <Text style={{color: 'red', fontFamily: FONTS.MEDIUM, fontSize: 12}}>Clear</Text>
                </TouchableOpacity>
              ) : null}
              {props?.onExport ? (
                <TouchableOpacity
                  style={styles.exportBtn}
                  disabled={props?.exporting}
                  onPress={props.onExport}>
                  {props?.exporting ? (
                    <ActivityIndicator size={12} color={COLORS.PRIMARY} />
                  ) : (
                    <Ionicons name="download-outline" size={14} color={COLORS.PRIMARY} />
                  )}
                  <Text style={styles.exportText}>Export</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
      </View>

      {/* Custom Date Range Picker Modal */}
      {showRangeModal ? (
        <CustomDateRangePicker
          open={showRangeModal}
          close={() => setShowRangeModal(false)}
          onChange={handleCustomDateRange}
          initialFromDate={
            props?.date?.from_date
              ? new Date(props.date.from_date)
              : new Date()
          }
          initialToDate={
            props?.date?.to_date ? new Date(props.date.to_date) : new Date()
          }
        />
      ) : null}

      {showBranchModal ? (
        <BranchPickerModal
          open={showBranchModal}
          value={props?.branchId}
          close={() => setShowBranchModal(false)}
          onChange={(data: any) => props?.setBranch(data)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  Filters: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomColor: COLORS?.GREY3,
    borderBottomWidth: 1,
  },
  FilterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 13,
  },
  FilterBox2: {
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.GREY3,
    backgroundColor: COLORS.GREY4,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    flex: 1,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    padding: Platform.OS === 'ios' ? 10 : 11,
    paddingLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  FilterItem: {
    borderColor: COLORS.GREY3,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 100,
  },
  FilterItemActive: {
    borderColor: COLORS.GREY3,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: COLORS?.PRIMARY,
  },
  FilterText: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: COLORS.GREY1,
  },
  FilterTextActive: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: '#fff',
  },
  FilterText2: {
    fontSize: 14,
    fontFamily: FONTS.BOLD,
    color: COLORS.GREY1,
    flex: 1,
  },
  customRangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  branchFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS?.GREY6,
    paddingHorizontal: 16,
    padding: 10,
    borderBottomColor: COLORS?.GREY3,
    borderBottomWidth: 0.5
  },
  branchText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#000',
    flex: 1,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.GREY6,
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  exportText: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.PRIMARY,
  },
});

export default Filters;
