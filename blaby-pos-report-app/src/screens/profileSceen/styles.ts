import {StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';
import COLORS from '../../config/color';

const styles = StyleSheet.create({
  profileSceen: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  Box1:{
    backgroundColor:COLORS?.GREY6,
    height:200
  },
  Box2:{
    padding:16,
    marginTop:-80,
    flexDirection:'row',
    alignItems:'center',
    gap:20
  },
  Box3:{
    height:90,
    width:90,
    borderColor:COLORS?.GREY3,
    borderWidth:1,
    backgroundColor:COLORS?.GREY6,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:100
  },
  Box4:{
    flexDirection:"row",
    alignItems:'center',
    gap:15,
    marginHorizontal:16,
    marginVertical:20
  },
  text1:{
    fontSize:16,
    fontFamily:FONTS?.BOLD,
    color:'#000'
  },
  text2:{
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: 'grey',
    marginBottom:5
  },
  text3:{
    fontSize: 14,
    fontFamily: FONTS.SEMI_BOLD,
    color: '#000',
  },
  logoutBtn:{
    flexDirection:"row",
    justifyContent:"space-between",
    margin:16,
    gap:10,
    backgroundColor:"#ffe0de",
    padding:12,
    paddingHorizontal:16,
    borderRadius:10,
    marginBottom:40
  },
  logoutText:{
    color:"red",
    fontFamily:FONTS?.SEMI_BOLD,
    fontSize:14
  }
});

export default styles;