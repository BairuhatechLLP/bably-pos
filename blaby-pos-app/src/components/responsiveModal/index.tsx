import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import {isMobile} from '../../utils/responsive';

export default function ResponsiveModal(props: any) {
  return (
    <Modal
      visible={props?.open}
      transparent={true}
      onRequestClose={() => props?.close()}>
      <StatusBar
        backgroundColor={'rgba(72, 72, 72, 0.25)'}
        barStyle={'dark-content'}
      />
      <View style={styles.Modal}>
        <SafeAreaView style={styles.SafeAreaView}>
          <View style={styles.ModalHeader}>
            <View style={{flex: 1}}>
              <Text style={styles.ModalTitle}>{props?.title}</Text>
            </View>
            <TouchableOpacity onPress={() => props?.close()}>
              <Ionicons name="close" style={styles.ModalClose} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.ScrollView}>
            {props?.children}
          </ScrollView>
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
    justifyContent: isMobile() ? 'flex-end' : 'center',
    alignItems: isMobile() ? 'stretch' : 'center',
    backgroundColor: 'rgba(72, 72, 72, 0.25)',
  },
  SafeAreaView: {
    backgroundColor: '#fff',
    borderTopEndRadius: isMobile() ? 20 : 8,
    borderTopStartRadius: isMobile() ? 20 : 8,
    borderBottomStartRadius: isMobile() ? 0 : 8,
    borderBottomEndRadius: isMobile() ? 0 : 8,
    overflow: 'hidden',
    maxHeight: '90%',
    width: isMobile() ? '100%' : 430,
  },
  ModalHeader: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingTop: 3,
    margin: 10,
    marginBottom: 0,
    borderBottomColor:COLOR?.grey4,
    borderBottomWidth:1
  },
  ModalTitle: {
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
    color: COLOR.grey6,
    marginTop:7
  },
  ModalClose: {
    color: COLOR.grey5,
    fontSize: 25,
    padding: 10,
    paddingRight: 0,
    paddingTop:5
  },
  Heading: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    flex: 1,
  },
  headingBox: {
    width: '100%',
    borderBottomColor: COLOR.grey4,
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ScrollView: {
    flexGrow: 1,
  },
});
