import {Dimensions, StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';
import COLOR from '../../config/color';
import {isMobile} from '../../utils/responsive';
const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: isMobile() ? '#fff' : COLOR.grey2,
    flexDirection: 'row',
    padding: 20,
    gap: isMobile() ? 10 : 20,
  },
  box1: {
    flex: 1,
  },
  box2: {
    flex: 3,
  },
  box3:{
    alignItems:'center'
  },
  box4: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: isMobile() ? 0 : 0,
    borderColor: COLOR.grey4,
    borderWidth: isMobile() ? 0 : 1,
    width:isMobile() ? "100%" : 500,
  },
  box5:{
    alignItems:'center',
    padding:20
  },
  text1:{
    color: '#000',
    fontFamily: FONTS.SemiBold,
    fontSize: 18,
  },
  text2:{
    color: 'grey',
    fontSize: 12,
    fontFamily: FONTS.Regular,
  },
  text3:{
    textAlign:"right",
    fontSize:20,
    fontFamily: FONTS.Bold,
    marginTop:5
  },
  box6:{
    padding:isMobile() ? 0 : 20,
  },
  box7:{
    flexDirection:"row",
    gap:10,
    marginTop:30
  },
  btn1:{
    flex:1,
    alignItems:"center",
    justifyContent:'center'
  },
  btn1Text:{
    color:"red",
    fontFamily: FONTS.Medium,
    fontSize:16
  },
  box8:{
    flexDirection:"row",
    alignItems:"center",
    gap:10,
    marginTop:5
  },
  label:{
    fontFamily: FONTS.Medium,
    color: '#000',
    fontSize: 12,
    marginTop: 15,
    alignItems: 'center',
    marginLeft: 2,
  },
  box9:{
    flexDirection:"row",
    alignItems:"center",
    gap:10,
    marginTop:20,
    borderTopColor:COLOR.grey1,
    borderTopWidth:1
  }
});
export default styles;
