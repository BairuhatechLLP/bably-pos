import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import FONTS from '../../../config/fonts';
import COLORS from '../../../config/color';

const TableItem = (props: any) => {
  return (
    <TouchableOpacity
      style={[
        styles.TableItem,
        props?.active?.id === props?.item?.id ? styles.active : {},
      ]}
      onPress={() => props.onChange()}>
      <Text
        style={[
          styles.text1,
          {color: props?.active?.id === props?.item?.id ? '#fff' : '#000'},
        ]}>
        {props?.item?.table_number}
      </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  TableItem: {
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    borderRadius: 8,
    padding: 3,
    paddingHorizontal: 10,
    paddingBottom:0
  },
  active: {
    backgroundColor: COLORS.primary,
  },
  text1: {
    fontSize: 13,
    fontFamily: FONTS.Medium,
  },
});
export default TableItem;
