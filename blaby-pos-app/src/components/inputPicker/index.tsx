import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  StatusBar,
  SafeAreaView,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import {isMobile} from '../../utils/responsive';

const InputPicker = (props: any) => {
  const [open, setOpen] = useState(false);

  const selectedItem = (item: any) => {
    setOpen(false);
    props.onChange(item);
  };

  const checkSelected = (item: any) => {
    try {
      let check = Array.isArray(props?.value);
      if (check) {
        let checkInput = props?.value.findIndex(
          (i: any) => i === item[props?.id],
        );
        if (checkInput >= 0) {
          return true;
        } else {
          return false;
        }
      } else {
        if (props?.value) {
          let checkInput = props?.value[props?.id] === item[props?.id];
          return checkInput;
        } else {
          return false;
        }
      }
    } catch (err) {
      console.log('err', err);
      return false;
    }
  };

  const showLabel = (data: any) => {
    try {
      if (props?.options?.length) {
        let checkInput = props?.options?.findIndex(
          (i: any) => i[props?.id] === data?.id,
        );
        if (checkInput >= 0) {
          return props?.options[checkInput]?.name;
        } else {
          return props.placeholder;
        }
      } else {
        return props.placeholder;
      }
    } catch (err) {
      console.log('err', err);
      return props.placeholder;
    }
  };

  return (
    <View>
      {props.label ? (
        <Text style={styles.label}>
          {props.label}{' '}
          {props?.required ? <Text style={{color: 'red'}}>*</Text> : null}
        </Text>
      ) : null}
      <TouchableOpacity
        style={styles.InputPicker}
        onPress={() => setOpen(true)}>
        <Text
          style={props.value ? styles.text2 : styles.text1}
          numberOfLines={1}>
          {props.value ? showLabel(props.value) : props.placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={20} color={'grey'} />
      </TouchableOpacity>
      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
      {open ? (
        <Modal
          visible={props?.open}
          transparent={true}
          onRequestClose={() => setOpen(false)}>
          <StatusBar
            backgroundColor={'rgba(72, 72, 72, 0.25)'}
            barStyle={'dark-content'}
          />
          <View style={styles.Modal}>
            <SafeAreaView style={styles.SafeAreaView}>
              <View style={styles.ModalHeader}>
                <Text style={styles.ModalTitle}>{props.placeholder}</Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Ionicons name="close" style={styles.ModalClose} />
                </TouchableOpacity>
              </View>
              <View style={styles.Box1}>
                <FlatList
                  contentContainerStyle={{flexGrow: 1}}
                  data={props?.options}
                  renderItem={({item}) => {
                    const selected = checkSelected(item);
                    return (
                      <TouchableOpacity
                        style={styles.ModalItem}
                        onPress={() => selectedItem(item)}>
                        <View style={{flex: 1}}>
                          <Text style={styles.ItemText}>{item?.name}</Text>
                        </View>
                        <View>
                          <Ionicons
                            size={20}
                            name={
                              selected ? 'radio-button-on' : 'radio-button-off'
                            }
                            color={selected ? COLOR.primary : COLOR.grey2}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={item => item.id}
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  InputPicker: {
    borderColor: COLOR.grey1,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 12 : 6,
  },
  text1: {
    flex: 1,
    fontFamily: FONTS.Medium,
    fontSize: 14,
    color: 'grey',
  },
  text2: {
    flex: 1,
    fontFamily: FONTS.Medium,
    fontSize: 14,
    color: '#000',
  },
  label: {
    fontFamily: FONTS.Medium,
    color: '#000',
    fontSize: 12,
    marginBottom: 5,
    marginTop: 15,
    alignItems: 'center',
    marginLeft: 2,
  },
  error: {
    color: 'red',
    fontFamily: FONTS.Regular,
    marginTop: 3,
    fontSize: 13,
    marginLeft: 2,
  },
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
    minWidth: '30%',
  },
  ModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 8,
    borderBottomColor: COLOR.grey1,
    borderBottomWidth: 0.7,
    marginBottom: 20,
  },
  ModalTitle: {
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
    color: COLOR.grey6,
    flex: 1,
  },
  ModalClose: {
    color: COLOR.grey5,
    fontSize: 20,
    padding: 10,
  },
  Box1: {},
  ModalItem: {
    marginHorizontal: 20,
    marginBottom: 13,
    borderBottomColor: COLOR.grey1,
    borderBottomWidth: 0.5,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ItemText: {
    fontFamily: FONTS.Medium,
    fontSize: 14,
    color: '#000',
  },
});
export default InputPicker;
