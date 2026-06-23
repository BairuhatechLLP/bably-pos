import {View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import { getFontSize } from '../utils/responsive';
export const TabBar = (route: any, focused: any, color: any, size: any) => {
  var Icon;
  if (route.name === 'Billing') {
    Icon = (
      <View style={focused ? styles.activeTab : styles.Tab}>
        <Ionicons
          name={focused ? 'print' : 'print-outline'}
          color={color}
          size={getFontSize(20)}
        />
      </View>
    );
  } else if (route.name === 'Orders') {
    Icon = (
      <View style={focused ? styles.activeTab : styles.Tab}>
        <Ionicons
          name={focused ? 'flash' : 'flash-outline'}
          color={color}
          size={getFontSize(20)}
        />
      </View>
    );
  } else if (route.name === 'Settings') {
    Icon = (
      <View style={focused ? styles.activeTab : styles.Tab}>
        <Ionicons
          name={focused ? 'settings' : 'settings-outline'}
          color={color}
          size={getFontSize(20)}
        />
      </View>
    );
  }
  return Icon;
};
