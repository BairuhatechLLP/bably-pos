import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, StatusBar, View, Text, ActivityIndicator} from 'react-native';
import moment from 'moment';
import {useSelector} from 'react-redux';

import styles from './styles';
import TabHeader from '../../navigation/tabHeader';
import LoadingBox from '../../components/skeleton/Loading';
import StaffItem from '../../components/staffItem';
import Filters from './components/filter';
import Empty from '../../components/alertBox/empty';
import AlertBox from '../../components/alertBox';

import API from '../../config/api';
import {GET} from '../../utils/apiCalls';
import COLOR from '../../config/color';

function StaffPerformanceScreen(props: any) {
  const format = `YYYY-MM-DD HH:mm:ss`;
  const branches = useSelector((state: any) => state?.Dropdown?.branches);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [data, setData] = useState<any>([]);
  const [error, setError] = useState<any>(null);

  const [branch, setBranch] = useState<any>(null);
  const [date, setDate] = useState<any>({
    key: 'Today',
    filter: 'day',
    from_date: moment().startOf('day').format(format),
    to_date: moment().endOf('day').format(format),
  });

  // Set initial branch when branches are loaded from Redux
  useEffect(() => {
    if (branches && branches.length > 0 && !branch) {
      setBranch(branches[0]);
    } else if (branches && branches.length === 0) {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  }, [branches]);

  // Fetch performance data when branch or date changes
  useEffect(() => {
    if (branch?.companyId) {
      if (!initialLoadComplete) {
        // Initial load - keep main loading spinner
        setIsLoading(true);
        getData();
      } else {
        // Filter changes - use secondary loading indicator
        setIsLoading2(true);
        getData();
      }
    } else {
      // If no branch is available, stop loading
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  }, [branch?.companyId, date]);

  // Get staff performance data
  const getData = async () => {
    try {
      setError(null);

      // Validate we have a branch
      if (!branch?.companyId) {
        setIsLoading(false);
        setIsLoading2(false);
        return;
      }

      // Step 1: Get staff list for the branch
      const staffListUrl = `${API.STAFF_LIST}?companyId=${branch.companyId}`;

      const staffListResponse: any = await GET(staffListUrl);

      if (!staffListResponse?.success || !staffListResponse?.data || staffListResponse.data.length === 0) {
        setData([]);
        setIsLoading(false);
        setRefresh(false);
        setIsLoading2(false);
        setInitialLoadComplete(true);
        return;
      }

      const staffList = staffListResponse.data;

      // Step 2: Fetch performance data for all staff members
      const allStaffData = [];

      for (const staffMember of staffList) {
        try {
          let params = new URLSearchParams();
          params.append('companyId', branch.companyId.toString());
          params.append('staffId', staffMember.staffId.toString());
          params.append('filter', date?.filter || 'day');

          // Only add startDate/endDate if filter is 'custom'
          if (date?.filter === 'custom' && date?.from_date && date?.to_date) {
            params.append('startDate', moment(date.from_date).format('YYYY-MM-DD'));
            params.append('endDate', moment(date.to_date).format('YYYY-MM-DD'));
          }

          const url = `${API.STAFF_PERFORMANCE}?${params.toString()}`;
          const response: any = await GET(url);

          if (response?.success && response?.data) {
            // Only include staff who have at least 1 order
            const totalOrders = response?.data?.summary?.totalOrders || 0;
            if (totalOrders > 0) {
              allStaffData.push(response.data);
            }
          }
        } catch (err) {
          // Silent fail for individual staff errors
        }
      }

      setData(allStaffData);
      setIsLoading(false);
      setRefresh(false);
      setIsLoading2(false);
      setInitialLoadComplete(true);
    } catch (err) {
      setIsLoading(false);
      setRefresh(false);
      setIsLoading2(false);
      setInitialLoadComplete(true);
      setError('Oops. Something went wrong');
      setData([]);
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    getData();
  };

  // Catch-all error boundary for the render
  try {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
        <TabHeader title={'Staff Performance'} showLogo={false} showProfile={true} />

        {isLoading ? (
          <LoadingBox />
        ) : (
          <FlatList
            refreshControl={
              <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              <Filters
                dataCount={data?.length}
                loading={isLoading2}
                branch={branch}
                date={date}
                setBranch={(value: any) => setBranch(value)}
                setDate={(value: any) => setDate(value)}
              />
            }
            ListEmptyComponent={
              isLoading2 ? (
                <View style={{padding: 50, alignItems: 'center'}}>
                  <Text style={{color: '#a2a2a2', marginBottom: 10}}>Loading staff data...</Text>
                </View>
              ) : (
                <Empty />
              )
            }
            data={data}
            renderItem={({item}) => <StaffItem item={item} />}
            keyExtractor={(item, index) => index.toString()}
          />
        )}

        {error ? <AlertBox message={error} onChange={() => onRefresh()} /> : null}

        {/* Loading overlay when filters change */}
        {isLoading2 && !isLoading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}>
            <View style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 12,
              alignItems: 'center',
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}>
              <ActivityIndicator size="large" color={COLOR.PRIMARY} />
              <Text style={{
                marginTop: 10,
                fontSize: 14,
                color: COLOR.GREY1,
                fontWeight: '500',
              }}>
                Loading staff data...
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  } catch (err) {
    console.error('🏪 [STAFF SCREEN] Render error:', err);
    return (
      <View style={styles.container}>
        <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
        <TabHeader title={'Staff Performance'} showLogo={false} showProfile={true} />
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <Text style={{fontSize: 16, color: '#E04F5F', textAlign: 'center'}}>
            Error loading screen. Check console logs.
          </Text>
          <Text style={{fontSize: 12, color: '#a2a2a2', marginTop: 10, textAlign: 'center'}}>
            {String(err)}
          </Text>
        </View>
      </View>
    );
  }
}

export default StaffPerformanceScreen;
