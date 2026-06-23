import {Dimensions, StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';
import COLOR from '../../config/color';
import {isMobile} from '../../utils/responsive';
const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  Container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  card: {
    width: isMobile() ? width : width / 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 20,
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  txt1: {
    fontFamily: FONTS.SemiBold,
    color: '#000',
    fontSize: 20,
  },
  errorText: {
    marginBottom: 10,
    fontFamily: FONTS.Medium,
    color: COLOR.red,
    fontSize: 14,
    textAlign: 'center',
  },
  Box2: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  forgottext: {
    fontFamily: FONTS.Medium,
    color: '#000',
    fontSize: 14,
    marginVertical: 20,
  },
});
export default styles;
