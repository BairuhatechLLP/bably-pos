import React, {useEffect, useState} from 'react';
import {Text, StyleSheet, TouchableOpacity, StatusBar} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';

import FONTS from '../../config/fonts';

function Network(props: any) {
  const [isConnected, setIsConnected] = useState<any>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if(state.isConnected){
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor('#fff');
      }else{
        StatusBar.setBarStyle("light-content");
        StatusBar.setBackgroundColor('red');
      }
    });
    return () => unsubscribe();
  }, []);

  return isConnected ? null : (
    <TouchableOpacity style={styles.Network}>
      <Ionicons name="wifi-outline" size={12} color={'#fff'} />
      <Text style={styles.text2}>No network</Text>
    </TouchableOpacity>
  );
}
export default Network;

const styles = StyleSheet.create({
  Network: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 2,
    backgroundColor:"red",
    zIndex:1000
  },
  text2: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS?.Regular,
  },
});
