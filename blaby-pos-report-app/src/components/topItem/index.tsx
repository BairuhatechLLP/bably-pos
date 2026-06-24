import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import COLORS from '../../config/color';
import FONTS from '../../config/fonts';

function TopItem(props: any) {
  const navigation: any = useNavigation();
  const onClick = () =>{
    if(props?.type === 'branch'){
      navigation.navigate('BranchDetails', {id: props?.id})
    }else{
      navigation.navigate('ProductDetails', {id: props?.id})
    }
  }
  return (
    <TouchableOpacity style={styles.TopItem} onPress={() =>onClick()}>
      <View style={styles.box1}>
        <View style={{flex: 1}}>
          <Text style={styles.text1}>{props?.name || "Branch name"}</Text>
          <Text style={styles.text2}>{props?.amount || 0}</Text>
        </View>
        <View style={styles.box3}>
          {props?.type === 'branch' ? (
            <Ionicons name="storefront" size={18} color={COLORS.PRIMARY} />
          ) : (
            <Ionicons name="list" size={18} color={COLORS.PRIMARY} />
          )}
        </View>
      </View>
      <View style={styles.box2}>
        <View style={{flex: 1}}>
          <Text style={styles.text3}>{props?.date}</Text>
        </View>
        <View>
          <Text style={styles.text3}>{props?.order || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
export default TopItem;

const styles = StyleSheet.create({
  TopItem: {
    padding: 3,
    borderRadius: 10,
    borderColor: COLORS?.GREY3,
    borderWidth: 1,
    backgroundColor: COLORS?.GREY6,
  },
  box1: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 8,
    padding: 15,
    borderColor: COLORS?.GREY3,
    borderWidth: 1,
  },
  box2: {
    flexDirection: 'row',
    alignItems: 'center',
    padding:10,
  },
  box3:{
    borderColor: COLORS?.GREY3,
    borderWidth: 1,
    padding:5,
    borderRadius:5,
    height:32
  },
  text1:{
    fontSize:16,
    flex:1,
    marginBottom:5,
    fontFamily:FONTS.MEDIUM,
  },
  text2:{
    fontSize:16,
    fontFamily:FONTS.BOLD,
    color:COLORS?.PRIMARY
  },
  text3:{
    color:"#000",
    fontSize:13,
    fontFamily:FONTS.REGULAR,
  }
});
