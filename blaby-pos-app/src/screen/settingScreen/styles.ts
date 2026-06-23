import {StyleSheet} from 'react-native';
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
    alignItems: 'center',
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
    padding: isMobile() ? 20 : 0,
  },
  ScrollView: {
    flexGrow: 1,
    maxWidth: isMobile() ? '100%' : '60%',
    minWidth: isMobile() ? '100%' : '60%',
    padding: isMobile() ? 0 : 20,
  },
});
export default styles;
