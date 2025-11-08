/**
 * Stock Status Badge Component
 * Displays stock status with appropriate styling and colors
 * 
 * Usage:
 * <StockStatusBadge 
 *   quantity={10} 
 *   lowStockThreshold={5}
 *   isOutOfStock={false}
 *   style="badge" // or "label" or "detailed"
 * />
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const StockStatusBadge = ({ 
  quantity = 0, 
  lowStockThreshold = 5, 
  isOutOfStock = false,
  style = 'badge',
  size = 'medium'
}) => {
  // Determine stock status
  const getStockStatus = () => {
    if (isOutOfStock || quantity === 0) {
      return {
        status: 'out_of_stock',
        text: 'Out of Stock',
        color: '#dc2626',
        bgColor: '#fef2f2',
        borderColor: '#fecaca',
        icon: 'times-circle'
      };
    } else if (quantity <= lowStockThreshold) {
      return {
        status: 'low_stock',
        text: `Only ${quantity} left`,
        color: '#d97706',
        bgColor: '#fffbeb',
        borderColor: '#fed7aa',
        icon: 'exclamation-triangle'
      };
    } else {
      return {
        status: 'in_stock',
        text: `${quantity} in stock`,
        color: '#059669',
        bgColor: '#ecfdf5',
        borderColor: '#bbf7d0',
        icon: 'check-circle'
      };
    }
  };

  const stockInfo = getStockStatus();
  const sizeStyles = getSizeStyles(size);

  if (style === 'badge') {
    return (
      <View style={[styles.badge, sizeStyles.badge, { 
        backgroundColor: stockInfo.bgColor, 
        borderColor: stockInfo.borderColor 
      }]}>
        <FontAwesome5 
          name={stockInfo.icon} 
          size={sizeStyles.iconSize} 
          color={stockInfo.color} 
          style={styles.badgeIcon}
        />
        <Text style={[styles.badgeText, sizeStyles.text, { color: stockInfo.color }]}>
          {stockInfo.text}
        </Text>
      </View>
    );
  }

  if (style === 'label') {
    return (
      <View style={[styles.label, { backgroundColor: stockInfo.color }]}>
        <Text style={[styles.labelText, sizeStyles.text]}>
          {stockInfo.text}
        </Text>
      </View>
    );
  }

  if (style === 'detailed') {
    return (
      <View style={[styles.detailed, { borderLeftColor: stockInfo.color }]}>
        <View style={styles.detailedHeader}>
          <FontAwesome5 
            name={stockInfo.icon} 
            size={sizeStyles.iconSize} 
            color={stockInfo.color}
          />
          <Text style={[styles.detailedTitle, sizeStyles.text, { color: stockInfo.color }]}>
            Stock Status
          </Text>
        </View>
        <Text style={[styles.detailedText, sizeStyles.text]}>
          {stockInfo.text}
        </Text>
        {!isOutOfStock && quantity <= lowStockThreshold && (
          <Text style={styles.detailedSubtext}>
            Limited availability - order soon!
          </Text>
        )}
      </View>
    );
  }

  return null;
};

const getSizeStyles = (size) => {
  switch (size) {
    case 'small':
      return {
        badge: { paddingHorizontal: 6, paddingVertical: 2 },
        text: { fontSize: 10 },
        iconSize: 8
      };
    case 'large':
      return {
        badge: { paddingHorizontal: 12, paddingVertical: 6 },
        text: { fontSize: 16 },
        iconSize: 16
      };
    default: // medium
      return {
        badge: { paddingHorizontal: 8, paddingVertical: 4 },
        text: { fontSize: 12 },
        iconSize: 12
      };
  }
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontWeight: '600',
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailed: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailedTitle: {
    fontWeight: '600',
    marginLeft: 8,
  },
  detailedText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  detailedSubtext: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default StockStatusBadge;