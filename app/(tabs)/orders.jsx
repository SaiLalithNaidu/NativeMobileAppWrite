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
import { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../lib/firebase';
import { COLORS } from '../../src/utils/constants';
import OrdersSkeleton from '../components/skeletons/OrdersSkeleton';

export default function OrdersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
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
        style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}
        onPress={() => handleOrderPress(order)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={[styles.orderHeader, { borderBottomColor: theme.border }]}>
          <View style={styles.orderHeaderLeft}>
            <Text style={[styles.orderId, { color: theme.text }]}>{order.orderId}</Text>
            <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
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
          <FontAwesome5 name="user" size={14} color={theme.textSecondary} />
          <Text style={[styles.customerName, { color: theme.text }]}>{order.customer?.name || 'Unknown'}</Text>
          {order.customer?.phone && (
            <>
              <Text style={[styles.separator, { color: theme.border }]}>•</Text>
              <FontAwesome5 name="phone" size={12} color={theme.textSecondary} />
              <Text style={[styles.customerPhone, { color: theme.textSecondary }]}>{order.customer.phone}</Text>
            </>
          )}
        </View>

        {/* Items Count */}
        <View style={styles.itemsInfo}>
          <FontAwesome5 name="box" size={14} color={theme.textSecondary} />
          <Text style={[styles.itemsText, { color: theme.textSecondary }]}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Payment Info */}
        <View style={[styles.paymentSection, { backgroundColor: theme.iconBackground }]}>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: theme.textSecondary }]}>Total Amount:</Text>
            <Text style={[styles.totalAmount, { color: theme.text }]}>₹{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: theme.textSecondary }]}>Paid Amount:</Text>
            <Text style={[styles.paidAmount, paidAmount > 0 && { color: theme.success }, { color: theme.textSecondary }]}>
              ₹{paidAmount.toFixed(2)}
            </Text>
          </View>
          {pendingAmount > 0 && (
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: theme.textSecondary }]}>Pending Amount:</Text>
              <Text style={[styles.pendingAmount, { color: theme.error }]}>₹{pendingAmount.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* View Details */}
        <View style={styles.viewDetailsRow}>
          <Text style={[styles.viewDetailsText, { color: theme.primary }]}>Tap to view & update</Text>
          <AntDesign name="right" size={14} color={theme.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render filter buttons
   */
  const renderFilters = () => (
    <View style={[styles.filtersContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && [styles.filterButtonActive, { borderColor: theme.primary }]]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterButtonText, filter === 'all' && { color: theme.primary }]}>
          All ({orders.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'pending' && [styles.filterButtonActive, { borderColor: theme.primary }]]}
        onPress={() => setFilter('pending')}
      >
        <Text style={[styles.filterButtonText, filter === 'pending' && { color: theme.primary }]}>
          Not Paid
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'partial' && [styles.filterButtonActive, { borderColor: theme.primary }]]}
        onPress={() => setFilter('partial')}
      >
        <Text style={[styles.filterButtonText, filter === 'partial' && { color: theme.primary }]}>
          Partial
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'paid' && [styles.filterButtonActive, { borderColor: theme.primary }]]}
        onPress={() => setFilter('paid')}
      >
        <Text style={[styles.filterButtonText, filter === 'paid' && { color: theme.primary }]}>
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
      <FontAwesome5 name="receipt" size={64} color={theme.textLight} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Orders Yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {filter === 'll'
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} >
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <Text style={styles.headerSubtitle}>
          Track payments and order status
        </Text>
      </View> */}

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]} >
        <FontAwesome5 name="search" size={16} color={theme.textLight} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name, phone, or order ID..."
          placeholderTextColor={theme.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <FontAwesome5 name="times-circle" size={16} color={theme.textLight} />
          </TouchableOpacity>
        )
        }
      </View >

      {/* Filters */}
      {renderFilters()}

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        scrollEnabled={false}
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
    </ScrollView >
  );
}

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
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextActive: {
  },
  listContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  orderCard: {
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
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
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
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: 4,
  },
  customerPhone: {
    fontSize: 13,
  },
  itemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  itemsText: {
    fontSize: 13,
  },
  paymentSection: {
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
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewDetailsText: {
    fontSize: 13,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
