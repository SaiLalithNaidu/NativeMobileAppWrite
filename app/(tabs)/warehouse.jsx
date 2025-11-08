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
import { db } from '../../lib/firebase';
import { SimpleSalesAnalyticsService } from '../services/simpleSalesAnalyticsService';

const WarehouseOverview = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    }, [])
  );

  // Reload sales data when period changes
  React.useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedCompany) return;

      try {
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

        setSalesStats({
          itemsSold: salesData.totalItems || 0,
          totalOrders: salesData.totalOrders || 0,
          totalRevenue: salesData.totalRevenue || 0,
          topSellingProducts: salesData.topProducts || []
        });
      } catch (error) {
        console.error('Error loading sales data:', error);
      }
    };

    loadAnalytics();
  }, [selectedPeriod, selectedCompany]);

  const loadCompanies = async () => {
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
  };

  const loadWarehouseData = async () => {
    try {
      // Get all products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get inventory data
      const inventoryRef = collection(db, 'inventory');
      const inventorySnapshot = await getDocs(inventoryRef);
      const inventory = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

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
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0080ff" />
        <Text style={styles.loadingText}>Loading Warehouse Overview...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#0080ff', '#0066cc', '#004d99']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Warehouse Overview</Text>
              <Text style={styles.headerSubtitle}>Real-time inventory tracking</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <FontAwesome5 name="sync-alt" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Company Selector */}
      {companies.length > 1 && (
        <View style={styles.companySelector}>
          <Text style={styles.selectorLabel}>Select Company:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companyList}>
            {companies.map(company => (
              <TouchableOpacity
                key={company.id}
                style={[
                  styles.companyChip,
                  selectedCompany?.id === company.id && styles.selectedCompanyChip
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
        <Text style={styles.sectionTitle}>Warehouse Statistics</Text>
        
        {/* Primary Stats Row */}
        <View style={styles.primaryStatsRow}>
          <View style={[styles.primaryStatCard, styles.totalProductsCard]}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.primaryStatGradient}
            >
              <FontAwesome5 name="boxes" size={32} color="white" style={styles.primaryStatIcon} />
              <Text style={styles.primaryStatNumber}>{warehouseStats.totalProducts}</Text>
              <Text style={styles.primaryStatLabel}>Total Products</Text>
            </LinearGradient>
          </View>
          
          <View style={[styles.primaryStatCard, styles.totalStockCard]}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.primaryStatGradient}
            >
              <FontAwesome5 name="warehouse" size={32} color="white" style={styles.primaryStatIcon} />
              <Text style={styles.primaryStatNumber}>{warehouseStats.totalStockQuantity}</Text>
              <Text style={styles.primaryStatLabel}>Items in Warehouse</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Secondary Stats Row */}
        <View style={styles.secondaryStatsRow}>
          <View style={[styles.secondaryStatCard, styles.inStockCard]}>
            <FontAwesome5 name="check-circle" size={24} color="#059669" />
            <Text style={styles.secondaryStatNumber}>{warehouseStats.inStockProducts}</Text>
            <Text style={styles.secondaryStatLabel}>In Stock</Text>
          </View>
          
          <View style={[styles.secondaryStatCard, styles.lowStockCard]}>
            <FontAwesome5 name="exclamation-triangle" size={24} color="#d97706" />
            <Text style={styles.secondaryStatNumber}>{warehouseStats.lowStockProducts}</Text>
            <Text style={styles.secondaryStatLabel}>Low Stock</Text>
          </View>
          
          <View style={[styles.secondaryStatCard, styles.outOfStockCard]}>
            <FontAwesome5 name="times-circle" size={24} color="#dc2626" />
            <Text style={styles.secondaryStatNumber}>{warehouseStats.outOfStockProducts}</Text>
            <Text style={styles.secondaryStatLabel}>Out of Stock</Text>
          </View>
        </View>

        {/* Stock Value Card */}
        <View style={styles.valueCard}>
          <View style={styles.valueHeader}>
            <FontAwesome5 name="rupee-sign" size={20} color="#059669" />
            <Text style={styles.valueTitle}>Total Stock Value</Text>
          </View>
          <Text style={styles.valueAmount}>₹{warehouseStats.totalStockValue.toLocaleString()}</Text>
          <Text style={styles.valueSubtext}>Estimated inventory worth</Text>
        </View>
      </View>

      {/* Sales Analytics Section */}
      <View style={styles.salesSection}>
        <View style={styles.salesHeader}>
          <Text style={styles.sectionTitle}>Sales Analytics</Text>
          <Text style={styles.salesSubtitle}>Track items sold and availability</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['today', 'week', 'month', 'year'].map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText
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
              colors={['#ef4444', '#dc2626']}
              style={styles.salesStatGradient}
            >
              <FontAwesome5 name="shopping-bag" size={28} color="white" style={styles.salesStatIcon} />
              <Text style={styles.salesStatNumber}>{salesStats.itemsSold}</Text>
              <Text style={styles.salesStatLabel}>Items Sold</Text>
              <Text style={styles.salesStatPeriod}>({getPeriodLabel()})</Text>
            </LinearGradient>
          </View>
          
          <View style={[styles.salesStatCard, styles.availableCard]}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.salesStatGradient}
            >
              <FontAwesome5 name="check-double" size={28} color="white" style={styles.salesStatIcon} />
              <Text style={styles.salesStatNumber}>{Math.max(0, getAvailableStock())}</Text>
              <Text style={styles.salesStatLabel}>Still Available</Text>
              <Text style={styles.salesStatPeriod}>(Current Stock)</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Additional Sales Metrics */}
        <View style={styles.additionalMetrics}>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <FontAwesome5 name="chart-line" size={16} color="#6b7280" />
              <Text style={styles.metricLabel}>Total Orders</Text>
              <Text style={styles.metricValue}>{salesStats.totalOrders}</Text>
            </View>
            <View style={styles.metricItem}>
              <FontAwesome5 name="rupee-sign" size={16} color="#6b7280" />
              <Text style={styles.metricLabel}>Revenue</Text>
              <Text style={styles.metricValue}>₹{salesStats.totalRevenue.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Top Selling Products */}
      {salesStats.topSellingProducts.length > 0 && (
        <View style={styles.topProductsSection}>
          <Text style={styles.sectionTitle}>Top Selling Products ({getPeriodLabel()})</Text>
          {salesStats.topSellingProducts.slice(0, 5).map((product, index) => (
            <View key={product.productId} style={styles.topProductItem}>
              <View style={styles.productRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle}>{product.productTitle}</Text>
                <Text style={styles.productMetrics}>
                  {product.totalQuantity} sold • ₹{product.totalRevenue.toLocaleString()} revenue
                </Text>
              </View>
              <FontAwesome5 name="trophy" size={16} color="#f59e0b" />
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="plus-circle" size={20} color="#0080ff" />
            <Text style={styles.actionButtonText}>Add Stock</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="chart-bar" size={20} color="#0080ff" />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="bell" size={20} color="#0080ff" />
            <Text style={styles.actionButtonText}>Stock Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
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
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  companyList: {
    flexDirection: 'row',
  },
  companyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 12,
  },
  selectedCompanyChip: {
    backgroundColor: '#0080ff',
  },
  companyChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
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
    color: '#111827',
    marginBottom: 16,
  },
  primaryStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  primaryStatCard: {
    flex: 1,
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
  },
  primaryStatIcon: {
    marginBottom: 12,
  },
  primaryStatNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
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
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  valueCard: {
    backgroundColor: 'white',
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
    color: '#374151',
    marginLeft: 8,
  },
  valueAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  valueSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  salesSection: {
    backgroundColor: 'white',
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
    color: '#6b7280',
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activePeriodButtonText: {
    color: '#111827',
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
    backgroundColor: '#f8fafc',
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
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  topProductsSection: {
    backgroundColor: 'white',
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
    borderBottomColor: '#f3f4f6',
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  productMetrics: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsSection: {
    backgroundColor: 'white',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export default WarehouseOverview;