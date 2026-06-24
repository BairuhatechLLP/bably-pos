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

function Filters(props: any) {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState(props?.query);
  const format = `YYYY-MM-DD HH:mm:ss`;
  // Date filter options: Today, Yesterday, This Month, Custom
  let date = [
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

  const customeDate = (date: any) => {
    let obj = {
      key: 'Custom',
      from_date: moment(date).startOf('day').format(format),
      to_date: moment(date).endOf('day').format(format),
    };
    props?.setDate(obj);
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

  return (
    <View style={styles.Filters}>
      <View style={styles.FilterBox}>
        <View style={styles.inputBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.GREY2} />
          <TextInput
            placeholder="Search branches . . ."
            style={styles.input}
            value={query}
            placeholderTextColor={"grey"}
            onChangeText={text => {
              setQuery(text);
              onValuesChange(text);
            }}
          />
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={
              props?.date?.key === 'Custom' ? COLORS.PRIMARY : COLORS.GREY1
            }
          />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {date?.map((item: any, index: any) => {
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
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={[
            props?.date?.key === 'Custom'
              ? styles.FilterItemActive
              : styles.FilterItem,
          ]}>
          <Text
            style={[
              props?.date?.key === 'Custom'
                ? styles.FilterTextActive
                : styles.FilterText,
            ]}>
            Custom
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.FilterBox2}>
        <Text style={styles.FilterText2}>
          {props?.dataConunt} branch{props?.dataConunt > 1 ? 'es' : ''} on{' '}
          {props?.query ? `'${props?.query}'` : ''}{' '}
          {props?.date?.key === 'Today'
            ? moment(props?.date?.from_date).format('ll')
            : `${moment(props?.date?.from_date).format('ll')} to ${moment(
                props?.date?.to_date,
              ).format('DD')}`}
        </Text>
        {props?.loading ? (
          <ActivityIndicator size={'small'} color={COLORS?.PRIMARY} />
        ) : props?.query || props?.date?.key !== 'Today' ? (
          <TouchableOpacity onPress={() => Clear()}>
            <Text style={{color: 'red'}}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {showModal ? (
        <DatePickerModal
          open={showModal}
          date={new Date()}
          close={() => setShowModal(false)}
          onChange={(data: any) => customeDate(data)}
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
});

export default Filters;
