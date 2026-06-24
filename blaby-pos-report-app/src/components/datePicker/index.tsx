import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

export default function DatePickerModal(props: any) {
  return Platform.OS === 'android' ? (
    <DateTimePicker
      testID="date"
      mode={'date'}
      value={props?.date}
      display="spinner"
      maximumDate={new Date()}
      onChange={(data:any,date:any) => {
        props?.close()
        if(data?.type ==="set"){
          props?.onChange
          ? props?.onChange(moment(data?.nativeEvent?.timestamp).format("YYYY-MM-DD HH:mm:ss"))
          : null;
        }
      }}
    />
  ) : (
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
            <Text style={styles.ModalTitle}>Pick date</Text>
            <TouchableOpacity onPress={() => props?.close()}>
              <Ionicons name="chevron-down" style={styles.ModalClose} />
            </TouchableOpacity>
          </View>
          <View style={styles.box}>
            <DatePicker
              theme="light"
              mode="date"
              modal={false}
              date={props?.value ? new Date(props.value) : new Date()}
              onDateChange={(date: any) => {
                props?.onChange(date);
              }}
            />
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
    padding: 10,
    paddingTop: 8,
    margin: 10,
    marginBottom: 15,
    paddingVertical: 15,
    borderBottomColor: COLOR.GREY3,
    borderBottomWidth: 1,
  },
  ModalTitle: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 18,
    color: COLOR.GREY1,
    flex: 1,
  },
  ModalClose: {
    color: COLOR.GREY1,
    fontSize: 18,
  },
  box: {
    alignItems: 'center',
    paddingBottom: 20,
  },
});
