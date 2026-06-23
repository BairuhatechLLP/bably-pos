import React, {useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';

import FONTS from '../../../config/fonts';
import COLORS from '../../../config/color';

import OrderDetailsModal from './orderDetailsModal';

import OrderCancelModal from './orderCancelModal';

const OrderItem = (props: any) => {
  const [showOption, setShowOption] = useState<any>(false);
  const [confirmCancel, setConfirmCancel] = useState<any>(false);

  return (
    <View style={styles.OrderItem}>
      <View style={styles.Box}>
        <View style={styles.Box1}>
          <TouchableOpacity
            style={styles.Box2}
            onPress={() => setShowOption(true)}>
            <Text style={styles.tokenNo}>{props?.item?.tokenNo}</Text>
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.text1}>
              {moment(props?.item?.createdAt).format('D/MM/YYYY hh:mm a')}
              {'  '}
              {props?.item?.offline ? (
                <Ionicons name="cloud-offline" size={13} color={'orange'} />
              ) : (
                ''
              )}
            </Text>
            <Text style={styles.text2}>
              {props?.item?.orderItems?.length ?? 0} Items /{' '}
              {props?.item?.table_details?.table_number && (
                <Text style={{color: 'red'}}>
                  Table {props?.item?.table_details?.table_number}
                </Text>
              )}
            </Text>
            {props?.item?.staff && (
              <View style={styles.staffBadge}>
                <Text style={styles.staffText}>
                  Staff: {props?.item?.staff?.name}
                </Text>
              </View>
            )}
            {props?.item?.orderStatus === 'cancelled' ? (
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
                  props?.item?.orderStatus === 'pending'
                    ? '#fff2c9'
                    : props?.item?.orderStatus === 'finished'
                    ? '#cdfae0'
                    : '#facdce',
              },
            ]}>
            {props?.onLoading ? (
              <ActivityIndicator size={'small'} color={COLORS.primary} />
            ) : (
              <Text style={styles.text5}>{props?.item?.orderStatus}</Text>
            )}
          </View>
        </View>
        <View style={styles.box2}>
          <View style={[styles.item, {paddingVertical: 2}]}>
            <Text style={[styles.text3, {flex: 3}]}>Item</Text>
            <Text style={styles.text3}>Qty</Text>
            <Text style={[styles.text3, {textAlign: 'right'}]}>Price</Text>
          </View>
          {props?.item?.orderItems?.slice(0, 3).map((item: any) => {
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
                <Text style={styles.text4}>{item?.quantity || 0}</Text>
                <Text style={[styles.text4, {textAlign: 'right'}]}>
                  {item?.sp_price
                    ? item?.sp_price
                    : item?.productMaster?.sp_price || 0}
                </Text>
              </View>
            );
          })}
          {props?.item?.orderItems?.length > 3 ? (
            <TouchableOpacity
              style={styles.item}
              onPress={() => setShowOption(true)}>
              <Text style={{flex: 1}}></Text>
              <Text style={styles.text6}>
                +{props?.item?.orderItems?.length - 3} more items
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <View style={[styles.Box1, {marginTop: 10}]}>
        <Text style={[styles.text4, {flex: 1}]}>Total</Text>
        <Text style={styles.text1}>{Number(props.item?.total).toFixed(2)}</Text>
      </View>

      {/* REVERTED: Mark payment option (admin Cash/UPI on order list) — commented out, do not remove
      {props?.isAdmin ? (
        <View style={[
          styles.paymentSection,
          !props?.item?.paymentMethod ? styles.paymentSectionUnpaid : {},
        ]}>
          <View style={styles.paymentRow}>
            {!props?.item?.paymentMethod ? (
              <Ionicons name="alert-circle" size={15} color={COLORS.orange} />
            ) : (
              <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} />
            )}
            <Text style={[
              styles.paymentLabel,
              !props?.item?.paymentMethod ? {color: COLORS.orange} : {color: COLORS.primary},
            ]}>
              {!props?.item?.paymentMethod ? 'Mark payment' : 'Paid'}
            </Text>
            <TouchableOpacity
              disabled={!!props?.item?.paymentMethod}
              style={[
                styles.paymentBtn,
                props?.item?.paymentMethod === 'Cash'
                  ? styles.paymentBtnActive
                  : {},
                props?.item?.paymentMethod && props?.item?.paymentMethod !== 'Cash'
                  ? styles.paymentBtnLocked
                  : {},
              ]}
              onPress={() =>
                props?.onPaymentChange(
                  props?.item?.paymentMethod === 'Cash' ? null : 'Cash',
                )
              }>
              <Ionicons
                name="cash-outline"
                size={14}
                color={props?.item?.paymentMethod === 'Cash' ? '#fff' : 'grey'}
              />
              <Text style={[
                styles.paymentBtnText,
                props?.item?.paymentMethod === 'Cash'
                  ? styles.paymentBtnTextActive
                  : {},
              ]}>
                Cash
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!!props?.item?.paymentMethod}
              style={[
                styles.paymentBtn,
                props?.item?.paymentMethod === 'UPI'
                  ? styles.paymentBtnActive
                  : {},
                props?.item?.paymentMethod && props?.item?.paymentMethod !== 'UPI'
                  ? styles.paymentBtnLocked
                  : {},
              ]}
              onPress={() =>
                props?.onPaymentChange(
                  props?.item?.paymentMethod === 'UPI' ? null : 'UPI',
                )
              }>
              <Ionicons
                name="phone-portrait-outline"
                size={14}
                color={props?.item?.paymentMethod === 'UPI' ? '#fff' : 'grey'}
              />
              <Text style={[
                styles.paymentBtnText,
                props?.item?.paymentMethod === 'UPI'
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

      <View style={styles.box3}>
        <TouchableOpacity style={styles.btn1} onPress={() => props?.onBill()}>
          <Text style={styles.btn1Text}>Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            props?.item?.orderStatus === `pending`
              ? styles.btn2
              : styles.disbaled,
          ]}
          disabled={props?.item?.orderStatus === `pending` ? false : true}
          onPress={() => props?.onEdit()}>
          <Text
            style={[
              styles.btn2Text,
              {color: props?.item?.orderStatus === `pending` ? '#000' : 'grey'},
            ]}>
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            props?.item?.orderStatus === `pending`
              ? styles.btn3
              : styles.disbaled,
          ]}
          disabled={props?.item?.orderStatus === `pending` ? false : true}
          onPress={() => setConfirmCancel(true)}>
          <Text
            style={[
              styles.btn3Text,
              {color: props?.item?.orderStatus === `pending` ? 'red' : 'grey'},
            ]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
      {showOption && (
        <OrderDetailsModal
          order={props?.item}
          isAdmin={props?.isAdmin}
          open={showOption}
          close={() => setShowOption(false)}
        />
      )}
      {confirmCancel && (
        <OrderCancelModal
          order={props?.item}
          open={confirmCancel}
          onChange={() => props?.onCancel()}
          close={() => setConfirmCancel(false)}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  OrderItem: {
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    padding: 13,
    marginBottom: 10,
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  Box: {
    flex: 1,
  },
  Box1: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    marginBottom: 10,
  },
  Box2: {
    height: 40,
    minWidth: 40,
    borderRadius: 6,
    backgroundColor: COLORS.grey2,
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  box2: {
    marginBottom: 5,
    padding: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: COLORS.grey4,
    borderBottomWidth: 1,
    paddingVertical: 8,
    gap: 10,
  },
  box3: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  btn1: {
    flex: 1,
    borderColor: COLORS.primary,
    borderWidth: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    paddingBottom: 4,
    borderRadius: 6,
  },
  btn2: {
    flex: 1,
    borderColor: COLORS.primary,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    paddingBottom: 4,
    borderRadius: 6,
  },
  btn3: {
    flex: 1,
    borderColor: COLORS.red,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    paddingBottom: 4,
    borderRadius: 6,
  },
  btn1Text: {
    color: '#fff',
    fontFamily: FONTS?.Medium,
  },
  btn2Text: {
    fontFamily: FONTS?.Medium,
  },
  btn3Text: {
    color: 'red',
    fontFamily: FONTS?.Medium,
  },
  tokenNo: {
    fontSize: 15,
    fontFamily: FONTS?.SemiBold,
    marginTop: 5,
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
  text4: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS?.Medium,
    color: '#000',
    marginBottom: -2,
    letterSpacing: 0.5,
  },
  statusBox: {
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    padding: 4,
    paddingBottom: 2,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  text5: {
    fontFamily: FONTS?.Medium,
    fontSize: 11,
  },
  text6: {
    fontSize: 13,
    fontFamily: FONTS?.SemiBold,
    color: COLORS.primary,
    marginBottom: -2,
  },
  disbaled: {
    flex: 1,
    borderColor: COLORS.grey4,
    backgroundColor: COLORS.grey4,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    paddingBottom: 4,
    borderRadius: 6,
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
  paymentSection: {
    borderColor: COLORS.grey4,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  paymentSectionUnpaid: {
    borderColor: COLORS.orange,
    backgroundColor: '#fff9f0',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentLabel: {
    fontSize: 11,
    fontFamily: FONTS?.SemiBold,
    flex: 1,
    marginTop: 2,
  },
  paymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderColor: COLORS.grey4,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: COLORS.grey2,
  },
  paymentBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  paymentBtnLocked: {
    opacity: 0.4,
  },
  paymentBtnText: {
    fontSize: 11,
    fontFamily: FONTS?.Medium,
    color: 'grey',
    marginTop: 2,
  },
  paymentBtnTextActive: {
    color: '#fff',
  },
  // New styles for staff badge
  staffBadge: {
    backgroundColor: COLORS.grey2, // Light primary color for background
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 4,
    alignSelf: 'flex-start', // Aligns to the left
  },
  staffText: {
    fontSize: 12,
    fontFamily: FONTS?.Medium,
    color: COLORS.primary, // Primary color for text to highlight
  },
});
export default OrderItem;
