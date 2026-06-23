import React, { useEffect } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch } from 'react-redux';

import COLOR from '../config/color';
import {TabBar} from './tabBar';
import styles from './styles';
import {setNetwrok} from "../redux/slice/settingsSlice";

import SplashScreen from '../screen/splashScreen';
import LoginScreen from '../screen/loginScreen';
import SyncScreen from '../screen/syncScreen';

import BillingScreen from '../screen/billingsScreen';
import OrderScreen from '../screen/orderScreen';
import SettingScreen from '../screen/settingScreen';

import OpenShift from '../screen/shiftScreen/openShift';
import CloseShift from '../screen/shiftScreen/closeShift';

import ProfileScreen from '../screen/profileScreen';
import BluetoothScreen from '../screen/bluetoothScreen';
import ConfigScreen from '../screen/configScreen';
import QuickProducts from "../screen/quickProducts";
import ReportScreen from '../screen/reportScreen';
import SalesReportScreen from '../screen/salesReportScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const tabOption: any = {
  navigationBarColor: '#fff',
  headerTitleStyle: styles.headerTitleStyle,
  headerBackButtonDisplayMode: 'minimal',
  headerTitleAlign: 'left',
};

const stackOption: any = {
  headerTitleStyle: styles.headerTitleStyle,
  headerBackButtonDisplayMode: 'minimal',
  headerTitleAlign: 'left',
};

const TabNavigation = () => {
  return (
    <Tabs.Navigator
      initialRouteName="Orders"
      screenOptions={({route}) => ({
        tabBarPosition: 'bottom',
        headerTitleAlign: 'left',
        tabBarInactiveTintColor: COLOR.grey3,
        tabBarActiveTintColor: COLOR.primary,
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarIcon: ({focused, color, size}) => {
          return TabBar(route, focused, color, size);
        },
      })}>
      <Tabs.Screen
        name="Billing"
        component={BillingScreen}
        options={{...tabOption, headerShown: false, title: 'Billing'}}
      />
      <Tabs.Screen
        name="Orders"
        component={OrderScreen}
        options={{...tabOption, headerShown: false, title: 'Orders'}}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingScreen}
        options={{...tabOption, title: 'Settings'}}
      />
    </Tabs.Navigator>
  );
};

const Navigation = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state:any) => {
      dispatch(setNetwrok(state.isConnected));
    });
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{headerShown: false, navigationBarColor: '#fff'}}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false, navigationBarColor: '#fff'}}
      />
      <Stack.Screen
        name="HomeScreen"
        component={TabNavigation}
        options={{headerShown: false, navigationBarColor: '#fff'}}
      />
      <Stack.Screen
        name="SyncScreen"
        component={SyncScreen}
        options={{...stackOption, title: 'Sync data'}}
      />

      <Stack.Screen
        name="EditOrder"
        component={BillingScreen}
        options={{...stackOption, title: 'Edit Order'}}
      />

      <Stack.Screen
        name="OpenShift"
        component={OpenShift}
        options={{...stackOption, title: 'Counter'}}
      />

      <Stack.Screen
        name="CloseShift"
        component={CloseShift}
        options={{...stackOption, title: 'Counter'}}
      />

      <Stack.Screen
        name="BluetoothScreen"
        component={BluetoothScreen}
        options={{...stackOption, title: 'Bluetooth settings'}}
      />

      <Stack.Screen
        name="ConfigScreen"
        component={ConfigScreen}
        options={{...stackOption, title: 'Configuration'}}
      />

      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{...stackOption, title: 'My profile'}}
      />

      <Stack.Screen
        name="QuickProducts"
        component={QuickProducts}
        options={{...stackOption, title: 'Setup Quick Products'}}
      />

      <Stack.Screen
        name="ReportScreen"
        component={ReportScreen}
        options={{...stackOption, title: 'Reports'}}
      />

      <Stack.Screen
        name="SalesReportScreen"
        component={SalesReportScreen}
        options={{...stackOption, title: 'Shawarma Sales Report'}}
      />
    </Stack.Navigator>
  );
};

export default Navigation;
