import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BluetoothManager} from 'rn-bt-escpos-printer';

import styles from './styles';
import {useSelector} from 'react-redux';
import {isMobile} from '../../utils/responsive';

import {ProductCategory_FindAll} from '../../database/query/productCategory';
import {ProductMaster_FindAll} from '../../database/query/productMaster';
import {Tables_FindAll} from '../../database/query/tables';

import ProductItem from './components/productItem';

import Header from './components/header';
import Categories from './components/categories';
import SummaryCard from './components/summaryCard';

import {CalculateSum} from './helpers/calculate';
import {CartManage} from './helpers/cartManage';
import PrintInvoice from './helpers/printBill';

import API from '../../config/api';
import {POST, PUT} from '../../utils/apiCalls';
import EditHeaderRight from './components/EditHeaderRight';

import {Orders_Insert, Orders_update} from '../../database/query/offlineOrders';

const BillingScreen = ({route}: any) => {
  const toastLong = ToastAndroid.SHORT;
  const navigation = useNavigation<any>();
  const Auth = useSelector((state: any) => state?.Auth?.user);
  const Settings = useSelector((state: any) => state?.Settings);
  const QuickProducts = useSelector(
    (state: any) => state?.Datasync?.quickAccess,
  );
  const params = route?.params?.data;

  const [categories, setCategories] = useState<any>([]);
  const [products, setProducts] = useState<any>([]);
  const [tables, setTables] = useState<any>([]);

  const [isLoading, setIsLoading] = useState<any>(false);
  const [refresh, setRefresh] = useState(false);
  const [summaryModal, setSummaryModal] = useState<any>(false);
  const [error, setError] = useState<any>(null); //token, table, items

  const [category, setCategory] = useState<any>({id: 0});
  const [search, setSearch] = useState<any>(null);

  const [orderItems, setOrderItems] = useState<any>(params?.orderItems || []);
  const [table, setTable] = useState<any>(params?.table_details || {});
  const [ac_room, setAc] = useState<any>(params?.ac_room || false);
  const [notes, setNotes] = useState<any>(params?.cooking_instructions || null);
  const [token, setToken] = useState<any>(params?.tokenNo || null);
  const [paymentMethod, setPaymentMethod] = useState<any>(params?.paymentMethod || null);

  useEffect(() => {
    loadData();
    if (params?.id) {
      navigation.setOptions({
        headerRight: () => <EditHeaderRight data={params} />,
      });
    }
    const unsubscribe = navigation.addListener('focus', () => {
      if (category?.id === -1 && !Settings?.quickArea) {
        setCategory({id: 0});
      }
      if (!params?.id) {
        setPaymentMethod(null);
      }
      loadData();
    });
    return unsubscribe;
  }, [category, search, Settings?.quickArea]);

  const loadData = () => {
    loadCategory();
  };

  const loadCategory = async () => {
    try {
      const ProductCategory: any = await ProductCategory_FindAll(null);
      setCategories(ProductCategory?.data);
      loadTables();
    } catch (err: any) {
      console.log('loadProducts err', err);
    }
  };

  const loadTables = async () => {
    try {
      const Tableses: any = await Tables_FindAll(null);
      setTables(Tableses?.data);
      loadProducts();
    } catch (err: any) {
      console.log('loadProducts err', err);
    }
  };

  const loadProducts = async () => {
    try {
      let obj = {
        id: Auth?.id,
        type: 'Stock',
        name: search,
        category: category?.id,
        companyid: Auth?.staff?.companyid,
      };
      if (category?.id === -1) {
        setProducts(QuickProducts);
      } else {
        const ProductMaster: any = await ProductMaster_FindAll(obj);
        setProducts(ProductMaster?.data);
      }
      setRefresh(false);
    } catch (err: any) {
      setRefresh(false);
      console.log('loadProducts err', err);
    }
  };

  const updateCart = async (item: any, action: string) => {
    try {
      setOrderItems((prevProducts: any[]) => {
        return CartManage(item, prevProducts, action);
      });
    } catch (err) {
      console.log('updateCart error:', err);
    }
  };

  const updateTable = async (item: any) => {
    try {
      if (item?.id === table?.id) {
        setTable({});
      } else {
        setTable(item);
      }
    } catch (err) {
      console.log('updateCart error:', err);
    }
  };

  const resetScreen = () => {
    setCategory({id: 0});
    setSearch(null);
    setOrderItems([]);
    setTable({});
    setAc(false);
    setNotes(null);
    setToken(null);
    setPaymentMethod(null);
    setSummaryModal(false);
    setIsLoading(false);
    setError({});
    if (params?.id) {
      navigation.goBack();
    }
  };

  const memoizedData = useMemo(() => products, [products]);
  const memoizedOrderItems = useMemo(() => orderItems, [orderItems]);

  const RenderItem = useCallback(
    ({item, index}: any) => {
      const cartItem = memoizedOrderItems.filter(
        (check: any) => check.id === item.id,
      );
      const sumQuantity = cartItem?.reduce(
        (sum: any, check: any) => sum + (check.quantity || 0),
        0,
      );
      return (
        <ProductItem
          item={item}
          index={index}
          cart={{quantity: sumQuantity}}
          CartItem={cartItem}
          showImage={Settings?.showImage}
          add={(obj: any) => updateCart(obj, 'add')}
          remove={(obj: any) => updateCart(obj, 'remove')}
        />
      );
    },
    [updateCart, memoizedOrderItems, Settings?.showImage],
  );

  const checkBluetooth = async () => {
    try {
      if (Platform.OS === 'android') {
        return BluetoothManager.isBluetoothEnabled().then(
          (enabled: any) => {
            if (enabled) {
              return true;
            } else {
              return false;
            }
          },
          (err: any) => {
            ToastAndroid.show('Please connect printer', toastLong);
            return false;
          },
        );
      }
    } catch (err) {
      console.log('err', err);
      ToastAndroid.show('Please connect printer', toastLong);
      return false;
    }
  };

  const placeOrder = async () => {
    try {
      if (!token && !Settings?.tokenGenerate) {
        setError({token: 'Token is required'});
        ToastAndroid.show('Please enter token', toastLong);
      } else {
        setError({});
        setIsLoading(true);
        let obj: any = {
          id: params?.id,
          userId: Auth?.id,
          companyId: Auth?.companyInfo?.id,
          staffId: Auth?.staff?.id,
          shift_id: null,
          utcOffset: new Date().getTimezoneOffset(),
          billing_status: false,
          orderItems: orderItems,
          total: CalculateSum(orderItems, ac_room)?.total,
          ac_room: ac_room,
          table_details: Settings?.netwrok ? Number(table?.id || 0) : table,
          cooking_instructions: notes,
          tokenNo: token,
          paymentMethod: paymentMethod,
        };
        const bluetooth: any = await checkBluetooth();
        var response: any = {};
        if (Settings?.netwrok) {
          let url = params?.id ? API.UPDATE_ORDER : API.CREATE_ORDER;
          response = params?.id
            ? await PUT(url, obj, {})
            : await POST(url, obj);
        } else {
          response = params?.id
            ? await Orders_update(obj)
            : await Orders_Insert(obj);
        }
        if (response?.status) {
          if (bluetooth) {
            obj['tokenNo'] = response?.data?.tokenNo;
            const printCount = Number(Settings?.printCount) || 0;
            for (let i = 0; i < printCount; i++) {
              await PrintInvoice(obj, table, Auth);
            }
          }
          resetScreen();
          ToastAndroid.show(
            params?.id
              ? 'Order updated successfully'
              : 'Order placed successfully',
            toastLong,
          );
        } else {
          ToastAndroid.show(
            response?.message || 'Something went wrong',
            toastLong,
          );
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      console.log('err', err);
      setIsLoading(false);
      ToastAndroid.show('Something went wrong', toastLong);
    }
  };

  return (
    <View style={styles.Container}>
      <View style={styles.Box}>
        <View style={styles.Box1}>
          <Header
            edit={params}
            search={search}
            setSearch={(value: any) => setSearch(value)}
            reset={() => resetScreen()}
          />
          <View style={styles.Box3}>
            <FlatList
              refreshControl={
                <RefreshControl
                  refreshing={refresh}
                  onRefresh={() => loadData()}
                />
              }
              ListHeaderComponent={
                <View>
                  <Categories
                    quickArea={Settings?.quickArea}
                    categories={categories}
                    active={category}
                    setCategory={(value: any) => setCategory(value)}
                  />
                </View>
              }
              data={memoizedData}
              contentContainerStyle={{flexGrow: 1, gap: 8, paddingBottom: 80}}
              columnWrapperStyle={{gap: 8}}
              numColumns={isMobile() ? 2 : 5}
              initialNumToRender={12}
              maxToRenderPerBatch={20}
              windowSize={5}
              removeClippedSubviews={true}
              overScrollMode="never"
              updateCellsBatchingPeriod={20}
              scrollEventThrottle={20}
              renderItem={({item, index}) => RenderItem({item, index})}
              keyExtractor={(item: any, index: number) => index?.toString()}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  {Settings?.quickArea ? (
                    <TouchableOpacity
                      style={styles.quickAreaButton}
                      onPress={() => navigation.navigate('QuickProducts')}>
                      <Text style={styles.text1}>+ Setup Quick products</Text>
                    </TouchableOpacity>
                  ) : null}

                  <Text style={styles.emptyText}>
                    No prodcuts found . Please sync data
                  </Text>
                </View>
              }
            />
          </View>
        </View>
        <SummaryCard
          edit={params}
          loading={isLoading}
          error={error}
          orderItems={memoizedOrderItems}
          tableData={tables}
          table={table}
          ac={ac_room}
          notes={notes}
          token={token}
          /* REVERTED: Mark payment option wiring — commented out, do not remove
          paymentMethod={paymentMethod}
          isAdmin={Auth?.staff?.staffAccess?.includes('administrator')}
          */
          settings={Settings}
          summaryModal={summaryModal}
          onChangeTabel={(value: any) => updateTable(value)}
          onChangeAc={(value: any) => setAc(value)}
          onChangeNotes={(value: any) => setNotes(value)}
          onChangeToken={(value: any) => setToken(value)}
          /* REVERTED: Mark payment option wiring — commented out, do not remove
          onChangePaymentMethod={(value: any) => setPaymentMethod(value)}
          */
          updateCart={(value: any, action: any) => updateCart(value, action)}
          OnchangeSummaryModal={(value: boolean) => setSummaryModal(value)}
          placeOrder={() => placeOrder()}
        />
      </View>
    </View>
  );
};

export default BillingScreen;
