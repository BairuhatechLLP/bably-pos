import React, {useEffect,useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import styles from './styles';
import {isMobile} from '../../utils/responsive';

import Menus from './components/menus';
import ProfileCard from './components/profileCard';
import ShiftSwitch from './components/shiftSwitch';

import API from '../../config/api';
import {GET} from '../../utils/apiCalls';
import Statics from './components/statics';

const SettingScreen = () => {
  const navigation = useNavigation<any>();
  const Auth = useSelector((state: any) => state?.Auth?.user);
  const[data,setData] = useState({})

  useEffect(() => {
    getStatics();
    navigation.setOptions({
      headerRight: () => <ShiftSwitch />,
    });
  }, []);

  const getStatics = async () => {
    try {
      let companyid = `?companyId=${Auth?.staff?.companyid}`;
      let adminId = `&adminId=${Auth?.id}`;
      const staffId = Auth?.staff?.staffAccess?.includes('order')
        ? `&staffId=${Auth?.staff?.id}`
        : ``;
      const url = `${API.STATICS_ORDER}${companyid}${adminId}${staffId}`;
      const response: any = await GET(url, null);
      if (response?.status) {
        setData(response?.data);
      } else {
        console.log('response', response);
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  return (
    <View style={styles.Container}>
      <View style={styles.box1}>
        {isMobile() ? (
          <>
            <ProfileCard />
            <Statics data={data}/>
          </>
        ) : null}
        <Menus />
      </View>
      {isMobile() ? null : (
        <View style={styles.box2}>
          <View style={styles.box3}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ScrollView}>
              <ProfileCard />
              <Statics data={data}/>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default SettingScreen;
