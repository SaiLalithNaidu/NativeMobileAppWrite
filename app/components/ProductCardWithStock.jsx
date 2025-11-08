/**
 * Enhanced Product Card with Stock Status
 * Displays product information with integrated stock status and availability
 * 
 * Usage:
 * <ProductCardWithStock 
 *   product={productData}
 *   inventory={inventoryData}
 *   onAddToCart={handleAddToCart}
 *   onViewDetails={handleViewDetails}
 * />
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { InventoryService } from '../services/inventoryService';
import StockStatusBadge from './StockStatusBadge';

const ProductCardWithStock = ({ 
  product,
  inventory = null,
  onAddToCart = null,
  onViewDetails = null,
  style = 'card', // 'card', 'list', 'minimal'
  showStockDetails = true
}) => {
  const [stockInfo, setStockInfo] = useState(inventory);
  const [loading, setLoading] = useState(!inventory);

  useEffect(() => {
    const loadStockInfo = async () => {
      if (!inventory && product.id) {
        try {
          setLoading(true);
          const inventoryData = await InventoryService.getProductInventory(product.id);
          setStockInfo(inventoryData);
        } catch (error) {
          console.error('Error fetching stock info:', error);
          setStockInfo({
            quantity: 0,
            isOutOfStock: true,
            isLowStock: false,
            lowStockThreshold: 5
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadStockInfo();
  }, [product.id, inventory]);



  const handleAddToCart = () => {
    if (!stockInfo || stockInfo.isOutOfStock) {
      Alert.alert(
        'Out of Stock',
        'This product is currently out of stock and cannot be added to cart.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const isAvailable = stockInfo && !stockInfo.isOutOfStock;
  const formatPrice = (price) => `₹${price?.toLocaleString() || 0}`;

  if (style === 'minimal') {
    return (
      <View style={styles.minimalCard}>
        <View style={styles.minimalContent}>
          <Text style={styles.minimalTitle} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={styles.minimalPrice}>
            {formatPrice(product.price)}
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <StockStatusBadge 
            quantity={stockInfo?.quantity || 0}
            lowStockThreshold={stockInfo?.lowStockThreshold || 5}
            isOutOfStock={stockInfo?.isOutOfStock || false}
            size="small"
            style="badge"
          />
        )}
      </View>
    );
  }

  if (style === 'list') {
    return (
      <TouchableOpacity 
        style={[styles.listCard, !isAvailable && styles.unavailableCard]}
        onPress={onViewDetails}
        activeOpacity={0.7}
      >
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.listImage} />
        ) : (
          <View style={styles.listImagePlaceholder}>
            <FontAwesome5 name="image" size={24} color="#9ca3af" />
          </View>
        )}
        
        <View style={styles.listContent}>
          <Text style={[styles.listTitle, !isAvailable && styles.unavailableText]} numberOfLines={2}>
            {product.title}
          </Text>
          
          {product.description && (
            <Text style={styles.listDescription} numberOfLines={1}>
              {product.description}
            </Text>
          )}
          
          <View style={styles.listFooter}>
            <View style={styles.priceContainer}>
              <Text style={[styles.listPrice, !isAvailable && styles.unavailableText]}>
                {formatPrice(product.price)}
              </Text>
              {product.originalPrice && product.originalPrice > product.price && (
                <Text style={styles.listOriginalPrice}>
                  {formatPrice(product.originalPrice)}
                </Text>
              )}
            </View>
            
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : showStockDetails ? (
              <StockStatusBadge 
                quantity={stockInfo?.quantity || 0}
                lowStockThreshold={stockInfo?.lowStockThreshold || 5}
                isOutOfStock={stockInfo?.isOutOfStock || false}
                size="small"
                style="badge"
              />
            ) : null}
          </View>
        </View>
        
        {onAddToCart && (
          <TouchableOpacity 
            style={[styles.listAddButton, !isAvailable && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={!isAvailable}
          >
            <FontAwesome5 
              name={isAvailable ? "plus" : "times"} 
              size={16} 
              color={isAvailable ? "#059669" : "#9ca3af"} 
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  // Default card style
  return (
    <TouchableOpacity 
      style={[styles.card, !isAvailable && styles.unavailableCard]}
      onPress={onViewDetails}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <FontAwesome5 name="image" size={32} color="#9ca3af" />
          </View>
        )}
        
        {!isAvailable && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}
        
        {loading ? (
          <View style={styles.stockBadgeContainer}>
            <ActivityIndicator size="small" color="#666" />
          </View>
        ) : showStockDetails ? (
          <View style={styles.stockBadgeContainer}>
            <StockStatusBadge 
              quantity={stockInfo?.quantity || 0}
              lowStockThreshold={stockInfo?.lowStockThreshold || 5}
              isOutOfStock={stockInfo?.isOutOfStock || false}
              size="small"
              style="badge"
            />
          </View>
        ) : null}
      </View>
      
      <View style={styles.cardContent}>
        <Text style={[styles.productTitle, !isAvailable && styles.unavailableText]} numberOfLines={2}>
          {product.title}
        </Text>
        
        {product.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={[styles.productPrice, !isAvailable && styles.unavailableText]}>
            {formatPrice(product.price)}
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
        </View>
        
        {onAddToCart && (
          <TouchableOpacity 
            style={[styles.addToCartButton, !isAvailable && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={!isAvailable}
          >
            <FontAwesome5 
              name={isAvailable ? "shopping-cart" : "times-circle"} 
              size={14} 
              color="white" 
              style={styles.buttonIcon}
            />
            <Text style={styles.addToCartText}>
              {isAvailable ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Card Style
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    margin: 8,
    overflow: 'hidden',
  },
  unavailableCard: {
    opacity: 0.7,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  stockBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cardContent: {
    padding: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 22,
  },
  productDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonIcon: {
    marginRight: 6,
  },
  addToCartText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  unavailableText: {
    color: '#9ca3af',
  },

  // List Style
  listCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    alignItems: 'center',
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  listImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  listDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginRight: 6,
  },
  listOriginalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  listAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },

  // Minimal Style
  minimalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 2,
  },
  minimalContent: {
    flex: 1,
    marginRight: 12,
  },
  minimalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  minimalPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
});

export default ProductCardWithStock;