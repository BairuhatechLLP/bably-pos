import React, {useCallback, useState} from 'react';
import {ScrollView, Switch, Text, TouchableOpacity, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {debounce} from 'lodash';

import styles from './styles';
import {isMobile} from '../../utils/responsive';

import Menus from '../settingScreen/components/menus';
import COLOR from '../../config/color';
import InputItem from '../../components/inputBox';

import {
  setShowImage,
  setTokenGenerate,
  setQuickArea,
  setPrintCount,
} from '../../redux/slice/settingsSlice';
import {clearquickAccess} from '../../redux/slice/datasyncSlice';

const ConfigScreen = () => {
   const navigation = useNavigation<any>();
  const Auth = useSelector((state: any) => state?.Auth?.user);
  const Settings = useSelector((state: any) => state.Settings);
  const dispatch = useDispatch();

  const [printCount, setPrint] = useState<any>(Settings?.printCount);

  const onValuesChange = useCallback(
    debounce((value: any) => {
      dispatch(setPrintCount(value));
    }, 100),
    [],
  );

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
            <View style={styles.itemBox1}>
              <View style={{flex: 1}}>
                <Text style={styles.text1}>Show Product Image</Text>
                <Text style={styles.text2}>
                  Enable this option to display product images on the billing
                  screen. This can enhance clarity and provide a better visual
                  representation of the items being billing.
                </Text>
              </View>
              <View>
                <Switch
                  value={Settings?.showImage}
                  trackColor={{false: COLOR.grey1, true: COLOR.primary}}
                  thumbColor={COLOR.white}
                  onChange={(value: any) => {
                    dispatch(setShowImage(Settings?.showImage ? false : true));
                  }}
                />
              </View>
            </View>
            <View style={styles.itemBox1}>
              <View style={{flex: 1}}>
                <Text style={styles.text1}>Token auto generate</Text>
                <Text style={styles.text2}>
                  When enabled, the system will automatically generate a token
                  number for customers during the billing process. This can help
                  in managing queues and providing a seamless checkout
                  experience.
                </Text>
              </View>
              <View>
                <Switch
                  value={Settings?.tokenGenerate}
                  trackColor={{false: COLOR.grey1, true: COLOR.primary}}
                  thumbColor={COLOR.white}
                  onChange={(value: any) => {
                    dispatch(
                      setTokenGenerate(Settings?.tokenGenerate ? false : true),
                    );
                  }}
                />
              </View>
            </View>
            <View style={styles.itemBox1}>
              <View style={{flex: 1}}>
                <Text style={styles.text1}>Billing quick area</Text>
                <Text style={styles.text2}>
                  Activating this setting allows the cashier to access a
                  simplified and faster version of the billing interface. Ideal
                  for reducing wait times during peak hours.
                </Text>
                {Settings?.quickArea? <TouchableOpacity onPress={()=>navigation.navigate("QuickProducts")}>
                  <Text style={styles.text3}>+ Select products</Text>
                </TouchableOpacity>:null}
               
              </View>
              <View>
                <Switch
                  value={Settings?.quickArea}
                  trackColor={{false: COLOR.grey1, true: COLOR.primary}}
                  thumbColor={COLOR.white}
                  onChange={(value: any) => {
                    let status = Settings?.quickArea ? false : true;
                    dispatch(setQuickArea(status));
                    if (!status) dispatch(clearquickAccess([]));
                  }}
                />
              </View>
            </View>
            <View style={styles.itemBox1}>
              <View style={{flex: 1}}>
                <Text style={styles.text1}>Number of prints</Text>
                <Text style={styles.text2}>
                  Set the desired number of receipt copies to print for each
                  transaction. You can increase or decrease the number based on
                  your business needs.
                </Text>
              </View>
              <View style={{width: 70}}>
                <InputItem
                  value={printCount.toString()}
                  onChange={(value: any) => {
                    setPrint(value);
                    onValuesChange(value);
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default ConfigScreen;
