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
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import Empty from '../alertBox/empty';

export default function StaffPickerModal(props: any) {
  // Prepare data with "All Staff" option at the beginning
  const staffData = React.useMemo(() => {
    const allStaffOption = {
      staffId: null,
      staffName: 'All Staff',
      staffEmail: null,
      isAllOption: true,
    };
    return [allStaffOption, ...(props?.staffList || [])];
  }, [props?.staffList]);

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
            <Text style={styles.ModalTitle}>Select Staff</Text>
            <TouchableOpacity onPress={() => props?.close()}>
              <Ionicons name="chevron-down" style={styles.ModalClose} />
            </TouchableOpacity>
          </View>
          <View style={styles.box}>
            {props?.loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR.PRIMARY} />
                <Text style={styles.loadingText}>Loading staff...</Text>
              </View>
            ) : (
              <FlatList
                contentContainerStyle={{flexGrow: 1}}
                data={staffData}
                ListEmptyComponent={
                  <View>
                    <Empty />
                    <Text style={styles.emptyText}>
                      No staff members found for this branch.
                    </Text>
                  </View>
                }
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    style={styles.ModalItem}
                    onPress={() => {
                      // If "All Staff" is selected, pass null to clear the staff filter
                      const selectedValue = item?.isAllOption ? null : item;
                      if (props?.onChange) {
                        props.onChange(selectedValue);
                      }
                      if (props?.close) {
                        props.close();
                      }
                    }}>
                    <View style={styles.iconBox}>
                      <Ionicons
                        name={item?.isAllOption ? 'people' : 'person'}
                        size={20}
                        color={COLOR.PRIMARY}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.ItemText}>
                        {item?.staffName || 'Unknown Staff'}
                      </Text>
                      {!item?.isAllOption && (
                        <Text style={styles.ItemSubText}>
                          ID: {item?.staffId} | Email: {item?.staffEmail || 'N/A'}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Ionicons
                        size={20}
                        name={
                          (item?.isAllOption && !props?.value) ||
                          props?.value?.staffId === item?.staffId
                            ? 'radio-button-on'
                            : 'radio-button-off'
                        }
                        color={
                          (item?.isAllOption && !props?.value) ||
                          props?.value?.staffId === item?.staffId
                            ? COLOR.PRIMARY
                            : COLOR.GREY2
                        }
                      />
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) =>
                  item?.isAllOption ? 'all-staff' : item?.staffId?.toString() || index.toString()
                }
              />
            )}
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
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
    color: COLOR.GREY2,
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: COLOR.GREY2,
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
  },
  ModalItem: {
    marginHorizontal: 20,
    marginBottom: 13,
    borderBottomColor: COLOR.GREY3,
    borderBottomWidth: 0.5,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLOR.LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
