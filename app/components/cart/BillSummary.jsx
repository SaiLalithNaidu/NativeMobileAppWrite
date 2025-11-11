/**
 * BillSummary Component
 * Displays invoice-style bill summary with all calculations
 * 
 * Props:
 * - summary: object - Cart summary data from cartService
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const BillSummary = ({ summary }) => {
  if (!summary) return null;

  const {
    subtotal,
    gst,
    delivery,
    total,
    savings,
    itemCount,
    amountForFreeDelivery,
    hasFreeDelivery,
  } = summary;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill Details</Text>
      
      {/* Subtotal */}
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>
          Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </Text>
        <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
      </View>

      {/* GST */}
      <View style={styles.billRow}>
        <View style={styles.gstContainer}>
          <Text style={styles.billLabel}>GST (18%)</Text>
          <FontAwesome5 name="info-circle" size={12} color="#999" />
        </View>
        <Text style={styles.billValue}>₹{gst.toFixed(2)}</Text>
      </View>

      {/* Delivery Charges */}
      <View style={styles.billRow}>
        <View style={styles.deliveryContainer}>
          <Text style={styles.billLabel}>Delivery Charges</Text>
          {hasFreeDelivery && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          )}
        </View>
        <Text style={[styles.billValue, hasFreeDelivery && styles.strikethrough]}>
          ₹{hasFreeDelivery ? '40' : delivery.toFixed(2)}
        </Text>
      </View>

      {/* Free Delivery Tip */}
      {!hasFreeDelivery && amountForFreeDelivery > 0 && (
        <View style={styles.deliveryTip}>
          <FontAwesome5 name="info-circle" size={12} color="#ff9800" />
          <Text style={styles.deliveryTipText}>
            Add ₹{amountForFreeDelivery.toFixed(2)} more for FREE delivery
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
      </View>

      {/* Savings */}
      {savings > 0 && (
        <View style={styles.savingsContainer}>
          <FontAwesome5 name="check-circle" size={14} color="#28a745" />
          <Text style={styles.savingsText}>
            You&apos;re saving ₹{savings.toFixed(2)} on this order!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
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
});

export default BillSummary;
