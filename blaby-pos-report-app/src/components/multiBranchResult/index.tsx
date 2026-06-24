import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

export type BranchOutcome = {
  branchId: number;
  branchName: string;
  success: boolean;
  message: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  summary?: string;
  branches: BranchOutcome[];
};

function MultiBranchResultModal({
  open,
  onClose,
  title,
  summary,
  branches,
}: Props) {
  const successCount = branches.filter((b) => b.success).length;
  const allSuccess = successCount === branches.length && branches.length > 0;
  const noneSuccess = successCount === 0;

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <StatusBar
        backgroundColor={'rgba(72,72,72,0.4)'}
        barStyle={'dark-content'}
      />
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.header}>
            <View style={{flex: 1}}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                {summary ||
                  `${successCount} of ${branches.length} branch${branches.length === 1 ? '' : 'es'} succeeded`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLOR.GREY1} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.statusBar,
              allSuccess && styles.statusBarAll,
              noneSuccess && styles.statusBarNone,
              !allSuccess && !noneSuccess && styles.statusBarPartial,
            ]}>
            <Ionicons
              name={
                allSuccess
                  ? 'checkmark-circle'
                  : noneSuccess
                    ? 'close-circle'
                    : 'alert-circle'
              }
              size={18}
              color={'#fff'}
            />
            <Text style={styles.statusBarText}>
              {allSuccess
                ? 'All branches updated'
                : noneSuccess
                  ? 'No branch was updated'
                  : `Updated in ${successCount} of ${branches.length} branches`}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{paddingBottom: 8}}>
            {branches.map((b) => (
              <View key={`${b.branchId}-${b.branchName}`} style={styles.row}>
                <Ionicons
                  name={b.success ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={b.success ? '#2E7D32' : '#C62828'}
                />
                <View style={{flex: 1}}>
                  <Text style={styles.branchName}>{b.branchName}</Text>
                  <Text
                    style={[
                      styles.message,
                      {color: b.success ? COLOR.GREY2 : '#C62828'},
                    ]}>
                    {b.message}
                  </Text>
                </View>
              </View>
            ))}
            {branches.length === 0 ? (
              <Text style={styles.empty}>No branch results to show.</Text>
            ) : null}
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(72,72,72,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
    paddingBottom: 12,
    marginBottom: 12,
  },
  title: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 17,
    color: COLOR.GREY1,
  },
  subtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
    marginTop: 2,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusBarAll: {backgroundColor: '#2E7D32'},
  statusBarPartial: {backgroundColor: '#F9A825'},
  statusBarNone: {backgroundColor: '#C62828'},
  statusBarText: {
    flex: 1,
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 13,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
  },
  branchName: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.GREY1,
  },
  message: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    fontFamily: FONTS.REGULAR,
    color: COLOR.GREY2,
    textAlign: 'center',
    paddingVertical: 20,
  },
  doneBtn: {
    marginTop: 14,
    backgroundColor: COLOR.PRIMARY,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 15,
    color: '#fff',
  },
});

export default MultiBranchResultModal;
