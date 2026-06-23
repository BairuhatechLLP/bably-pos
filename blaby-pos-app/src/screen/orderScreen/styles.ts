import {StyleSheet} from 'react-native';
import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: COLOR.grey2,
    paddingVertical:0,
    marginTop:10,
  },
  FlatList:{
    flexGrow:1,
    padding:16
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
});
export default styles;
