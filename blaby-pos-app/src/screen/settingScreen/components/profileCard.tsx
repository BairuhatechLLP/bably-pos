import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';
import {isMobile} from '../../../utils/responsive';

const ProfileCard = (props: any) => {
  const Auth = useSelector((state: any) => state.Auth.user);
  return (
    <View style={styles.Box1}>
      <ImageBackground
        source={require('../../../assets/images/profile.png')}
        style={styles.image}
      />
      <Text style={styles.text1}>{Auth?.staff?.name}</Text>
      <Text style={styles.text2}>{Auth?.staff?.email}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  Box1: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  image: {
    width: isMobile() ? 100 : 130,
    height:isMobile() ? 100 : 130,
    borderRadius: 100,
    overflow: 'hidden',
    borderColor: COLOR.grey1,
    borderWidth: 1,
    marginBottom: 10,
  },
  text1: {
    color: '#000',
    fontFamily: FONTS.SemiBold,
    fontSize: isMobile() ? 18 : 22,
  },
  text2: {
    color: 'grey',
    fontSize: isMobile() ? 12 : 14,
    fontFamily: FONTS.Regular,
  },
  btn1: {
    borderColor: COLOR.grey4,
    borderWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    padding: 3,
    paddingBottom: 2,
    marginTop: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'center',
  },
  btn1text1: {
    fontFamily: FONTS.Regular,
    fontSize: 12,
  },
  text3: {
    fontFamily: FONTS.Regular,
    fontSize: 14,
    color: 'grey',
  },
});
export default ProfileCard;
