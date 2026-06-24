import {StyleSheet} from 'react-native';
import FONTS from '../../config/fonts';

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  box:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Logo: {
    width: 120,
    height: 120, 
    objectFit:"contain"
  },
  LogoText:{
    fontSize:20,
    fontFamily:FONTS?.BOLD,
    marginTop:5
  },
  text1:{
    color:"grey",
    fontSize:10,
    fontFamily:FONTS?.REGULAR,
    textAlign:"center"
  }
});

export default styles;