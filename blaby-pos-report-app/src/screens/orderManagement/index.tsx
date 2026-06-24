import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import BranchPickerModal from '../../components/branchPicker';

function OrderHubScreen() {
  const navigation: any = useNavigation();
  const branches: any[] = useSelector(
    (state: any) => state?.Dropdown?.branches || [],
  );
  const [branch, setBranch] = useState<any>(branches?.[0] || null);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);

  const hasBranch = !!branch?.companyId;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Place an Order</Text>
        <Text style={styles.sub}>
          Pick a branch, then create a new order or edit a recent one.
        </Text>

        <Text style={styles.fieldLabel}>Branch</Text>
        <TouchableOpacity
          style={styles.branchPicker}
          onPress={() => setBranchPickerOpen(true)}>
          <Ionicons name="business-outline" size={20} color={COLOR.PRIMARY} />
          <Text style={styles.branchText}>
            {branch ? branch.bname : 'Select branch'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLOR.GREY2} />
        </TouchableOpacity>

        {!hasBranch ? (
          <View style={styles.warningBox}>
            <Ionicons
              name="warning-outline"
              size={18}
              color={COLOR.WARNING || '#FFA500'}
            />
            <Text style={styles.warningText}>
              Please pick a branch to continue.
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.actionCard, !hasBranch && styles.actionCardDisabled]}
          disabled={!hasBranch}
          onPress={() =>
            navigation.navigate('CreateOrder', {branch, editOrder: null})
          }>
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle" size={24} color={COLOR.PRIMARY} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.actionTitle}>Create new order</Text>
            <Text style={styles.actionSub}>
              Pick products from this branch and place an order
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLOR.GREY2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, !hasBranch && styles.actionCardDisabled]}
          disabled={!hasBranch}
          onPress={() => navigation.navigate('RecentOrders', {branch})}>
          <View style={styles.actionIcon}>
            <Ionicons name="time" size={22} color={COLOR.PRIMARY} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.actionTitle}>Edit recent orders</Text>
            <Text style={styles.actionSub}>Last 3 days from this branch</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLOR.GREY2} />
        </TouchableOpacity>
      </ScrollView>

      <BranchPickerModal
        open={branchPickerOpen}
        close={() => setBranchPickerOpen(false)}
        value={branch}
        onChange={(b: any) => setBranch(b)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scroll: {padding: 16, paddingBottom: 32},
  heading: {
    fontFamily: FONTS.BOLD,
    fontSize: 22,
    color: COLOR.GREY1,
    marginTop: 4,
  },
  sub: {
    fontFamily: FONTS.REGULAR,
    fontSize: 13,
    color: COLOR.GREY2,
    marginTop: 4,
    marginBottom: 18,
  },
  fieldLabel: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: COLOR.GREY2,
    marginBottom: 6,
  },
  branchPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.LIGHT,
    padding: 13,
    borderRadius: 8,
    marginBottom: 14,
  },
  branchText: {
    flex: 1,
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.PRIMARY,
    marginLeft: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 10,
    borderRadius: 6,
    gap: 8,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: '#856404',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.GREY4,
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
    gap: 12,
  },
  actionCardDisabled: {opacity: 0.5},
  actionIcon: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 22,
  },
  actionTitle: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 15,
    color: COLOR.GREY1,
  },
  actionSub: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    marginTop: 2,
  },
});

export default OrderHubScreen;
