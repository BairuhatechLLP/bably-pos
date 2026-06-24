import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import COLORS from '../../config/color';
import FONTS from '../../config/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
function BranchItem(props: any) {
  const navigation: any = useNavigation();
  return (
    <TouchableOpacity
      style={styles.TopItem}
      onPress={() =>
        navigation.navigate('BranchDetails', {id: props?.item?.companyId})
      }>
      <View>
        <Ionicons
          name="storefront"
          color={COLORS.GREY2}
          size={20}
          style={{marginTop: 3}}
        />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.text3}>
          {Number(props?.item?.totalSales || 0).toFixed(2)}{' '}
          <Text style={styles.text4}>
            {' '}
            - {props?.item?.totalOrders || 0} orders
          </Text>
        </Text>
        <Text style={styles.text1}>
          {props?.item?.CompanyMaster?.bname}{' '}
          <Text style={styles.text2}>
            {' '}
            |{' '}
            <Ionicons
              name="location-sharp"
              color={COLORS.GREY2}
              size={10}
              style={{marginTop: 5}}
            />{' '}
            {props?.item?.CompanyMaster?.fulladdress},{' '}
            {props?.item?.CompanyMaster?.state}
          </Text>
        </Text>
        {props?.item?.paymentBreakdown?.filter(
          (p: any) => p.method !== 'Unmarked',
        ).length ? (
          <Text style={styles.paymentText}>
            {props.item.paymentBreakdown
              .filter((p: any) => p.method !== 'Unmarked')
              .map((p: any) => `${p.method}: ${Number(p.amount || 0).toFixed(0)} (${p.count})`)
              .join('   ·   ')}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
export default BranchItem;

const styles = StyleSheet.create({
  TopItem: {
    padding: 16,
    paddingVertical: 14,
    borderRadius: 5,
    borderBottomColor: COLORS?.GREY3,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
  },
  text1: {
    fontSize: 15,
    fontFamily: FONTS?.MEDIUM,
    color: '#000',
    marginTop: 5,
  },
  text2: {
    fontSize: 12,
    color: 'grey',
    fontFamily: FONTS?.REGULAR,
  },
  text3: {
    fontSize: 16,
    fontFamily: FONTS?.BOLD,
    color: COLORS.PRIMARY,
  },
  text4: {
    fontSize: 12,
    color: 'grey',
    fontFamily: FONTS?.MEDIUM,
    marginTop: 8,
    textAlign: 'right',
  },
  paymentText: {
    fontSize: 11,
    fontFamily: FONTS?.MEDIUM,
    color: COLORS.PRIMARY,
    marginTop: 6,
  },
});
