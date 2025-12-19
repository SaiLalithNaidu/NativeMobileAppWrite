/**
 * CartItem Component
 * Displays a single cart item with image, details, quantity controls, and remove option
 * 
 * Props:
 * - item: object - Cart item data
 * - onIncrease: function - Handler to increase quantity
 * - onDecrease: function - Handler to decrease quantity
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

export const CartItem = ({ item, onIncrease, onDecrease }) => {
  const { theme } = useTheme();
  if (!item) return null;

  const itemTotal = (item.price * item.quantity).toFixed(2);

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.itemLeft}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage, { backgroundColor: theme.iconBackground }]}>
            <FontAwesome5 name="box" size={24} color={theme.textLight} />
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.itemPrice, { color: theme.primary }]}>₹{item.price}</Text>
          {item.originalPrice && (
            <Text style={[styles.itemOriginalPrice, { color: theme.textSecondary }]}>₹{item.originalPrice}</Text>
          )}
        </View>
      </View>

      <View style={styles.itemRight}>
        <View style={[styles.quantityControl, { backgroundColor: theme.primary }]}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onDecrease(item.id)}
          >
            <FontAwesome5 name="minus" size={10} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onIncrease(item)}
          >
            <FontAwesome5 name="plus" size={10} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.itemTotal, { color: theme.text }]}>₹{itemTotal}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemOriginalPrice: {
    fontSize: 12,
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
  },
});

export default CartItem;
