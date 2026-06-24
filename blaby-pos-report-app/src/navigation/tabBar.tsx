import {View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
export const TabBar = (route: any, focused: any, color: any, size: any) => {
  var Icon;
  if (route.name === 'Home') {
    Icon = (
      <View style={focused ? styles.activeTab : styles.Tab}>
        <Ionicons
          name={focused ? 'home' : 'home-outline'}
          color={color}
          size={22}
        />
      </View>
    );
  } else if (route.name === 'Reports') {
    Icon = (
      <View style={focused ? styles.activeTab : styles.Tab}>
        <Ionicons
          name={focused ? 'bar-chart' : 'bar-chart-outline'}
          color={color}
          size={22}
        />
      </View>
    );
  } else if (route.name === 'Branches') {
    Icon = (
      <View style={focused ? styles.activeTab : styles.Tab}>
        <Ionicons
          name={focused ? 'storefront' : 'storefront-outline'}
          color={color}
          size={22}
        />
      </View>
    );
  } else if (route.name === 'Products') {
    Icon = (
      <View style={focused ? styles.activeTab : styles.Tab}>
        <Ionicons
          name={focused ? 'list' : 'list-outline'}
          color={color}
          size={22}
        />
      </View>
    );
  } else if (route.name === 'Order') {
    Icon = (
      <View style={focused ? styles.activeTab : styles.Tab}>
        <Ionicons
          name={focused ? 'cart' : 'cart-outline'}
          color={color}
          size={22}
        />
      </View>
    );
  }
  return Icon;
};
