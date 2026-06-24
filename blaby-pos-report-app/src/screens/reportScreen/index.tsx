import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, StatusBar, Text, View} from 'react-native';
import moment from 'moment';

import styles from './styles';
import TabHeader from '../../navigation/tabHeader';
import LoadingBox from '../../components/skeleton/Loading';
import Empty from '../../components/alertBox/empty';
import AlertBox from '../../components/alertBox';
import Filters from './components/filter';
import DateItem from './components/dateItem';

import API from '../../config/api';
import {GET} from '../../utils/apiCalls';
import useAutoRefresh from '../../utils/useAutoRefresh';

function ReportScreen(props: any) {
  const format = `YYYY-MM-DD HH:mm:ss`;
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const [data, setData] = useState<any>({});

  const [error, setError] = useState<any>(null);

  const [date, setDate] = useState<any>({
    key: 'All Time',
    from_date: moment('2020-01-01').startOf('day').format(format),
    to_date: moment().endOf('day').format(format),
  });

  const [branchId, setBranchId] = useState<any>(null);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setIsLoading2(true);
    getData();
  }, [date, branchId]);

  const getData = async () => {
    try {
      setError(null);
      let filter1 = date?.key
        ? `?from_date=${date?.from_date}&to_date=${date?.to_date}`
        : '';
      let filter2 = branchId?.id ? `&branchId=${branchId?.id}` : '';
      let url = `${API.REPORT_LIST}${filter1}${filter2}`;
      let response: any = await GET(url);

      if (response?.success) {
        setData(response?.data);
      } else {
        setError(response?.message);
      }
      setIsLoading(false);
      setRefresh(false);
      setIsLoading2(false);
    } catch (err) {
      setIsLoading(false);
      setRefresh(false);
      setIsLoading2(false);
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
    <View style={styles.brancheScreen}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
      <TabHeader title={'Reports'} showLogo={false} showProfile={true} />
      {isLoading ? (
        <LoadingBox />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View>
              <Filters
                dataConunt={data?.length}
                loading={isLoading2}
                date={date}
                branchId={branchId}
                setBranch={(value: any) => setBranchId(value)}
              />
              <View style={styles.header}>
                <Text style={styles.text1}>Month</Text>
                <Text style={styles.text2}>Orders</Text>
                <Text style={styles.text3}>Amount</Text>
              </View>
            </View>
          }
          ListEmptyComponent={<Empty />}
          data={data}
          renderItem={({item}) => <DateItem item={item} />}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
      {error ? <AlertBox message={error} onChange={() => onRefresh()} /> : null}
    </View>
  );
}

export default ReportScreen;
