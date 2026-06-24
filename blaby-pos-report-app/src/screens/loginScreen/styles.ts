import {Platform, StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';
import COLORS from '../../config/color';

const styles = StyleSheet.create({
  loginScreen: {
    backgroundColor: '#fff',
    flex: 1,
  },
  ScrollView: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding:16,
    paddingBottom:30
  },
  Box1:{
    flex:1,
    flexDirection:"column",
    justifyContent:'center',
  },
  Box2:{
    alignItems:'center'
  },
  Logo:{
    height:100,
    width:200
  },
  errorText:{
    marginBottom:10,
    fontFamily: FONTS.SEMI_BOLD,
    color:COLORS.FAILURE,
    fontSize:14,
    textAlign:"center"
  },
  text1:{
    textAlign:"center",
    fontFamily: FONTS?.BOLD,
    color: '#000',
    fontSize:20
  }
});

export default styles;
