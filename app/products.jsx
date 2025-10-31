import { FontAwesome5 } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { db } from '../lib/firebase';

const ProductsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (params.company && params.category) {
      try {
        const companyData = JSON.parse(params.company);
        const categoryData = JSON.parse(params.category);
        setCompany(companyData);
        setCategory(categoryData);
        fetchProducts(companyData, categoryData);
      } catch (error) {
        console.error('Error parsing params:', error);
        setLoading(false);
      }
    }
  }, [params.company, params.category]);

  const fetchProducts = async (companyData, categoryData) => {
    try {
      setLoading(true);
      const companyId = companyData.companyId || companyData.id;
      
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('companyId', '==', companyId),
        where('categoryId', '==', categoryData.id)
      );
      const snapshot = await getDocs(q);
      
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📦 Products loaded:', productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>
          {item.title || "Unnamed Product"}
        </Text>
        {item.description && (
          <Text style={styles.descriptionText} numberOfLines={3}>
            {item.description}
          </Text>
        )}
        <View style={styles.priceContainer}>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>
              ₹{item.originalPrice}
            </Text>
          )}
          <Text style={styles.price}>
            ₹{item.price || 0}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: true,
            headerTitle: category?.title || 'Products',
            headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
            headerBackTitle: 'Back',
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
          headerTitle: category?.title || 'Products',
          headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
          headerBackTitle: 'Back',
        }} 
      />
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              <Text style={styles.subtitle}>
                {products.length} products available
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="shopping-bag" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                No products found in this category
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
  },
  headerContainer: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  productItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'coral',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
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
});

export default ProductsScreen;
