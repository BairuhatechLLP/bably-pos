import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, RefreshControl, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import styles from './styles';
import {isMobile} from '../../utils/responsive';

import Menus from '../settingScreen/components/menus';
import ListItem from './listItem';
import {ProductMaster_FindAll} from '../../database/query/productMaster';
import InputItem from '../../components/inputBox';

import {
  addquickAccess,
  removequickAccess,
} from '../../redux/slice/datasyncSlice';

const QuickProducts = () => {
  const Auth = useSelector((state: any) => state?.Auth?.user);
  const QuickAccess = useSelector((state: any) => state?.Datasync?.quickAccess);
  const dispatch = useDispatch();
  const [products, setProducts] = useState<any>([]);

  const [isLoading, setIsLoading] = useState<any>(true);
  const [refresh, setRefresh] = useState(false);

  const [category, setCategory] = useState<any>({id: 0});
  const [search, setSearch] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, [search]);

  const loadProducts = async () => {
    try {
      let obj = {
        id: Auth?.id,
        type: 'Stock',
        name: search,
        category: category?.id,
        companyid: Auth?.staff?.companyid,
      };
      const ProductMaster: any = await ProductMaster_FindAll(obj);
      setProducts(ProductMaster?.data);
      setRefresh(false);
      setIsLoading(false);
    } catch (err: any) {
      setRefresh(false);
      setIsLoading(false);
      console.log('loadProducts err', err);
    }
  };

  const memoizedData = useMemo(() => products, [products]);

  const addToQuick = (item: any) => {
    try {
      dispatch(addquickAccess(item));
    } catch (err) {
      console.log('addToQuick err', err);
    }
  };

  const removeToQuick = (item: any) => {
    try {
      dispatch(removequickAccess(item));
    } catch (err) {
      console.log('removeToQuick err', err);
    }
  };

  const checkQuick = (product: any) => {
    try {
      let arr = QuickAccess;
      if(arr.length){
        const exists = arr.some(
          (item: any) => item.id === product.id,
        );
        return exists;
      }else{
        return false;
      }
      
    } catch (err) {
      return false;
    }
  };

  return (
    <View style={styles.Container}>
      {isMobile() ? null : (
        <View style={styles.box1}>
          <Menus />
        </View>
      )}
      <View style={styles.box2}>
        <View style={styles.box3}>
          <View style={styles.box4}>
            <FlatList
              ListHeaderComponent={
                <View style={{marginBottom: 20}}>
                  <InputItem
                    placeholder={'Search products'}
                    value={search}
                    onChange={(value: any) => setSearch(value)}
                  />
                </View>
              }
              refreshControl={
                <RefreshControl
                  refreshing={refresh}
                  onRefresh={() => loadProducts()}
                />
              }
              data={memoizedData}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{flexGrow: 1, paddingBottom: 40}}
              initialNumToRender={12}
              maxToRenderPerBatch={20}
              windowSize={5}
              removeClippedSubviews={true}
              overScrollMode="never"
              updateCellsBatchingPeriod={20}
              scrollEventThrottle={20}
              renderItem={({item, index}) => (
                <ListItem
                  item={item}
                  index={index}
                  active={checkQuick(item)}
                  add={() => addToQuick(item)}
                  remove={() => removeToQuick(item)}
                />
              )}
              keyExtractor={(item: any, index: number) => index?.toString()}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    No prodcuts found . Please sync data
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default QuickProducts;
