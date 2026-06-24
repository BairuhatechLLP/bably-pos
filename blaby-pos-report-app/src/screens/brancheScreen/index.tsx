import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, StatusBar, View} from 'react-native';
import moment from 'moment';

import styles from './styles';
import TabHeader from '../../navigation/tabHeader';
import LoadingBox from '../../components/skeleton/Loading';
import BranchItem from '../../components/branchItem';
import Filters from './components/filter';
import Empty from '../../components/alertBox/empty';
import AlertBox from '../../components/alertBox';

import API from '../../config/api';
import {GET} from '../../utils/apiCalls';
import useAutoRefresh from '../../utils/useAutoRefresh';

function BrancheScreen(props: any) {
  const format = `YYYY-MM-DD HH:mm:ss`;
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const [data, setData] = useState<any>({});

  const [error, setError] = useState<any>(null);

  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [query, setQuery] = useState<any>(null);
  const [date, setDate] = useState<any>({
    key: 'Today',
    from_date: moment().startOf('day').format(format),
    to_date: moment().endOf('day').format(format),
  });

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setIsLoading2(true);
    setPage(1);
    setTake(10);
    getData();
  }, [query, date]);

  const getData = async () => {
    try {
      setError(null);
      let filter1 = `?page=${page}`;
      let filter2 = `&limit=${take}`;
      let filter3 = query ? `&query=${query}` : '';
      let filter4 = date?.key
        ? `&from_date=${date?.from_date}&to_date=${date?.to_date}`
        : '';
      let url = `${API.BRANCHES_LIST}${filter1}${filter2}${filter3}${filter4}`;
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
      <TabHeader title={'Branches'} showLogo={false} showProfile={true} />
      {isLoading ? (
        <LoadingBox />
      ) : (
        <FlatList
          ListHeaderComponent={
            <Filters
            dataConunt={data?.length}
            loading={isLoading2}
              query={query}
              date={date}
              setQuery={(value: any) => setQuery(value)}
              setDate={(value: any) => setDate(value)}
            />
          }
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
          }
          ListEmptyComponent={<Empty />}
          data={data}
          renderItem={({item}) => <BranchItem item={item} />}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
      {error ? <AlertBox message={error} onChange={() => onRefresh()} /> : null}
    </View>
  );
}

export default BrancheScreen;
