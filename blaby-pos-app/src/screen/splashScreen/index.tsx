import React, {useEffect} from 'react';
import {Image, StatusBar, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {CommonActions} from '@react-navigation/native';
import styles from './styles';

const SplashScreen = (props: any) => {
  let Auth = useSelector((state: any) => state.Auth);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setTimeout(() => {
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [Auth.auth ? {name: 'HomeScreen'} : {name: 'LoginScreen'}],
        }),
      );
    }, 1000);
  };

  return (
    <View style={styles.Container}>
    <StatusBar
      barStyle={'dark-content'}
      translucent={true}
      backgroundColor={'#fff'}
    />
    <Image
      source={require('../../assets/images/splashlogo.png')}
      style={styles.image}
      resizeMode="contain"
    />
  </View>
  );
};

export default SplashScreen;
