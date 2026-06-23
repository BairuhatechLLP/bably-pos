import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import styles from '../configScreen/styles';
import {isMobile} from '../../utils/responsive';
import Menus from '../settingScreen/components/menus';
import COLOR from '../../config/color';
import InputItem from '../../components/inputBox';
import API from '../../config/api';
import {PUT} from '../../utils/apiCalls';
import {updateCompany} from '../../redux/slice/userSlice';

const VatSettingsScreen = () => {
  const Auth = useSelector((state: any) => state?.Auth?.user);
  const dispatch = useDispatch();
  const isAdmin = Auth?.staff?.staffAccess?.includes('administrator');

  const [vat, setVat] = useState<string>(
    Auth?.companyInfo?.tax ? String(Auth?.companyInfo?.tax) : '',
  );
  const [vatNumber, setVatNumber] = useState<string>(
    Auth?.companyInfo?.taxregno ? String(Auth?.companyInfo?.taxregno) : '',
  );
  const [saving, setSaving] = useState<boolean>(false);

  const onSave = async () => {
    const rate = Number(vat);
    if (vat?.trim() === '' || isNaN(rate) || rate < 0 || rate > 100) {
      ToastAndroid.show('Enter a valid VAT % (0 to 100)', ToastAndroid.SHORT);
      return;
    }
    try {
      setSaving(true);
      const url = `${API.UPDATE_COMPANY}${Auth?.companyInfo?.id}`;
      const payload = {tax: String(rate), taxregno: vatNumber?.trim()};
      await PUT(url, payload, null);
      // reflect the new values locally so billing/print use them immediately
      dispatch(updateCompany(payload));
      ToastAndroid.show('VAT settings updated successfully', ToastAndroid.LONG);
    } catch (err) {
      ToastAndroid.show(
        'Failed to update VAT. Please try again.',
        ToastAndroid.LONG,
      );
    } finally {
      setSaving(false);
    }
  };

  // Defensive gate — only an administrator can manage VAT
  if (!isAdmin) {
    return (
      <View
        style={[
          styles.Container,
          {alignItems: 'center', justifyContent: 'center', padding: 20},
        ]}>
        <Text style={styles.text1}>Access restricted</Text>
        <Text style={[styles.text2, {textAlign: 'center'}]}>
          Only an administrator can manage VAT / Tax settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.Container}>
      {isMobile() ? null : (
        <View style={styles.box1}>
          <Menus />
        </View>
      )}
      <View style={styles.box2}>
        <View style={styles.box3}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ScrollView}>
            <View style={styles.itemBox1}>
              <View style={{flex: 1}}>
                <Text style={styles.text1}>VAT / Tax rate (%)</Text>
                <Text style={styles.text2}>
                  Set the VAT percentage for the business. Prices already include
                  VAT, so the receipt will show the VAT portion within the total.
                  Enter 0 to disable VAT on receipts.
                </Text>
              </View>
              <View style={{width: 80}}>
                <InputItem
                  value={vat}
                  keyboardType="numeric"
                  onChange={(value: any) => setVat(value)}
                />
              </View>
            </View>

            <View style={styles.itemBox1}>
              <View style={{flex: 1}}>
                <Text style={styles.text1}>VAT / Tax number</Text>
                <Text style={styles.text2}>
                  Your business VAT registration number (e.g. GB123456789). It
                  will be printed on every receipt. Leave blank to hide it.
                </Text>
              </View>
              <View style={{width: 150}}>
                <InputItem
                  value={vatNumber}
                  onChange={(value: any) => setVatNumber(value)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: COLOR.primary,
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 16,
                opacity: saving ? 0.6 : 1,
              }}
              disabled={saving}
              onPress={onSave}>
              <Text style={{color: COLOR.white, fontSize: 15, fontWeight: '600'}}>
                {saving ? 'Saving...' : 'Save VAT setting'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default VatSettingsScreen;
