import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import FONTS from '../../config/fonts';
import COLORS from '../../config/color';

const PrimaryButton = (props: any) => {
  return (
    <TouchableOpacity
      style={[
        styles.primaryBtn,
        props?.styles,
        props?.disbled
          ? {backgroundColor: COLORS.grey1}
          : {backgroundColor: COLORS.primary},
      ]}
      onPress={() =>
        props?.loading ? null : props?.onPress ? props?.onPress() : null
      }>
      {props?.loading ? (
        <View>
          <ActivityIndicator size={'small'} color={'#fff'} />
        </View>
      ) : (
        <Text style={styles.primarytext}>{props?.label}</Text>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primarytext: {
    fontFamily: FONTS.Medium,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
export default PrimaryButton;
