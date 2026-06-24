import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import moment from 'moment';

import COLORS from '../../../config/color';
import FONTS from '../../../config/fonts';
function DateItem(props: any) {
  return (
    <View style={styles.DateItem}>
      <Text style={styles.text1}>
        {moment(props?.item?.prodDate).format('DD-MM-YYYY')}
      </Text>
      <Text style={styles.text2}>{props?.item?.totalQuantity}</Text>
      <Text style={styles.text3}>
        {Number(props?.item?.totalAmount
        ).toFixed(2)}
      </Text>
    </View>
  );
}
export default DateItem;

const styles = StyleSheet.create({
  DateItem: {
    padding: 8,
    paddingHorizontal: 16,
    borderBottomColor: COLORS?.GREY3,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text1: {
    flex: 1,
    fontFamily: FONTS?.REGULAR,
    color: '#000',
    fontSize: 14,
  },
  text2: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONTS?.REGULAR,
    color: '#000',
    fontSize: 14,
  },
  text3: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONTS?.BOLD,
    color: COLORS?.PRIMARY,
    fontSize: 14,
    letterSpacing: 1,
  },
});
