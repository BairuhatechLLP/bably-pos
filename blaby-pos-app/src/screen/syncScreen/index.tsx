import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import styles from './styles';
import COLOR from '../../config/color';
import ProgressBar from './ProgressBar';

import {OpenDB} from '../../database/db';
import {CreateTables} from '../../database/tables';
import {ProductMaster_Insert} from '../../database/query/productMaster';
import {ProductCategory_Insert} from '../../database/query/productCategory';
import {Tables_Insert} from '../../database/query/tables';
import {Counters_Insert} from '../../database/query/counters';
import {
  Orders_FindAll,
  Orders_delete,
} from '../../database/query/offlineOrders';

import API from '../../config/api';
import {GET, POST} from '../../utils/apiCalls';
import {saveLastSynced} from '../../redux/slice/datasyncSlice';

const SyncScreen = () => {
  const dispatch = useDispatch();
  const Auth = useSelector((state: any) => state.Auth.user);
  const Datasync = useSelector((state: any) => state.Datasync);
  const Settings = useSelector((state: any) => state?.Settings);

  const [percentage, setPercentage] = useState(0);
  const [orderLength, setOrderLength] = useState(0);
  const [orderSynced, setOrderSynced] = useState(0);
  const [error, setError] = useState<any>(null);

  console.log(orderLength, orderSynced);

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      let checkDb = await OpenDB();
      if (checkDb) {
        let createTable = await CreateTables();
        const response: any = await Orders_FindAll({status: 'all'});
        setOrderLength(response?.data?.length);
        if (createTable) {
          if (Settings?.netwrok) {
            getProducts();
          }
          setPercentage(10);
        }
      } else {
        setError('Database not created.Something went wrong');
      }
    } catch (err) {
      setError('Database not created.Something went wrong');
      console.log('initDB = = = > err', err);
    }
  };

  const getProducts = async () => {
    try {
      const url = `${API.GET_PRODUCT_LIST}${Auth?.staff?.companyid}/all`;
      const response: any = await GET(url, null);
      if (response?.status) {
        await ProductMaster_Insert(response?.data);
        setPercentage(40);
        getCategory();
      }
    } catch (err) {
      console.log('getProducts = = = > err', err);
    }
  };

  const getCategory = async () => {
    try {
      const url = `${API.GET_CATEGOTY_LIST}${Auth?.id}/${Auth?.staff?.companyid}`;
      const response: any = await GET(url, null);
      if (response?.status) {
        await ProductCategory_Insert(response);
        setPercentage(50);
        getTables();
      }
    } catch (err) {
      console.log('getCategory = = = > err', err);
    }
  };

  const getTables = async () => {
    try {
      const url = `${API.GET_TABLE_LIST}${Auth?.staff?.companyid}`;
      const response: any = await GET(url, null);
      if (response?.status) {
        await Tables_Insert(response);
        setPercentage(70);
        getCounters();
      }
    } catch (err) {
      console.log('getTables = = = > err', err);
    }
  };

  const getCounters = async () => {
    try {
      let obj = {
        adminId: Auth?.id,
        companyid: Auth?.companyInfo?.id,
        query: '',
        page: 1,
        take: 100,
      };
      const url = `${API.GET_COUNTER_LIST}`;
      const response: any = await POST(url, obj);
      if (response?.status) {
        let data = response?.datas;
        await Counters_Insert(response);
        setPercentage(70);
        checkOrders();
      }
    } catch (err) {
      console.log('getCounters = = = > err', err);
    }
  };

  const checkOrders = async () => {
    try {
      const response: any = await Orders_FindAll({status: 'all'});
      if (response?.data?.length) {
        let count = 0;
        for (let item of response?.data) {
          const url = `${API.SYNC_ORDERS}`;
          const sync: any = await POST(url, item);
          if (sync?.status) {
            let deleteItem = await Orders_delete(item?.id);
          }
          count = count + 1;
          setOrderSynced(count);
        }
        setPercentage(100);
      } else {
        setPercentage(100);
      }
      dispatch(saveLastSynced(moment().format()));
    } catch (err) {
      console.log('error', err);
      setPercentage(100);
    }
  };

  return (
    <View style={styles.Container}>
      <View style={styles.card}>
        <View style={styles.box}>
          {percentage === 100 ? (
            <View>
              <Ionicons name="checkmark-circle-outline" style={styles.icon} />
            </View>
          ) : Settings?.netwrok ? (
            <ActivityIndicator size={'large'} color={COLOR.primary} />
          ) : (
            <Ionicons name="wifi-outline" color={'red'} size={50}/>
          )}
          <Text style={styles.text1}>
            {Settings?.netwrok
              ? ' Sync all data to cloud storage and download it to the system'
              : 'No network'}
          </Text>
          <Text style={styles.text2}>
            Data syncing allows you to browse and select products while offline.
          </Text>
        </View>
        <ProgressBar progress={percentage} />
        <View style={styles.box1}>
          <View style={styles.syncItem}>
            <Text style={styles.syncItemText}>Initializing</Text>
            {percentage >= 10 && (
              <Ionicons
                name="checkmark-circle-outline"
                color={COLOR.primary}
                size={20}
              />
            )}
          </View>

          <View style={styles.syncItem}>
            <Text style={styles.syncItemText}>Products</Text>
            {percentage >= 20 && (
              <Ionicons
                name="checkmark-circle-outline"
                color={COLOR.primary}
                size={20}
              />
            )}
          </View>
          <View style={styles.syncItem}>
            <Text style={styles.syncItemText}>Category</Text>
            {percentage >= 40 && (
              <Ionicons
                name="checkmark-circle-outline"
                color={COLOR.primary}
                size={20}
              />
            )}
          </View>
          <View style={styles.syncItem}>
            <Text style={styles.syncItemText}>Tables</Text>
            {percentage >= 50 && (
              <Ionicons
                name="checkmark-circle-outline"
                color={COLOR.primary}
                size={20}
              />
            )}
          </View>
          <View style={styles.syncItem}>
            <Text style={styles.syncItemText}>Counters</Text>
            {percentage >= 60 && (
              <Ionicons
                name="checkmark-circle-outline"
                color={COLOR.primary}
                size={20}
              />
            )}
          </View>
          <View style={styles.syncItem}>
            <Text style={styles.syncItemText}>
              Offline orders - {orderLength - orderSynced}
            </Text>
            {percentage >= 70 && (
              <Ionicons
                name="checkmark-circle-outline"
                color={COLOR.primary}
                size={20}
              />
            )}
          </View>
          <View
            style={[
              styles.syncItem,
              {borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0},
            ]}>
            <Text style={styles.syncItemText}>All done</Text>
            {percentage >= 90 && (
              <Ionicons
                name="checkmark-circle"
                color={COLOR.primary}
                size={20}
              />
            )}
          </View>
        </View>
        {percentage === 100 ? (
          <Text style={styles.text}>Data sync completed</Text>
        ) : (
          <Text style={styles.tex3}>Please wait don't close this screen</Text>
        )}
        {Datasync?.last_synced ? (
          <Text style={styles.tex4}>
            Last sync on {moment(Datasync?.last_synced).format('lll')}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default SyncScreen;
