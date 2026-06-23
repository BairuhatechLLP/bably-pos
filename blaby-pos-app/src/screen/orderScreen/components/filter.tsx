import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import FONTS from '../../../config/fonts';
import COLORS from '../../../config/color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {isMobile} from '../../../utils/responsive';
import {debounce} from 'lodash';
import {Tables_FindAll} from '../../../database/query/tables';

const Filter = (props: any) => {
  const status = [
    {key: 1, label: 'All Orders', value: 'all'},
    {key: 2, label: 'Pending', value: 'pending'},
    {key: 3, label: 'Finished', value: 'finished'},
    {key: 4, label: 'Cancelled', value: 'cancelled'},
  ];

  const onValuesChange = useCallback(
    debounce((value: any) => {
      props?.setQuery(value);
    }, 500),
    [],
  );

  const onTableChange = useCallback(
    debounce((value: any) => {
      props?.setTable(value); // Assuming setTable is a prop to update the selected table
    }, 500),
    [],
  );

  return (
    <View style={styles.FilterBox}>
      {/* Search Input */}
      <View style={styles.inputBox}>
        {props?.loading2 ? (
          <ActivityIndicator size={'small'} color={COLORS?.primary} />
        ) : (
          <Ionicons name="search-outline" size={20} color={'grey'} />
        )}
        <TextInput
          style={styles.input}
          placeholder={`Search token or table . . .`}
          placeholderTextColor={'grey'}
          onChangeText={(value: any) => onValuesChange(value)}
        />
      </View>

      {/* Total Orders Display (Hidden on Mobile) */}
      {!isMobile() && (
        <View style={{flex: 1, justifyContent: 'center'}}>
          {props?.loading2 ? null : (
            <Text style={styles.text1}>
              {props?.total} Orders showing out of {props?.meta?.itemCount}
            </Text>
          )}
        </View>
      )}
      {/* Status Filter */}
      <View style={styles.filterSection}>
        {/* <Text style={styles.filterLabel}>Filter by Status</Text> */}
        <ScrollView
          contentContainerStyle={styles.Box1}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {status?.map((item: any) => {
            let selected = props?.status === item?.value;
            return (
              <TouchableOpacity
                style={[styles.btn1, selected ? styles.selected : {}]}
                key={item?.key}
                onPress={() => props?.setStatus(item?.value)}>
                <Text style={styles.btn1Text}>{item.label}</Text>
                {selected ? (
                  props?.loading2 ? (
                    <ActivityIndicator size={'small'} color={COLORS?.primary} />
                  ) : (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.primary}
                    />
                  )
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {/* Table Filter */}
      <View style={styles.filterSection}>
        <ScrollView
          contentContainerStyle={styles.Box1}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {props?.tables?.map((item: any) => {
            let selected = props?.table === item?.table_number;
            return (
              <TouchableOpacity
                style={[styles.btn1, selected ? styles.selected : {}]}
                key={item?.id}
                onPress={() => onTableChange(item)}>
                <Text style={styles.btn1Text}>{item.table_number}</Text>
                {selected ? (
                  props?.loading2 ? (
                    <ActivityIndicator size={'small'} color={COLORS?.primary} />
                  ) : (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.primary}
                    />
                  )
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  FilterBox: {
    flexDirection: isMobile() ? 'column' : 'column',
    gap: 10,
    padding: 16,
    paddingTop: 0,
    paddingBottom: 14,
    borderBottomColor: COLORS.grey4,
    borderBottomWidth: 1,
  },
  inputBox: {
    flex: isMobile() ? 0 : 0,
    backgroundColor: '#fff',
    borderColor: COLORS.grey4,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    height: isMobile() ? 40 : 40,
  },
  input: {
    flex: 1,
    color: '#000',
    padding: 0,
    fontSize: 14,
  },
  filterSection: {
    flexDirection: 'column',
    gap: 5,
  },
  filterLabel: {
    fontFamily: FONTS.Bold,
    fontSize: 12,
    color: COLORS.grey1,
    marginBottom: 5,
  },
  Box1: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: isMobile() ? 'flex-start' : 'flex-end',
    gap: 10,
  },
  btn1: {
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    borderRadius: 8,
    padding: 3,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // flex: 1,
  },
  selected: {
    borderColor: COLORS?.primary,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  btn1Text: {
    fontFamily: FONTS.Regular,
    fontSize: 12,
    marginTop: 3,
  },
  text1: {
    fontFamily: FONTS.Regular,
    fontSize: 12,
    color: COLORS.grey1,
  },
});

export default Filter;
