import React, {useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import COLORS from '../../../config/color';
import FONTS from '../../../config/fonts';
import BranchPickerModal from '../../../components/branchPicker';

function Filters(props: any) {
  const [showBranchModal, setShowBranchModal] = useState(false);

  const Clear = () => {
    props?.setBranch(null);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.branchFilter}
        onPress={() => setShowBranchModal(true)}>
        <Ionicons name="storefront" size={16} color={'grey'} />
        <View style={{flex: 1}}>
          <Text style={styles.branchText} numberOfLines={1}>
            {props?.branchId?.bname || 'Select branch'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={'grey'} />
      </TouchableOpacity>
      <View style={styles.Filters}>
        <View style={styles.FilterBox2}>
          <Text style={styles.FilterText2}>
            {props?.branchId?.id?null:"All branches -"} 
            {props?.query ? `'${props?.query}'` : ''}{' '}
            {`${moment(props?.date?.from_date).format('MMMM DD')} to ${moment(
              props?.date?.to_date,
            ).format('ll')}`}
          </Text>
          {props?.loading ? (
            <ActivityIndicator size={'small'} color={COLORS?.PRIMARY} />
          ) : props?.branchId?.id ? (
            <TouchableOpacity onPress={() => Clear()}>
              <Text style={{color: 'red'}}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {showBranchModal ? (
        <BranchPickerModal
          open={showBranchModal}
          value={props?.branchId}
          close={() => setShowBranchModal(false)}
          onChange={(data: any) => props?.setBranch(data)}
          filterByRecentSales={true}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  Filters: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomColor: COLORS?.GREY3,
    borderBottomWidth: 1,
    paddingTop: 0,
  },
  FilterBox2: {
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  FilterText2: {
    fontSize: 14,
    fontFamily: FONTS.BOLD,
    color: COLORS.GREY1,
    flex: 1,
  },
  branchFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS?.GREY6,
    paddingHorizontal: 16,
    padding: 10,
    borderBottomColor: COLORS?.GREY3,
    borderBottomWidth: 0.5,
  },
  branchText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#000',
    flex: 1,
  },
});

export default Filters;
