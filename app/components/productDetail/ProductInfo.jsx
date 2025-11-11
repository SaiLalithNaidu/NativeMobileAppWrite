/**
 * ProductInfo Component
 * Displays product information including title, price, description, and add to cart
 * 
 * Props:
 * - product: object - Product data
 * - onAddToCart: function - Add to cart handler
 * - onRemoveFromCart: function - Remove from cart handler
 * - quantity: number - Current quantity in cart
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../src/utils/constants';
import { InventoryService } from '../../services/inventoryService';

export const ProductInfo = ({ product, onAddToCart, onRemoveFromCart, quantity }) => {
  const [stockInfo, setStockInfo] = useState(null);
  const [loadingStock, setLoadingStock] = useState(true);

  useEffect(() => {
    const loadStockInfo = async () => {
      if (!product?.id) return;
      
      try {
        setLoadingStock(true);
        const inventory = await InventoryService.getProductInventory(product.id);
        
        // If no inventory record exists, treat as out of stock
        if (!inventory) {
          setStockInfo({
            quantity: 0,
            isOutOfStock: true,
            isLowStock: false,
            lowStockThreshold: 5
          });
        } else {
          setStockInfo(inventory);
        }
      } catch (error) {
        console.error('Error fetching product stock:', error);
        setStockInfo({
          quantity: 0,
          isOutOfStock: true,
          isLowStock: false,
          lowStockThreshold: 5
        });
      } finally {
        setLoadingStock(false);
      }
    };

    loadStockInfo();
  }, [product?.id]);

  if (!product) return null;

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>{product.title}</Text>

      {/* Rating & Reviews (Placeholder) */}
      <View style={styles.ratingContainer}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>4.3 ⭐</Text>
        </View>
        <Text style={styles.reviewText}>2,547 ratings & 345 reviews</Text>
      </View>

      {/* Price Section */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{product.price}</Text>
        {product.originalPrice && (
          <>
            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          </>
        )}
      </View>

      {/* Description */}
      {product.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      )}

      {/* Specifications (Placeholder) */}
      <View style={styles.specificationsSection}>
        <Text style={styles.sectionTitle}>Specifications</Text>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Brand</Text>
          <Text style={styles.specValue}>Original Product</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Condition</Text>
          <Text style={styles.specValue}>Brand New</Text>
        </View>
      </View>

      {/* Stock Information */}
      <View style={styles.stockSection}>
        {loadingStock ? (
          <View style={styles.loadingStock}>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            <Text style={styles.loadingStockText}>Checking stock...</Text>
          </View>
        ) : stockInfo ? (
          <>
            <View style={styles.stockInfo}>
              <FontAwesome5 
                name={stockInfo.isOutOfStock ? "times-circle" : "check-circle"} 
                size={16} 
                color={stockInfo.isOutOfStock ? "#dc2625" : "#059669"} 
              />
              <Text style={[
                styles.stockText, 
                stockInfo.isOutOfStock && styles.outOfStockText,
                stockInfo.isLowStock && !stockInfo.isOutOfStock && styles.lowStockText
              ]}>
                {stockInfo.isOutOfStock 
                  ? "Out of Stock" 
                  : stockInfo.isLowStock 
                    ? `Low Stock (${stockInfo.quantity} left)`
                    : `In Stock (${stockInfo.quantity} available)`
                }
              </Text>
            </View>
            
            {stockInfo.isLowStock && !stockInfo.isOutOfStock && (
              <Text style={styles.lowStockWarning}>
                ⚠️ Only {stockInfo.quantity} items left!
              </Text>
            )}
          </>
        ) : (
          <View style={styles.stockInfo}>
            <FontAwesome5 name="question-circle" size={16} color="#9ca3af" />
            <Text style={styles.stockText}>Stock information unavailable</Text>
          </View>
        )}
      </View>

      {/* Add to Cart Section */}
      <View style={styles.cartSection}>
        {stockInfo?.isOutOfStock ? (
          <View style={[styles.addToCartButton, styles.outOfStockButton]}>
            <FontAwesome5 name="times-circle" size={18} color="white" />
            <Text style={styles.outOfStockButtonText}>OUT OF STOCK</Text>
          </View>
        ) : quantity === 0 ? (
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              loadingStock && styles.disabledButton
            ]}
            onPress={onAddToCart}
            disabled={loadingStock || stockInfo?.isOutOfStock}
          >
            <FontAwesome5 name="shopping-cart" size={18} color="white" />
            <Text style={styles.addToCartText}>ADD TO CART</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityControl}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={onRemoveFromCart}
            >
              <FontAwesome5 name="minus" size={16} color="white" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={[
                styles.quantityButton,
                quantity >= (stockInfo?.quantity || 0) && styles.disabledQuantityButton
              ]}
              onPress={onAddToCart}
              disabled={quantity >= (stockInfo?.quantity || 0)}
            >
              <FontAwesome5 
                name="plus" 
                size={16} 
                color={quantity >= (stockInfo?.quantity || 0) ? "#ccc" : "white"} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    lineHeight: 28,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  ratingBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 13,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.PRIMARY,
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  specificationsSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specLabel: {
    fontSize: 14,
    color: '#666',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cartSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    minWidth: 40,
    textAlign: 'center',
  },

  // Stock Status Styles
  stockSection: {
    marginBottom: 20,
  },
  loadingStock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    gap: 10,
  },
  loadingStockText: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    gap: 10,
  },
  stockText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  outOfStockText: {
    color: '#dc2625',
  },
  lowStockText: {
    color: '#f59e0b',
  },
  lowStockWarning: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    marginTop: 8,
  },
  outOfStockButton: {
    backgroundColor: '#9ca3af',
  },
  outOfStockButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledQuantityButton: {
    opacity: 0.5,
  },
});

export default ProductInfo;
