import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, StatusBar, View, TouchableOpacity, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Linking} from 'react-native';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import styles from './styles';
import TabHeader from '../../navigation/tabHeader';
import LoadingBox from '../../components/skeleton/Loading';
import ProductItem from '../../components/productitem';
import Filters from './components/filter';
import CategorySection from './components/categorySection';
import CategorySummary from './components/categorySummary';
import CategorySkeleton from './components/categorySkeleton';
import ProductListSkeleton from './components/productListSkeleton';
import AlertBox from '../../components/alertBox';
import Empty from '../../components/alertBox/empty';
import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

import API from '../../config/api';
import {GET} from '../../utils/apiCalls';
import useAutoRefresh from '../../utils/useAutoRefresh';

type ViewMode = 'list' | 'category';

function ProductScreen(props: any) {
  const Dropdown = useSelector((state: any) => state?.Dropdown?.branches);
  const format = `YYYY-MM-DD HH:mm:ss`;
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const [data, setData] = useState<any>([]);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [error, setError] = useState<any>(null);

  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [query, setQuery] = useState<any>(null);
  const [date, setDate] = useState<any>({
    key: 'Today',
    from_date: moment().startOf('day').format(format),
    to_date: moment().endOf('day').format(format),
  });
  const [branchId, setBranchId] = useState<any>(
    Dropdown?.length ? Dropdown[0] : null,
  );

  // Update branchId when Dropdown becomes available (after Redux hydration)
  useEffect(() => {
    if (!branchId && Dropdown?.length) {
      setBranchId(Dropdown[0]);
    }
  }, [Dropdown]);

  // Initial data fetch - only when branchId is available
  useEffect(() => {
    if (branchId?.id) {
      getData();
    }
  }, []);

  // Fetch data when filters change - only when branchId is available
  useEffect(() => {
    if (branchId?.id) {
      setIsLoading2(true);
      setPage(1);
      setTake(10);
      getData();
    }
  }, [branchId, query, date, viewMode]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!isLoading && branchId?.id) {
        getData();
      }
    }, [branchId, query, date, viewMode])
  );

  const getData = async () => {
    // Don't fetch if branchId is not available
    if (!branchId?.id) {
      setIsLoading(false);
      setIsLoading2(false);
      return;
    }

    try {
      setError(null);

      if (viewMode === 'category') {
        // Fetch category-wise data
        let filter3 = query ? `?query=${query}` : '?';
        let filter4 = date?.key
          ? `${query ? '&' : ''}from_date=${date?.from_date}&to_date=${date?.to_date}`
          : '';
        let filter5 = `&branchId=${branchId?.id}`;
        let url = `${API.PRODUCTS_CATEGORY_WISE}${filter3}${filter4}${filter5}`;
        let response: any = await GET(url);

        if (response?.success) {
          setCategoryData(response?.data);
          setData([]);
        } else {
          setError(response?.message);
        }
      } else {
        // Fetch list data
        let filter1 = `?page=${page}`;
        let filter2 = `&limit=${take}`;
        let filter3 = query ? `&query=${query}` : '';
        let filter4 = date?.key
          ? `&from_date=${date?.from_date}&to_date=${date?.to_date}`
          : '';
        let filter5 = `&branchId=${branchId?.id}`;
        let url = `${API.PRODUCTS_LIST}${filter1}${filter2}${filter3}${filter4}${filter5}`;
        let response: any = await GET(url);

        if (response?.success) {
          setData(response?.data);
          setCategoryData(null);
        } else {
          setError(response?.message);
        }
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

  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    try {
      const hasData = viewMode === 'category'
        ? categoryData?.categories?.length > 0
        : data?.length > 0;
      if (!hasData) {
        Alert.alert('No Data', 'No products to export');
        return;
      }
      setExporting(true);

      let params = `?branchId=${branchId?.id}`;
      if (date?.from_date) params += `&from_date=${encodeURIComponent(date.from_date)}`;
      if (date?.to_date) params += `&to_date=${encodeURIComponent(date.to_date)}`;
      if (query) params += `&query=${encodeURIComponent(query)}`;

      const url = `${API.BASE_URL}report_app/v2/products/export-pdf${params}`;
      await Linking.openURL(url);
    } catch (err: any) {
      console.log('PDF export error:', err);
      Alert.alert('Error', 'Failed to open export link');
    } finally {
      setExporting(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'category' : 'list');
  };

  const getDataCount = () => {
    if (viewMode === 'category' && categoryData?.summary) {
      return categoryData.summary.totalProducts;
    }
    return data?.length || 0;
  };

  const renderCategoryView = () => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
      }>
      <Filters
        dataConunt={getDataCount()}
        loading={isLoading2}
        branchId={branchId}
        query={query}
        date={date}
        setQuery={(value: any) => setQuery(value)}
        setDate={(value: any) => setDate(value)}
        setBranch={(value: any) => setBranchId(value)}
        onExport={exportPDF}
        exporting={exporting}
      />

      {/* View Mode Toggle */}
      <View style={viewToggleStyles.container}>
        <TouchableOpacity
          style={[
            viewToggleStyles.toggleButton,
            viewMode === 'list' && viewToggleStyles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('list')}>
          <Ionicons
            name="list-outline"
            size={18}
            color={viewMode === 'list' ? '#fff' : COLOR.GREY1}
          />
          <Text
            style={[
              viewToggleStyles.toggleText,
              viewMode === 'list' && viewToggleStyles.toggleTextActive,
            ]}>
            List View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            viewToggleStyles.toggleButton,
            viewMode === 'category' && viewToggleStyles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('category')}>
          <Ionicons
            name="grid-outline"
            size={18}
            color={viewMode === 'category' ? '#fff' : COLOR.GREY1}
          />
          <Text
            style={[
              viewToggleStyles.toggleText,
              viewMode === 'category' && viewToggleStyles.toggleTextActive,
            ]}>
            Category View
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading2 || !categoryData ? (
        <CategorySkeleton />
      ) : (
        <>
          {categoryData?.summary && (
            <CategorySummary summary={categoryData.summary} />
          )}

          {categoryData?.categories?.length > 0 ? (
            categoryData.categories.map((category: any, index: number) => (
              <CategorySection
                key={`${category.categoryId}-${index}`}
                category={category}
                defaultExpanded={index === 0}
              />
            ))
          ) : (
            <Empty />
          )}
        </>
      )}

      {/* Bottom padding for FAB */}
      <View style={{height: 100}} />
    </ScrollView>
  );

  const renderListView = () => (
    <FlatList
      ListHeaderComponent={
        <>
          <Filters
            dataConunt={getDataCount()}
            loading={isLoading2}
            branchId={branchId}
            query={query}
            date={date}
            setQuery={(value: any) => setQuery(value)}
            setDate={(value: any) => setDate(value)}
            setBranch={(value: any) => setBranchId(value)}
            onExport={exportPDF}
            exporting={exporting}
          />
          {/* View Mode Toggle */}
          <View style={viewToggleStyles.container}>
            <TouchableOpacity
              style={[
                viewToggleStyles.toggleButton,
                viewMode === 'list' && viewToggleStyles.toggleButtonActive,
              ]}
              onPress={() => setViewMode('list')}>
              <Ionicons
                name="list-outline"
                size={18}
                color={viewMode === 'list' ? '#fff' : COLOR.GREY1}
              />
              <Text
                style={[
                  viewToggleStyles.toggleText,
                  viewMode === 'list' && viewToggleStyles.toggleTextActive,
                ]}>
                List View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                viewToggleStyles.toggleButton,
                viewMode === 'category' && viewToggleStyles.toggleButtonActive,
              ]}
              onPress={() => setViewMode('category')}>
              <Ionicons
                name="grid-outline"
                size={18}
                color={viewMode === 'category' ? '#fff' : COLOR.GREY1}
              />
              <Text
                style={[
                  viewToggleStyles.toggleText,
                  viewMode === 'category' && viewToggleStyles.toggleTextActive,
                ]}>
                Category View
              </Text>
            </TouchableOpacity>
          </View>
        </>
      }
      refreshControl={
        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
      }
      ListEmptyComponent={isLoading2 ? <ProductListSkeleton /> : <Empty />}
      data={isLoading2 ? [] : data}
      renderItem={({item}) => <ProductItem item={item} />}
      keyExtractor={(item, index) => index.toString()}
      ListFooterComponent={<View style={{height: 100}} />}
    />
  );

  return (
    <View style={styles.productScreen}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
      <TabHeader title={'Products'} showLogo={false} showProfile={true} />
      {isLoading ? (
        <LoadingBox />
      ) : viewMode === 'category' ? (
        renderCategoryView()
      ) : (
        renderListView()
      )}
      {error ? <AlertBox message={error} onChange={() => onRefresh()} /> : null}

      {/* Floating Action Buttons */}
      <View style={fabStyles.fabContainer}>
        <TouchableOpacity
          style={fabStyles.fab}
          onPress={() => props.navigation.navigate('CategoryManagement')}>
          <Ionicons name="list-outline" size={18} color="#fff" />
          <Text style={fabStyles.fabText}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[fabStyles.fab, fabStyles.fabPrimary]}
          onPress={() => props.navigation.navigate('ProductList')}>
          <Ionicons name="cube-outline" size={18} color="#fff" />
          <Text style={fabStyles.fabText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const viewToggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: COLOR.GREY4,
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: COLOR.PRIMARY,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: FONTS.MEDIUM,
    color: COLOR.GREY1,
  },
  toggleTextActive: {
    color: '#fff',
  },
});

const fabStyles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    gap: 8,
  },
  fab: {
    backgroundColor: COLOR.GREY1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  fabPrimary: {
    backgroundColor: COLOR.PRIMARY,
  },
  fabText: {
    color: '#fff',
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    marginLeft: 6,
  },
});

export default ProductScreen;
