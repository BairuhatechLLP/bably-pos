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

const GhostButton = (props: any) => {
  return (
    <TouchableOpacity
      style={styles.primaryBtn}
      onPress={() =>
        props?.loading ? null : props?.onPress ? props?.onPress() : null
      }>
      {props?.loading ? (
        <View>
          <ActivityIndicator size={'small'} color={'#000'} />
        </View>
      ) : (
        <Text style={styles.primarytext}>{props?.label}</Text>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  primaryBtn: {
    borderColor: COLORS.GREY2,
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primarytext: {
    fontFamily: FONTS.SEMI_BOLD,
    color: '#000',
    fontSize: 15,
    textAlign: 'center',
  },
});
export default GhostButton;
