import React, {useCallback} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {debounce} from 'lodash';

import COLORS from '../../../config/color';
import {isMobile} from '../../../utils/responsive';

const Header = (props: any) => {
  const navigation = useNavigation<any>();

  const onValuesChange = useCallback(
    debounce((value: any) => {
      props?.setSearch(value);
    }, 100),
    [],
  );

  return (
    <View style={styles.Header}>
      <View style={{flex: 1}}>
        <View style={styles.inputBox}>
          <Ionicons name="search-outline" size={20} color={'grey'} />
          <TextInput
            style={styles.input}
            placeholder="Search product name . . ."
            placeholderTextColor={'grey'}
            onChangeText={(value: any) => onValuesChange(value)}
            clearButtonMode="while-editing"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.btn1}
        onPress={() => navigation.navigate('SyncScreen')}>
        <MaterialCommunityIcons name="cloud-sync" color={'#000'} size={20} />
      </TouchableOpacity>
      {props?.edit ? null : (
        <TouchableOpacity onPress={() => props.reset()}>
          <MaterialCommunityIcons
            name="refresh-circle"
            color={'red'}
            size={35}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  Header: {
    paddingHorizontal: 16,
    borderBottomColor: COLORS.grey4,
    borderBottomWidth: 1,
    paddingBottom: 8,
    gap: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: COLORS.grey4,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    height: isMobile() ? 40 : 35,
    width: isMobile() ? '100%' : '50%',
  },
  input: {
    flex: 1,
    color: '#000',
    padding: 0,
    fontSize: 14,
  },
  btn1: {
    backgroundColor: '#fff',
    borderColor: COLORS.grey4,
    borderWidth: 1,
    height: isMobile() ? 40 : 35,
    width: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
export default Header;
