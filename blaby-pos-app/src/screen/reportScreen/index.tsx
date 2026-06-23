import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import {isMobile} from '../../utils/responsive';
import API from '../../config/api';
import {GET} from '../../utils/apiCalls';

const ReportScreen = () => {
  const Auth = useSelector((state: any) => state?.Auth?.user);
  const [selectedFilter, setSelectedFilter] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('shawarma');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSalesReport();
  }, [selectedFilter, selectedCategory]);

  const fetchSalesReport = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    try {
      setLoading(true);
      setError(null);
      const companyId = Auth?.staff?.companyid || 158;

      let url = `${API.GET_CATEGORY_SALES_REPORT}?companyId=${companyId}`;

      // Only add categoryName if a specific category is selected
      if (selectedCategory) {
        url += `&categoryName=${selectedCategory}`;
      }

      if (selectedFilter) {
        url += `&dateFilter=${selectedFilter}`;
      }

      console.log('Fetching report from:', url);
      const response: any = await GET(url, null);
      console.log('Report API Response:', JSON.stringify(response, null, 2));
      console.log('Response status:', response?.status);
      console.log('Response data type:', typeof response?.data, Array.isArray(response?.data) ? 'Array' : 'Object');
      console.log('Response data:', response?.data);

      if (response?.status) {
        // Handle response data properly - check if it's an array
        if (Array.isArray(response?.data)) {
          console.log('Array length:', response?.data.length);
          // If multiple results, take the first one, or aggregate them
          if (response?.data.length > 0) {
            setReportData(response?.data?.[0]);
            if (response?.data.length > 1) {
              console.log(`API returned ${response.data.length} results, showing first one`);
            }
          } else {
            console.log('Array is empty');
            setReportData(null);
            setError('No shawarma sales data found for the selected date');
          }
        } else if (response?.data && Object.keys(response?.data).length > 0) {
          // If it's a single object with data
          console.log('Single object received');
          setReportData(response?.data);
        } else {
          console.log('No data in response');
          setReportData(null);
          setError('No shawarma sales data found for the selected date');
        }
      } else {
        const errorMsg = response?.message || 'Failed to fetch sales report';
        console.log('Error fetching sales report:', errorMsg);
        setError(errorMsg);
        setReportData(null);
      }

      // Success - clear loading state
      setLoading(false);
      setRefreshing(false);
    } catch (error: any) {
      console.log('Error:', error, `(Attempt ${retryCount + 1}/${MAX_RETRIES})`);

      // Retry logic for network errors
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
        // Don't clear loading state, we're retrying
        setTimeout(() => {
          fetchSalesReport(retryCount + 1);
        }, (retryCount + 1) * 1000); // Exponential backoff: 1s, 2s, 3s
        return; // Don't set error yet, we're retrying
      }

      // Max retries reached
      const errorMsg = error?.message || 'Network error occurred';
      setError(errorMsg);
      setReportData(null);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSalesReport();
  };

  const dateFilters = [
    {id: 'today', label: 'Today'},
    {id: 'yesterday', label: 'Yesterday'},
    {id: 'thismonth', label: 'This month'},
  ];


  // Show all products, but highlight those with sales
  const allProducts = reportData?.products || [];
  const productsWithSales = allProducts.filter((product: any) =>
    product?.quantitySold > 0 || product?.salesValue > 0,
  );

  const getTotalSales = () => {
    // Use data from API response if available, otherwise calculate
    return reportData?.totalSalesValue || 0;
  };

  const getTotalUnits = () => {
    // Use data from API response if available, otherwise calculate
    return reportData?.totalQuantitySold || 0;
  };

  const getDateDisplay = () => {
    const today = new Date();
    if (selectedFilter === 'today') {
      return today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } else if (selectedFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="stats-chart" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Shawarma Sales Report</Text>
          </View>
        </View>

        {/* Date Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {dateFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLOR.primary]}
            />
          }
          contentContainerStyle={styles.productsScroll}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <Text style={styles.loadingText}>Loading sales report...</Text>
            </View>
          ) : reportData ? (
            <>
              {/* Summary Cards */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                  <Ionicons name="cash-outline" style={styles.summaryIcon} />
                  <Text style={styles.summaryLabel}>Total Sales</Text>
                  <Text style={styles.summaryValue}>₹{getTotalSales().toFixed(2)}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="cube-outline" style={styles.summaryIcon} />
                  <Text style={styles.summaryLabel}>Total Units</Text>
                  <Text style={styles.summaryValue}>{getTotalUnits()}</Text>
                </View>
              </View>

              {/* Product Count Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.productCountText}>
                  {productsWithSales.length > 0
                    ? `${productsWithSales.length} Products with Sales`
                    : `${allProducts.length} Products (No Sales)`}
                </Text>
                <Text style={styles.dateText}>{getDateDisplay()}</Text>
              </View>

              {/* Product List */}
              {productsWithSales.length > 0 ? (
                <View style={styles.productsList}>
                  {productsWithSales.map((product: any, index: number) => (
                    <View key={index} style={styles.productCard}>
                      <View style={styles.productHeader}>
                        <Text style={styles.productName}>
                          {product?.productName}
                        </Text>
                        <Text style={styles.productSales}>
                          ₹{product?.salesValue?.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.productDetails}>
                        <View style={styles.productDetailRow}>
                          <Ionicons name="pricetag-outline" style={styles.detailIcon} />
                          <Text style={styles.productDetailText}>
                            Price: ₹{product?.averagePrice?.toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.productDetailRow}>
                          <Ionicons name="layers-outline" style={styles.detailIcon} />
                          <Text style={styles.productDetailText}>
                            {product?.quantitySold} units sold
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noDataBox}>
                  <Ionicons name="cart-outline" style={styles.noDataIcon} />
                  <Text style={styles.noDataText}>
                    No shawarma sales recorded for {selectedFilter}
                  </Text>
                  <Text style={[styles.noDataText, {fontSize: 12, marginTop: 8}]}>
                    {allProducts.length} product{allProducts.length !== 1 ? 's' : ''} available in catalog
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noDataBox}>
              <Ionicons
                name={error ? 'alert-circle-outline' : 'document-text-outline'}
                style={[styles.noDataIcon, error && {color: '#ef4444'}]}
              />
              <Text style={styles.noDataText}>
                {error || `No sales data available for ${selectedFilter}`}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchSalesReport}>
                <Ionicons name="refresh" style={styles.retryIcon} />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.grey2,
  },
  content: {
    flex: 1,
    padding: isMobile() ? 15 : 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 28,
    color: COLOR.primary,
  },
  headerTitle: {
    fontFamily: FONTS.Bold,
    fontSize: 22,
    color: COLOR.black,
  },

  // Filters
  filterScroll: {
    gap: 10,
    paddingRight: 10,
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: COLOR.white,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: COLOR.grey4,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: COLOR.primary,
    borderColor: COLOR.primary,
    shadowColor: COLOR.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
    color: COLOR.black,
  },
  filterTextActive: {
    color: COLOR.white,
  },

  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLOR.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    fontSize: 32,
    color: COLOR.primary,
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: FONTS.Medium,
    fontSize: 12,
    color: COLOR.grey5,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: FONTS.Bold,
    fontSize: 20,
    color: COLOR.black,
  },

  // Loading
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontFamily: FONTS.Medium,
    fontSize: 14,
    color: COLOR.grey5,
    marginTop: 15,
  },

  // Products
  productsScroll: {
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  productCountText: {
    fontFamily: FONTS.Bold,
    fontSize: 18,
    color: COLOR.black,
  },
  dateText: {
    fontFamily: FONTS.Medium,
    fontSize: 14,
    color: COLOR.grey5,
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: COLOR.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontFamily: FONTS.Bold,
    fontSize: 17,
    color: COLOR.black,
    flex: 1,
  },
  productSales: {
    fontFamily: FONTS.Bold,
    fontSize: 22,
    color: COLOR.primary,
  },
  productDetails: {
    gap: 8,
  },
  productDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 16,
    color: COLOR.grey5,
  },
  productDetailText: {
    fontFamily: FONTS.Medium,
    fontSize: 14,
    color: COLOR.grey5,
  },

  // No Data
  noDataBox: {
    backgroundColor: COLOR.white,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataIcon: {
    fontSize: 64,
    color: COLOR.grey5,
    marginBottom: 15,
  },
  noDataText: {
    fontFamily: FONTS.Medium,
    fontSize: 15,
    color: COLOR.grey5,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLOR.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: COLOR.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryIcon: {
    fontSize: 18,
    color: COLOR.white,
  },
  retryText: {
    fontFamily: FONTS.SemiBold,
    fontSize: 15,
    color: COLOR.white,
  },
});

export default ReportScreen;
