import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import styles from './styles';
import COLOR from '../../config/color';
import {isMobile} from '../../utils/responsive';

import Menus from '../settingScreen/components/menus';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../../components/buttons/primary';
import InputPicker from '../../components/inputPicker';
import ShiftPicker from '../../components/inputPicker/shiftPicker';
import Denominations from './components/denominations';

import API from '../../config/api';
import {POST} from '../../utils/apiCalls';

const OpenShift = (props: any) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const Auth = useSelector((state: any) => state?.Auth?.user);
  
  const [isLoading, setIsLoading] = useState<any>(false);

  const [counter, setCounter] = useState<any>();
  const [shift, setShift] = useState<any>('');
  const [denominations, setDenominations] = useState<any>();

  useEffect(() => {
    // setCounter(counters);
    // setShift(shifts);
  }, []);

  const submit = async () => {
    try {
      setIsLoading(true);
      let obj = {
        adminid: Auth?.id,
        staffid: Auth?.staff?.id,
        companyid: Auth?.staff?.companyid,
        sdate: new Date(),
        counter_id: counter?.id,
        balance: denominations?.total_balance,
        open_denomination: denominations,
        shift_type: shift?.name,
      };
      const response:any = await POST(API.POST_USER_OPEN_SHIFT, obj);
      if(response?.status){
        navigation.goBack();
      }else{

      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log('err', err);
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
              <Ionicons name="time-outline" size={70} color={COLOR.grey1} />
              <Text style={styles.text1}>Clock In</Text>
              <Text style={styles.text2}>
                Before entering you need to select count and shift
              </Text>
            </View>
            <View style={styles.box6}>
              <InputPicker
                label={'Counter'}
                placeholder={'Select counter'}
                type={'single'} // single / multi
                id={'id'}
                required={true}
                error={null}
                value={counter}
                options={[]}
                onChange={(value: any) => setCounter(value)}
              />
              <ShiftPicker
                label={'Shift'}
                placeholder={'Select shift'}
                type={'single'} // single / multi
                id={'id'}
                required={true}
                error={null}
                value={shift}
                options={counter?.shiftlist}
                onChange={(value: any) => setShift(value)}
              />
              <Denominations
                value={denominations}
                totalOnChange = {(values:any)=>console.log(values)}
                onChange={(values: any) => setDenominations(values)}
              />
              <View style={styles.box7}>
                <TouchableOpacity style={styles.btn1} onPress={()=>navigation.goBack()}>
                  <Text style={styles.btn1Text}>Cancel</Text>
                </TouchableOpacity>
                <View style={{flex: 1}}>
                  <PrimaryButton label={'Submit'} loading={isLoading} onPress={() => submit()} />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default OpenShift;
