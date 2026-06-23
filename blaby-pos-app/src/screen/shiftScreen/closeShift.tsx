import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import styles from './styles';
import COLOR from '../../config/color';
import {isMobile} from '../../utils/responsive';

import Menus from '../settingScreen/components/menus';
import PrimaryButton from '../../components/buttons/primary';
import Denominations from './components/denominations';

import API from '../../config/api';
import {POST} from '../../utils/apiCalls';

const CloseShift = (props: any) => {
  const navigation = useNavigation<any>();
  const Counter = useSelector((state: any) => state?.counter);
  const Auth = useSelector((state: any) => state?.Auth?.user);

  const [isLoading, setIsLoading] = useState<any>(true);
  const [isLoading2, setIsLoading2] = useState<any>(false);

  const [counterData, setCounterData] = useState<any>({});

  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [paymentBank, setPaymentBank] = useState<any>({});
  const [denominations, setDenominations] = useState<any>({});

  useEffect(() => {
    getShiftReport();
  }, []);

  const getShiftReport = async () => {
    try {
      let obj = {
        staffid: Auth?.staff?.id,
        adminid: Auth?.id,
        companyid: Auth?.staff?.companyid,
        shiftid: Counter?.counterData?.data?.id,
      };
      const response: any = await POST(API.GET__USER_SHIFT_REPORT, obj);
      console.log('data = = = >', response);
      if (response?.status) {
        setCounterData(response?.data);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };
  
  const submit = async () => {
    try {
      setIsLoading2(true);
      const obj = {
        counter_id: Counter?.counterData?.data?.counter_id,
        id: Counter?.counterData?.data?.id,
        close_denomination: 0,
        companyid: Auth?.staff?.companyid,
        balance: denominations?.total_balance,
        short: 0,
      };
      const response: any = await POST(API.POST_USER_CLOSE_SHIFT, obj);
    } catch (err) {
      setIsLoading2(false);
    }
  };

  return (
    <View style={styles.Container}>
      {isMobile() ? null : (
        <View style={styles.box1}>
          <Menus />
        </View>
      )}
      <View style={styles.box2}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.box3}>
          <View style={styles.box4}>
            <View style={styles.box5}>
              <Ionicons name="time-outline" size={70} color={COLOR.primary} />
              <Text style={styles.text1}>Clock Out</Text>
              <Text style={styles.text2}>
                Before entering you need to select count and shift
              </Text>
            </View>
            <View style={styles.box6}>
              <Denominations
                value={denominations}
                totalOnChange={(values: any) => console.log(values)}
                onChange={(values: any) => setDenominations(values)}
              />
              <View style={styles.box7}>
                <TouchableOpacity
                  style={styles.btn1}
                  onPress={() => navigation.goBack()}>
                  <Text style={styles.btn1Text}>Cancel</Text>
                </TouchableOpacity>
                <View style={{flex: 1}}>
                  <PrimaryButton
                    label={'Submit'}
                    loading={isLoading2}
                    onPress={() => submit()}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default CloseShift;
