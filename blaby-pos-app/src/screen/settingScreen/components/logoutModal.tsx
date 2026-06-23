import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';
import ResponsiveModal from '../../../components/responsiveModal';

import {logout} from '../../../redux/slice/userSlice';
import {clearAllData} from '../../../redux/slice/datasyncSlice';

import {Counters_DropTable} from '../../../database/query/counters';
import {ProductCategory_DropTable} from '../../../database/query/productCategory';
import {ProductMaster_DropTable} from '../../../database/query/productMaster';
import {Tables_DropTable} from '../../../database/query/tables';

export default function LogoutModal(props: any) {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const logouts = async () => {
    try {
      await Counters_DropTable();
      await ProductCategory_DropTable();
      await ProductMaster_DropTable();
      await Tables_DropTable();
      props?.close();
      dispatch(logout());
      dispatch(clearAllData());
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'LoginScreen'}],
        }),
      );
    } catch (err) {}
  };
  return (
    <ResponsiveModal
      title={'Logout account'}
      open={props?.open}
      close={() => props.close(false)}>
      <View style={styles.Box1}>
        <Text style={styles.text1}>Are you sure want to logout?</Text>
        <View style={styles.Box2}>
          <TouchableOpacity style={styles.btn1} onPress={() => props?.close()}>
            <Text style={styles.text2}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.line} />
          <TouchableOpacity style={styles.btn1} onPress={() => logouts()}>
            <Text style={styles.text3}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ResponsiveModal>
  );
}
const styles = StyleSheet.create({
  Box1: {
    padding: 16,
  },
  Box2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
  },
  text1: {
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 18,
    color: '#000',
  },
  btn1: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  text2: {
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
    color: 'grey',
  },
  text3: {
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
    color: 'red',
  },
  line: {
    backgroundColor: COLOR.grey2,
    width: 1,
    height: '80%',
  },
});
