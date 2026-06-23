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
  Box5: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: 10,
  },
  profilePic: {
    height: 120,
    width: 120,
    borderRadius: 100,
    overflow: 'hidden',
    objectFit: 'fill',
    borderColor: COLOR.grey4,
    borderWidth: 1,
    marginBottom: 5,
  },
  text1: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
    color: '#000',
    marginBottom: -5,
  },
  text2: {
    color: 'grey',
    fontSize: 12,
    fontFamily: FONTS.Regular,
    marginBottom: -10,
  },
  box4: {
    borderColor: COLOR.grey4,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    paddingBottom: 0,
    paddingHorizontal: 12,
    marginTop: 20,
  },
  box6: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#000',
    fontFamily: FONTS.Medium,
    fontSize: 15,
    paddingHorizontal: 0,
    marginTop: 10,
    paddingBottom: 5,
  },
  iconBox: {
    backgroundColor: COLOR.grey4,
    height: 28,
    width: 28,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
});
export default styles;
