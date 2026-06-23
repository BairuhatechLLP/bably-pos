import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';

import ResponsiveModal from '../../../components/responsiveModal';

export default function OrderCancelModal(props: any) {
  return (
    <ResponsiveModal
      title={'Cancel Order'}
      open={props?.open}
      close={() => props.close(false)}>
      <View style={styles.Box1}>
        <Text style={styles.text1}>
          Are you sure want to cancel this order ?
        </Text>
        <View style={styles.Box2}>
          <View style={styles.Box3}>
            <Text style={styles.text3}>Token : </Text>
            <Text style={styles.text4}>{props?.order?.tokenNo}</Text>
          </View>
          <View style={styles.Box3}>
            <Text style={styles.text3}>Total : </Text>
            <Text style={styles.text4}>
              {Number(props?.order?.total).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.Box3, {borderBottomWidth: 0, paddingBottom: 5}]}>
            <Text style={styles.text3}>Status : </Text>
            <Text style={styles.text4}>{props?.order?.orderStatus}</Text>
          </View>
        </View>
        <View style={styles.footerBox}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => props?.close()}>
            <Text style={styles.closeBtntext}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn1}
            onPress={() => {
              props?.close();
              props?.onChange();
            }}>
            <Text style={styles.btn1Text}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ResponsiveModal>
  );
}
const styles = StyleSheet.create({
  Box1: {
    padding: 20,
  },
  footerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  closeBtn: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
  },
  closeBtntext: {
    textAlign: 'center',
    color: 'red',
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
  },
  text1: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
    fontFamily: FONTS.Medium,
  },
  btn1: {
    flex: 1,
    borderColor: COLOR.primary,
    borderWidth: 1,
    backgroundColor: COLOR.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 6,
    borderRadius: 6,
  },
  btn1Text: {
    color: '#fff',
    fontFamily: FONTS?.Medium,
  },
  Box2: {
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    paddingVertical: 7,
    marginBottom: 10,
    marginTop: 10,
  },
  Box3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: COLOR.grey4,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  text3: {
    fontFamily: FONTS.Regular,
    fontSize: 12,
    color: 'grey',
  },
  text4: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: '#000',
  },
});
