/**
 * RelatedProducts Component
 * Displays horizontal scrollable list of related products
 * 
 * Props:
 * - products: array - List of related products
 * - loading: boolean - Loading state
 * - onProductPress: function - Handler when product is clicked
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export const RelatedProducts = ({ products, loading, onProductPress }) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Related Products</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="coral" />
        </View>
      </View>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You May Also Like</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((product) => (
          <TouchableOpacity 
            key={product.id}
            style={styles.productCard}
            onPress={() => onProductPress(product)}
            activeOpacity={0.8}
          >
            {product.imageUrl ? (
              <Image 
                source={{ uri: product.imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.productImage, styles.placeholder]}>
                <FontAwesome5 name="box" size={30} color="#ccc" />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title}
              </Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{product.price}</Text>
                {product.originalPrice && (
                  <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                )}
              </View>
              {product.originalPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f8f8f8',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    height: 40,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ff6f00',
  },
});

export default RelatedProducts;
