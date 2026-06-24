import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {Image, StatusBar, Text, View} from 'react-native';
import styles from './styles';
import {CommonActions} from '@react-navigation/native';

function SplashScreen(props: any) {
  const Auth = useSelector((state: any) => state.Auth);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    setTimeout(() => {
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [Auth?.auth ? {name: 'home'} : {name: 'login'}],
        }),
      );
    }, 2000);
  };

  return (
    <View style={styles.splashScreen}>
      <StatusBar barStyle={"dark-content"} backgroundColor={'#fff'} />
      <View style={styles.box}>
      <Image
        resizeMode="contain"
        source={require('../../assets/images/logo-box.png')}
        style={styles.Logo}
      />
      <Text style={styles.LogoText}>Fruits Reports</Text>
      </View>
      <Text style={styles.text1}>Powerd by Bairuha Tech</Text>
    </View>
  );
}

export default SplashScreen;