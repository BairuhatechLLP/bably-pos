import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import moment from 'moment';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import LoadingBox from '../../components/skeleton/Loading';
import Empty from '../../components/alertBox/empty';
import {GET, POST} from '../../utils/apiCalls';
import API from '../../config/api';

const CANCELABLE = new Set(['pending', 'started', 'finished']);

function RecentOrdersScreen() {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const branch = route?.params?.branch;

  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!branch?.companyId) {
      setLoading(false);
      return;
    }
    try {
      const url = `${API.ORDER_LIST}?branchId=${branch.companyId}&days=3`;
      const res: any = await GET(url);
      if (res?.success) setOrders(res.data || []);
      else Alert.alert('Error', res?.message || 'Could not load orders');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not load orders');
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }, [branch?.companyId]);

  useEffect(() => {
    load();
  }, [load]);

  // Refetch every time the screen comes back into focus (e.g. after placing
  // or editing an order in CreateOrder and tapping Back).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefresh(true);
    load();
  };

  const editOrder = (order: any) => {
    navigation.navigate('CreateOrder', {branch, editOrder: order});
  };

  const confirmCancel = (order: any) => {
    const token = order?.tokenNo ?? '—';
    Alert.alert(
      'Cancel order',
      `Cancel order #${token}? This will mark the order and all its items as cancelled. It cannot be undone from the app.`,
      [
        {text: 'Keep order', style: 'cancel'},
        {
          text: 'Cancel order',
          style: 'destructive',
          onPress: () => doCancel(order),
        },
      ],
    );
  };

  const doCancel = async (order: any) => {
    try {
      setCancellingId(Number(order.id));
      const url = `${API.ORDER_CANCEL}${order.id}/cancel?branchId=${branch.companyId}`;
      const res: any = await POST(url, {});
      if (res?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            Number(o.id) === Number(order.id)
              ? {...o, orderStatus: 'cancelled'}
              : o,
          ),
        );
        Alert.alert('Cancelled', res?.message || 'Order cancelled');
      } else {
        Alert.alert('Error', res?.message || 'Could not cancel order');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <LoadingBox />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
      <View style={styles.headerBar}>
        <Ionicons name="business-outline" size={16} color={COLOR.PRIMARY} />
        <Text style={styles.branchText}>{branch?.bname}</Text>
        <Text style={styles.countText}>
          {orders.length} order{orders.length === 1 ? '' : 's'}
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={{paddingTop: 40}}>
            <Empty />
            <Text style={styles.emptyHint}>
              No orders in the last 3 days for this branch.
            </Text>
          </View>
        }
        renderItem={({item}) => {
          const items: any[] = item?.orderItems || [];
          const itemCount = items.length;
          const time = moment(item?.createdAt).format('DD MMM, HH:mm');
          const statusRaw = String(item?.orderStatus || 'pending').toLowerCase();
          const status = statusRaw.toUpperCase();
          const narration = item?.cooking_instructions || '';
          const isCancelled = statusRaw === 'cancelled';
          const canCancel = CANCELABLE.has(statusRaw);
          const cancelling = cancellingId === Number(item.id);

          // Item name preview — up to 3, then "+ N more"
          const preview = items.slice(0, 3).map((it: any) => {
            const name = it?.idescription || `Product #${it?.productId}`;
            const qty = Number(it?.quantity) || 1;
            return `${qty} × ${name}`;
          });
          const overflow = itemCount - preview.length;

          return (
            <View style={[styles.card, isCancelled && styles.cardCancelled]}>
              <TouchableOpacity
                activeOpacity={isCancelled ? 1 : 0.7}
                onPress={() => (isCancelled ? null : editOrder(item))}>
                <View style={styles.cardHeader}>
                  <View style={styles.tokenChip}>
                    <Text style={styles.tokenChipText}>
                      Token #{item?.tokenNo || '—'}
                    </Text>
                  </View>
                  <Text style={[styles.statusChip, statusStyle(status)]}>
                    {status}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardItems}>
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </Text>
                  <Text style={styles.cardTotal}>
                    ₹{Number(item?.total || 0).toFixed(2)}
                  </Text>
                </View>

                {/* Item preview */}
                {preview.length > 0 ? (
                  <View style={styles.itemList}>
                    {preview.map((line, i) => (
                      <Text key={i} style={styles.itemLine} numberOfLines={1}>
                        • {line}
                      </Text>
                    ))}
                    {overflow > 0 ? (
                      <Text style={styles.itemMore}>+ {overflow} more</Text>
                    ) : null}
                  </View>
                ) : null}

                {narration ? (
                  <Text style={styles.narration} numberOfLines={2}>
                    “{narration}”
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardTime}>{time}</Text>
                  {!isCancelled ? (
                    <Text style={styles.cardEdit}>
                      Tap to edit{' '}
                      <Ionicons
                        name="chevron-forward"
                        size={12}
                        color={COLOR.PRIMARY}
                      />
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>

              {canCancel ? (
                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    cancelling && {opacity: 0.5},
                  ]}
                  disabled={cancelling}
                  onPress={() => confirmCancel(item)}>
                  <Ionicons name="close-circle" size={14} color={'#D32F2F'} />
                  <Text style={styles.cancelBtnText}>
                    {cancelling ? 'Cancelling…' : 'Cancel order'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const statusStyle = (status: string) => {
  switch (status) {
    case 'BILLED':
      return {color: '#2E7D32'};
    case 'CANCELLED':
      return {color: '#C62828'};
    case 'FINISHED':
      return {color: '#1565C0'};
    default:
      return {color: COLOR.GREY1};
  }
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.GREY3,
    gap: 6,
  },
  branchText: {
    flex: 1,
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.GREY1,
    marginLeft: 4,
  },
  countText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY2,
  },
  listContent: {padding: 12, paddingBottom: 24, flexGrow: 1},
  card: {
    backgroundColor: COLOR.GREY4,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  cardCancelled: {
    opacity: 0.55,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tokenChip: {
    backgroundColor: COLOR.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tokenChipText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 12,
    color: '#fff',
  },
  statusChip: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 11,
    color: COLOR.GREY1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardItems: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY2,
  },
  cardTotal: {
    fontFamily: FONTS.BOLD,
    fontSize: 16,
    color: COLOR.PRIMARY,
  },
  itemList: {
    marginTop: 8,
    paddingLeft: 2,
  },
  itemLine: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 12,
    color: COLOR.GREY1,
    marginTop: 2,
  },
  itemMore: {
    fontFamily: FONTS.REGULAR,
    fontSize: 11,
    color: COLOR.GREY2,
    marginTop: 2,
    fontStyle: 'italic',
  },
  narration: {
    marginTop: 8,
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    color: COLOR.GREY1,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardTime: {
    fontFamily: FONTS.REGULAR,
    fontSize: 11,
    color: COLOR.GREY2,
  },
  cardEdit: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 12,
    color: COLOR.PRIMARY,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    gap: 5,
  },
  cancelBtnText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 12,
    color: '#D32F2F',
  },
  emptyHint: {
    fontFamily: FONTS.REGULAR,
    fontSize: 13,
    color: COLOR.GREY2,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default RecentOrdersScreen;
