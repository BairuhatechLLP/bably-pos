import {StyleSheet} from 'react-native';
import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  Box: {
    flex: 1,
    flexDirection: 'row',
  },
  Box1: {
    flex: 3,
    borderRightColor: COLOR.grey2,
    borderRightWidth: 1,
    paddingBottom: 0,
  },
  Box2: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  Box3: {
    backgroundColor: COLOR.grey2,
    padding: 10,
    paddingBottom: 0,
    flex: 1,
  },
  emptyBox:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  emptyText:{
    textAlign:"center",
    fontFamily:FONTS?.Medium,
    color:"grey",
    fontSize:14
  },
  quickAreaButton:{
    borderColor: COLOR?.grey4,
    borderWidth: 1,
    marginBottom:15,
    borderRadius:6,
    backgroundColor:"#fff"
  },
  text1:{
    color:COLOR.primary,
    fontFamily:FONTS.Medium,
    fontSize:14,
    paddingVertical:5,
    paddingHorizontal:20,
    paddingBottom:3
  }
});
export default styles;
