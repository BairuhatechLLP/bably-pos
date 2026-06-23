import React, {useEffect} from 'react';
import {
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';

import styles from './styles';
import {isMobile} from '../../utils/responsive';

import Menus from '../settingScreen/components/menus';
import EditProfile from './components/editProfile';
import COLOR from '../../config/color';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const Auth = useSelector((state: any) => state?.Auth?.user);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <EditProfile />,
    });
  }, []);

  return (
    <View style={styles.Container}>
      {isMobile() ? null : (
        <View style={styles.box1}>
          <Menus />
        </View>
      )}
      <View style={styles.box2}>
        <View style={styles.box3}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ScrollView}>
            <View style={styles.Box5}>
              <ImageBackground
                source={
                  Auth?.staff?.image
                    ? {uri: Auth?.staff?.image}
                    : require('../../assets/images/profile.png')
                }
                style={styles.profilePic}
              />
              <Text style={styles.text1}>{Auth?.staff.name}</Text>
              <Text style={styles.text2}>{Auth?.staff?.staffId}</Text>
            </View>
            <View>
              <View style={styles.box4}>
                <View style={styles.box6}>
                  <TouchableOpacity style={styles.iconBox}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={COLOR.primary}
                    />
                  </TouchableOpacity>
                  <View>
                    <Text style={styles.text2}>Email Address</Text>
                    <Text style={styles.input}>{Auth?.staff.email}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.box4}>
                <View style={styles.box6}>
                  <TouchableOpacity style={styles.iconBox}>
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={COLOR.primary}
                    />
                  </TouchableOpacity>
                  <View style={{flex: 1}}>
                    <Text style={styles.text2}>Phone Number</Text>
                    <Text style={styles.input}>{Auth?.staff.mobile}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.box4}>
                <View style={styles.box6}>
                  <TouchableOpacity style={styles.iconBox}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={COLOR.primary}
                    />
                  </TouchableOpacity>
                  <View style={{flex: 1}}>
                    <Text style={styles.text2}>Address</Text>
                    <Text style={styles.input}>{Auth?.staff.address}</Text>
                  </View>
                </View>
              </View>
              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={[styles.box4, {flex: 1}]}>
                  <View style={styles.box6}>
                    <TouchableOpacity style={styles.iconBox}>
                      <MaterialCommunityIcons
                        name="home-city-outline"
                        size={18}
                        color={COLOR.primary}
                      />
                    </TouchableOpacity>
                    <View style={{flex: 1}}>
                      <Text style={styles.text2}>City</Text>
                      <Text style={styles.input}>{Auth?.staff.city}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.box4, {flex: 1}]}>
                  <View style={styles.box6}>
                    <TouchableOpacity style={styles.iconBox}>
                      <Entypo
                        name="newsletter"
                        size={18}
                        color={COLOR.primary}
                      />
                    </TouchableOpacity>
                    <View style={{flex: 1}}>
                      <Text style={styles.text2}>Postcode</Text>
                      <Text style={styles.input}>{Auth?.staff.postcode}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default ProfileScreen;
