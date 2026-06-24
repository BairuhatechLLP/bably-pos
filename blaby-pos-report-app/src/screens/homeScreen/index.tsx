import React, {useEffect, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import moment from 'moment';

import styles from './styles';
import COLORS from '../../config/color';
import TabHeader from '../../navigation/tabHeader';
import LoadingBox from '../../components/skeleton/Loading';
import Chart from './components/charts';
import TopItem from '../../components/topItem';
import AlertBox from '../../components/alertBox';

import API from '../../config/api';
import {GET} from '../../utils/apiCalls';
import useAutoRefresh from '../../utils/useAutoRefresh';

function HomeScreen(props: any) {
  const navigation: any = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [data, setData] = useState<any>({});

  const [error, setError] = useState<any>(null);

  // Get branches from Redux to ensure app is fully initialized
  const branches = useSelector((state: any) => state?.Dropdown?.branches);

  // Wait for branches to be loaded before fetching data on initial load
  useEffect(() => {
    // Only fetch on initial load if branches are available or if we've already tried
    if (!initialLoadComplete && branches !== undefined) {
      if (branches.length === 0) {
        setInitialLoadComplete(true);
        setIsLoading(false);
        setError('No branches available. Please check your connection.');
      } else {
        setInitialLoadComplete(true);
        getData();
      }
    }
  }, [branches, initialLoadComplete]);

  const getData = async () => {
    try {
      setError(null);
      let response: any = await GET(API.HOME_DATA);

      if (response?.success) {
        setData(response?.data);
      } else {
        setError(response?.message);
      }
      setIsLoading(false);
      setRefresh(false);
    } catch (err) {
      setIsLoading(false);
      setError('Oops.Something went wrong');
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    getData();
  };

  // Auto-refresh every 30 seconds while screen is focused
  useAutoRefresh(getData, 30000);

  return (
    <ScrollView
      contentContainerStyle={styles.homeScreen}
      refreshControl={
        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
      }>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
      <TabHeader title={'Home'} showLogo={true} showProfile={true} />
      {isLoading ? (
        <LoadingBox />
      ) : (
        <>
          {/* Today's sales — clean green card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Today's sales</Text>
            <Text style={styles.heroAmount}>
              ₹{Number(data?.today_amount || 0).toFixed(2)}
            </Text>
            <View style={styles.heroMetaRow}>
              <Text style={styles.heroOrders}>
                {data?.today_order || 0} order
                {Number(data?.today_order || 0) === 1 ? '' : 's'}
              </Text>
              {(() => {
                const today = Number(data?.today_amount || 0);
                const yesterday = Number(data?.yesterday_amount || 0);
                if (!yesterday) return null;
                const delta = ((today - yesterday) / yesterday) * 100;
                const positive = delta >= 0;
                return (
                  <View style={styles.heroDeltaPill}>
                    <Ionicons
                      name={positive ? 'arrow-up' : 'arrow-down'}
                      size={11}
                      color="#fff"
                    />
                    <Text style={styles.heroDeltaText}>
                      {`${Math.abs(delta).toFixed(1)}% vs yesterday`}
                    </Text>
                  </View>
                );
              })()}
            </View>
          </View>

          {/* Quick links — compact 2×2 row */}
          <View style={styles.quickLinksGrid}>
            <TouchableOpacity
              style={[styles.quickTile, {borderColor: '#FFE0B2'}]}
              onPress={() => navigation.navigate('KitchenDisplays')}>
              <View style={[styles.quickTileIcon, {backgroundColor: '#FFF3E0'}]}>
                <Ionicons name="restaurant" size={14} color="#F57C00" />
              </View>
              <Text style={styles.quickTileLabel} numberOfLines={1}>
                Kitchen
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickTile, {borderColor: '#C8E6C9'}]}
              onPress={() => navigation.navigate('ProductList')}>
              <View style={[styles.quickTileIcon, {backgroundColor: COLORS.LIGHT}]}>
                <Ionicons name="cube" size={14} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.quickTileLabel} numberOfLines={1}>
                Products
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickTile, {borderColor: '#BBDEFB'}]}
              onPress={() => navigation.navigate('StaffPerformance')}>
              <View style={[styles.quickTileIcon, {backgroundColor: '#E3F2FD'}]}>
                <Ionicons name="people" size={14} color="#1976D2" />
              </View>
              <Text style={styles.quickTileLabel} numberOfLines={1}>
                Staff
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickTile, {borderColor: '#E1BEE7'}]}
              onPress={() => navigation.navigate('CategoryManagement')}>
              <View style={[styles.quickTileIcon, {backgroundColor: '#F3E5F5'}]}>
                <Ionicons name="pricetag" size={14} color="#7B1FA2" />
              </View>
              <Text style={styles.quickTileLabel} numberOfLines={1}>
                Categories
              </Text>
            </TouchableOpacity>
          </View>
          {data?.chart?.length ? <Chart data={data?.chart} /> : null}
          {data?.payment_summary?.filter(
            (item: any) => item.method !== 'Unmarked',
          ).length ? (
            <View style={styles.paymentSection}>
              <Text style={styles.text3}>Collections</Text>
              <View style={styles.paymentRow}>
                {data.payment_summary
                  .filter((item: any) => item.method !== 'Unmarked')
                  .map((item: any, index: number) => (
                    <View key={index} style={styles.paymentCard}>
                      <View style={styles.paymentIconBox}>
                        <Ionicons
                          name={
                            item.method === 'Cash'
                              ? 'cash-outline'
                              : 'phone-portrait-outline'
                          }
                          size={16}
                          color={COLORS.PRIMARY}
                        />
                      </View>
                      <Text style={styles.paymentMethod}>{item.method}</Text>
                      <Text style={styles.paymentAmount}>
                        {Number(item.amount || 0).toFixed(2)}
                      </Text>
                      <Text style={styles.paymentCount}>
                        {item.count} orders
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          ) : null}
          <View style={styles.Box3}>
            {data?.today_branch?.CompanyMaster ? (
              <>
                <View style={styles.Box4}>
                  <Text style={styles.text3}>Today's top branch</Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('BranchDetails', {
                        id: data?.today_branch?.companyId,
                      })
                    }>
                    <Ionicons
                      name="arrow-forward-outline"
                      size={18}
                      color={COLORS.GREY2}
                    />
                  </TouchableOpacity>
                </View>
                <TopItem
                  type={'branch'}
                  id={data?.today_branch?.companyId}
                  name={data?.today_branch?.CompanyMaster?.bname}
                  amount={Number(data?.today_branch?.totalSales).toFixed(2)}
                  order={`${data?.today_branch?.totalOrders} orders`}
                  date={moment().format('lll')}
                />
              </>
            ) : null}

            {data?.today_product?.ProductMaster ? (
              <>
                <View style={[styles.Box4, {marginTop: 15}]}>
                  <Text style={styles.text3}>Today's top product</Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('ProductDetails', {
                        id: data?.today_product?.productId,
                      })
                    }>
                    <Ionicons
                      name="arrow-forward-outline"
                      size={18}
                      color={COLORS.GREY2}
                    />
                  </TouchableOpacity>
                </View>
                <TopItem
                  type={'product'}
                  id={data?.today_product?.productId}
                  name={data?.today_product?.ProductMaster?.idescription}
                  amount={Number(
                    Number(data?.today_product?.totalAmount)
                  ).toFixed(2)}
                  order={`${data?.today_product?.totalSold} units sold`}
                  date={moment().format('lll')}
                />
              </>
            ) : null}
          </View>
        </>
      )}
      {error ? (
        <View style={styles.Box6}>
          <AlertBox message={error} onChange={() => onRefresh()} />
        </View>
      ) : null}
    </ScrollView>
  );
}

export default HomeScreen;
