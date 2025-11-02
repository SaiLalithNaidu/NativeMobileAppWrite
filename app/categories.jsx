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
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../lib/firebase';

const CategoriesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (params.company) {
      try {
        const companyData = JSON.parse(params.company);
        setCompany(companyData);
        fetchCategories(companyData);
      } catch (error) {
        console.error('Error parsing company data:', error);
        setLoading(false);
      }
    }
  }, [params.company]);

  const fetchCategories = async (companyData) => {
    try {
      setLoading(true);
      const companyId = companyData.companyId || companyData.id;
      
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('companyId', '==', companyId));
      const snapshot = await getDocs(q);
      
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📂 Categories loaded:', categoriesData.length);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    const companyId = company.companyId || company.id;
    console.log('✅ Navigating to Products from Categories:', {
      companyId,
      companyName: company.name,
      categoryId: category.id,
      categoryName: category.title
    });
    
    router.push(
      `/products?companyId=${companyId}&companyName=${encodeURIComponent(company.name)}&categoryId=${category.id}&categoryName=${encodeURIComponent(category.title)}`
    );
  };

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.categoryCardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.categoryCardImage, styles.placeholderImage]}>
          <FontAwesome5 name="box" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.categoryCardInfo}>
        <Text style={styles.categoryCardTitle} numberOfLines={2}>
          {item.title || "Unnamed Category"}
        </Text>
        {item.productsCount !== undefined && (
          <Text style={styles.productCountText}>
            {item.productsCount} Products
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: true,
            headerTitle: company?.name || 'Categories',
            headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
            headerBackTitle: 'Back',
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="coral" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: company?.name || 'Categories',
          headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
          headerBackTitle: 'Back',
        }} 
      />
      <View style={styles.container}>
        {/* Subtitle with count */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            {categories.length} categories available
          </Text>
        </View>

        {/* Categories Grid */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          renderItem={renderCategoryCard}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="box-open" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                No categories found for this company
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
  subtitleContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  categoryCard: {
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
  categoryCardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardInfo: {
    padding: 12,
  },
  categoryCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    minHeight: 36,
  },
  productCountText: {
    fontSize: 12,
    color: '#666',
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
  },
});

export default CategoriesScreen;
