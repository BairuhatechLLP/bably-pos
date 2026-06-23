import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';

import LogoutModal from './logoutModal';

const Menus = () => {
  const navigation = useNavigation<any>();
  const Auth = useSelector((state: any) => state?.Auth?.user);
  const isAdmin = Auth?.staff?.staffAccess?.includes('administrator');
  const [isLogout, setIsLogout] = useState<any>(false);
  const meusitem: any[] = [
    {
      id: 2,
      value: 'Sync',
      path: 'SyncScreen',
      icon: 'sync-outline',
      color: '#792113',
    },
    {
      id: 3,
      value: 'Bluetooth',
      path: 'BluetoothScreen',
      icon: 'bluetooth-sharp',
      color: '#0082FC',
    },
    {
      id: 4,
      value: 'Configuration',
      path: 'ConfigScreen',
      icon: 'construct',
      color: '#fcba03',
    },
  ];

  // Admin-only menu items — hidden from regular staff
  if (isAdmin) {
    // Reports at the top
    meusitem.unshift({
      id: 1,
      value: 'Reports',
      path: 'ReportScreen',
      icon: 'stats-chart',
      color: '#9534eb',
    });
    // VAT / Tax at the bottom
    meusitem.push({
      id: 5,
      value: 'VAT / Tax',
      path: 'VatSettingsScreen',
      icon: 'calculator-outline',
      color: '#8C745A',
    });
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.ScrollView}>
      <View style={styles.menuBox}>
        {meusitem?.map((item: any, index: any) => (
          <TouchableOpacity
            key={item?.id}
            style={[
              styles.menuItem,
              index === meusitem.length - 1
                ? {borderBottomWidth: 0, marginBottom: 0}
                : null,
            ]}
            onPress={() => navigation.navigate(item?.path)}>
            <View style={[styles.menuIconBox, {backgroundColor: item?.color}]}>
              <Ionicons name={item.icon} style={styles.menuIcon} />
            </View>
            <Text style={styles.menuText}>{item.value}</Text>
            <Ionicons name="chevron-forward-outline" style={styles.menuArrow} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={{margin: 10}} />
      <View style={styles.menuBox}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ProfileScreen')}>
          <View style={styles.menuIconBox}>
            <Ionicons name={'person-circle-outline'} style={styles.menuIcon} />
          </View>
          <Text style={styles.menuText}>{'My profile'}</Text>
          <Ionicons name="chevron-forward-outline" style={styles.menuArrow} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, {borderBottomWidth: 0, marginBottom: 0}]}
          onPress={() => {setIsLogout(true)}}>
          <View style={[styles.menuIconBox, {backgroundColor: 'red'}]}>
            <Ionicons name={'log-out-outline'} style={styles.menuIcon} />
          </View>
          <Text style={styles.menuText}>{'Sign Out'}</Text>
          <Ionicons name="chevron-forward-outline" style={styles.menuArrow} />
        </TouchableOpacity>
      </View>
      <View style={{flex: 1}}></View>
      <View>
        <Text style={styles.text1}>Version : 1.0.0</Text>
      </View>
      {isLogout ? (
        <LogoutModal open={isLogout} close={() => setIsLogout(false)} />
      ) : null}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  ScrollView: {
    flexGrow: 1,
  },
  menuBox: {
    borderColor: COLOR.grey4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    paddingTop: 10,
  },
  menuItem: {
    borderRadius: 5,
    margin: 10,
    paddingBottom: 10,
    marginTop: 0,
    paddingHorizontal: 2,
    borderBottomColor: COLOR.grey4,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuIconBox: {
    height: 28,
    width: 28,
    backgroundColor: COLOR.grey5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  menuIcon: {
    fontSize: 20,
    color: '#fff',
  },
  menuText: {
    flex: 1,
    fontFamily: FONTS.Medium,
    fontSize: 14,
    marginTop: 3,
    color: '#000',
  },
  menuArrow: {
    fontSize: 20,
    color: COLOR.grey1,
  },
  text1: {
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    color: 'grey',
    fontSize: 12,
  },
});

export default Menus;
