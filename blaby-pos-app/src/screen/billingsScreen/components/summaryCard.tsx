import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import FONTS from '../../../config/fonts';
import COLOR from '../../../config/color';
import {isMobile} from '../../../utils/responsive';

import CartItem from './cartItem';
import TableItem from './tableItem';
import ResponsiveModal from '../../../components/responsiveModal';
import PrimaryButton from '../../../components/buttons/primary';
import {CalculateSum} from '../helpers/calculate';

const SummaryCard = (props: any) => {
  const scrollViewRef = useRef<any>();
  const [showinstruction, setShowinstruction] = useState<any>(
    props?.notes ? true : false,
  );

  useEffect(() => {
    if (scrollViewRef?.current) {
      scrollViewRef?.current?.scrollToEnd({animated: true});
    }
  }, [props?.orderItems]);

  const PlaceOrder = () => {
    props?.placeOrder();
  };

  const summaryCardBox = () => {
    return (
      <View
        style={[
          styles.Box1,
          {marginTop: isMobile() ? 0 : 5},
        ]}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          {props?.orderItems?.length ? (
            props?.orderItems?.map((item: any, index: number) => (
              <CartItem
                key={item?.comb_id}
                index={index}
                item={item}
                updateCart={(action: any) => props?.updateCart(item, action)}
              />
            ))
          ) : (
            <View style={styles.Box6}>
              <Text style={styles.text4}>Choose product create new order</Text>
            </View>
          )}
          <View style={{flex: 1, margin: 5}} />
          {props?.tableData?.length ? (
            <View style={styles.Box3}>
              <View style={styles.headingBox}>
                <Text style={styles.Heading}>Select table</Text>
                <View style={styles.Box4}>
                  <Text style={styles.text3}>A/C</Text>
                  <Switch
                    trackColor={{false: COLOR.grey1, true: COLOR.primary}}
                    thumbColor={COLOR.white}
                    value={props?.ac}
                    onValueChange={(value: any) => props?.onChangeAc(value)}
                  />
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: 10}}>
                {props?.tableData?.map((item: any) => (
                  <TableItem
                    key={item?.id}
                    item={item}
                    active={props?.table}
                    onChange={() => props?.onChangeTabel(item)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
          <View style={styles.Box3}>
            <TouchableOpacity
              style={[
                styles.headingBox,
                showinstruction
                  ? {}
                  : {borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0},
              ]}
              onPress={() => setShowinstruction(!showinstruction)}>
              <Text style={styles.Heading}>Instructions</Text>
              <View>
                <Ionicons name="add" color={COLOR.primary} size={20} />
              </View>
            </TouchableOpacity>
            {showinstruction ? (
              <TextInput
                placeholder="Write something . . . "
                placeholderTextColor={'grey'}
                multiline={true}
                numberOfLines={4}
                value={props?.notes}
                onChangeText={value => props?.onChangeNotes(value)}
              />
            ) : null}
          </View>
          {props?.settings?.tokenGenerate && !props?.token ? null : (
            <View
              style={[
                styles.Box3,
                props.error?.token ? {borderColor: 'red'} : {},
              ]}>
              <View style={styles.Box4}>
                <Text style={styles.Heading}>Token no : </Text>
                <TextInput
                  placeholder="Token"
                  placeholderTextColor={'grey'}
                  style={styles.tokeninput}
                  value={props?.token}
                  onChangeText={value => {
                    props?.settings?.tokenGenerate
                      ? null
                      : props?.onChangeToken(value);
                  }}
                />
              </View>
            </View>
          )}
          {/* REVERTED: Payment method selector (place-order section) — commented out, do not remove
          {props?.isAdmin ? (
            <View style={styles.Box3}>
              <Text style={styles.Heading}>Payment method</Text>
              <View style={styles.paymentRow}>
                <TouchableOpacity
                  style={[
                    styles.paymentBtn,
                    props?.paymentMethod === 'Cash' ? styles.paymentBtnActive : {},
                  ]}
                  onPress={() =>
                    props?.onChangePaymentMethod(
                      props?.paymentMethod === 'Cash' ? null : 'Cash',
                    )
                  }>
                  <Ionicons
                    name="cash-outline"
                    size={16}
                    color={props?.paymentMethod === 'Cash' ? '#fff' : 'grey'}
                  />
                  <Text
                    style={[
                      styles.paymentBtnText,
                      props?.paymentMethod === 'Cash'
                        ? styles.paymentBtnTextActive
                        : {},
                    ]}>
                    Cash
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentBtn,
                    props?.paymentMethod === 'UPI' ? styles.paymentBtnActive : {},
                  ]}
                  onPress={() =>
                    props?.onChangePaymentMethod(
                      props?.paymentMethod === 'UPI' ? null : 'UPI',
                    )
                  }>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={16}
                    color={props?.paymentMethod === 'UPI' ? '#fff' : 'grey'}
                  />
                  <Text
                    style={[
                      styles.paymentBtnText,
                      props?.paymentMethod === 'UPI'
                        ? styles.paymentBtnTextActive
                        : {},
                    ]}>
                    UPI
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          */}
        </ScrollView>
        <View style={styles.Box2}>
          <Text style={styles.text1}>Total : </Text>
          <Text style={styles.text2}>
            {CalculateSum(props?.orderItems, props?.ac)?.total}
          </Text>
        </View>
        <PrimaryButton
          loading={props?.loading}
          disbled={props?.orderItems?.length ? false : true}
          label={`${props?.edit?.id ? 'Update' : 'Place'} order`}
          onPress={() => (props?.orderItems?.length ? PlaceOrder() : null)}
        />
      </View>
    );
  };
  return isMobile() ? (
    <>
      {props?.orderItems?.length ? (
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => props?.OnchangeSummaryModal(true)}>
          <Text style={styles.floatingBtntext}>
            {props?.edit?.id ? 'Update' : 'Place'} Order
          </Text>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={20}
            color={'#fff'}
          />
        </TouchableOpacity>
      ) : null}
      {props?.summaryModal ? (
        <ResponsiveModal
          title={'Order summary'}
          open={props?.summaryModal}
          close={() => props.OnchangeSummaryModal(false)}>
          {summaryCardBox()}
        </ResponsiveModal>
      ) : null}
    </>
  ) : (
    summaryCardBox()
  );
};
const styles = StyleSheet.create({
  Box1: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
    borderColor: COLOR.grey4,
    borderWidth: isMobile() ? 0 : 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: isMobile() ? 0 : 5,
  },
  Heading: {
    fontSize: 13,
    fontFamily: FONTS.Medium,
    flex: 1,
  },
  headingBox: {
    borderBottomColor: COLOR.grey4,
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  Box2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    paddingVertical: 7,
  },
  Box3: {
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    paddingVertical: 7,
    marginBottom: 10,
  },
  Box4: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  text1: {
    fontFamily: FONTS.Regular,
    fontSize: 12,
    color: 'grey',
  },
  text2: {
    fontSize: 16,
    fontFamily: FONTS.Bold,
    color: '#000',
  },
  text3: {
    fontSize: 10,
    fontFamily: FONTS.Bold,
    color: '#000',
  },
  tokeninput: {
    backgroundColor: COLOR.grey2,
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius: 4,
    flex: 2,
    height: 38,
    padding: 0,
    fontSize: 12,
    paddingHorizontal: 10,
    color: '#000',
  },
  Box6: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  text4: {
    textAlign: 'center',
    fontFamily: FONTS?.Medium,
    color: 'grey',
    fontSize: 14,
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  paymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    backgroundColor: COLOR.grey2,
  },
  paymentBtnActive: {
    borderColor: COLOR.primary,
    backgroundColor: COLOR.primary,
  },
  paymentBtnText: {
    fontSize: 12,
    fontFamily: FONTS.Medium,
    color: 'grey',
    marginTop: 2,
  },
  paymentBtnTextActive: {
    color: '#fff',
  },
  floatingBtn: {
    width: '95%',
    borderRadius: 8,
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    padding: 10,
    backgroundColor: COLOR.primary,
    borderColor: COLOR.grey4,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  floatingBtntext: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FONTS?.Medium,
    marginTop: 3,
  },
});
export default SummaryCard;
