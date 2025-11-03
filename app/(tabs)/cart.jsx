/**
 * Cart Screen
 * Displays user's shopping cart with items, bill summary, and checkout
 * 
 * Architecture:
 * - Service Layer: cartService.js (calculations)
 * - Component Layer: CartItem, BillSummary, EmptyCart
 * - Context: CartContext (state management)
 */

import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { COLORS } from '../../src/utils/constants';
import { BillSummary } from '../components/cart/BillSummary';
import { CartItem } from '../components/cart/CartItem';
import { EmptyCart } from '../components/cart/EmptyCart';
import { getCartSummary } from '../services/cartService';

const CartScreen = () => {
  const router = useRouter();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
  } = useCart();

  // Get cart summary using service
  const cartSummary = getCartSummary(cartItems);

  const renderCartItem = ({ item }) => (
    <CartItem 
      item={item}
      onIncrease={addToCart}
      onDecrease={removeFromCart}
    />
  );

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <EmptyCart />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <FontAwesome5 name="trash" size={16} color={COLORS.ERROR} />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={<BillSummary summary={cartSummary} />}
      />

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerTotal}>₹{cartSummary.total.toFixed(2)}</Text>
          <Text style={styles.footerSubtext}>{cartSummary.itemCount} items</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <FontAwesome5 name="arrow-right" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff5f5',
  },
  clearButtonText: {
    color: '#ff6347',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  footerLeft: {
    flex: 1,
  },
  footerTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  footerSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartScreen;