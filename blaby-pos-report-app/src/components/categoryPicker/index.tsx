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
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import Empty from '../alertBox/empty';

export default function CategoryPickerModal(props: any) {
  const [search, setSearch] = useState('');

  const filteredCategories = (props?.categories || []).filter((item: any) => {
    if (!search) return true;
    const name = (item?.category || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const onClose = () => {
    setSearch('');
    props?.close();
  };

  return (
    <Modal
      visible={props?.open}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <StatusBar
        backgroundColor={'rgba(72, 72, 72, 0.25)'}
        barStyle={'dark-content'}
      />
      <View style={styles.Modal}>
        <SafeAreaView style={styles.SafeAreaView}>
          <View style={styles.ModalHeader}>
            <Text style={styles.ModalTitle}>Select Category</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="chevron-down" style={styles.ModalClose} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={'grey'} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search category..."
              placeholderTextColor={'grey'}
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={'grey'} />
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.box}>
            <FlatList
              contentContainerStyle={{flexGrow: 1}}
              data={filteredCategories}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Empty />}
              renderItem={({item}) => {
                const displayName = item?.category || 'Unnamed';
                return (
                  <TouchableOpacity
                    style={styles.ModalItem}
                    onPress={() => {
                      props?.onChange(item);
                      onClose();
                    }}>
                    <View style={{flex: 1}}>
                      <Text style={styles.ItemText}>{displayName}</Text>
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
              keyExtractor={item => item.id.toString()}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 12,
    backgroundColor: COLOR.GREY4,
    borderRadius: 8,
    borderColor: COLOR.GREY3,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: '#000',
    padding: 0,
    height: 40,
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
});
