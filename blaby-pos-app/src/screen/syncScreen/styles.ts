import {Dimensions, StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';
import COLOR from '../../config/color';
import {isMobile} from '../../utils/responsive';
const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  card: {
    width: isMobile() ? width : width / 2.5,
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 20,
  },
  box: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  icon: {
    fontSize: 50,
    color: COLOR?.primary,
  },
  text: {
    fontSize: 16,
    color: COLOR?.primary,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  text1: {
    fontSize: 20,
    color: '#000',
    marginTop: 20,
    fontFamily: FONTS.SemiBold,
    textAlign: 'center',
  },
  text2: {
    fontSize: 14,
    color: 'grey',
    fontFamily: FONTS.Regular,
    textAlign: 'center',
  },
  tex3: {
    fontSize: 16,
    color: "red",
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  tex4:{
    fontFamily: FONTS.Medium,
    textAlign:"center",
    color:"grey",
    fontSize:12,
    marginTop:10
  },
  box1: {
    backgroundColor: '#fff',
    borderColor: COLOR.grey4,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    width: isMobile() ? '100%' : width / 2.7,
    marginBottom:10
  },
  syncItem:{
    flexDirection:"row",
    alignItems:"center",
    borderBottomColor: COLOR.grey4,
    borderBottomWidth: 1,
    margin: 10,
    paddingBottom: 10,
    marginTop: 0,
  },
  syncItemText:{
    flex: 1,
    fontFamily: FONTS.Medium,
    fontSize: 13,
    color:"#000"
  }
});
export default styles;
