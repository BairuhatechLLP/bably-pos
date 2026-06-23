import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';

import ResponsiveModal from '../../../components/responsiveModal';

export default function OrderDetailsModal(props: any) {
  return (
    <ResponsiveModal
      title={` Token : ${props?.order?.tokenNo}`}
      open={props?.open}
      close={() => props.close(false)}>
      <View style={styles.Box1}>
        <View style={styles.Box2}>
          <View style={{flex: 1}}>
            <Text style={styles.text1}>
              {moment(props?.order?.createdAt).format('D/MM/YYYY hh:mm a')}
              {'   '}
              {props?.order?.offline ? (
                <Ionicons name="cloud-offline" size={15} color={'orange'} />
              ) : (
                ''
              )}
            </Text>
            <Text style={styles.text2}>
              {props?.order?.orderItems?.length || 0} Items{' '}
              {props?.order?.table_details?.table_number &&
                ` / Table ${props?.order?.table_details?.table_number} `}
              {props?.order?.ac_room && ' / AC Room'}
            </Text>
            {props?.order?.orderStatus === 'cancelled' ? (
              <Text style={[styles.text2, {color: 'red', fontSize: 10}]}>
                Cancelled on{' '}
                {moment(props?.item?.updatedAt).format('D/MM/YYYY hh:mm a')}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.statusBox,
              {
                backgroundColor:
                  props?.order?.orderStatus === 'pending'
                    ? '#fff2c9'
                    : props?.order?.orderStatus === 'finished'
                    ? '#cdfae0'
                    : '#facdce',
              },
            ]}>
            <Text style={styles.text5}>{props?.order?.orderStatus}</Text>
          </View>
        </View>
        <View style={[styles.item, {paddingVertical: 2}]}>
          <Text style={[styles.text3, {flex: 3}]}>Item</Text>
          <Text style={[styles.text3, {marginRight: 10}]}>Qty</Text>
          <Text style={[styles.text3, {textAlign: 'right'}]}>Price</Text>
        </View>
        {props?.order?.orderItems?.map((item: any) => {
          return (
            <View style={styles.item} key={item?.id}>
              <View style={{flex: 3}}>
                <Text style={styles.text4}>
                  {item?.idescription
                    ? item?.idescription
                    : item?.productMaster?.idescription}
                </Text>
                <View style={styles.box4}>
                  <Text style={styles.text7}>
                    {item?.ice_option || 'normal'}-ice
                  </Text>
                  <Text style={styles.text8}>|</Text>
                  <Text style={styles.text7}>
                    {item?.sugar_option || 'normal'}-sugar
                  </Text>
                  {item?.parcel_option === 'dine-in' ? null : (
                    <>
                      <Text style={styles.text8}>|</Text>
                      <Text style={styles.text7}>
                        {item?.parcel_option || 'dine-in'}
                      </Text>
                    </>
                  )}
                </View>
              </View>
              <Text style={[styles.text4, {marginRight: 10}]}>
                {item?.quantity || 0}
              </Text>
              <Text style={[styles.text4, {textAlign: 'right'}]}>
                {item?.sp_price
                  ? item?.sp_price
                  : item?.productMaster?.sp_price || 0}
              </Text>
            </View>
          );
        })}
        <View style={[styles.Box2, {marginTop: 10}]}>
          <Text style={[styles.text4, {flex: 1}]}>Total</Text>
          <Text style={styles.text1}>
            {Number(props.order?.total).toFixed(2)}
          </Text>
        </View>
        {props?.isAdmin && props.order?.paymentMethod ? (
          <View style={[styles.Box5, {marginTop: 10}]}>
            <Text style={[styles.text4]}>Payment</Text>
            <Text style={styles.text2}>{props.order?.paymentMethod}</Text>
          </View>
        ) : null}
        {props.order?.cooking_instructions ? (
          <View style={[styles.Box5, {marginTop: 10}]}>
            <Text style={[styles.text4]}>Instruction</Text>
            <Text style={styles.text2}>
              {props.order?.cooking_instructions}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => props?.close()}>
          <Text style={styles.closeBtntext}>Close</Text>
        </TouchableOpacity>
      </View>
    </ResponsiveModal>
  );
}
const styles = StyleSheet.create({
  Box1: {
    padding: 20,
    paddingTop: 10,
  },
  closeBtn: {
    padding: 10,
    alignItems: 'center',
    paddingTop: 20,
  },
  closeBtntext: {
    textAlign: 'center',
    color: 'red',
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
  },
  Box2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    marginBottom: 10,
  },
  text1: {
    fontSize: 15,
    fontFamily: FONTS?.SemiBold,
    color: '#000',
  },
  text2: {
    fontSize: 12,
    fontFamily: FONTS?.Medium,
    color: 'grey',
  },
  text3: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS?.Regular,
    color: 'grey',
  },
  statusBox: {
    borderColor: COLOR?.grey4,
    borderWidth: 1,
    padding: 4,
    paddingBottom: 2,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  text4: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS?.Medium,
    color: '#000',
    marginBottom: -2,
    letterSpacing: 0.5,
  },
  text5: {
    fontFamily: FONTS?.Medium,
    fontSize: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: COLOR.grey4,
    borderBottomWidth: 1,
    paddingVertical: 8,
    gap: 10,
  },
  box4: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  text7: {
    fontSize: 11,
    color: 'grey',
  },
  text8: {
    fontSize: 11,
    color: '#000',
  },
  Box5: {
    gap: 10,
    borderColor: COLOR.grey4,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
});
