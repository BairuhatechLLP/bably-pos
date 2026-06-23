import React from 'react';
import {StyleSheet, Switch, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';

const ShiftSwitch = () => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity style={styles.clockBox}>
      <Text style={styles.clockBoxtext}>
      Clock In
      </Text>
      <Switch
        value={false}
        trackColor={{false: COLOR.grey1, true: COLOR.primary}}
        thumbColor={COLOR.white}
        onChange={() =>
          navigation.navigate('OpenShift')
        }
      />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  clockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLOR.grey4,
    paddingHorizontal: 10,
    paddingRight: 5,
    padding: 2,
    borderRadius: 8,
  },
  clockBoxtext: {
    fontSize: 12,
    fontFamily: FONTS.Medium,
    marginTop: 3,
  },
});

export default ShiftSwitch;
