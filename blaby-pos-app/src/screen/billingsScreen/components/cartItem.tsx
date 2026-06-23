import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import FONTS from '../../../config/fonts';
import COLORS from '../../../config/color';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CartItem = (props: any) => {
  return (
    <View style={styles.CartItem}>
      <View style={styles.box}>
        <Text style={styles.text1}>{props?.index + 1}. {props?.item?.idescription}</Text>
        <View style={styles.box2}>
        <Text style={styles.text2}>{props?.item?.ice_option}-ice</Text>
          <Text style={styles.text2}>| {props?.item?.sugar_option}-sugar</Text>
          {props?.item?.parcel_option === "dine-in"?null:
          <Text style={styles.text2}>| {props?.item?.parcel_option}</Text>}
        </View>
      </View>
      <View style={styles.box1}>
        <View style={{flex: 2}}>
          <TouchableOpacity style={styles.btn5} onPress={()=>props.updateCart("delete")}>
            <Text style={styles.btn5text}>Remove</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.text1}>£{props?.item?.sp_price} x  </Text>
        </View>
        <View style={styles.groupBox}>
          <TouchableOpacity style={styles.btn2} onPress={()=>props.updateCart("remove")}>
            <Ionicons name="remove" color={'red'} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn3}>
            <Text style={styles.text1}>{props?.item.quantity}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn4} onPress={()=>props.updateCart("add")}>
            <Ionicons name="add" color={'#fff'} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  CartItem: {
    borderBottomColor: COLORS?.grey4,
    borderBottomWidth: 1,
    paddingTop: 10,
    padding:2
  },
  box: {},
  box1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
  },
  groupBox: {
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#fcfcfc',
    flexDirection: 'row',
    padding: 2,
    flex: 1,
  },
  btn2: {
    backgroundColor: COLORS.grey2,
    flex: 1,
    borderRadius: 4,
    alignItems: 'center',
    padding: 2,
  },
  btn3: {
    flex: 1,
    alignItems: 'center',
    padding: 2,
  },
  btn4: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    alignItems: 'center',
    padding: 2,
  },
  text1: {
    color: '#000',
    fontSize: 14,
    fontFamily:FONTS.Medium,
    marginBottom:-2
  },
  box2:{
    flexDirection:'row',
    alignItems:'center',
    gap:10,
  },
  text2:{
    fontSize:12,
    color:"grey",
    textTransform:"capitalize",
    fontFamily:FONTS.Regular,
    marginBottom:-1
  },
  btn5:{
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    alignSelf:"flex-start",
    paddingHorizontal:10,
    borderRadius:4,
    padding:1,
    paddingBottom:0
  },
  btn5text:{
    fontFamily:FONTS.Regular,
    fontSize:12,
    color:"red"
  }
});
export default CartItem;
