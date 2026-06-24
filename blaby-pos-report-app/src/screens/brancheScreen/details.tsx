import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, StatusBar, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import styles from './styles';
import LoadingBox from '../../components/skeleton/Loading';
import AlertBox from '../../components/alertBox';
import Empty from '../../components/alertBox/empty';
import DateItem from './components/dateItem';
import Filters2 from './components/filter2';

import API from '../../config/api';
import {GET} from '../../utils/apiCalls';

function BranchDetails({route}: any) {
  const format = `YYYY-MM-DD HH:mm:ss`;
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const [details, setDetails] = useState<any>({});
  const [data, setData] = useState<any>({});

  const [error, setError] = useState<any>(null);

  const [date, setDate] = useState<any>({
    key: moment().format('MMMM'),
    from_date: moment().startOf('month').format(format),
    to_date: moment().endOf('month').format(format),
  });

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setIsLoading2(true);
    getData();
  }, [date]);

  const getData = async () => {
    try {
      setError(null);
      let filter1 = date?.key
        ? `?from_date=${date?.from_date}&to_date=${date?.to_date}`
        : '';
      let url = `${API.BRANCH_DETAILD}${route?.params?.id}${filter1}`;
      let response: any = await GET(url);

      if (response?.success) {
        setData(response?.data?.data);
        setDetails(response?.data?.branch);
      } else {
        setError(response.message);
      }
      setIsLoading(false);
      setIsLoading2(false);
      setRefresh(false);
    } catch (err) {
      setIsLoading(false);
      setIsLoading2(false);
      setRefresh(false);
      setError('Oops.Something went wrong');
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    getData();
  };

  return (
    <View style={styles.brancheScreen}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
      {isLoading ? (
        <LoadingBox />
      ) : (
        <FlatList
          ListHeaderComponent={
            <View>
              <View style={styles.Box1}>
                <View style={styles.Box2}>
                  <Ionicons name="storefront" color={'grey'} size={20} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.text4}>{details?.bname}</Text>
                  <Text style={styles.text5}>
                    {details?.fulladdress}, {details?.state}
                  </Text>
                  <Text style={styles.text5}>
                    Open {details?.workingTimeFrom} - {details?.workingTimeTo}
                  </Text>
                </View>
              </View>
              <Filters2
                loading={isLoading2}
                date={date}
                setDate={(value: any) => setDate(value)}
              />
              <View style={styles.header}>
                <Text style={styles.text1}>Date</Text>
                <Text style={styles.text2}>Orders</Text>
                <Text style={styles.text3}>Amount</Text>
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
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

export default BranchDetails;
