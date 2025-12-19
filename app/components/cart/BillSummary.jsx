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
import { useTheme } from '../../../contexts/ThemeContext';

export const BillSummary = ({ summary }) => {
  const { theme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Bill Details</Text>

      {/* Subtotal */}
      <View style={styles.billRow}>
        <Text style={[styles.billLabel, { color: theme.textSecondary }]}>
          Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </Text>
        <Text style={[styles.billValue, { color: theme.text }]}>₹{subtotal.toFixed(2)}</Text>
      </View>

      {/* GST */}
      <View style={styles.billRow}>
        <View style={styles.gstContainer}>
          <Text style={[styles.billLabel, { color: theme.textSecondary }]}>GST (18%)</Text>
          <FontAwesome5 name="info-circle" size={12} color={theme.textLight} />
        </View>
        <Text style={[styles.billValue, { color: theme.text }]}>₹{gst.toFixed(2)}</Text>
      </View>

      {/* Delivery Charges */}
      <View style={styles.billRow}>
        <View style={styles.deliveryContainer}>
          <Text style={[styles.billLabel, { color: theme.textSecondary }]}>Delivery Charges</Text>
          {hasFreeDelivery && (
            <View style={[styles.freeBadge, { backgroundColor: theme.success }]}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          )}
        </View>
        <Text style={[styles.billValue, hasFreeDelivery && styles.strikethrough, hasFreeDelivery && { color: theme.textSecondary }]}>
          ₹{hasFreeDelivery ? '40' : delivery.toFixed(2)}
        </Text>
      </View>

      {/* Free Delivery Tip */}
      {!hasFreeDelivery && amountForFreeDelivery > 0 && (
        <View style={[styles.deliveryTip, { backgroundColor: theme.warning + '20' }]}>
          <FontAwesome5 name="info-circle" size={12} color={theme.warning} />
          <Text style={[styles.deliveryTipText, { color: theme.warning }]}>
            Add ₹{amountForFreeDelivery.toFixed(2)} more for FREE delivery
          </Text>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
        <Text style={[styles.totalValue, { color: theme.primary }]}>₹{total.toFixed(2)}</Text>
      </View>

      {/* Savings */}
      {savings > 0 && (
        <View style={[styles.savingsContainer, { backgroundColor: theme.primary + '15' }]}>
          <FontAwesome5 name="check-circle" size={14} color={theme.success} />
          <Text style={[styles.savingsText, { color: theme.success }]}>
            You&apos;re saving ₹{savings.toFixed(2)} on this order!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
  billValue: {
    fontSize: 15,
    fontWeight: '600',
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
  },
  deliveryTip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  deliveryTipText: {
    flex: 1,
    fontSize: 13,
  },
  divider: {
    height: 1,
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
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  savingsText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default BillSummary;
