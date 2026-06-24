import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutModal from './logoutModal';

import styles from './styles';
import {logout} from '../../redux/slices/AuthSlice';
import COLORS from '../../config/color';

function ProfileSceen(props: any) {
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const Users = useSelector((state: any) => state?.Auth?.user);
  const [showModal, setShowModal] = useState(false);

  const onLogout = async () => {
    setShowModal(false);

    // Clear AsyncStorage token
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      // Silent fail
    }

    // Clear Redux state
    dispatch(logout());

    // Navigate to login
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'login'}],
      }),
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.profileSceen}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
      <View style={styles.Box1}></View>
      <View style={styles.Box2}>
        <View style={styles.Box3}>
          <Ionicons name="person" size={50} color={COLORS?.PRIMARY} />
        </View>
        <View>
          <Text style={styles.text1}>{Users?.staff?.name}</Text>
        </View>
      </View>
      <View style={{flex: 1}}>
        <View style={styles.Box4}>
          <Ionicons name="mail-outline" size={20} color={'grey'} />
          <View>
            <Text style={styles.text2}>Email address</Text>
            <Text style={styles.text3}>{Users?.staff?.email}</Text>
          </View>
        </View>
        <View style={styles.Box4}>
          <Ionicons name="call-outline" size={20} color={'grey'} />
          <View>
            <Text style={styles.text2}>Phone number</Text>
            <Text style={styles.text3}>{Users?.staff?.mobile}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
        <Ionicons name="log-out-outline" size={20} color={'red'} />
      </TouchableOpacity>
      {showModal ? (
        <LogoutModal
          open={showModal}
          date={new Date()}
          close={() => setShowModal(false)}
          onChange={() => onLogout()}
        />
      ) : null}
    </ScrollView>
  );
}

export default ProfileSceen;
