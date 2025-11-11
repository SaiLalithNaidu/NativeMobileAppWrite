/**
 * Orders Screen (Admin Panel Tab)
 * Displays all orders with payment tracking functionality
 * 
 * Features:
 * - List all orders from Firebase
 * - Show payment status (paid vs pending)
 * - Update payment amounts
 * - View order details
 * - Filter by status
 */

import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { db } from '../../lib/firebase';
import { COLORS } from '../../src/utils/constants';
import OrdersSkeleton from '../components/skeletons/OrdersSkeleton';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, paid, partial
  const [searchQuery, setSearchQuery] = useState('');

  // Reload orders whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  /**
   * Load all orders from Firebase
   */
  const loadOrders = async () => {
    try {
      console.log('📥 Loading orders...');
      setLoading(true);

      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('✅ Orders loaded:', ordersData.length);
      setOrders(ordersData);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load orders',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull to refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  /**
   * Get payment status for an order
   */
  const getPaymentStatus = (order) => {
    const totalAmount = order.billing?.total || 0;
    const paidAmount = order.payment?.paidAmount || 0;

    if (paidAmount === 0) {
      return { status: 'pending', label: 'Not Paid', color: COLORS.ERROR };
    } else if (paidAmount >= totalAmount) {
      return { status: 'paid', label: 'Paid', color: COLORS.SUCCESS };
    } else {
      return { status: 'partial', label: 'Partial', color: COLORS.WARNING };
    }
  };

  /**
   * Filter orders based on selected filter and search query
   */
  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by payment status
    if (filter !== 'all') {
      filtered = filtered.filter(order => {
        const paymentStatus = getPaymentStatus(order);
        return paymentStatus.status === filter;
      });
    }

    // Filter by search query (name or phone)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => {
        const customerName = (order.customer?.name || '').toLowerCase();
        const customerPhone = (order.customer?.phone || '').toLowerCase();
        const orderId = (order.orderId || '').toLowerCase();
        
        return customerName.includes(query) || 
               customerPhone.includes(query) ||
               orderId.includes(query);
      });
    }

    return filtered;
  };

  /**
   * Navigate to order detail screen
   */
  const handleOrderPress = (order) => {
    router.push({
      pathname: '/orderDetail',
      params: {
        orderId: order.id,
        orderData: JSON.stringify(order),
      },
    });
  };

  /**
   * Render order card
   */
  const renderOrderItem = ({ item: order }) => {
    const totalAmount = order.billing?.total || 0;
    const paidAmount = order.payment?.paidAmount || 0;
    const pendingAmount = totalAmount - paidAmount;
    const paymentStatus = getPaymentStatus(order);
    const itemCount = order.billing?.itemCount || 0;
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.orderDate);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(order)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderId}>{order.orderId}</Text>
            <Text style={styles.orderDate}>
              {orderDate.toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: paymentStatus.color + '20' }]}>
            <Text style={[styles.statusText, { color: paymentStatus.color }]}>
              {paymentStatus.label}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <FontAwesome5 name="user" size={14} color="#666" />
          <Text style={styles.customerName}>{order.customer?.name || 'Unknown'}</Text>
          {order.customer?.phone && (
            <>
              <Text style={styles.separator}>•</Text>
              <FontAwesome5 name="phone" size={12} color="#666" />
              <Text style={styles.customerPhone}>{order.customer.phone}</Text>
            </>
          )}
        </View>

        {/* Items Count */}
        <View style={styles.itemsInfo}>
          <FontAwesome5 name="box" size={14} color="#666" />
          <Text style={styles.itemsText}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Paid Amount:</Text>
            <Text style={[styles.paidAmount, paidAmount > 0 && { color: COLORS.SUCCESS }]}>
              ₹{paidAmount.toFixed(2)}
            </Text>
          </View>
          {pendingAmount > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Pending Amount:</Text>
              <Text style={styles.pendingAmount}>₹{pendingAmount.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* View Details */}
        <View style={styles.viewDetailsRow}>
          <Text style={styles.viewDetailsText}>Tap to view & update</Text>
          <AntDesign name="right" size={14} color={COLORS.PRIMARY} />
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render filter buttons
   */
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
          All ({orders.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
        onPress={() => setFilter('pending')}
      >
        <Text style={[styles.filterButtonText, filter === 'pending' && styles.filterButtonTextActive]}>
          Not Paid
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'partial' && styles.filterButtonActive]}
        onPress={() => setFilter('partial')}
      >
        <Text style={[styles.filterButtonText, filter === 'partial' && styles.filterButtonTextActive]}>
          Partial
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'paid' && styles.filterButtonActive]}
        onPress={() => setFilter('paid')}
      >
        <Text style={[styles.filterButtonText, filter === 'paid' && styles.filterButtonTextActive]}>
          Paid
        </Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="receipt" size={64} color="#ddd" />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all' 
          ? 'Orders will appear here once customers start placing them'
          : `No orders with "${filter}" status`}
      </Text>
    </View>
  );

  // Loading state
  if (loading) {
    return <OrdersSkeleton />;
  }

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <Text style={styles.headerSubtitle}>
          Track payments and order status
        </Text>
      </View> */}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or order ID..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <FontAwesome5 name="times-circle" size={16} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {renderFilters()}

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      />

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: COLORS.ACCENT_LIGHT,
    borderColor: COLORS.PRIMARY,
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.PRIMARY,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  customerName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  separator: {
    color: '#ccc',
    marginHorizontal: 4,
  },
  customerPhone: {
    fontSize: 13,
    color: '#666',
  },
  itemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  itemsText: {
    fontSize: 13,
    color: '#666',
  },
  paymentSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ERROR,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewDetailsText: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
