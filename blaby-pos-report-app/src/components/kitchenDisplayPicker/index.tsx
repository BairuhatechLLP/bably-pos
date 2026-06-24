import React from 'react';
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

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import Empty from '../alertBox/empty';

interface KitchenDisplay {
  id: number;
  name: string;
}

interface KitchenDisplayPickerModalProps {
  open: boolean;
  close: () => void;
  value: KitchenDisplay | null;
  onChange: (display: KitchenDisplay) => void;
  kitchenDisplays: KitchenDisplay[];
}

export default function KitchenDisplayPickerModal(props: KitchenDisplayPickerModalProps) {
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
            <Text style={styles.ModalTitle}>Select Kitchen Display</Text>
            <TouchableOpacity onPress={() => props?.close()}>
              <Ionicons name="chevron-down" style={styles.ModalClose} />
            </TouchableOpacity>
          </View>
          <View style={styles.box}>
            <FlatList
              contentContainerStyle={{flexGrow: 1}}
              data={props?.kitchenDisplays || []}
              ListEmptyComponent={
                <View>
                  <Empty />
                  <Text style={{textAlign: 'center', padding: 20, color: COLOR.GREY2}}>
                    No kitchen displays available for this branch
                  </Text>
                </View>
              }
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    style={styles.ModalItem}
                    onPress={() => {
                      props?.onChange(item);
                      props?.close();
                    }}>
                    <View style={{flex: 1}}>
                      <Text style={styles.ItemText}>{item?.name || 'Unknown Display'}</Text>
                      <Text style={styles.ItemSubText}>
                        ID: {item?.id}
                      </Text>
                    </View>
                    <View>
                      <Ionicons
                        size={20}
                        name={
                          props?.value?.id === item?.id
                            ? 'radio-button-on'
                            : 'radio-button-off'
                        }
                        color={
                          props?.value?.id === item?.id
                            ? COLOR.PRIMARY
                            : COLOR.GREY2
                        }
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
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
  box: {},
  ModalItem: {
    marginHorizontal: 20,
    marginBottom: 13,
    borderBottomColor: COLOR.GREY3,
    borderBottomWidth: 0.5,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ItemText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#000',
  },
  ItemSubText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 11,
    color: COLOR.GREY2,
    marginTop: 4,
  },
});
