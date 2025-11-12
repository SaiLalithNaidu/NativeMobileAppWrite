import { FontAwesome5 } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useCart } from '../contexts/CartContext';
import { db } from '../lib/firebase';
import { COLORS } from '../src/utils/constants';
import { SkeletonProductGrid } from './components/SkeletonLoader';
import { InventoryService } from './services/inventoryService';

const ProductsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart, removeFromCart, getItemQuantity, getTotalItems, getTotal } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockStatus, setStockStatus] = useState({});
  const [stockLoading, setStockLoading] = useState(false);
  
  // Extract simple params
  const { companyId, companyName, categoryId, categoryName } = params;

  // Load stock status for products - OPTIMIZED with batch loading
  const loadStockStatus = useCallback(async (productList) => {
    try {
      setStockLoading(true);
      
      // Extract product IDs
      const productIds = productList.map(p => p.id);
      
      // Use batch inventory fetch (single optimized query)
      const inventoryData = await InventoryService.getBatchProductInventory(productIds);
      
      // Fill in missing products with out-of-stock data
      const stockData = {};
      productList.forEach(product => {
        stockData[product.id] = inventoryData[product.id] || {
          quantity: 0,
          isOutOfStock: true,
          isLowStock: false,
          lowStockThreshold: 5
        };
      });
      
      setStockStatus(stockData);
    } catch (error) {
      console.error('Error loading stock status:', error);
      // Set all products as out of stock on error
      const stockData = {};
      productList.forEach(product => {
        stockData[product.id] = {
          quantity: 0,
          isOutOfStock: true,
          isLowStock: false,
          lowStockThreshold: 5
        };
      });
      setStockStatus(stockData);
    } finally {
      setStockLoading(false);
    }
  }, []);

  // Stock-aware add to cart
  const addToCartWithValidation = useCallback(async (product) => {
    const itemStock = stockStatus[product.id];
    
    if (!itemStock || itemStock.isOutOfStock) {
      Toast.show({
        type: 'error',
        text1: 'Out of Stock',
        text2: `${product.title} is currently out of stock`,
      });
      return;
    }

    const currentQuantityInCart = getItemQuantity(product.id);
    
    if (currentQuantityInCart >= itemStock.quantity) {
      Toast.show({
        type: 'error',
        text1: 'Insufficient Stock',
        text2: `Only ${itemStock.quantity} items available`,
      });
      return;
    }

    addToCart(product);
    
    if (itemStock.isLowStock && currentQuantityInCart + 1 === itemStock.quantity) {
      Toast.show({
        type: 'info',
        text1: 'Last Item',
        text2: `This is the last ${product.title} in stock!`,
      });
    }
  }, [stockStatus, getItemQuantity, addToCart]);

  // Stock-aware remove from cart
  const removeFromCartWithValidation = useCallback((productId) => {
    removeFromCart(productId);
  }, [removeFromCart]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching products with:', { companyId, categoryId });
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('companyId', '==', companyId),
        where('categoryId', '==', categoryId)
      );
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('✅ Products loaded:', productsData.length);
      
      // Show products immediately
      setProducts(productsData);
      setLoading(false);
      
      // Load stock status in background (non-blocking)
      if (productsData.length > 0) {
        loadStockStatus(productsData);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setLoading(false);
    }
  }, [companyId, categoryId, loadStockStatus]);

  useEffect(() => {
    console.log('🚀 Products Screen Mounted - Params:', { companyId, companyName, categoryId, categoryName });
    if (companyId && categoryId) {
      fetchProducts();
    } else {
      console.warn('❌ Missing params - companyId or categoryId not provided');
      setLoading(false);
    }
  }, [companyId, categoryId, companyName, categoryName, fetchProducts]);

  // fetchProducts defined via useCallback above

  const handleProductPress = (product) => {
    router.push({
      pathname: '/productDetail',
      params: { productId: product.id }
    });
  };

  const renderProductItem = ({ item }) => {
    const quantity = getItemQuantity(item.id);
    const itemStockStatus = stockStatus[item.id];
    const isOutOfStock = itemStockStatus?.isOutOfStock || false;
    const isLowStock = itemStockStatus?.isLowStock || false;
    const availableQuantity = itemStockStatus?.quantity || 0;

    return (
      <View style={styles.gridItem}>
        <TouchableOpacity 
          onPress={() => handleProductPress(item)}
          activeOpacity={0.8}
        >
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }}
              style={[styles.gridImage, isOutOfStock && styles.outOfStockImage]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.gridImage, styles.placeholderImage, isOutOfStock && styles.outOfStockImage]}>
              <FontAwesome5 name="box" size={40} color="#ccc" />
            </View>
          )}
          
          {/* Stock Status Badge */}
          {isOutOfStock && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>OUT OF STOCK</Text>
            </View>
          )}
          {isLowStock && !isOutOfStock && (
            <View style={[styles.stockBadge, styles.lowStockBadge]}>
              <Text style={[styles.stockBadgeText, styles.lowStockText]}>LOW STOCK</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.gridInfo}>
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            <Text style={[styles.gridTitle, isOutOfStock && styles.outOfStockText]} numberOfLines={2}>
              {item.title || "Unnamed Product"}
            </Text>
          </TouchableOpacity>
          {item.description && (
            <Text style={[styles.gridDescription, isOutOfStock && styles.outOfStockText]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.gridPriceContainer}>
            {item.originalPrice && (
              <Text style={[styles.gridOriginalPrice, isOutOfStock && styles.outOfStockText]}>₹{item.originalPrice}</Text>
            )}
            <Text style={[styles.gridPrice, isOutOfStock && styles.outOfStockText]}>₹{item.price || 0}</Text>
          </View>

          {/* Stock Information */}
          {!isOutOfStock && availableQuantity > 0 && (
            <Text style={styles.stockInfo}>
              {availableQuantity} available
            </Text>
          )}

          {/* Add to Cart Controls - Stock Aware */}
          {isOutOfStock ? (
            <View style={[styles.addButton, styles.outOfStockButton]}>
              <Text style={styles.outOfStockButtonText}>OUT OF STOCK</Text>
            </View>
          ) : quantity === 0 ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => addToCartWithValidation(item)}
              disabled={stockLoading}
            >
              {stockLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.addButtonText}>ADD TO CART</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityControl}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => removeFromCartWithValidation(item.id)}
              >
                <FontAwesome5 name="minus" size={12} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => addToCartWithValidation(item)}
                disabled={quantity >= availableQuantity}
              >
                <FontAwesome5 name="plus" size={12} color={quantity >= availableQuantity ? "#ccc" : "#fff"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            headerShown: true,
            headerTitle: categoryName && categoryName !== 'undefined' ? categoryName : 'Products',
            headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
            headerBackTitle: 'Back',
          }} 
        />
        <View style={styles.container}>
          {/* Compact Header Skeleton */}
          <View style={styles.headerContainer}>
            <View style={[styles.companyName, { backgroundColor: '#e0e0e0', height: 14 }]} />
            <View style={[styles.subtitle, { backgroundColor: '#e0e0e0', height: 12, width: '40%', marginTop: 4 }]} />
          </View>
          
          {/* Product Grid Skeleton */}
          <SkeletonProductGrid count={6} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: categoryName && categoryName !== 'undefined' ? categoryName : 'Products',
          headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
          headerBackTitle: 'Back',
        }} 
      />
      <View style={styles.container}>
        {/* Compact Header */}
        <View style={styles.headerContainer}>
          {companyName && (
            <Text style={styles.companyName}>{companyName}</Text>
          )}
          <Text style={styles.subtitle}>
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="shopping-bag" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                No products found in this category
              </Text>
            </View>
          }
        />

        {/* Floating View Cart Button */}
        {getTotalItems() > 0 && (
          <TouchableOpacity 
            style={styles.viewCartButton}
            onPress={() => router.push('/(tabs)/cart')}
            activeOpacity={0.9}
          >
            <View style={styles.cartButtonLeft}>
              <View style={styles.cartItemBadge}>
                <Text style={styles.cartItemBadgeText}>{getTotalItems()}</Text>
              </View>
              <Text style={styles.viewCartText}>View Cart</Text>
            </View>
            <View style={styles.cartButtonRight}>
              <Text style={styles.cartTotalText}>₹{getTotal().toFixed(2)}</Text>
              <FontAwesome5 name="arrow-right" size={16} color="white" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  // Grid View Styles
  gridContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    paddingBottom: 100, // Extra padding for floating cart button
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  gridItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridInfo: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    minHeight: 36,
  },
  gridDescription: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
    lineHeight: 14,
  },
  gridPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  gridOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  // Cart Controls - Swiggy/Zomato Style
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  addButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    minWidth: 30,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  // Floating View Cart Button
  viewCartButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartItemBadge: {
    backgroundColor: 'white',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemBadgeText: {
    color: COLORS.PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },
  viewCartText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  cartButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartTotalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  // Stock Status Styles
  outOfStockImage: {
    opacity: 0.5,
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2625',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  lowStockBadge: {
    backgroundColor: '#f59e0b',
  },
  stockBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lowStockText: {
    color: 'white',
  },
  outOfStockText: {
    color: '#9ca3af',
  },
  stockInfo: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 4,
  },
  outOfStockButton: {
    backgroundColor: '#9ca3af',
  },
  outOfStockButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ProductsScreen;
