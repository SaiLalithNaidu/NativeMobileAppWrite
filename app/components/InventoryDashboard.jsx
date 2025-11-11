/**
 * Inventory Management Dashboard
 * Admin interface for managing stock levels, viewing analytics, and tracking inventory
 * 
 * Features:
 * - Real-time inventory overview
 * - Stock alerts and notifications
 * - Bulk inventory updates
 * - Sales analytics integration
 * - Low stock and out of stock management
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SkeletonInventoryItem, SkeletonStatCardRow } from '../components/SkeletonLoader';
import StockAlert from '../components/StockAlert';
import StockStatusBadge from '../components/StockStatusBadge';
import { InventoryService } from '../services/inventoryService';
import { OrderProcessingService } from '../services/orderProcessingService';
import { SalesAnalyticsService } from '../services/salesAnalyticsService';

const InventoryDashboard = ({ companyId, companyName = "Company" }) => {
  // State management
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [restockModal, setRestockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [restockLoading, setRestockLoading] = useState(false);

  // Analytics period
  const [analyticsPeriod, setAnalyticsPeriod] = useState('today'); // today, week, month

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        // Load inventory data
        const inventoryData = await InventoryService.getCompanyInventory(companyId);
        setInventory(inventoryData);

        // Load alerts
        const [lowStockAlerts, outOfStockAlerts] = await Promise.all([
          OrderProcessingService.getLowStockAlerts(companyId),
          OrderProcessingService.getOutOfStockAlerts(companyId)
        ]);
        
        setAlerts([...outOfStockAlerts, ...lowStockAlerts]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        Alert.alert('Error', 'Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [companyId]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        let salesData;
        
        switch (analyticsPeriod) {
          case 'today':
            salesData = await SalesAnalyticsService.getDailySales(companyId);
            break;
          case 'week':
            salesData = await SalesAnalyticsService.getWeeklySales(companyId);
            break;
          case 'month':
            salesData = await SalesAnalyticsService.getMonthlySales(companyId);
            break;
          default:
            salesData = await SalesAnalyticsService.getDailySales(companyId);
        }
        
        setSalesSummary(salesData);
      } catch (error) {
        console.error('Error loading sales analytics:', error);
      }
    };

    loadAnalytics();
  }, [analyticsPeriod, companyId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load inventory data
      const inventoryData = await InventoryService.getCompanyInventory(companyId);
      setInventory(inventoryData);

      // Load alerts
      const [lowStockAlerts, outOfStockAlerts] = await Promise.all([
        OrderProcessingService.getLowStockAlerts(companyId),
        OrderProcessingService.getOutOfStockAlerts(companyId)
      ]);
      
      setAlerts([...outOfStockAlerts, ...lowStockAlerts]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesAnalytics = async () => {
    try {
      let salesData;
      
      switch (analyticsPeriod) {
        case 'today':
          salesData = await SalesAnalyticsService.getDailySales(companyId);
          break;
        case 'week':
          salesData = await SalesAnalyticsService.getWeeklySales(companyId);
          break;
        case 'month':
          salesData = await SalesAnalyticsService.getMonthlySales(companyId);
          break;
        default:
          salesData = await SalesAnalyticsService.getDailySales(companyId);
      }
      
      setSalesSummary(salesData);
    } catch (error) {
      console.error('Error loading sales analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboardData(), loadSalesAnalytics()]);
    setRefreshing(false);
  };

  const handleRestock = (productId) => {
    const product = inventory.find(item => item.productId === productId);
    setSelectedProduct(product);
    setRestockModal(true);
  };

  const processRestock = async () => {
    if (!selectedProduct || !restockQuantity || isNaN(restockQuantity)) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    try {
      setRestockLoading(true);
      
      await InventoryService.restockProduct(
        selectedProduct.productId,
        parseInt(restockQuantity),
        'admin_restock'
      );

      Alert.alert('Success', 'Product restocked successfully');
      setRestockModal(false);
      setRestockQuantity('');
      setSelectedProduct(null);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error restocking product:', error);
      Alert.alert('Error', 'Failed to restock product');
    } finally {
      setRestockLoading(false);
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const getInventoryStats = () => {
    const totalProducts = inventory.length;
    const inStock = inventory.filter(item => !item.isOutOfStock).length;
    const lowStock = inventory.filter(item => item.isLowStock).length;
    const outOfStock = inventory.filter(item => item.isOutOfStock).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);

    return { totalProducts, inStock, lowStock, outOfStock, totalValue };
  };

  const stats = getInventoryStats();

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <View>
            <View style={{ width: 180, height: 18, backgroundColor: '#e5e7eb', borderRadius: 6, marginBottom: 8 }} />
            <View style={{ width: 120, height: 14, backgroundColor: '#e5e7eb', borderRadius: 6 }} />
          </View>
        </View>

        {/* Stats Skeleton */}
        <View style={styles.statsContainer}>
          <SkeletonStatCardRow />
          <SkeletonStatCardRow />
        </View>

        {/* Sales Summary Skeleton */}
        <View style={styles.analyticsSection}>
          <View style={{ height: 18, width: 140, backgroundColor: '#e5e7eb', borderRadius: 6, marginBottom: 16 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {[0,1,2].map((i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <View style={{ height: 20, width: 60, backgroundColor: '#e5e7eb', borderRadius: 6, marginBottom: 6 }} />
                <View style={{ height: 12, width: 50, backgroundColor: '#e5e7eb', borderRadius: 6 }} />
              </View>
            ))}
          </View>
        </View>

        {/* Inventory List Skeleton */}
        <View style={styles.inventorySection}>
          <View style={{ height: 18, width: 160, backgroundColor: '#e5e7eb', borderRadius: 6, marginBottom: 12 }} />
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonInventoryItem key={idx} />
          ))}
        </View>
      </ScrollView>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Dashboard</Text>
        <Text style={styles.headerSubtitle}>{companyName}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.totalCard]}>
            <FontAwesome5 name="boxes" size={24} color="#2563eb" />
            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          
          <View style={[styles.statCard, styles.inStockCard]}>
            <FontAwesome5 name="check-circle" size={24} color="#059669" />
            <Text style={styles.statNumber}>{stats.inStock}</Text>
            <Text style={styles.statLabel}>In Stock</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.lowStockCard]}>
            <FontAwesome5 name="exclamation-triangle" size={24} color="#d97706" />
            <Text style={styles.statNumber}>{stats.lowStock}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          
          <View style={[styles.statCard, styles.outOfStockCard]}>
            <FontAwesome5 name="times-circle" size={24} color="#dc2626" />
            <Text style={styles.statNumber}>{stats.outOfStock}</Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>
      </View>

      {/* Sales Analytics Toggle */}
      <View style={styles.analyticsSection}>
        <Text style={styles.sectionTitle}>Sales Analytics</Text>
        <View style={styles.periodSelector}>
          {['today', 'week', 'month'].map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                analyticsPeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setAnalyticsPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                analyticsPeriod === period && styles.activePeriodButtonText
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {salesSummary && (
          <View style={styles.salesSummaryCard}>
            <View style={styles.salesRow}>
              <View style={styles.salesStat}>
                <Text style={styles.salesNumber}>{salesSummary.totalOrders || 0}</Text>
                <Text style={styles.salesLabel}>Orders</Text>
              </View>
              <View style={styles.salesStat}>
                <Text style={styles.salesNumber}>₹{(salesSummary.totalRevenue || 0).toLocaleString()}</Text>
                <Text style={styles.salesLabel}>Revenue</Text>
              </View>
              <View style={styles.salesStat}>
                <Text style={styles.salesNumber}>{salesSummary.totalItems || 0}</Text>
                <Text style={styles.salesLabel}>Items Sold</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Stock Alerts</Text>
          <StockAlert 
            alerts={alerts}
            onDismiss={dismissAlert}
            onRestock={handleRestock}
            maxVisible={3}
          />
        </View>
      )}

      {/* Inventory List */}
      <View style={styles.inventorySection}>
        <Text style={styles.sectionTitle}>Inventory Overview</Text>
        
        {inventory.map((item, index) => (
          <View key={item.id || index} style={styles.inventoryItem}>
            <View style={styles.inventoryInfo}>
              <Text style={styles.inventoryTitle}>Product {item.productId}</Text>
              <Text style={styles.inventoryQuantity}>
                Quantity: {item.quantity}
              </Text>
              {item.lowStockThreshold && (
                <Text style={styles.inventoryThreshold}>
                  Threshold: {item.lowStockThreshold}
                </Text>
              )}
            </View>
            
            <View style={styles.inventoryActions}>
              <StockStatusBadge 
                quantity={item.quantity}
                lowStockThreshold={item.lowStockThreshold}
                isOutOfStock={item.isOutOfStock}
                size="small"
                style="badge"
              />
              
              <TouchableOpacity 
                style={styles.restockButton}
                onPress={() => handleRestock(item.productId)}
              >
                <FontAwesome5 name="plus" size={12} color="#059669" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Restock Modal */}
      <Modal
        visible={restockModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRestockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Restock Product</Text>
              <TouchableOpacity 
                onPress={() => setRestockModal(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome5 name="times" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            
            {selectedProduct && (
              <View style={styles.modalContent}>
                <Text style={styles.modalProductInfo}>
                  Product ID: {selectedProduct.productId}
                </Text>
                <Text style={styles.modalCurrentStock}>
                  Current Stock: {selectedProduct.quantity}
                </Text>
                
                <Text style={styles.inputLabel}>Quantity to Add:</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={restockQuantity}
                  onChangeText={setRestockQuantity}
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                />
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setRestockModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.confirmButton, restockLoading && styles.disabledButton]}
                    onPress={processRestock}
                    disabled={restockLoading}
                  >
                    {restockLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Restock</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  analyticsSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
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
  salesSummaryCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  salesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  salesStat: {
    alignItems: 'center',
  },
  salesNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  salesLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertsSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inventorySection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  inventoryQuantity: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 1,
  },
  inventoryThreshold: {
    fontSize: 11,
    color: '#9ca3af',
  },
  inventoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restockButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalProductInfo: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  modalCurrentStock: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  quantityInput: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default InventoryDashboard;