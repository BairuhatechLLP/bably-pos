import {StyleSheet} from 'react-native';
import FONTS from '../config/fonts';
import COLORS from '../config/color';

const styles = StyleSheet.create({
  headerTitleStyle: {
    fontFamily: FONTS.BOLD,
    fontSize:20
  },
  Tab: {
    height:28,
    width:50,
    alignItems:"center",
    justifyContent:"center",
    marginBottom:5
  },
  activeTab: {
    backgroundColor: COLORS.LIGHT,
    borderRadius: 100,
    height:28,
    width:50,
    alignItems:"center",
    justifyContent:"center",
    marginBottom:5
  },
  TabHeaderLogo:{
    width:100,
    height:50,
    objectFit:"contain",
  },
  TabHeadertxt:{
    fontFamily: FONTS.BOLD,
    fontSize:20
  },
  TabHeaderRight:{
    flexDirection:"row",
    gap:20,
    marginRight:16
  },
  TabHeaderLeft:{
    marginLeft:16,
    paddingRight:10
  },
  drawerContent:{
    flexGrow:1,
  },
  drawerdevider:{
    height:1,
    backgroundColor:COLORS.GREY3,
    marginVertical:5
  },
  drawerItem:{
    flexDirection:"row",
    alignItems:"center",
    gap:20,
    paddingHorizontal:10,
    marginVertical:11
  },
  drawerItemText:{
    fontFamily: FONTS.MEDIUM,
    fontSize:14,
  },
  drawerLogo:{
    width:150,
    height:35,
    objectFit:"contain",
    marginVertical:11,
    marginHorizontal:5
  },
  profileImage:{
    height:25,
    width:25,
    borderRadius:100,
    objectFit:"cover",
    overflow:"hidden"
  }
});

export default styles;
