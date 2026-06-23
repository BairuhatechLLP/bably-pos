import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ToastAndroid,
  View,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Text,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {BluetoothManager} from 'rn-bt-escpos-printer';

import styles from './styles';
import {isMobile} from '../../utils/responsive';
import PrintInvoice from '../../utils/printInvoice';

import OrderItem from './components/OrderItem';
import Filter from './components/filter';
import LoadingBox from '../../components/loadingBox';
import {EditOrder} from './helpers/editOrder';

import API from '../../config/api';
import {GET} from '../../utils/apiCalls';
import {
  Orders_FindAll,
  Orders_status,
  Orders_updatePaymentMethod,
} from '../../database/query/offlineOrders';
import { Tables_FindAll } from '../../database/query/tables';

const OrderScreen = () => {
  const navigation = useNavigation<any>();
  const Auth = useSelector((state: any) => state.Auth.user);
  const Bluetooth = useSelector((state: any) => state.Bluetooth);
  const Settings = useSelector((state: any) => state?.Settings);
  const toastLong = ToastAndroid.LONG;

  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTable, setSearchTable] = useState<any>({ id: 0, table_number: 'All Tables' });
  const [page, setPage] = useState(1);
  const [take] = useState(10);
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any>([]);
  const [meta, setMeta] = useState<any>({});
  const [tables, setTables] = useState<any>([]);

  useEffect(() => {
    checkBtConnection();
    getOfflineTables();
  }, []);

  useEffect(() => {
    setLoading2(true);
    setPage(1); // Reset page to 1 when filters change
    loadOrders(1);
    getOfflineTables();
    const unsubscribe = navigation.addListener('focus', () => {
      setPage(1);
      loadOrders(1);
      getOfflineTables();
    });
    return unsubscribe;
  }, [status, searchQuery, Settings?.netwrok, searchTable]);

  const getOfflineTables = async () => {
    try {
      const response:any = await Tables_FindAll('');
      if (response?.status) {
        const allTables = [{ id: 0, table_number: 'All Tables' }, ...response?.data];
        setTables(allTables);
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  const loadOrders = (page: number) => {
    if (Settings?.netwrok) {
      getOrdersOnline(page);
    } else {
      getOfflineOrders();
    }
  };

  const getOrdersOnline = async (pages: any) => {
    try {
      setIsLoadingMore(pages > 1);
      let companyid = `?companyId=${Auth?.staff?.companyid}`;
      let adminId = `&adminId=${Auth?.id}`;
      let takepage = `&order=DESC&page=${pages}&take=${take}`;
      let search = `&status=${status}&search=${searchQuery}&table_name=${Number(searchTable?.id) || 0}`;
      const staffId = Auth?.staff?.staffAccess?.includes('order')
        ? `&staffId=${Auth?.staff?.id}`
        : ``;
      const url = `${API.GET_ORDER_LIST}${companyid}${adminId}${staffId}${takepage}${search}`;
      const response: any = await GET(url, null);
      if (response?.status) {
        if (pages > 1) {
          setData((currentData: any) =>
            currentData.concat(response?.data?.data),
          );
        } else {
          setData(response?.data?.data);
        }
        setMeta(response?.data?.meta);
      } else {
        console.log('response', response);
      }
      resetAll();
    } catch (err) {
      console.log('err', err);
      resetAll();
    }
  };

  const getOfflineOrders = async () => {
    try {
      let obj = {
        search: searchQuery,
        status: status,
        table_id: Number(searchTable?.id) || 0,
      };
      const response: any = await Orders_FindAll(obj);
      if (response?.status) {
        // Filter by table if table_id is not 0 (All Tables)
        let filteredData = response?.data;
        if (obj.table_id !== 0) {
          filteredData = response?.data?.filter((order: any) => {
            return order?.table_details?.id === obj.table_id;
          });
        }
        setData(filteredData);
      }
      resetAll();
    } catch (err) {
      console.log('err', err);
      resetAll();
    }
  };

  const resetAll = () => {
    setLoading(false);
    setLoading2(false);
    setRefresh(false);
    setIsLoadingMore(false);
  };

  const handleEndReached = () => {
    if (!loading2 && !isLoadingMore && meta?.hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadOrders(nextPage);
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    setPage(1); // Reset to page 1 on refresh
    loadOrders(1);
    getOfflineTables();
  };

  const cancelOrder = async (order: any) => {
    try {
      setLoading3(order?.id);
      let orderId = `?orderId=${order?.id}`;
      let status = `&status=cancelled`;
      var response: any = {};
      if (Settings?.netwrok) {
        let url = `${API?.STATUS_ORDER}${orderId}${status}`;
        response = await GET(url, null);
      } else {
        response = await Orders_status({id: order?.id, status: 'cancelled'});
      }
      if (response?.status) {
        setLoading2(true);
        loadOrders(page);
      } else {
        ToastAndroid.show(response?.message, ToastAndroid.SHORT);
      }
      setLoading3(null);
    } catch (err) {
      console.log(err);
      setLoading3(null);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  const editOrders = async (order: any) => {
    try {
      setLoading3(order?.id);
      let data = await EditOrder(order);
      if (data) {
        setLoading3(null);
        navigation.navigate('EditOrder', {data: data});
      } else {
        ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      }
      setLoading3(null);
    } catch (err) {
      console.log('err', err);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      setLoading3(null);
    }
  };

  // REVERTED: Mark payment option handler — commented out, do not remove
  // const updatePaymentMethod = async (order: any, method: string | null) => {
  //   // Update UI immediately for responsive feel
  //   setData((currentData: any) =>
  //     currentData.map((item: any) =>
  //       item?.id === order?.id ? {...item, paymentMethod: method} : item,
  //     ),
  //   );
  //   // Sync to server/offline DB in background
  //   try {
  //     if (Settings?.netwrok) {
  //       let url = `${API?.UPDATE_PAYMENT_METHOD}?orderId=${order?.id}&paymentMethod=${method || ''}`;
  //       await GET(url, null);
  //     } else {
  //       await Orders_updatePaymentMethod({
  //         id: order?.id,
  //         paymentMethod: method,
  //       });
  //     }
  //   } catch (err) {
  //     console.log('payment method update err', err);
  //   }
  // };

  const checkBtConnection = () => {
    try {
      if (Platform.OS === 'android') {
        BluetoothManager.isBluetoothEnabled().then(
          (enabled: any) => {
            if (enabled && !Bluetooth?.connected?.address) {
              BluetoothManager.connect(Bluetooth?.connected?.address).then(
                (name: any) => {
                  ToastAndroid.show('Printer connected', toastLong);
                },
                (e: any) => {
                  console.log('error', e);
                },
              );
            }
          },
          (err: any) => {
            console.log('error', err);
          },
        );
      }
    } catch (err) {
      console.log('error', err);
    }
  };

  const printBill = async (item: any) => {
    try {
      if (Platform.OS === 'android') {
        BluetoothManager.isBluetoothEnabled().then(
          (enabled: any) => {
            if (enabled) {
              PrintInvoice(item, Auth);
            }
          },
          (err: any) => {
            ToastAndroid.show('Please enable bluetooth', toastLong);
          },
        );
      }
    } catch (err) {
      console.log('err', err);
      ToastAndroid.show('Please connect bluetooth', toastLong);
    }
  };

  return (
    <View style={styles?.Container}>
      <Filter
        loading2={loading2}
        total={data?.length}
        meta={meta}
        status={status}
        query={searchQuery}
        setStatus={(value: any) => setStatus(value)}
        setQuery={(value: any) => setSearchQuery(value)}
        setTable={(value: any) => setSearchTable(value)}
        table={searchTable?.table_number}
        tables={tables} 
      />
      {loading ? (
        <LoadingBox />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
          }
          data={data}
          renderItem={({item, index}) => (
            <OrderItem
              item={item}
              isAdmin={Auth?.staff?.staffAccess?.includes('administrator')}
              onLoading={loading3 === item?.id}
              onEdit={() => editOrders(item)}
              onBill={() => printBill(item)}
              onCancel={() => cancelOrder(item)}
              /* REVERTED: Mark payment option wiring — commented out, do not remove
              onPaymentChange={(method: string | null) =>
                updatePaymentMethod(item, method)
              }
              */
            />
          )}
          contentContainerStyle={styles.FlatList}
          numColumns={isMobile() ? 1 : 3}
          columnWrapperStyle={isMobile() ? null : {gap: 10}}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={6}
          initialNumToRender={6}
          keyExtractor={(item: any, index: number) => index?.toString()}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator style={{padding: 16}} color={'grey'} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default OrderScreen;
