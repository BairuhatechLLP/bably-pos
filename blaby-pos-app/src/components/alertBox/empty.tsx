import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import COLORS from '../../config/color';
import FONTS from '../../config/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
function Empty(props: any) {
  return (
    <TouchableOpacity style={styles.Empty}>
      <Ionicons name="albums-outline" size={50} color={COLORS.GREY3}/>
      <Text style={styles.text2}>No data found</Text>
    </TouchableOpacity>
  );
}
export default Empty;

const styles = StyleSheet.create({
    Empty: {
    margin: 16,
    padding: 10,
    borderRadius: 10,
    flexDirection:"column",
    alignItems:'center',
    justifyContent:'center',
    gap:10
  },
  text2:{
    fontSize:14,
    fontFamily:FONTS?.MEDIUM,
    color:"grey"
  },
});
