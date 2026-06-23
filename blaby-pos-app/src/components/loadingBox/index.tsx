import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

const LoadingBox = (props: any) => {
  return (
    <View style={styles.Box}>
      <ActivityIndicator size={'large'} color={COLOR.primary} />
      <Text style={styles.text1}>Loading . . .</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  Box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 20,
  },
  text1: {
    fontFamily: FONTS?.SemiBold,
    fontSize: 14,
    color: 'grey',
  },
});
export default LoadingBox;
