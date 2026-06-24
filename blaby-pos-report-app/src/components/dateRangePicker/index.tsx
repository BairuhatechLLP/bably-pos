import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  StatusBar,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

export default function DateRangePickerModal(props: any) {
  const format = 'YYYY-MM-DD HH:mm:ss';

  // Date filter options: Today, Yesterday, This Month
  const dateRanges = [
    {
      key: 'Today',
      filter: 'day',
      from_date: moment().startOf('day').format(format),
      to_date: moment().endOf('day').format(format),
    },
    {
      key: 'Yesterday',
      filter: 'day',
      from_date: moment().subtract(1, 'day').startOf('day').format(format),
      to_date: moment().subtract(1, 'day').endOf('day').format(format),
    },
    {
      key: 'This Month',
      filter: 'month',
      from_date: moment().startOf('month').format(format),
      to_date: moment().endOf('month').format(format),
    },
  ];

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
            <Text style={styles.ModalTitle}>Select Date Range</Text>
            <TouchableOpacity onPress={() => props?.close()}>
              <Ionicons name="close" style={styles.ModalClose} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={dateRanges}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              const isSelected = props?.value?.key === item.key;
              return (
                <TouchableOpacity
                  style={[
                    styles.item,
                    isSelected && styles.selectedItem,
                  ]}
                  onPress={() => {
                    props?.onChange(item);
                    props?.close();
                  }}>
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.radio,
                        isSelected && styles.radioSelected,
                      ]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.itemTextBox}>
                      <Text style={styles.itemText}>{item.key}</Text>
                      <Text style={styles.itemSubText}>
                        {moment(item.from_date).format('MMM DD')} -{' '}
                        {moment(item.to_date).format('MMM DD, YYYY')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
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
    maxHeight: '70%',
  },
  ModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 8,
    margin: 10,
    marginBottom: 5,
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
    fontSize: 22,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY4,
  },
  selectedItem: {
    backgroundColor: COLOR.LIGHT,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLOR.GREY3,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLOR.PRIMARY,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLOR.PRIMARY,
  },
  itemTextBox: {
    flex: 1,
  },
  itemText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 15,
    color: COLOR.GREY1,
    marginBottom: 3,
  },
  itemSubText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
  },
});
