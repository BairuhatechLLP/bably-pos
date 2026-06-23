import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';
import {isMobile} from '../../../utils/responsive';

export default function ProductOptionModal(props: any) {
  const ice = [
    {label: 'Normal', value: 'normal'},
    {label: 'Extra', value: 'extra'},
    {label: 'Without', value: 'without'},
  ];
  const sugar = [
    {label: 'Normal', value: 'normal'},
    {label: 'Extra', value: 'extra'},
    {label: 'Without', value: 'without'},
  ];
  const supplay = [
    {label: 'Dine In', value: 'dine-in'},
    {label: 'Parcel', value: 'parcel'},
    {label: 'Delivery', value: 'delivery'},
  ];

  const [iceOption, setIceOption] = useState<any>(props?.product?.ice_option);
  const [sugarOption, setsugarOption] = useState<any>(
    props?.product?.sugar_option,
  );
  const [supplayOption, setSupplayOption] = useState<any>(
    props?.product?.parcel_option,
  );

  const addToCart = (action: any) => {
    try {
      const itemObj = {
        ...props?.product,
        comb_id: `${props?.product?.id}-${iceOption}-${sugarOption}-${supplayOption}`,
        ice_option: iceOption,
        sugar_option: sugarOption,
        parcel_option: supplayOption,
        sp_price:
          supplayOption === 'dine-in'
            ? Number(props?.product?.sp_price)
            : Number(props?.product?.sp_price) + 5,
      };
      props?.updateCart(itemObj, action);
    } catch (err) {
      console.log(err);
    }
  };

  const findSum = () => {
    try {
      let arr = props?.CartItem;
      let createcomb_id = `${props?.product?.id}-${iceOption}-${sugarOption}-${supplayOption}`;
      let findquantity = arr.find(
        (check: any) => check.comb_id === createcomb_id,
      ) || {
        quantity: 0,
      };
      if (findquantity?.comb_id) {
        return findquantity?.quantity;
      } else {
        return 0;
      }
    } catch (err) {
      return 0;
    }
  };

  return (
    <Modal
      visible={props?.open}
      transparent={true}
      onRequestClose={() => props?.close()}>
      <StatusBar
        backgroundColor={'rgba(72, 72, 72, 0.25)'}
        barStyle={'dark-content'}
      />
      <View style={styles.Modal}>
        <SafeAreaView style={styles.SafeAreaView}>
          <View style={styles.ModalHeader}>
            <View style={{flex: 1}}>
              <Text style={styles.ModalTitle}>
                {props?.product?.idescription}
              </Text>
              <Text style={styles.ModalPrice}>
                {props?.product?.sp_price || 0}
              </Text>
            </View>
            <TouchableOpacity onPress={() => props?.close()}>
              <Ionicons name="close" style={styles.ModalClose} />
            </TouchableOpacity>
          </View>
          <View style={styles.Box1}>
            <View style={styles.Box2}>
              <View style={styles.headingBox}>
                <Text style={styles.Heading}>ICE</Text>
                <FontAwesome5 name="dice-d6" size={18} color={'grey'} />
              </View>
              <View style={styles.Box3}>
                {ice?.map((item: any, index: number) => {
                  let checked = iceOption === item?.value;
                  return (
                    <TouchableOpacity
                      style={[styles.option, checked && styles.selected]}
                      key={index}
                      onPress={() => setIceOption(item?.value)}>
                      <Text
                        style={[styles.optionText, checked && {color: '#fff'}]}>
                        {item?.label}
                      </Text>
                      <Ionicons
                        name={checked ? 'checkmark-circle' : 'radio-button-off'}
                        size={20}
                        color={checked ? '#fff' : 'grey'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.Box2}>
              <View style={styles.headingBox}>
                <Text style={styles.Heading}>Sugar</Text>
                <MaterialCommunityIcons
                  name="spoon-sugar"
                  size={20}
                  color={'grey'}
                />
              </View>
              <View style={styles.Box3}>
                {sugar?.map((item: any, index: number) => {
                  let checked = sugarOption === item?.value;
                  return (
                    <TouchableOpacity
                      style={[styles.option, checked && styles.selected]}
                      key={index}
                      onPress={() => setsugarOption(item?.value)}>
                      <Text
                        style={[styles.optionText, checked && {color: '#fff'}]}>
                        {item?.label}
                      </Text>
                      <Ionicons
                        name={checked ? 'checkmark-circle' : 'radio-button-off'}
                        size={20}
                        color={checked ? '#fff' : 'grey'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.Box2}>
              <View style={styles.headingBox}>
                <Text style={styles.Heading}>Supply</Text>
                <MaterialCommunityIcons
                  name="food-takeout-box"
                  size={20}
                  color={'grey'}
                />
              </View>
              <View style={styles.Box3}>
                {supplay?.map((item: any, index: number) => {
                  let checked = supplayOption === item?.value;
                  return (
                    <TouchableOpacity
                      style={[styles.option, checked && styles.selected]}
                      key={index}
                      onPress={() => setSupplayOption(item?.value)}>
                      <Text
                        style={[styles.optionText, checked && {color: '#fff'}]}>
                        {item?.label}
                      </Text>
                      <Ionicons
                        name={checked ? 'checkmark-circle' : 'radio-button-off'}
                        size={20}
                        color={checked ? '#fff' : 'grey'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.groupBox}>
              <TouchableOpacity
                style={styles.btn2}
                onPress={() => addToCart('remove')}>
                <Ionicons name="remove" color={'red'} size={30} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn3}>
                <Text style={styles.text3}>{findSum()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btn4}
                onPress={() => addToCart('add')}>
                <Ionicons name="add" color={'#fff'} size={30} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => props?.close()}>
              <Text style={styles.closeBtntext}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  Modal: {
    flex: 1,
    margin: 0,
    flexDirection: 'column',
    justifyContent: isMobile() ? 'flex-end' : 'center',
    alignItems: isMobile() ? 'stretch' : 'center',
    backgroundColor: 'rgba(72, 72, 72, 0.25)',
  },
  SafeAreaView: {
    backgroundColor: '#fff',
    borderTopEndRadius: isMobile() ? 20 : 8,
    borderTopStartRadius: isMobile() ? 20 : 8,
    borderBottomStartRadius: isMobile() ? 0 : 8,
    borderBottomEndRadius: isMobile() ? 0 : 8,
    overflow: 'hidden',
    maxHeight: '90%',
    width: isMobile() ? '100%' : 430,
  },
  ModalHeader: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingTop: 5,
    margin: 10,
    marginBottom: 0,
  },
  ModalTitle: {
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
    color: COLOR.grey6,
  },
  ModalClose: {
    color: COLOR.grey5,
    fontSize: 25,
    padding: 10,
    paddingRight: 0,
  },
  Box1: {
    padding: 16,
  },
  ModalPrice: {
    color: COLOR.primary,
    fontSize: 14,
    fontFamily: FONTS.Medium,
  },
  Box2: {
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    paddingVertical: 7,
    paddingBottom: 10,
  },
  Heading: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    flex: 1,
  },
  headingBox: {
    width: '100%',
    borderBottomColor: COLOR.grey4,
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  Box3: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  option: {
    borderColor: COLOR?.grey4,
    borderWidth: 1,
    borderRadius: 6,
    padding: 3,
    paddingHorizontal: 10,
    paddingRight: 8,
    backgroundColor: COLOR?.grey2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  selected: {
    borderColor: COLOR?.primary,
    borderWidth: 1,
    backgroundColor: COLOR?.primary,
  },
  optionText: {
    fontFamily: FONTS.Medium,
    marginTop: 2,
    fontSize: 12,
    flex: 1,
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
  groupBox: {
    borderColor: COLOR?.grey4,
    borderWidth: 1,
    borderRadius: 7,
    backgroundColor: '#fcfcfc',
    flexDirection: 'row',
    padding: 2,
  },
  btn2: {
    backgroundColor: COLOR.grey2,
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    padding: 5,
  },
  btn3: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
    paddingVertical: 10,
  },
  btn4: {
    flex: 1,
    backgroundColor: COLOR.primary,
    borderRadius: 6,
    alignItems: 'center',
    padding: 5,
  },
  text3: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
