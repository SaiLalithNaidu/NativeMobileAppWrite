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
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCart } from '../../contexts/CartContext';
import { COLORS } from '../../src/utils/constants';
import { useSearch } from '../hooks/useSearch';
import { InventoryService } from '../services/inventoryService';

const Search = () => {
  const router = useRouter();
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  
  // Custom hook handles all search logic
  const {
    searchQuery,
    results,
    loading,
    error,
    companyMap,
    categoryMap,
    searchHistory,
    handleSearch,
    handleSearchFromHistory,
    clearSearchHistory
  } = useSearch();

  // Track inventory status for search results
  const [stockStatus, setStockStatus] = useState({});
  const [stockLoading, setStockLoading] = useState(false);

  // Load stock status when search results change
  useEffect(() => {
    if (results.length > 0) {
      loadStockStatus(results);
    }
  }, [results, loadStockStatus]);

  // Load stock status for products
  const loadStockStatus = useCallback(async (productList) => {
    try {
      setStockLoading(true);
      const stockData = {};
      
      for (const product of productList) {
        try {
          const inventory = await InventoryService.getProductInventory(product.id);
          stockData[product.id] = inventory || {
            quantity: 0,
            isOutOfStock: true,
            isLowStock: false,
            lowStockThreshold: 5
          };
        } catch (error) {
          console.error(`Error loading stock for product ${product.id}:`, error);
          stockData[product.id] = {
            quantity: 0,
            isOutOfStock: true,
            isLowStock: false,
            lowStockThreshold: 5
          };
        }
      }
      
      setStockStatus(stockData);
      setStockLoading(false);
    } catch (error) {
      console.error('Error loading stock status:', error);
      setStockLoading(false);
    }
  }, []);

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

  // Render search history item
  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => handleSearchFromHistory(item)}
      activeOpacity={0.7}
    >
      <FontAwesome5 name="history" size={16} color="#666" />
      <Text style={styles.historyText}>{item}</Text>
      <FontAwesome5 name="arrow-up-left" size={14} color="#999" />
    </TouchableOpacity>
  );

  // Render add to cart controls
  const renderCartControls = (item) => {
    const quantity = getItemQuantity(item.id);
    const stock = stockStatus[item.id];
    const isOutOfStock = stock?.isOutOfStock || stock?.quantity === 0;
    
    // Show out of stock badge
    if (isOutOfStock) {
      return (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
        </View>
      );
    }
    
    if (quantity === 0) {
      return (
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.quantityControls}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => removeFromCart(item.id)}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="minus" size={12} color="white" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => addToCart(item)}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="plus" size={12} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

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
        {searchQuery ? (
          <TouchableOpacity 
            onPress={() => handleSearch('')}
            style={styles.clearButton}
          >
            <FontAwesome5 name="times" size={16} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Show search history when no search query */}
      {!searchQuery && searchHistory.length > 0 ? (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearSearchHistory} style={styles.clearHistoryButton}>
              <Text style={styles.clearHistoryText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchHistory}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.historyList}
          />
        </View>
      ) : (
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
            <View style={styles.productCard}>
              <TouchableOpacity 
                onPress={() => handleProductPress(item)}
                activeOpacity={0.8}
                style={styles.productCardTouchable}
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
              
              {/* Add to Cart Controls */}
              <View style={styles.cartControlsContainer}>
                {renderCartControls(item)}
              </View>
            </View>
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
      )}
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
    marginBottom: 12,
  },
  productCardTouchable: {
    flex: 1,
  },
  productCardInfo: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  clearButton: {
    padding: 8,
  },
  // Search History Styles
  historyContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearHistoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  historyList: {
    paddingHorizontal: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
  },
  historyText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  // Cart Controls Styles
  cartControlsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  addToCartButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  quantityButton: {
    backgroundColor: COLORS.PRIMARY,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  outOfStockBadge: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Search;
