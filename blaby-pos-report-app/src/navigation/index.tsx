import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import COLORS from '../config/color';
import FONTS from '../config/fonts';
import styles from './styles';
import {TabBar} from './tabBar';

import SplashScreen from '../screens/splashScreen';
import LoginScreen from '../screens/loginScreen';
import ProfileSceen from "../screens/profileSceen";
import HomeScreen from '../screens/homeScreen';
import ReportScreen from '../screens/reportScreen';

import BrancheScreen from "../screens/brancheScreen";
import BranchDetails from "../screens/brancheScreen/details";

import ProductScreen from "../screens/productScreen";
import ProductDetails from "../screens/productScreen/details";
import AddProductScreen from "../screens/productManagement/addProduct";
import CategoryManagementScreen from "../screens/productManagement/categoryManagement";
import ProductListScreen from "../screens/productManagement/productList";

import StaffPerformanceScreen from "../screens/staffPerformanceScreen";
import StaffProductsScreen from "../screens/staffProductsScreen";

import KitchenDisplaysScreen from "../screens/kitchenDisplays";

import OrderHubScreen from "../screens/orderManagement";
import CreateOrderScreen from "../screens/orderManagement/createOrder";
import RecentOrdersScreen from "../screens/orderManagement/recentOrders";

const Stack = createNativeStackNavigator();
const stackOption: any = {
  navigationBarColor: '#fff',
  headerTitleStyle: styles.headerTitleStyle,
  headerBackButtonDisplayMode: 'minimal',
  headerTitleAlign: 'left',
};

const Tabs = createBottomTabNavigator();
const HomeTabs = () => {
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          return TabBar(route, focused, color, size);
        },
        tabBarInactiveTintColor: COLORS.GREY5,
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarStyle: {
          height: 60,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.MEDIUM,
          fontSize: 12,
        },
        headerTitleAlign: 'left',
      })}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{headerShown: true}} />
      <Tabs.Screen name="Reports" component={ReportScreen} options={{headerShown: true}} />
      <Tabs.Screen name="Branches" component={BrancheScreen} options={{headerShown: true}} />
      <Tabs.Screen name="Products" component={ProductScreen} options={{headerShown: true}} />
      <Tabs.Screen name="Order" component={OrderHubScreen} options={{headerShown: true, title: 'Order'}} />
    </Tabs.Navigator>
  );
};


function Navigation() {
  return (
    <Stack.Navigator
      initialRouteName="splash"
      screenOptions={{headerTitleAlign: 'left'}}>
      <Stack.Screen
        name="splash"
        component={SplashScreen}
        options={{
          headerShown: false,
          navigationBarColor: '#fff',
        }}
      />
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{
          headerShown: false,
          navigationBarColor: '#fff',
        }}
      />
       <Stack.Screen
        name="home"
        component={HomeTabs}
        options={{headerShown: false, navigationBarColor: '#fff'}}
      />
       <Stack.Screen
        name="BranchDetails"
        component={BranchDetails}
        options={{...stackOption, title: 'Branch details'}}
      />
       <Stack.Screen
        name="ProfileScreen"
        component={ProfileSceen}
        options={{...stackOption, title: 'Profile'}}
      />
        <Stack.Screen
        name="ProductDetails"
        component={ProductDetails}
        options={{...stackOption, title: 'Product details'}}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={({route}: any) => ({
          ...stackOption,
          title: route.params?.product ? 'Edit Product' : 'Add Product'
        })}
      />
      <Stack.Screen
        name="CategoryManagement"
        component={CategoryManagementScreen}
        options={{...stackOption, title: 'Category Management'}}
      />
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{...stackOption, title: 'Manage Products'}}
      />
      <Stack.Screen
        name="StaffProducts"
        component={StaffProductsScreen}
        options={{
          ...stackOption,
          title: 'Staff Products',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="KitchenDisplays"
        component={KitchenDisplaysScreen}
        options={{...stackOption, title: 'Kitchen Displays'}}
      />
      <Stack.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{...stackOption, title: 'New Order'}}
      />
      <Stack.Screen
        name="RecentOrders"
        component={RecentOrdersScreen}
        options={{...stackOption, title: 'Recent Orders'}}
      />
      <Stack.Screen
        name="StaffPerformance"
        component={StaffPerformanceScreen}
        options={{...stackOption, title: 'Staff Performance', headerShown: true}}
      />
    </Stack.Navigator>
  );
}

export default Navigation;
