/**
 * EmptyCart Component
 * Displays empty state when cart has no items
 * 
 * Props:
 * - onContinueShopping: function - Optional callback for continue shopping button
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const EmptyCart = ({ onContinueShopping }) => {
  return (
    <View style={styles.container}>
      <FontAwesome5 name="shopping-cart" size={80} color="#ddd" />
      <Text style={styles.title}>Your cart is empty</Text>
      <Text style={styles.subtitle}>
        Add items to get started
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default EmptyCart;
