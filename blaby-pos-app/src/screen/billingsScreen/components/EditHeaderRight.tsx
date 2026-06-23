import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import FONTS from '../../../config/fonts';
import COLORS from '../../../config/color';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EditHeaderRight = (props: any) => {
  return (
    <View style={styles.EditHeaderRight}>
      <Text style={styles.text1}>
        Order ID : <Text style={styles.text2}>{props?.data?.id}</Text>
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  EditHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text1: {
    color: '#000',
    fontFamily: FONTS.Medium,
    fontSize: 14,
  },
  text2: {
    paddingLeft: 10,
  },
});
export default EditHeaderRight;
