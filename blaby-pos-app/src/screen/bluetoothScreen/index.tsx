import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  DeviceEventEmitter,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import {BluetoothManager} from 'rn-bt-escpos-printer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';

import styles from './styles';
import COLOR from '../../config/color';
import {isMobile} from '../../utils/responsive';
import Menus from '../settingScreen/components/menus';
import DeviceItem from './components/deviceItem';

import CheckBtPermission from './components/checkBtPermission';
import PrinterTest from './components/testPrinter';

import {clearBluetooth, saveConnected} from '../../redux/slice/bluetoothSlice';

const BluetoothScreen = () => {
  const navigation = useNavigation<any>();
  const Bluetooth = useSelector((state: any) => state.Bluetooth);
  const dispatch = useDispatch();
  const toastLong = ToastAndroid.LONG;
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [status, setStatus] = useState(false);

  const [pairedDevices, setPairedDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <PrinterTest />,
    });
  }, []);

  useEffect(() => {
    BluetoothManager.isBluetoothEnabled().then(
      (enabled: any) => {
        setStatus(Boolean(enabled));
        setIsLoading(false);
        if (Boolean(enabled)) {
          scanNow();
        }
      },
      (err: any) => ToastAndroid.show(err, toastLong),
    );

    if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_CONNECTED,
        (rsp: any) => {
          console.log('Device connected:', rsp);
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        (rsp: any) => deviceAlreadPaired(rsp),
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        rsp => {
          console.log('EVENT_DEVICE_FOUND', rsp);
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST,
        () =>
          ToastAndroid.show(
            'Bluetooth Connection lost.Please Reconnect',
            toastLong,
          ),
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT,
        () =>
          ToastAndroid.show('Device Doesnot Support Bluetooth !', toastLong),
      );
    }
  }, [BluetoothManager]);

  const trunOn = () => {
    try {
      setIsLoading(true);
      BluetoothManager.enableBluetooth().then(
        (paired_id: any) => {
          deviceAlreadPaired(paired_id);
          setIsLoading(false);
          setStatus(true);
        },
        (err: any) => {
          setIsLoading(false);
          Alert.alert(err.message);
        },
      );
    } catch (err) {
      setIsLoading(false);
      console.log('err', err);
    }
  };

  const trunOff = () => {
    try {
      setIsLoading(true);
      BluetoothManager.disableBluetooth().then(
        () => {
          setStatus(false);
          setIsLoading(false);
          dispatch(clearBluetooth());
          setPairedDevices([]);
        },
        (err: any) => {
          Alert.alert(err.message);
        },
      );
    } catch (err) {
      setIsLoading(false);
      console.log('err', err);
    }
  };

  const scanNow = async () => {
    setIsLoading2(true);
    const checkPermission = await CheckBtPermission();
    BluetoothManager.scanDevices().then(
      (s: any) => {
        var found = s.found;
        try {
          found = JSON.parse(found);
        } catch (e) {
          console.log("e",e);
          //ignore
        }
        found = JSON.parse(found);
        console.log('found', found);
        setIsLoading2(false);
      },
      (err: any) => {
        console.log('err 2', err);
        setIsLoading2(false);
        ToastAndroid.show('No device found', toastLong);
      },
    );
  };

  const connect = (address: any) => {
    try{
    BluetoothManager.connect(address).then(
      (name: any) => {
        console.log('s ----> ', name);
        dispatch(
          saveConnected({
            address: address,
            name: name,
            status: true,
          }),
        );
      },
      (e: any) => {
        console.log('Connect error ----> ', e);
        ToastAndroid.show(e.message, toastLong);
      },
    );
  }catch(err){
    console.log("err",err);
  }
  };

  const disconnect = (address: any) => {
    try{
    BluetoothManager.unpaire(address).then(
      (s: any) => {
        dispatch(clearBluetooth());
      },
      (e: any) => {
        ToastAndroid.show(e.message, toastLong);
      },
    );
  }catch(err){
    console.log("err",err);
  }
  };

  const deviceAlreadPaired = useCallback(
    (rsp: any) => {
      try{
      console.log('deviceAlreadPaired = = = >');
      var ds = null;
      if (typeof rsp.devices === 'object') {
        ds = rsp.devices;
      } else {
        try {
          ds = JSON.parse(rsp.devices);
        } catch (e) {}
      }
      if (ds && ds.length) {
        setPairedDevices(ds);
      }
    }catch(err){
      console.log("err",err);
    }
    },
    [pairedDevices],
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
              <View style={styles.iconBox}>
                <Ionicons name="bluetooth" size={20} color={'#fff'} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.text1}>Bluetooth</Text>
                <Text style={styles.text2}>
                  Please turn on Bluetooth and connect to the printer for
                  printing.
                </Text>
              </View>
              <View>
                {isLoading ? (
                  <ActivityIndicator size={'small'} color={COLOR.primary} />
                ) : (
                  <Switch
                    value={status}
                    trackColor={{false: COLOR.grey1, true: COLOR.primary}}
                    thumbColor={COLOR.white}
                    onChange={() => (status ? trunOff() : trunOn())}
                  />
                )}
              </View>
            </View>

            {status && Bluetooth?.connected?.address ? (
              <View style={styles.itemBox2}>
                <View style={styles.headingBox}>
                  <Text style={styles.text3}>Connected Device</Text>
                  <TouchableOpacity
                    onPress={() => disconnect(Bluetooth?.connected?.address)}
                    style={styles.btn1}>
                    <Text style={styles.btn1Text}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
                <DeviceItem
                  item={Bluetooth?.connected}
                  index={0}
                  length={1}
                  active={true}
                  connetcted={true}
                />
              </View>
            ) : null}

            <View style={styles.itemBox2}>
              <View style={styles.headingBox}>
                <Text style={styles.text3}>Paired Device</Text>
                {status ? (
                  <TouchableOpacity
                    onPress={() => scanNow()}
                    style={styles.btn1}>
                    {isLoading2 ? (
                      <ActivityIndicator
                        size={'small'}
                        color={COLOR.primary}
                        style={styles.text4}
                      />
                    ) : (
                      <Text style={styles.text4}>Refresh</Text>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
              {pairedDevices?.length ? (
                pairedDevices?.map((item: any, index: number) => {
                  return (
                    <DeviceItem
                      key={index}
                      item={item}
                      index={index}
                      length={pairedDevices?.length}
                      active={item?.address === Bluetooth?.connected?.address}
                      connect={() => connect(item?.address)}
                      disconnect={() => disconnect(item?.address)}
                    />
                  );
                })
              ) : (
                <Text style={styles.text5}>No devices found</Text>
              )}
            </View>
            <Text style={styles?.text6}>
              <Ionicons name='information-circle-outline' color={"blue"} size={18}/>{" "}
              If there is an issue with the Bluetooth device connection, please
              check the device's Bluetooth settings and ensure that it is paired
              correctly.
            </Text>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default BluetoothScreen;
