import {useEffect} from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

import COLOR from '../config/color';
import FONTS from '../config/fonts';
import styles from './styles';
const TabHeader = (props: any) => {
  const navigation: any = useNavigation();
  const Auth = useSelector((state: any) => state.Auth?.user);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () =>
        props?.showLogo ? (
          <Image
            source={require('../assets/images/logo-dark.png')}
            style={styles.TabHeaderLogo}
          />
        ) : (
          <Text numberOfLines={1} style={styles.TabHeadertxt}>
            {props?.title}
          </Text>
        ),
      headerTitleStyle: {
        fontFamily: FONTS.SEMI_BOLD,
        fontSize: 23,
      },
      headerStyle:{
        height:60
      },
      headerRight: () => (
        <View style={styles.TabHeaderRight}>
          {props?.showProfile ? (
            <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
              {Auth?.images?.image1 ? (
                <ImageBackground
                  source={{uri: Auth?.images?.image1}}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={28}
                  color={COLOR.GREY5}
                />
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      ),
    });
  }, []);

  return <View></View>;
};

export default TabHeader;
