import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../lib/firebase';

const AdminProductsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Extract simple params
  const { companyId, companyName, categoryId, categoryName } = params;

  useEffect(() => {
    console.log('🚀 Admin Products Screen Mounted - Params:', { companyId, companyName, categoryId, categoryName });
    
    if (companyId && categoryId) {
      fetchProducts();
    } else {
      console.warn('❌ Missing params - companyId or categoryId not provided');
      setLoading(false);
    }
  }, [companyId, categoryId]);

  // Refresh products when screen comes into focus (after editing)
  useFocusEffect(
    useCallback(() => {
      if (companyId && categoryId) {
        console.log('🔄 Screen focused - Refreshing products...');
        fetchProducts();
      }
    }, [companyId, categoryId])
  );

  const fetchProducts = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('🔍 Fetching products with:', {
        companyId,
        categoryId
      });
      
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('companyId', '==', companyId),
        where('categoryId', '==', categoryId)
      );
      const snapshot = await getDocs(q);
      
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Admin Products loaded:', productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchProducts(true);
  };

  const handleEditProduct = (product) => {
    // Navigate to dedicated edit product screen
    router.push({
      pathname: '/editProduct',
      params: {
        product: JSON.stringify(product),
        companyId: companyId,
        companyName: companyName,
        categoryId: categoryId,
        categoryName: categoryName
      }
    });
  };

  const renderProductItemGrid = ({ item }) => (
    <View style={styles.gridItem}>
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
      <View style={styles.gridInfo}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {item.title || "Unnamed Product"}
        </Text>
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
        <TouchableOpacity 
          style={styles.gridEditButton}
          onPress={() => handleEditProduct(item)}
        >
          <FontAwesome5 name="edit" size={14} color="white" />
          <Text style={styles.gridEditButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: true,
            headerTitle: categoryName && categoryName !== 'undefined' ? categoryName : 'Products',
            headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: '#f8f9fa' },
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="coral" />
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
          headerStyle: { backgroundColor: '#f8f9fa' },
        }} 
      />
      <View style={styles.container}>
        {/* Admin Header */}
        <View style={styles.adminHeader}>
          <View style={styles.headerInfo}>
            <View style={styles.adminBadge}>
              <FontAwesome5 name="shield-alt" size={14} color="#fff" />
              <Text style={styles.adminBadgeText}>ADMIN VIEW</Text>
            </View>
            {companyName && (
              <Text style={styles.companyNameSmall}>{companyName}</Text>
            )}
            <Text style={styles.subtitleSmall}>
              {products.length} products • Category: {categoryName || 'N/A'}
            </Text>
          </View>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItemGrid}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['coral']}
              tintColor="coral"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="inbox" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                No products found in this category
              </Text>
              <Text style={styles.emptySubtext}>
                Add products using the Admin Panel
              </Text>
            </View>
          }
        />
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  // Admin Header Styles
  adminHeader: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'coral',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
    gap: 4,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  companyNameSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subtitleSmall: {
    fontSize: 12,
    color: '#666',
  },
  // Grid View Styles
  gridContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    paddingBottom: 20,
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
    marginBottom: 10,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  gridOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  gridEditButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  gridEditButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AdminProductsScreen;
