/**
 * Search Screen
 * Tab screen for product search functionality
 * 
 * Features:
 * - Real-time search as user types
 * - Grid view of search results (2 columns)
 * - Displays product with company and category info
 * - Navigates to product detail on tap
 * 
 * Architecture:
 * - Hook Layer: useSearch.js (custom hook)
 * - Service Layer: searchService.js (business logic)
 * - Component Layer: This screen (UI only)
 */

import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from '../../src/utils/constants';
import { useSearch } from '../hooks/useSearch';

const Search = () => {
  const router = useRouter();
  
  // Custom hook handles all search logic
  const {
    searchQuery,
    results,
    loading,
    error,
    companyMap,
    categoryMap,
    handleSearch
  } = useSearch();

  /**
   * Navigate to product detail screen
   * @param {Object} product - Product object with id
   */
  const handleProductPress = (product) => {
    router.push({
      pathname: '/productDetail',
      params: { productId: product.id }
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
  <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={{ marginTop: 8, color: '#666' }}>Loading data…</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.center}>
  <FontAwesome5 name="exclamation-circle" size={48} color={COLORS.PRIMARY} />
        <Text style={{ marginTop: 16, color: '#666', textAlign: 'center', paddingHorizontal: 20 }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput 
          placeholder="Search products…" 
          style={styles.searchInput}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>
              {searchQuery ? `Results for "${searchQuery}"` : 'Search Products'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {results.length} result{results.length === 1 ? '' : 's'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.productCard}
            onPress={() => handleProductPress(item)}
            activeOpacity={0.8}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
            ) : (
              <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
                <FontAwesome5 name="image" size={28} color="#bbb" />
              </View>
            )}
            <View style={styles.productCardInfo}>
              <Text style={styles.productName} numberOfLines={2}>{item.title || 'Unnamed Product'}</Text>
              <Text style={styles.metaText} numberOfLines={2}>
                {companyMap.get(item.companyId) || 'Unknown Company'}
                {' \u2022 '}
                {categoryMap.get(item.categoryId) || 'Unknown Category'}
              </Text>
              <View style={styles.priceContainer}>
                {item.originalPrice ? (
                  <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                ) : null}
                <Text style={styles.price}>₹{item.price || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={
          searchQuery ? (
            <Text style={styles.emptyText}>{`No products found for "${searchQuery}"`}</Text>
          ) : (
            <Text style={styles.emptyText}>Type to search products</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 16,
    backgroundColor: 'white',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  headerContainer: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  productItem: {
    backgroundColor: 'white',
    padding: 12,
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
    height: 140,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
    flexWrap: 'wrap',
    width: '100%',
    lineHeight: 16,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  // Grid specific styles
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardInfo: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});

export default Search;
