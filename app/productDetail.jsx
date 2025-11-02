/**
 * ProductDetail Screen
 * Main screen that displays detailed product information
 * 
 * Features:
 * - Product image gallery
 * - Product information (title, price, description)
 * - Add to cart functionality
 * - Related products section
 * - Modular component structure
 * 
 * Architecture:
 * - Service Layer: productDetailService.js
 * - Hook Layer: useProductDetail.js
 * - Component Layer: ProductImageGallery, ProductInfo, RelatedProducts
 */

import { FontAwesome5 } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import { ProductImageGallery } from './components/productDetail/ProductImageGallery';
import { ProductInfo } from './components/productDetail/ProductInfo';
import { RelatedProducts } from './components/productDetail/RelatedProducts';
import { useProductDetail } from './hooks/useProductDetail';

const ProductDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart, removeFromCart, getItemQuantity, getTotalItems, getTotal } = useCart();
  
  const productId = params.productId;
  const { product, relatedProducts, loading, loadingRelated, error } = useProductDetail(productId);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleRemoveFromCart = () => {
    if (product) {
      removeFromCart(product.id);
    }
  };

  const handleRelatedProductPress = (relatedProduct) => {
    // Navigate to the new product detail page
    router.push({
      pathname: '/productDetail',
      params: { productId: relatedProduct.id }
    });
  };

  const handleViewCart = () => {
    router.push('/(tabs)/cart');
  };

  const handleGoBack = () => {
    router.back();
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: true,
            headerTitle: 'Product Details',
            headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="coral" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: true,
            headerTitle: 'Product Not Found',
            headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
          }} 
        />
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={60} color="#ff6347" />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorText}>{error || 'This product is no longer available'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const quantity = getItemQuantity(product.id);
  const cartTotal = getTotalItems();

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Product Details',
          headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
          headerBackTitle: 'Back',
        }} 
      />
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Product Image Gallery */}
          <ProductImageGallery 
            imageUrl={product.imageUrl}
            title={product.title}
          />

          {/* Product Information */}
          <ProductInfo 
            product={product}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            quantity={quantity}
          />

          {/* Related Products */}
          <RelatedProducts 
            products={relatedProducts}
            loading={loadingRelated}
            onProductPress={handleRelatedProductPress}
          />

          {/* Extra padding for floating button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating View Cart Button */}
        {cartTotal > 0 && (
          <TouchableOpacity 
            style={styles.viewCartButton}
            onPress={handleViewCart}
            activeOpacity={0.9}
          >
            <View style={styles.cartButtonLeft}>
              <View style={styles.cartItemBadge}>
                <Text style={styles.cartItemBadgeText}>{cartTotal}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: 'coral',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: 'coral',
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
    color: 'coral',
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
});

export default ProductDetailScreen;
