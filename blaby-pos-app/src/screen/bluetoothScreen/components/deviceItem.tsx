import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';

const DeviceItem = (props: any) => {
  return (
    <View
      style={[
        styles.itemBox3,
        props?.index === props.length - 1
          ? {borderBottomWidth: 0, paddingBottom: 5}
          : null,
      ]}>
      <View style={[styles.itemBox3IconBox,{backgroundColor:props?.connetcted?COLOR.primary:COLOR.grey4}]}>
        <Ionicons name="bluetooth" size={20} color={props?.connetcted?"#fff":COLOR.primary} />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.text1}>{props?.item?.name}</Text>
        <Text style={[styles.text2, {fontSize: 10}]}>
          {props?.item?.address}
        </Text>
      </View>
      {props?.connetcted?null:
      <TouchableOpacity
        onPress={() =>
          props?.active ? props?.connect() : props?.connect()
        }>
        <Text
          style={[
            styles.text6,
            {color: props?.active ? 'orange' : COLOR.primary},
          ]}>
          {props?.active ? 'Reconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>}
    </View>
  );
};

const styles = StyleSheet.create({
  text1: {
    color: '#000',
    fontFamily: FONTS.Medium,
    fontSize: 14,
  },
  text2: {
    color:"grey"
  },
  itemBox3: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomColor: COLOR.grey4,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  itemBox3IconBox: {
    height: 35,
    width: 35,
    backgroundColor: COLOR.grey4,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text6: {
    fontFamily: FONTS.primary,
    fontSize: 12,
  },
});
export default DeviceItem;
