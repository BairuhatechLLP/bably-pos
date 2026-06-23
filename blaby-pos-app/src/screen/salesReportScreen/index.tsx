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
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import COLOR from '../../config/color';
import FONTS from '../../config/fonts';
import {isMobile} from '../../utils/responsive';
import API from '../../config/api';
import {GET} from '../../utils/apiCalls';

const SalesReportScreen = () => {
  const Auth = useSelector((state: any) => state?.Auth?.user);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('today');
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded to shawarma only
  const CATEGORY_NAME = 'shawarma';

  useEffect(() => {
    fetchSalesReport();
  }, [selectedFilter]);

  const fetchSalesReport = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    try {
      setLoading(true);
      setError(null);
      const companyId = Auth?.staff?.companyid || 158;

      // Build API URL with shawarma category hardcoded
      let url = `${API.GET_CATEGORY_SALES_REPORT}?companyId=${companyId}&categoryName=${CATEGORY_NAME}`;

      if (selectedFilter) {
        url += `&dateFilter=${selectedFilter}`;
      }

      console.log('Fetching Shawarma Sales Report from:', url);
      const response: any = await GET(url, null);
      console.log('Shawarma Sales Report API Response:', JSON.stringify(response, null, 2));
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
    {id: 'yesterday', label: 'Yesterday'},
    {id: 'today', label: 'Today'},
    {id: 'lastweek', label: 'Last Week'},
    {id: 'lastmonth', label: 'Last Month'},
    {id: 'thismonth', label: 'This Month'},
  ];

  const StatCard = ({icon, label, value, color, currency}: any) => (
    <View style={[styles.statCard, isMobile() ? styles.statCardMobile : null]}>
      <View style={[styles.statIconBox, {backgroundColor: color}]}>
        <FontAwesome6 name={icon} style={styles.statIcon} solid />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {currency ? '₹ ' : ''}
          {value?.toLocaleString() || '0'}
        </Text>
      </View>
    </View>
  );

  const ProductCard = ({product, index}: any) => (
    <View
      style={[
        styles.productCard,
        index === reportData?.products?.length - 1 && styles.productCardLast,
      ]}>
      <View style={styles.productHeader}>
        <View style={styles.productNameBox}>
          <FontAwesome6 name="box" style={styles.productIcon} />
          <Text style={styles.productName}>{product?.productName}</Text>
        </View>
        <View style={styles.productBadge}>
          <Text style={styles.productBadgeText}>
            {product?.quantitySold} sold
          </Text>
        </View>
      </View>
      <View style={styles.productDetails}>
        <View style={styles.productDetailItem}>
          <Text style={styles.productDetailLabel}>Sales Value</Text>
          <Text style={styles.productDetailValue}>
            ₹ {product?.salesValue?.toLocaleString() || '0'}
          </Text>
        </View>
        <View style={styles.productDetailItem}>
          <Text style={styles.productDetailLabel}>Avg Price</Text>
          <Text style={styles.productDetailValue}>
            ₹ {product?.averagePrice?.toFixed(2) || '0.00'}
          </Text>
        </View>
        <View style={styles.productDetailItem}>
          <Text style={styles.productDetailLabel}>Invoices</Text>
          <Text style={styles.productDetailValue}>
            {product?.numberOfInvoices || '0'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLOR.primary]}
          />
        }>
        <View style={styles.content}>
          {/* Header Title */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Shawarma Sales Report</Text>
            <Text style={styles.headerSubtitle}>
              View detailed sales analytics for shawarma products
            </Text>
          </View>

          {/* Date Filter */}
          <View style={styles.filterContainer}>
            <Text style={styles.sectionTitle}>Select Date Range</Text>
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
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <Text style={styles.loadingText}>Loading sales report...</Text>
            </View>
          ) : reportData ? (
            <>
              {/* Company Info */}
              <View style={styles.companyInfoBox}>
                <FontAwesome6
                  name="store"
                  style={styles.companyIcon}
                  color={COLOR.primary}
                  solid
                />
                <View style={styles.companyTextBox}>
                  <Text style={styles.companyName}>
                    {reportData?.companyName}
                  </Text>
                  <View style={styles.categoryBadge}>
                    <FontAwesome6 name="burger" size={12} color={COLOR.primary} />
                    <Text style={styles.categoryBadgeText}>Shawarma Category</Text>
                  </View>
                </View>
              </View>

              {/* Statistics Overview */}
              <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                  <StatCard
                    icon="sack-dollar"
                    label="Total Sales Value"
                    value={reportData?.totalSalesValue}
                    color="#792113"
                    currency={true}
                  />
                  <StatCard
                    icon="box"
                    label="Quantity Sold"
                    value={reportData?.totalQuantitySold}
                    color="#0082FC"
                    currency={false}
                  />
                  <StatCard
                    icon="receipt"
                    label="Total Invoices"
                    value={reportData?.totalInvoices}
                    color="#fcba03"
                    currency={false}
                  />
                  <StatCard
                    icon="chart-line"
                    label="Avg per Invoice"
                    value={
                      reportData?.totalInvoices > 0
                        ? (
                            reportData?.totalSalesValue /
                            reportData?.totalInvoices
                          ).toFixed(2)
                        : 0
                    }
                    color="#9534eb"
                    currency={true}
                  />
                </View>
              </View>

              {/* Product Breakdown */}
              {reportData?.products && reportData?.products?.length > 0 ? (
                (() => {
                  const productsWithSales = reportData.products.filter(
                    (p: any) => p?.quantitySold > 0 || p?.salesValue > 0
                  );
                  return productsWithSales.length > 0 ? (
                    <View style={styles.productsContainer}>
                      <Text style={styles.sectionTitle}>
                        Product Breakdown ({productsWithSales.length} items with sales)
                      </Text>
                      <View style={styles.productsBox}>
                        {productsWithSales.map((product: any, index: number) => (
                          <ProductCard
                            key={index}
                            product={product}
                            index={index}
                          />
                        ))}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noDataBox}>
                      <Ionicons name="cart-outline" style={styles.noDataIcon} />
                      <Text style={styles.noDataText}>
                        No shawarma sales recorded for the selected period
                      </Text>
                      <Text style={[styles.noDataText, {fontSize: 12, marginTop: 8}]}>
                        {reportData.products.length} product{reportData.products.length !== 1 ? 's' : ''} available in catalog
                      </Text>
                    </View>
                  );
                })()
              ) : (
                <View style={styles.noDataBox}>
                  <Ionicons
                    name="information-circle-outline"
                    style={styles.noDataIcon}
                  />
                  <Text style={styles.noDataText}>
                    No product data available
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
                {error || 'No sales data available for the selected filters'}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchSalesReport}>
                <Ionicons name="refresh" style={styles.retryIcon} />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.grey2,
  },
  content: {
    padding: isMobile() ? 15 : 20,
  },

  // Header
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: FONTS.Bold,
    fontSize: isMobile() ? 22 : 26,
    color: COLOR.black,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: FONTS.Regular,
    fontSize: 14,
    color: COLOR.grey5,
  },

  sectionTitle: {
    fontFamily: FONTS.SemiBold,
    fontSize: isMobile() ? 16 : 18,
    color: COLOR.black,
    marginBottom: 12,
  },

  // Filters
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    gap: 10,
    paddingRight: 10,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: COLOR.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLOR.grey4,
  },
  filterButtonActive: {
    backgroundColor: COLOR.primary,
    borderColor: COLOR.primary,
  },
  filterText: {
    fontFamily: FONTS.Medium,
    fontSize: 13,
    color: COLOR.black,
  },
  filterTextActive: {
    color: COLOR.white,
  },

  // Loading
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.grey4,
  },
  loadingText: {
    fontFamily: FONTS.Medium,
    fontSize: 14,
    color: COLOR.grey5,
    marginTop: 15,
  },

  // Company Info
  companyInfoBox: {
    backgroundColor: COLOR.white,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: COLOR.grey4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  companyIcon: {
    fontSize: 30,
  },
  companyTextBox: {
    flex: 1,
  },
  companyName: {
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
    color: COLOR.black,
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLOR.light || '#f0f9ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontFamily: FONTS.Medium,
    fontSize: 12,
    color: COLOR.primary,
  },

  // Statistics
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: isMobile() ? '48%' : 200,
    backgroundColor: COLOR.white,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: COLOR.grey4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statCardMobile: {
    minWidth: '48%',
  },
  statIconBox: {
    height: 45,
    width: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 20,
    color: COLOR.white,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontFamily: FONTS.Regular,
    fontSize: 11,
    color: COLOR.grey5,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FONTS.SemiBold,
    fontSize: isMobile() ? 16 : 18,
    color: COLOR.black,
  },

  // Products
  productsContainer: {
    marginBottom: 20,
  },
  productsBox: {
    backgroundColor: COLOR.white,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: COLOR.grey4,
  },
  productCard: {
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.grey4,
  },
  productCardLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productNameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  productIcon: {
    fontSize: 16,
    color: COLOR.primary,
  },
  productName: {
    fontFamily: FONTS.SemiBold,
    fontSize: 15,
    color: COLOR.black,
    flex: 1,
  },
  productBadge: {
    backgroundColor: COLOR.light,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  productBadgeText: {
    fontFamily: FONTS.Medium,
    fontSize: 12,
    color: COLOR.primary,
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productDetailItem: {
    minWidth: '30%',
    flex: 1,
  },
  productDetailLabel: {
    fontFamily: FONTS.Regular,
    fontSize: 12,
    color: COLOR.grey5,
    marginBottom: 4,
  },
  productDetailValue: {
    fontFamily: FONTS.SemiBold,
    fontSize: 15,
    color: COLOR.black,
  },

  // No Data
  noDataBox: {
    backgroundColor: COLOR.white,
    borderRadius: 10,
    padding: 40,
    borderWidth: 1,
    borderColor: COLOR.grey4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataIcon: {
    fontSize: 60,
    color: COLOR.grey5,
    marginBottom: 15,
  },
  noDataText: {
    fontFamily: FONTS.Medium,
    fontSize: 14,
    color: COLOR.grey5,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLOR.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryIcon: {
    fontSize: 18,
    color: COLOR.white,
  },
  retryText: {
    fontFamily: FONTS.Medium,
    fontSize: 14,
    color: COLOR.white,
  },
});

export default SalesReportScreen;
