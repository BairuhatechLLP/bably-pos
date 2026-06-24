import React, {useState} from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

interface CustomDateRangePickerProps {
  open: boolean;
  close: () => void;
  onChange: (data: {key: string; from_date: string; to_date: string}) => void;
  initialFromDate?: Date;
  initialToDate?: Date;
}

export default function CustomDateRangePicker(props: CustomDateRangePickerProps) {
  const format = 'YYYY-MM-DD HH:mm:ss';
  const [fromDate, setFromDate] = useState<Date>(props.initialFromDate || new Date());
  const [toDate, setToDate] = useState<Date>(props.initialToDate || new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);

  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowFromPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setFromDate(selectedDate);
      // If to date is before from date, update it
      if (selectedDate > toDate) {
        setToDate(selectedDate);
      }
    }
  };

  const handleToDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowToPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setToDate(selectedDate);
    }
  };

  const handleApply = () => {
    props.onChange({
      key: 'Custom Range',
      from_date: moment(fromDate).startOf('day').format(format),
      to_date: moment(toDate).endOf('day').format(format),
    });
    props.close();
  };

  const renderDateButton = (
    label: string,
    date: Date,
    onPress: () => void,
    isActive: boolean,
  ) => (
    <TouchableOpacity
      style={[styles.dateButton, isActive && styles.dateButtonActive]}
      onPress={onPress}>
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateValueContainer}>
        <Ionicons name="calendar-outline" size={18} color={COLOR.PRIMARY} />
        <Text style={styles.dateValue}>{moment(date).format('DD MMM YYYY')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={props.open}
      animationType="slide"
      transparent={true}
      onRequestClose={() => props.close()}>
      <StatusBar
        backgroundColor={'rgba(72, 72, 72, 0.25)'}
        barStyle={'dark-content'}
      />
      <View style={styles.Modal}>
        <SafeAreaView style={styles.SafeAreaView}>
          <View style={styles.ModalHeader}>
            <Text style={styles.ModalTitle}>Select Date Range</Text>
            <TouchableOpacity onPress={() => props.close()}>
              <Ionicons name="close" style={styles.ModalClose} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* From Date */}
            {renderDateButton(
              'From Date',
              fromDate,
              () => {
                setActiveField('from');
                setShowFromPicker(true);
              },
              activeField === 'from',
            )}

            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-down" size={24} color={COLOR.GREY2} />
            </View>

            {/* To Date */}
            {renderDateButton(
              'To Date',
              toDate,
              () => {
                setActiveField('to');
                setShowToPicker(true);
              },
              activeField === 'to',
            )}

            {/* Date Range Summary */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                {moment(fromDate).format('DD MMM')} - {moment(toDate).format('DD MMM YYYY')}
              </Text>
              <Text style={styles.summarySubText}>
                {moment(toDate).diff(moment(fromDate), 'days') + 1} day(s) selected
              </Text>
            </View>

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Date Range</Text>
            </TouchableOpacity>
          </View>

          {/* Date Pickers */}
          {showFromPicker && (
            <DateTimePicker
              testID="fromDatePicker"
              mode="date"
              value={fromDate}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={handleFromDateChange}
            />
          )}

          {showToPicker && (
            <DateTimePicker
              testID="toDatePicker"
              mode="date"
              value={toDate}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={fromDate}
              maximumDate={new Date()}
              onChange={handleToDateChange}
            />
          )}
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
    maxHeight: '80%',
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
  content: {
    padding: 20,
  },
  dateButton: {
    backgroundColor: COLOR.GREY4,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  dateButtonActive: {
    borderColor: COLOR.PRIMARY,
    backgroundColor: COLOR.LIGHT,
  },
  dateLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    marginBottom: 5,
  },
  dateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateValue: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 16,
    color: COLOR.GREY1,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryBox: {
    backgroundColor: COLOR.LIGHT,
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  summaryText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLOR.PRIMARY,
  },
  summarySubText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    marginTop: 5,
  },
  applyButton: {
    backgroundColor: COLOR.PRIMARY,
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: '#fff',
  },
});
