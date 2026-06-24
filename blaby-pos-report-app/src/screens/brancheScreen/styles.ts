import {Platform, StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';
import COLORS from '../../config/color';

const styles = StyleSheet.create({
  brancheScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  Box1:{
    padding:16,
    paddingVertical:30,
    flexDirection:'row',
    gap:20
  },
  Box2:{
    backgroundColor:COLORS?.GREY6,
    width:60,
    height:60,
    marginBottom:10,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:100
  },
  header: {
    padding: 10,
    paddingHorizontal: 16,
    borderBottomColor: COLORS?.GREY3,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS?.GREY6,
  },
  text1: {
    flex: 1,
    fontFamily: FONTS?.SEMI_BOLD,
    color: '#000',
    fontSize:15
  },
  text2: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONTS?.SEMI_BOLD,
    color: '#000',
    fontSize:15
  },
  text3: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONTS?.SEMI_BOLD,
    color: '#000',
    fontSize:15
  },
  text4:{
    fontFamily: FONTS?.SEMI_BOLD,
    color: '#000',
    fontSize:18,
  },
  text5:{
    fontFamily: FONTS?.REGULAR,
    color: 'grey',
    fontSize:13,
    marginTop:10
  }
});

export default styles;
