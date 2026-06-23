import {Dimensions, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems:"center",
    justifyContent:"center"
  },
  image: {
    width:Dimensions.get(`screen`).width/2.3,
    height:Dimensions.get(`screen`).width/2.3
  },
});
export default styles;
