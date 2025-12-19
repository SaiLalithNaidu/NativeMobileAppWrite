/**
 * Warehouse Overview Screen
 * Displays comprehensive warehouse statistics including:
 * - Total products in warehouse
 * - Items sold (analytics)
 * - Available stock levels
 * - Visual charts and metrics
 */

import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../lib/firebase';
import WarehouseSkeleton from '../components/warehouse/WarehouseSkeleton';
import { SimpleSalesAnalyticsService } from '../services/simpleSalesAnalyticsService';
import { SalesDataSeeder } from '../utils/salesDataSeeder';

const WarehouseOverview = () => {
  const router = useRouter();
  const { theme } = useTheme();

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // today, week, month, year

  // Data state
  const [warehouseStats, setWarehouseStats] = useState({
    totalProducts: 0,
    totalStockQuantity: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
    totalStockValue: 0
  });

  const [salesStats, setSalesStats] = useState({
    itemsSold: 0,
    totalOrders: 0,
    totalRevenue: 0,
    topSellingProducts: []
  });

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Cache for sales data to reduce API calls
  const [salesCache, setSalesCache] = useState({});

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      const initializeData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            loadCompanies(),
            loadWarehouseData(),
          ]);
        } catch (error) {
          console.error('Error loading initial data:', error);
          Alert.alert('Error', 'Failed to load warehouse data');
        } finally {
          setLoading(false);
        }
      };

      initializeData();
    }, [loadCompanies, loadWarehouseData])
  );

  // Reload sales data when period changes
  React.useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedCompany) return;

      // Check cache first to reduce API calls
      const cacheKey = `${selectedCompany.id}-${selectedPeriod}`;
      if (salesCache[cacheKey]) {
        console.log('Using cached sales data for', cacheKey);
        setSalesStats(salesCache[cacheKey]);
        return;
      }

      try {
        setSalesLoading(true);
        let salesData;

        switch (selectedPeriod) {
          case 'today':
            salesData = await SimpleSalesAnalyticsService.getTodaysSales(selectedCompany.id);
            break;
          case 'week':
            salesData = await SimpleSalesAnalyticsService.getWeeklySales(selectedCompany.id);
            break;
          case 'month':
            salesData = await SimpleSalesAnalyticsService.getMonthlySales(selectedCompany.id);
            break;
          case 'year':
            salesData = await SimpleSalesAnalyticsService.getYearlySales(selectedCompany.id);
            break;
          default:
            salesData = await SimpleSalesAnalyticsService.getTodaysSales(selectedCompany.id);
        }

        const processedStats = {
          itemsSold: salesData.totalItems || 0,
          totalOrders: salesData.totalOrders || 0,
          totalRevenue: salesData.totalRevenue || 0,
          topSellingProducts: salesData.topProducts || []
        };

        // Cache the result for faster subsequent loads
        setSalesCache(prev => ({
          ...prev,
          [cacheKey]: processedStats
        }));

        setSalesStats(processedStats);
      } catch (error) {
        console.error('Error loading sales data:', error);
        // Set default values on error to prevent UI disruption
        const defaultStats = {
          itemsSold: 0,
          totalOrders: 0,
          totalRevenue: 0,
          topSellingProducts: []
        };
        setSalesStats(defaultStats);
      } finally {
        setSalesLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedPeriod, selectedCompany, salesCache]);

  // Reload warehouse data when company changes
  React.useEffect(() => {
    if (selectedCompany) {
      loadWarehouseData();
    }
  }, [selectedCompany, loadWarehouseData]);

  const loadCompanies = useCallback(async () => {
    try {
      const companiesRef = collection(db, 'companies');
      const snapshot = await getDocs(companiesRef);
      const companyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCompanies(companyData);
      if (companyData.length > 0 && !selectedCompany) {
        setSelectedCompany(companyData[0]);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  }, [selectedCompany]);

  const loadWarehouseData = useCallback(async () => {
    try {
      setWarehouseLoading(true);

      // Get all products (or filter by company if selected)
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      let products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter products by selected company if one is selected
      if (selectedCompany) {
        products = products.filter(product => product.companyId === selectedCompany.id);
      }

      // Get inventory data (or filter by company if selected)
      const inventoryRef = collection(db, 'inventory');
      const inventorySnapshot = await getDocs(inventoryRef);
      let inventory = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter inventory by selected company if one is selected
      if (selectedCompany) {
        inventory = inventory.filter(item => item.companyId === selectedCompany.id);
      }

      // Calculate warehouse statistics
      const totalProducts = products.length;
      const totalStockQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const inStockProducts = inventory.filter(item => !item.isOutOfStock).length;
      const outOfStockProducts = inventory.filter(item => item.isOutOfStock).length;
      const lowStockProducts = inventory.filter(item => item.isLowStock && !item.isOutOfStock).length;

      // Estimate stock value (using product prices)
      let totalStockValue = 0;
      inventory.forEach(invItem => {
        const product = products.find(p => p.id === invItem.productId);
        if (product && invItem.quantity) {
          totalStockValue += (invItem.quantity * (product.price || 0));
        }
      });

      setWarehouseStats({
        totalProducts,
        totalStockQuantity,
        inStockProducts,
        outOfStockProducts,
        lowStockProducts,
        totalStockValue
      });

    } catch (error) {
      console.error('Error loading warehouse data:', error);
      // Set default values on error
      setWarehouseStats({
        totalProducts: 0,
        totalStockQuantity: 0,
        inStockProducts: 0,
        outOfStockProducts: 0,
        lowStockProducts: 0,
        totalStockValue: 0
      });
    } finally {
      setWarehouseLoading(false);
    }
  }, [selectedCompany]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear sales cache on refresh to ensure fresh data
      setSalesCache({});

      await Promise.all([
        loadCompanies(),
        loadWarehouseData(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const generateSampleSalesData = async () => {
    Alert.alert(
      "Generate Sample Sales Data",
      "This will create realistic sales data for the last 3 months to test analytics functionality. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Generate",
          onPress: async () => {
            try {
              setRefreshing(true);
              console.log('🌱 Starting sample sales data generation...');

              const result = await SalesDataSeeder.seedRealisticSalesData(
                selectedCompany ? selectedCompany.id : null
              );

              // Clear cache and refresh analytics after generating data
              setSalesCache({});

              if (selectedCompany) {
                // Trigger a fresh load by changing a state that will cause useEffect to run
                setSalesLoading(true);
                setTimeout(() => {
                  setSalesLoading(false);
                }, 100);
              }

              Alert.alert(
                "Success!",
                `Generated ${result.salesCreated} sales records over ${result.months} months. Check the sales analytics above!`,
                [{ text: "OK" }]
              );

            } catch (error) {
              console.error('Error generating sample sales data:', error);
              Alert.alert(
                "Error",
                "Failed to generate sample sales data. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setRefreshing(false);
            }
          }
        }
      ]
    );
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Today';
    }
  };

  const getAvailableStock = () => {
    return warehouseStats.totalStockQuantity - salesStats.itemsSold;
  };

  if (loading) {
    return <WarehouseSkeleton />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.headerTitle, { color: 'white' }]}>Warehouse Overview</Text>
              <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Real-time inventory tracking</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <FontAwesome5 name="sync-alt" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions - PhonePe Style Design */}
      <View style={[styles.quickActionsSection, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.quickActionsHeader}>
          <Text style={[styles.quickActionsTitle, { color: theme.text }]}>Warehouse & Operations</Text>
        </View>

        <View style={styles.quickActionGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/addStock')}
          >
            <View style={[styles.quickActionCircle, { backgroundColor: theme.iconBackground }]}>
              <FontAwesome5 name="plus" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.text }]}>Add Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => {
              Alert.alert('Coming Soon', 'Inventory Reports feature will be available soon!');
            }}
          >
            <View style={[styles.quickActionCircle, { backgroundColor: theme.iconBackground }]}>
              <FontAwesome5 name="chart-bar" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.text }]}>Inventory Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => {
              Alert.alert('Stock Alerts', 'No critical stock alerts at the moment!');
            }}
          >
            <View style={[styles.quickActionCircle, { backgroundColor: theme.iconBackground }]}>
              <FontAwesome5 name="exclamation-triangle" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.text }]}>Stock Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Company Selector */}
      {companies.length > 1 && (
        <View style={[styles.companySelector, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.selectorLabel, { color: theme.text }]}>Select Company:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companyList}>
            {companies.map(company => (
              <TouchableOpacity
                key={company.id}
                style={[
                  styles.companyChip,
                  selectedCompany?.id === company.id && [styles.selectedCompanyChip, { backgroundColor: theme.primary }]
                ]}
                onPress={() => setSelectedCompany(company)}
              >
                <Text style={[
                  styles.companyChipText,
                  selectedCompany?.id === company.id && styles.selectedCompanyChipText
                ]}>
                  {company.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Stats Cards */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Warehouse Statistics</Text>

        {/* Primary Stats Row */}
        <View style={styles.primaryStatsRow}>
          <View style={[styles.primaryStatCard, styles.totalProductsCard]}>
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={styles.primaryStatGradient}
            >
              <View style={styles.primaryStatContent}>
                {(loading || warehouseLoading) ? (
                  <>
                    <ActivityIndicator size="large" color="white" style={styles.primaryStatIcon} />
                    <Text style={styles.primaryStatNumber}>--</Text>
                    <Text style={[styles.primaryStatLabel, { color: 'rgba(255,255,255,0.9)' }]}>Loading...</Text>
                  </>
                ) : (
                  <>
                    <FontAwesome5 name="boxes" size={32} color="white" style={styles.primaryStatIcon} />
                    <Text style={styles.primaryStatNumber}>{warehouseStats.totalProducts}</Text>
                    <Text style={[styles.primaryStatLabel, { color: 'rgba(255,255,255,0.9)' }]}>Total Products</Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </View>

          <View style={[styles.primaryStatCard, styles.totalStockCard]}>
            <LinearGradient
              colors={[theme.success, '#10b981']}
              style={styles.primaryStatGradient}
            >
              <View style={styles.primaryStatContent}>
                {(loading || warehouseLoading) ? (
                  <>
                    <ActivityIndicator size="large" color="white" style={styles.primaryStatIcon} />
                    <Text style={styles.primaryStatNumber}>--</Text>
                    <Text style={[styles.primaryStatLabel, { color: 'rgba(255,255,255,0.9)' }]}>Loading...</Text>
                  </>
                ) : (
                  <>
                    <FontAwesome5 name="warehouse" size={32} color="white" style={styles.primaryStatIcon} />
                    <Text style={styles.primaryStatNumber}>{warehouseStats.totalStockQuantity}</Text>
                    <Text style={[styles.primaryStatLabel, { color: 'rgba(255,255,255,0.9)' }]}>Items in Warehouse</Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Secondary Stats Row */}
        <View style={styles.secondaryStatsRow}>
          <View style={[styles.secondaryStatCard, styles.inStockCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.secondaryStatContent}>
              {(loading || warehouseLoading) ? (
                <>
                  <ActivityIndicator size="small" color={theme.success} />
                  <Text style={[styles.secondaryStatNumber, { color: theme.text }]}>--</Text>
                  <Text style={[styles.secondaryStatLabel, { color: theme.textSecondary }]}>Loading...</Text>
                </>
              ) : (
                <>
                  <FontAwesome5 name="check-circle" size={24} color={theme.success} />
                  <Text style={[styles.secondaryStatNumber, { color: theme.text }]}>{warehouseStats.inStockProducts}</Text>
                  <Text style={[styles.secondaryStatLabel, { color: theme.textSecondary }]}>In Stock</Text>
                </>
              )}
            </View>
          </View>

          <View style={[styles.secondaryStatCard, styles.lowStockCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.secondaryStatContent}>
              {(loading || warehouseLoading) ? (
                <>
                  <ActivityIndicator size="small" color={theme.warning} />
                  <Text style={[styles.secondaryStatNumber, { color: theme.text }]}>--</Text>
                  <Text style={[styles.secondaryStatLabel, { color: theme.textSecondary }]}>Loading...</Text>
                </>
              ) : (
                <>
                  <FontAwesome5 name="exclamation-triangle" size={24} color={theme.warning} />
                  <Text style={[styles.secondaryStatNumber, { color: theme.text }]}>{warehouseStats.lowStockProducts}</Text>
                  <Text style={[styles.secondaryStatLabel, { color: theme.textSecondary }]}>Low Stock</Text>
                </>
              )}
            </View>
          </View>

          <View style={[styles.secondaryStatCard, styles.outOfStockCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.secondaryStatContent}>
              {(loading || warehouseLoading) ? (
                <>
                  <ActivityIndicator size="small" color={theme.error} />
                  <Text style={[styles.secondaryStatNumber, { color: theme.text }]}>--</Text>
                  <Text style={[styles.secondaryStatLabel, { color: theme.textSecondary }]}>Loading...</Text>
                </>
              ) : (
                <>
                  <FontAwesome5 name="times-circle" size={24} color={theme.error} />
                  <Text style={[styles.secondaryStatNumber, { color: theme.text }]}>{warehouseStats.outOfStockProducts}</Text>
                  <Text style={[styles.secondaryStatLabel, { color: theme.textSecondary }]}>Out of Stock</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Stock Value Card */}
        <View style={[styles.valueCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.valueHeader}>
            <FontAwesome5 name="rupee-sign" size={20} color={theme.success} />
            <Text style={[styles.valueTitle, { color: theme.text }]}>Total Stock Value</Text>
          </View>
          {(loading || warehouseLoading) ? (
            <View style={styles.valueLoadingContainer}>
              <ActivityIndicator size="small" color={theme.success} />
              <Text style={[styles.valueAmount, { color: theme.text }]}>--</Text>
            </View>
          ) : (
            <Text style={[styles.valueAmount, { color: theme.primary }]}>₹{warehouseStats.totalStockValue.toLocaleString()}</Text>
          )}
          <Text style={[styles.valueSubtext, { color: theme.textSecondary }]}>Estimated inventory worth</Text>
        </View>
      </View>

      {/* Sales Analytics Section */}
      <View style={[styles.salesSection, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.salesHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sales Analytics</Text>
          <Text style={[styles.salesSubtitle, { color: theme.textSecondary }]}>Track items sold and availability</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['today', 'week', 'month', 'year'].map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && [styles.activePeriodButton, { backgroundColor: theme.primary }]
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && { color: 'white' }
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sales Stats Cards */}
        <View style={styles.salesStatsRow}>
          <View style={[styles.salesStatCard, styles.itemsSoldCard]}>
            <LinearGradient
              colors={[theme.error, '#991b1b']}
              style={styles.salesStatGradient}
            >
              {salesLoading ? (
                <>
                  <ActivityIndicator size="large" color="white" style={styles.salesStatIcon} />
                  <Text style={styles.salesStatNumber}>--</Text>
                  <Text style={[styles.salesStatLabel, { color: 'rgba(255,255,255,0.9)' }]}>Loading...</Text>
                  <Text style={[styles.salesStatPeriod, { color: 'rgba(255,255,255,0.8)' }]}>({getPeriodLabel()})</Text>
                </>
              ) : (
                <>
                  <FontAwesome5 name="shopping-bag" size={28} color="white" style={styles.salesStatIcon} />
                  <Text style={styles.salesStatNumber}>{salesStats.itemsSold}</Text>
                  <Text style={[styles.salesStatLabel, { color: 'rgba(255,255,255,0.9)' }]}>Items Sold</Text>
                  <Text style={[styles.salesStatPeriod, { color: 'rgba(255,255,255,0.8)' }]}>({getPeriodLabel()})</Text>
                </>
              )}
            </LinearGradient>
          </View>

          <View style={[styles.salesStatCard, styles.availableCard]}>
            <LinearGradient
              colors={[theme.success, '#065f46']}
              style={styles.salesStatGradient}
            >
              {salesLoading ? (
                <>
                  <ActivityIndicator size="large" color="white" style={styles.salesStatIcon} />
                  <Text style={styles.salesStatNumber}>--</Text>
                  <Text style={[styles.salesStatLabel, { color: 'rgba(255,255,255,0.9)' }]}>Loading...</Text>
                  <Text style={[styles.salesStatPeriod, { color: 'rgba(255,255,255,0.8)' }]}>(Current Stock)</Text>
                </>
              ) : (
                <>
                  <FontAwesome5 name="check-double" size={28} color="white" style={styles.salesStatIcon} />
                  <Text style={styles.salesStatNumber}>{Math.max(0, getAvailableStock())}</Text>
                  <Text style={[styles.salesStatLabel, { color: 'rgba(255,255,255,0.9)' }]}>Still Available</Text>
                  <Text style={[styles.salesStatPeriod, { color: 'rgba(255,255,255,0.8)' }]}>(Current Stock)</Text>
                </>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Additional Sales Metrics */}
        <View style={styles.additionalMetrics}>
          {salesLoading ? (
            <View style={styles.metricsLoadingContainer}>
              <ActivityIndicator size="small" color={theme.textSecondary} />
              <Text style={[styles.metricsLoadingText, { color: theme.textSecondary }]}>Loading sales metrics...</Text>
            </View>
          ) : (
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <FontAwesome5 name="chart-line" size={16} color={theme.textSecondary} />
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Orders</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>{salesStats.totalOrders}</Text>
              </View>
              <View style={styles.metricItem}>
                <FontAwesome5 name="rupee-sign" size={16} color={theme.textSecondary} />
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Revenue</Text>
                <Text style={[styles.metricValue, { color: theme.primary }]}>₹{salesStats.totalRevenue.toLocaleString()}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Top Selling Products */}
      {salesStats.topSellingProducts.length > 0 && (
        <View style={[styles.topProductsSection, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Selling Products ({getPeriodLabel()})</Text>
          {salesStats.topSellingProducts.slice(0, 5).map((product, index) => (
            <View key={product.productId} style={[styles.topProductItem, { borderBottomColor: theme.border }]}>
              <View style={[styles.productRank, { backgroundColor: theme.primary }]}>
                <Text style={[styles.rankNumber, { color: 'white' }]}>{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: theme.text }]}>{product.productTitle}</Text>
                <Text style={[styles.productMetrics, { color: theme.textSecondary }]}>
                  {product.totalQuantity} sold • ₹{product.totalRevenue.toLocaleString()} revenue
                </Text>
              </View>
              <FontAwesome5 name="trophy" size={16} color={theme.warning} />
            </View>
          ))}
        </View>
      )}


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companySelector: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  companyList: {
    flexDirection: 'row',
  },
  companyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  selectedCompanyChip: {
  },
  companyChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCompanyChipText: {
    color: 'white',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  primaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  primaryStatCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryStatGradient: {
    padding: 20,
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
    borderRadius: 16,
  },
  primaryStatContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  primaryStatIcon: {
    marginBottom: 12,
  },
  primaryStatNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    minHeight: 38,
    textAlignVertical: 'center',
  },
  primaryStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 90,
    justifyContent: 'center',
  },
  secondaryStatContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  secondaryStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
    minHeight: 24,
    textAlignVertical: 'center',
  },
  secondaryStatLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  valueCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  valueAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  valueLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  valueSubtext: {
    fontSize: 14,
  },
  salesSection: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  salesHeader: {
    marginBottom: 20,
  },
  salesSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activePeriodButtonText: {
    fontWeight: '600',
  },
  salesStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  salesStatCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  salesStatGradient: {
    padding: 16,
    alignItems: 'center',
  },
  salesStatIcon: {
    marginBottom: 8,
  },
  salesStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  salesStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 2,
  },
  salesStatPeriod: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  additionalMetrics: {
    borderRadius: 12,
    padding: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  topProductsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  productMetrics: {
    fontSize: 12,
  },
  // PhonePe Style Quick Actions
  quickActionsSection: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAllButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
  },
  quickActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  quickActionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 80,
  },
  metricsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  metricsLoadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default WarehouseOverview;