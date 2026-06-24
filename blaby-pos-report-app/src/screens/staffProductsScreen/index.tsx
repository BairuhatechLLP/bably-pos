import React, {useEffect, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LoadingBox from '../../components/skeleton/Loading';
import ProductCard from '../../components/productCard';
import Empty from '../../components/alertBox/empty';
import AlertBox from '../../components/alertBox';

import API from '../../config/api';
import {GET} from '../../utils/apiCalls';
import COLOR from '../../config/color';
import FONTS from '../../config/fonts';

function StaffProductsScreen(props: any) {
  const {route} = props;
  const {staffInfo, dateRange, filter} = route.params || {};

  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState<any>(null);

  const [products, setProducts] = useState<any>([]);
  const [summary, setSummary] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Only fetch data if we have the required params
    if (staffInfo?.staffId && staffInfo?.companyId) {
      getData(1, false);
    } else {
      setIsLoading(false);
      setError('Unable to load products. Please go back and try again.');
    }
  }, []);

  const getData = async (page: number = 1, isLoadMore: boolean = false) => {
    try {
      // Validate required params
      if (!staffInfo?.staffId || !staffInfo?.companyId) {
        setIsLoading(false);
        setLoadingMore(false);
        setError('Unable to load products. Missing staff information.');
        return;
      }

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      let params = new URLSearchParams();
      params.append('companyId', staffInfo.companyId.toString());
      params.append('staffId', staffInfo.staffId.toString());
      params.append('filter', filter);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      // Add startDate/endDate if custom filter
      if (filter === 'custom' && dateRange?.startDate && dateRange?.endDate) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }

      const url = `${API.STAFF_PRODUCTS}?${params.toString()}`;

      const response: any = await GET(url);

      if (response?.success) {
        const data = response.data;

        if (isLoadMore) {
          // Append new products for pagination
          setProducts([...products, ...(data.products || [])]);
        } else {
          // Replace products for new query
          setProducts(data.products || []);
          setSummary(data.summary);
        }

        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        setError(response?.message || 'Failed to load products');
        if (!isLoadMore) {
          setProducts([]);
          setSummary(null);
        }
      }

      setIsLoading(false);
      setRefresh(false);
      setLoadingMore(false);
    } catch (err) {
      setIsLoading(false);
      setRefresh(false);
      setLoadingMore(false);
      setError('Oops. Something went wrong');
      if (!isLoadMore) {
        setProducts([]);
        setSummary(null);
      }
    }
  };

  const loadNextPage = () => {
    if (pagination?.hasNextPage && !loadingMore) {
      getData(currentPage + 1, true);
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    setCurrentPage(1);
    getData(1, false);
  };

  const formatCurrency = (value: any) => {
    const num = parseFloat(value) || 0;
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (value: any) => {
    const num = parseInt(value) || 0;
    return num.toLocaleString('en-IN');
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Staff Info Card */}
      <View style={styles.staffInfoCard}>
        <View style={styles.staffIconContainer}>
          <Ionicons name="person" size={30} color={COLOR.PRIMARY} />
        </View>
        <View style={styles.staffInfoText}>
          <Text style={styles.staffNameText}>{staffInfo?.staffName}</Text>
          <Text style={styles.staffDetailText}>
            ID: {staffInfo?.staffId} • {staffInfo?.branchName}
          </Text>
        </View>
      </View>

      {/* Date Range Info */}
      <View style={styles.dateRangeCard}>
        <Ionicons name="calendar-outline" size={16} color={COLOR.GREY2} />
        <Text style={styles.dateRangeText}>
          {dateRange?.startDate} to {dateRange?.endDate}
        </Text>
      </View>

      {/* Summary Cards */}
      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, {backgroundColor: '#e3f2fd'}]}>
              <Ionicons name="pricetag-outline" size={20} color="#1976d2" />
            </View>
            <Text style={styles.summaryValue}>
              {formatNumber(summary.totalProducts)}
            </Text>
            <Text style={styles.summaryLabel}>Total Products</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, {backgroundColor: '#fff3e0'}]}>
              <Ionicons name="cube-outline" size={20} color="#f57c00" />
            </View>
            <Text style={styles.summaryValue}>
              {formatNumber(summary.totalQuantity)}
            </Text>
            <Text style={styles.summaryLabel}>Total Quantity</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, {backgroundColor: '#e8f5e9'}]}>
              <Ionicons name="cash-outline" size={20} color="#388e3c" />
            </View>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary.totalRevenue)}
            </Text>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
          </View>
        </View>
      )}

      {/* Pagination Info */}
      {pagination && (
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Showing {products.length} of {pagination.totalProducts} products
            {pagination.totalPages > 1 && ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
          </Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Products</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLOR.PRIMARY} />
        <Text style={styles.footerLoaderText}>Loading more...</Text>
      </View>
    );
  };

  const renderLoadMoreButton = () => {
    if (!pagination?.hasNextPage || loadingMore) return null;

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={loadNextPage}
        disabled={loadingMore}>
        <Text style={styles.loadMoreButtonText}>Load More Products</Text>
        <Ionicons name="chevron-down" size={16} color={COLOR.PRIMARY} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />

      {isLoading ? (
        <LoadingBox />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
          }
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            <Empty message="No products found for this staff member" />
          }
          data={products}
          renderItem={({item}) => <ProductCard item={item} />}
          keyExtractor={(item, index) => `${item.productId}-${index}`}
          ListFooterComponent={
            <>
              {renderFooter()}
              {renderLoadMoreButton()}
            </>
          }
          onEndReached={() => {
            if (pagination?.hasNextPage && !loadingMore && !isLoading) {
              loadNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      {error ? <AlertBox message={error} onChange={() => onRefresh()} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  staffInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5fff9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  staffIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLOR.LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  staffInfoText: {
    flex: 1,
  },
  staffNameText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 18,
    color: COLOR.GREY1,
    marginBottom: 4,
  },
  staffDetailText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 13,
    color: COLOR.GREY2,
  },
  dateRangeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
  },
  dateRangeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY2,
    marginLeft: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLOR.GREY3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: FONTS.BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
    marginBottom: 4,
  },
  summaryLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: 10,
    color: COLOR.GREY2,
    textAlign: 'center',
  },
  paginationInfo: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  paginationText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 12,
    color: COLOR.GREY2,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: 16,
    color: COLOR.GREY1,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerLoaderText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 13,
    color: COLOR.GREY2,
    marginLeft: 10,
  },
  loadMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.LIGHT,
    marginHorizontal: 15,
    marginVertical: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.PRIMARY,
  },
  loadMoreButtonText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    color: COLOR.PRIMARY,
    marginRight: 5,
  },
});

export default StaffProductsScreen;
