import {Platform, StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';
import COLORS from '../../config/color';

const styles = StyleSheet.create({
  brancheScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 6,
    paddingHorizontal: 16,
    borderBottomColor: COLORS?.GREY3,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS?.GREY4,
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
});

export default styles;
