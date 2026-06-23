import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import COLORS from '../../config/color';
import FONTS from '../../config/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
function AlertBox(props: any) {
  return (
    <TouchableOpacity style={styles.AlertBox}>
      <Ionicons name="alert-circle-outline" size={40} color={COLORS.FAILURE} />
      <Text style={styles.text1}>Unable to load</Text>
      <Text style={styles.text2}>{props?.message}</Text>
      <TouchableOpacity
        onPress={() => (props?.onChange ? props?.onChange() : null)}>
        <Text style={styles.text3}>Retry</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
export default AlertBox;

const styles = StyleSheet.create({
  AlertBox: {
    margin: 16,
    borderWidth: 1,
    borderColor: COLORS?.GREY3,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  text1: {
    fontSize: 16,
    fontFamily: FONTS?.MEDIUM,
    color: '#000',
  },
  text2: {
    fontSize: 14,
    fontFamily: FONTS?.MEDIUM,
    color: 'grey',
  },
  text3: {
    fontSize: 14,
    fontFamily: FONTS?.MEDIUM,
    color: 'blue',
    padding: 10,
  },
});
