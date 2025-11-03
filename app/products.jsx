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
import { useCart } from '../contexts/CartContext';
import { db } from '../lib/firebase';
import { COLORS } from '../src/utils/constants';

const ProductsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart, removeFromCart, getItemQuantity, getTotalItems, getTotal } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Extract simple params
  const { companyId, companyName, categoryId, categoryName } = params;

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
      setProducts(productsData);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId, categoryId]);

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

    return (
      <View style={styles.gridItem}>
        <TouchableOpacity 
          onPress={() => handleProductPress(item)}
          activeOpacity={0.8}
        >
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.gridImage, styles.placeholderImage]}>
              <FontAwesome5 name="box" size={40} color="#ccc" />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.gridInfo}>
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            <Text style={styles.gridTitle} numberOfLines={2}>
              {item.title || "Unnamed Product"}
            </Text>
          </TouchableOpacity>
          {item.description && (
            <Text style={styles.gridDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.gridPriceContainer}>
            {item.originalPrice && (
              <Text style={styles.gridOriginalPrice}>₹{item.originalPrice}</Text>
            )}
            <Text style={styles.gridPrice}>₹{item.price || 0}</Text>
          </View>

          {/* Add to Cart Controls - Swiggy/Zomato Style */}
          {quantity === 0 ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityControl}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => removeFromCart(item.id)}
              >
                <FontAwesome5 name="minus" size={12} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => addToCart(item)}
              >
                <FontAwesome5 name="plus" size={12} color="#fff" />
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading products...</Text>
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
        {/* Header */}
        <View style={styles.headerContainer}>
          {companyName && (
            <Text style={styles.companyName}>{companyName}</Text>
          )}
          <Text style={styles.subtitle}>
            {products.length} products available
          </Text>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
});

export default ProductsScreen;
