import {Dimensions, StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';
import COLOR from '../../config/color';
import {isMobile} from '../../utils/responsive';
const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: COLOR.grey2,
    flexDirection: 'row',
  },
  box1: {
    flex: 1.4,
    padding: 20,
  },
  box2: {
    flex: 3,
    alignItems: 'center',
    borderLeftColor: COLOR.grey4,
    borderLeftWidth: isMobile() ? 0 : 1,
    padding: isMobile() ? 0 : 20,
  },
  box3:{
    alignItems:"center",
    backgroundColor:'#fff',
    borderRadius: 8,
    borderColor: COLOR.grey4,
    borderWidth: isMobile() ? 0 : 1,
    width:"100%",
    padding: isMobile() ? 20 : 0,
  },
  ScrollView:{
    flexGrow:1,
    maxWidth:isMobile()?"100%":"60%",
    minWidth:isMobile()?"100%":"60%",
    padding:isMobile()?0:20
  },
  itemBox1:{
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flexDirection:"row",
    gap:20
  },
  iconBox:{
    height: 35,
    width:35,
    backgroundColor: "#0082FC",
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text1:{
    fontSize:14,
    fontFamily:FONTS.SemiBold,
    color:"#000"
  },
  text2:{
    fontSize:12,
    fontFamily:FONTS.Regular,
    color:"grey"
  },
  itemBox2:{
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius: 8,
    marginTop:20,
    padding: 10,
    paddingVertical:5
  },
  headingBox:{
    borderBottomColor: COLOR.grey4,
    borderBottomWidth: 1,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingBottom:2
  },
  text3:{
    fontFamily:FONTS.SemiBold,
    color:"#000",
    fontSize:14,
    padding:8,
    paddingLeft:0
  },
  text4:{
    color:"#000",
    fontFamily:FONTS.Regular,
    fontSize:12,
    letterSpacing:.5,
    marginTop:1
  },
  text5:{
    paddingVertical:50,
    textAlign:"center",
    fontFamily:FONTS.Regular,
    color:COLOR.grey1
  },
  btn1:{
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius:4,
    padding:4,
    paddingHorizontal:15,
  },
  btn1Text:{
    color:"red"
  },
  text6:{
    fontFamily:FONTS.Regular,
    color:"grey",
    fontSize:12,
    marginTop:10
  }

});
export default styles;
