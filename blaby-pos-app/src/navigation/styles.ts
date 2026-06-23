import {Dimensions, StyleSheet} from 'react-native';
import FONTS from '../config/fonts';
import COLORS from '../config/color';
import {isMobile, getFontSize} from '../utils/responsive';
const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  tabBarStyle: {
    height: isMobile() ? 60 : 45,
    paddingHorizontal: isMobile() ? 0 : width / 4,
  },
  tabBarLabelStyle: {
    fontFamily: FONTS.Medium,
    fontSize: getFontSize(11),
  },
  headerTitleStyle: {
    fontFamily: FONTS.SemiBold,
    fontSize: isMobile() ?16:20,
  },
  Tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: getFontSize(24),
    width: getFontSize(40),
    marginBottom: isMobile() ? getFontSize(3) : 0,
    marginRight: isMobile() ? 0 : getFontSize(10),
    marginTop:isMobile() ?5:0
  },
  activeTab: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 100,
    height: getFontSize(24),
    width: getFontSize(40),
    marginBottom: isMobile() ? getFontSize(2) : 0,
    marginRight: isMobile() ? 0 : getFontSize(30),
    marginTop:isMobile() ?5:0
  },
  TabHeaderLogo: {
    width: 150,
    height: 35,
    objectFit: 'contain',
  },
  TabHeadertxt: {
    fontFamily: FONTS.Bold,
    fontSize: 20,
  },
  TabHeaderRight: {
    flexDirection: 'row',
    gap: 20,
    marginRight: 16,
  },
  TabHeaderLeft: {
    marginLeft: 16,
    paddingRight: 10,
  },
  drawerContent: {
    flexGrow: 1,
  },
  drawerdevider: {
    height: 1,
    backgroundColor: COLORS.grey1,
    marginVertical: 5,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 10,
    marginVertical: 11,
  },
  drawerItemText: {
    fontFamily: FONTS.Medium,
    fontSize: 14,
  },
  drawerLogo: {
    width: 150,
    height: 35,
    objectFit: 'contain',
    marginVertical: 11,
    marginHorizontal: 5,
  },
  profileImage: {
    height: 25,
    width: 25,
    borderRadius: 100,
    objectFit: 'cover',
    overflow: 'hidden',
  },
});

export default styles;
