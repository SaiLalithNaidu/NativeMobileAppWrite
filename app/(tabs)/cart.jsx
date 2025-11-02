import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCart } from '../../contexts/CartContext';

const CartScreen = () => {
  const router = useRouter();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalItems,
    getSubtotal,
    getGST,
    getDeliveryCharges,
    getTotal,
  } = useCart();

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemLeft}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]}>
            <FontAwesome5 name="box" size={24} color="#ccc" />
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.itemOriginalPrice}>₹{item.originalPrice}</Text>
          )}
        </View>
      </View>

      <View style={styles.itemRight}>
        <View style={styles.quantityControl}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => removeFromCart(item.id)}
          >
            <FontAwesome5 name="minus" size={10} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => addToCart(item)}
          >
            <FontAwesome5 name="plus" size={10} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="shopping-cart" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items to get started
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <FontAwesome5 name="trash" size={16} color="#ff6347" />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <View style={styles.invoiceContainer}>
            <Text style={styles.invoiceTitle}>Bill Details</Text>
            
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                Subtotal ({getTotalItems()} items)
              </Text>
              <Text style={styles.billValue}>₹{getSubtotal().toFixed(2)}</Text>
            </View>

            <View style={styles.billRow}>
              <View style={styles.gstContainer}>
                <Text style={styles.billLabel}>GST (18%)</Text>
                <FontAwesome5 name="info-circle" size={12} color="#999" />
              </View>
              <Text style={styles.billValue}>₹{getGST().toFixed(2)}</Text>
            </View>

            <View style={styles.billRow}>
              <View style={styles.deliveryContainer}>
                <Text style={styles.billLabel}>Delivery Charges</Text>
                {getDeliveryCharges() === 0 && (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.billValue, getDeliveryCharges() === 0 && styles.strikethrough]}>
                ₹{getDeliveryCharges() === 0 ? '40' : getDeliveryCharges().toFixed(2)}
              </Text>
            </View>

            {getSubtotal() < 500 && (
              <View style={styles.deliveryTip}>
                <FontAwesome5 name="info-circle" size={12} color="#ff9800" />
                <Text style={styles.deliveryTipText}>
                  Add ₹{(500 - getSubtotal()).toFixed(2)} more for FREE delivery
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{getTotal().toFixed(2)}</Text>
            </View>

            <View style={styles.savingsContainer}>
              <FontAwesome5 name="check-circle" size={14} color="#28a745" />
              <Text style={styles.savingsText}>
                You're saving ₹{cartItems.reduce((total, item) => {
                  if (item.originalPrice) {
                    return total + ((item.originalPrice - item.price) * item.quantity);
                  }
                  return total;
                }, 0).toFixed(2)} on this order!
              </Text>
            </View>
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerTotal}>₹{getTotal().toFixed(2)}</Text>
          <Text style={styles.footerSubtext}>{getTotalItems()} items</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
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
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#28a745',
    marginBottom: 2,
  },
  itemOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'coral',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  invoiceContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 15,
    color: '#666',
  },
  billValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  gstContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freeBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deliveryTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  deliveryTipText: {
    flex: 1,
    fontSize: 13,
    color: '#f57c00',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#28a745',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  savingsText: {
    flex: 1,
    fontSize: 13,
    color: '#28a745',
    fontWeight: '600',
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
    backgroundColor: 'coral',
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