import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';

import COLORS from '../../../config/color';
import FONTS from '../../../config/fonts';
function Filters2(props: any) {
  const format = `YYYY-MM-DD HH:mm:ss`;
  let date = Array.from({length: 12}, (_, index) => {
    const monthStart = moment().month(index).startOf('month').format(format);
    const monthEnd = moment().month(index).endOf('month').format(format);
    return {
      key: moment().month(index).format('MMMM'),
      from_date: monthStart,
      to_date: monthEnd,
    };
  });

  const dateChange = (date: any) => {
    props?.setDate(date);
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.Box}>
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
      </ScrollView>
      <View style={styles.FilterBox2}>
        <Text style={styles.FilterText2}>
          Showing on {" "}
          {`${moment(props?.date?.from_date).format('ll')} to ${moment(
                props?.date?.to_date,
              ).format('ll')}`}
        </Text>
        {props?.loading ? (
          <ActivityIndicator size={'small'} color={COLORS?.PRIMARY} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    Box:{
        marginBottom:10,
        paddingLeft:16
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
  FilterBox2:{
    padding:5,
    paddingBottom:10,
    paddingHorizontal:16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  FilterText2:{
    fontSize: 15,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.GREY1,
    flex: 1,
  }
});

export default Filters2;
