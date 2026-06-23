import {Dimensions, StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';
import COLOR from '../../config/color';
import {isMobile} from '../../utils/responsive';
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
    borderLeftColor: COLOR.grey4,
    borderLeftWidth: isMobile() ? 0 : 1,
    padding: isMobile() ? 0 : 20,
  },
  box3: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: COLOR.grey4,
    borderWidth: isMobile() ? 0 : 1,
    width: '100%',
    padding: isMobile() ? 20 : 20,
  },
  box4:{
    maxWidth: isMobile() ? '100%' : '50%',
    minWidth: isMobile() ? '100%' : '50%',
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
  }
});
export default styles;
