import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
  Modal,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import Empty from '../../components/alertBox/empty';
import {KITCHEN_URLS, KITCHEN_CREDENTIALS} from '../../config/api';

type SheetState = {
  open: boolean;
  branchName?: string;
  url?: string;
  email?: string;
  password?: string;
};

function KitchenDisplaysScreen() {
  const branches: any[] = useSelector(
    (state: any) => state?.Dropdown?.branches || [],
  );

  const [sheet, setSheet] = useState<SheetState>({open: false});
  const [showPassword, setShowPassword] = useState(false);

  const onRowPress = (branch: any) => {
    const companyId = Number(branch?.companyId);
    const url = KITCHEN_URLS[companyId];
    if (!url) {
      Alert.alert(
        'Not configured',
        `Kitchen display URL is not set up yet for ${branch?.bname || 'this branch'}.`,
      );
      return;
    }

    const creds = KITCHEN_CREDENTIALS[companyId];
    setShowPassword(false);
    setSheet({
      open: true,
      branchName: branch?.bname,
      url,
      email: creds?.email,
      password: creds?.password,
    });
  };

  const closeSheet = () => setSheet({open: false});

  const openInBrowser = async () => {
    const url = sheet.url;
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (err: any) {
      Alert.alert(
        'Could not open kitchen display',
        err?.message || `No browser available to open ${url}`,
      );
    }
  };

  const renderItem = ({item}: any) => {
    const companyId = Number(item?.companyId);
    const url = KITCHEN_URLS[companyId];
    const configured = !!url;

    return (
      <TouchableOpacity
        style={[styles.row, !configured && styles.rowDisabled]}
        onPress={() => onRowPress(item)}>
        <View style={styles.icon}>
          <Ionicons
            name="restaurant"
            size={20}
            color={configured ? COLOR.PRIMARY : COLOR.GREY2}
          />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.branchName}>
            {item?.bname || 'Unnamed Branch'}
          </Text>
          <Text style={styles.urlText} numberOfLines={1}>
            {configured ? url : 'No kitchen display URL configured'}
          </Text>
        </View>
        {configured ? (
          <View style={styles.openBtn}>
            <Ionicons name="open-outline" size={16} color={'#fff'} />
            <Text style={styles.openBtnText}>Open</Text>
          </View>
        ) : (
          <Ionicons name="ellipsis-horizontal" size={18} color={COLOR.GREY2} />
        )}
      </TouchableOpacity>
    );
  };

  const hasCreds = !!(sheet.email && sheet.password);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
      <View style={styles.helpBox}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={COLOR.GREY2}
        />
        <Text style={styles.helpText}>
          Tap a branch to view credentials and open its kitchen display.
        </Text>
      </View>
      <FlatList
        data={branches}
        keyExtractor={(item) => String(item?.companyId ?? item?.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Empty />}
        contentContainerStyle={styles.listContent}
      />

      {/* Credentials sheet */}
      <Modal
        visible={sheet.open}
        animationType="slide"
        transparent
        onRequestClose={closeSheet}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <View style={{flex: 1}}>
                <Text style={styles.sheetTitle}>{sheet.branchName}</Text>
                <Text style={styles.sheetSub} numberOfLines={1}>
                  {sheet.url}
                </Text>
              </View>
              <TouchableOpacity onPress={closeSheet}>
                <Ionicons name="close" size={24} color={COLOR.GREY1} />
              </TouchableOpacity>
            </View>

            {hasCreds ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <View style={styles.fieldValueRow}>
                    <Text style={styles.fieldValue} selectable>
                      {sheet.email}
                    </Text>
                  </View>
                  <Text style={styles.hint}>Long-press to copy</Text>
                </View>

                <View style={styles.field}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <TouchableOpacity
                      onPress={() => setShowPassword((s) => !s)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={COLOR.PRIMARY}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.fieldValueRow}>
                    <Text style={styles.fieldValue} selectable>
                      {showPassword
                        ? sheet.password
                        : '•'.repeat((sheet.password || '').length || 8)}
                    </Text>
                  </View>
                  <Text style={styles.hint}>
                    Reveal then long-press to copy
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.noCredsBox}>
                <Ionicons
                  name="warning-outline"
                  size={18}
                  color={COLOR.WARNING || '#FFA500'}
                />
                <Text style={styles.noCredsText}>
                  No credentials configured for this branch. You'll log in
                  manually in the browser.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.openSheetBtn}
              onPress={openInBrowser}>
              <Ionicons name="open-outline" size={18} color={'#fff'} />
              <Text style={styles.openSheetBtnText}>Open kitchen display</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: COLOR.GREY4,
  },
  helpText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    flex: 1,
  },
  listContent: {padding: 12, paddingBottom: 24, flexGrow: 1},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.GREY4,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  rowDisabled: {opacity: 0.6},
  icon: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 22,
    marginRight: 12,
  },
  branchName: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 15,
    color: COLOR.GREY1,
  },
  urlText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    marginTop: 2,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  openBtnText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(72,72,72,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 18,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
    paddingBottom: 12,
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 17,
    color: COLOR.GREY1,
  },
  sheetSub: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    marginTop: 2,
  },
  field: {marginBottom: 14},
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: COLOR.GREY2,
    marginBottom: 6,
  },
  fieldValueRow: {
    backgroundColor: COLOR.GREY4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldValue: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 15,
    color: COLOR.GREY1,
  },
  hint: {
    fontFamily: FONTS.REGULAR,
    fontSize: 11,
    color: COLOR.GREY2,
    marginTop: 4,
  },
  noCredsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 14,
  },
  noCredsText: {
    flex: 1,
    fontFamily: FONTS.MEDIUM,
    fontSize: 12,
    color: '#856404',
  },
  openSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  openSheetBtnText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 15,
    color: '#fff',
  },
});

export default KitchenDisplaysScreen;
