import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

export default function LogoutModal(props: any) {
  return (
    <Modal
      visible={props?.open}
      animationType="slide"
      transparent={true}
      onRequestClose={() => props?.close()}>
      <StatusBar
        backgroundColor={'rgba(72, 72, 72, 0.25)'}
        barStyle={'dark-content'}
      />
      <View style={styles.Modal}>
        <SafeAreaView style={styles.SafeAreaView}>
          <View style={styles.ModalHeader}>
            <Text style={styles.ModalTitle}>Logout account</Text>
            <TouchableOpacity onPress={() => props?.close()}>
              <Ionicons name="chevron-down" style={styles.ModalClose} />
            </TouchableOpacity>
          </View>
          <View style={styles.Box1}>
            <Text style={styles.text1}>Are you sure want to logout?</Text>
            <View style={styles.Box2}>
              <TouchableOpacity
                style={styles.btn1}
                onPress={() => props?.close()}>
                <Text style={styles.text2}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.line} />
              <TouchableOpacity
                style={styles.btn1}
                onPress={() => props?.onChange()}>
                <Text style={styles.text3}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  Modal: {
    flex: 1,
    margin: 0,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(72, 72, 72, 0.25)',
  },
  SafeAreaView: {
    backgroundColor: '#fff',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  ModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 8,
    margin: 10,
    borderBottomColor: COLOR.GREY3,
    borderBottomWidth: 0.7,
  },
  ModalTitle: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
    flex: 1,
  },
  ModalClose: {
    color: COLOR.GREY1,
    fontSize: 18,
    padding: 10,
  },
  Box1: {
    padding: 16,
  },
  Box2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
  },
  text1: {
    textAlign: 'center',
    fontFamily: FONTS.MEDIUM,
    fontSize: 15,
    color: 'grey',
  },
  btn1: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  text2: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: '#000',
  },
  text3: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: 'red',
  },
  line: {
    backgroundColor: COLOR.GREY3,
    width: 1,
    height: '80%',
  },
});
