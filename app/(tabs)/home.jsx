import { FontAwesome5 } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { db } from '../../lib/firebase';
import ImageCarousel from '../components/imageCarousel';

// ============================================================================
// SCREEN COMPONENTS
// ============================================================================

// Companies List Screen
const CompaniesScreen = ({ companies, onCompanySelect, getCategoryCount, getProductCount }) => {
  return (
    <FlatList
      data={companies}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.categoryItem}
          onPress={() => onCompanySelect(item)}
        >
          {item.logoUrl && (
            <Image 
              source={{ uri: item.logoUrl }}
              style={styles.companyLogo}
              resizeMode="contain"
            />
          )}
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>
              {item.name || "Unnamed Company"}
            </Text>
            <View style={styles.categoryDescription}>
              <Text style={styles.statsText}>
                📂 {getCategoryCount(item)} Categories
              </Text>
              <Text style={styles.statsText}>
                📦 {getProductCount(item)} Products
              </Text>
            </View>
            <View style={styles.viewDetailsBtn}>
              <Text style={styles.viewDetailsBtnText}>View Categories →</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No companies available</Text>
      }
    />
  );
};

// Categories List Screen
const CategoriesScreen = ({ 
  categories, 
  selectedCompany, 
  onCategorySelect, 
  onBack 
}) => {
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => (
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={18} color="#333" />
            <Text style={styles.backButtonText}>Back to Companies</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedCompany?.name} - Categories
          </Text>
          <Text style={styles.headerSubtitle}>
            {categories.length} categories found
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.categoryItem}
          onPress={() => onCategorySelect(item)}
        >
          {item.imageUrl && (
            <Image 
              source={{ uri: item.imageUrl }}
              style={styles.companyLogo}
              resizeMode="cover"
            />
          )}
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>
              {item.title || "Unnamed Category"}
            </Text>
            {item.description && (
              <Text style={styles.descriptionText} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.viewDetailsBtn}>
              <Text style={styles.viewDetailsBtnText}>View Products →</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          No categories found for this company
        </Text>
      }
    />
  );
};

// Products List Screen
const ProductsScreen = ({ 
  products, 
  selectedCompany, 
  selectedCategory, 
  searchQuery,
  onBack 
}) => {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => (
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={18} color="#333" />
            <Text style={styles.backButtonText}>
              {searchQuery ? 'Back to Companies' : 'Back to Categories'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {searchQuery 
              ? `Search Results for "${searchQuery}"`
              : selectedCategory 
                ? `${selectedCategory.title} - Products`
                : `${selectedCompany?.name} - All Products`
            }
          </Text>
          <Text style={styles.headerSubtitle}>
            {products.length} products found
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
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
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {searchQuery 
            ? `No products found for "${searchQuery}"`
            : selectedCategory
              ? "No products in this category"
              : "No products found"
          }
        </Text>
      }
    />
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Index = () => {
  // State Management
  const [companies, setCompanies] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState('companies'); // 'companies', 'categories', 'products', 'search'

  // ============================================================================
  // DATA FETCHING FUNCTIONS
  // ============================================================================

  const fetchCompanies = async () => {
    try {
      const companiesRef = collection(db, 'companies');
      const snapshot = await getDocs(companiesRef);
      const companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Companies fetched:", companiesData.length);
      return companiesData;
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Categories fetched:", categoriesData.length);
      return categoriesData;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  };

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Products fetched:", productsData.length);
      return productsData;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  // Load all data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [companiesData, categoriesData, productsData] = await Promise.all([
          fetchCompanies(),
          fetchCategories(),
          fetchProducts()
        ]);
        
        setCompanies(companiesData);
        setAllCategories(categoriesData);
        setAllProducts(productsData);

        if (companiesData.length === 0) {
          setError("No companies found");
        }
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getCompanyIdentifier = (company) => company.companyId || company.id;

  const getCategoryCount = (company) => {
    const companyIdentifier = getCompanyIdentifier(company);
    return allCategories.filter(cat => cat.companyId === companyIdentifier).length;
  };

  const getProductCount = (company) => {
    const companyIdentifier = getCompanyIdentifier(company);
    return allProducts.filter(prod => prod.companyId === companyIdentifier).length;
  };

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const handleCompanySelect = (company) => {
    const companyIdentifier = getCompanyIdentifier(company);
    
    // Filter categories for this company
    const companyCategories = allCategories.filter(
      cat => cat.companyId === companyIdentifier
    );
    
    setSelectedCompany(company);
    setSelectedCategory(null);
    setFilteredCategories(companyCategories);
    setView('categories');
    
    console.log(`✓ Selected: ${company.name} | ${companyCategories.length} categories`);
  };

  const handleCategorySelect = (category) => {
    const companyIdentifier = getCompanyIdentifier(selectedCompany);
    
    // Filter products for this category
    const categoryProducts = allProducts.filter(
      prod => prod.categoryId === category.id && prod.companyId === companyIdentifier
    );
    
    setSelectedCategory(category);
    setFilteredProducts(categoryProducts);
    setView('products');
    
    console.log(`✓ Selected: ${category.title} | ${categoryProducts.length} products`);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      // Clear search - reset to companies view
      resetToCompanies();
      return;
    }

    const searchLower = text.toLowerCase();
    
    // Search in products
    const matchedProducts = allProducts.filter(prod =>
      prod.title?.toLowerCase().includes(searchLower) ||
      prod.description?.toLowerCase().includes(searchLower)
    );
    
    setFilteredProducts(matchedProducts);
    setView('products');
    
    console.log(`🔍 Search: "${text}" | ${matchedProducts.length} products found`);
  };

  const handleBack = () => {
    if (searchQuery) {
      // If searching, go back to companies and clear search
      resetToCompanies();
    } else if (view === 'products' && selectedCategory) {
      // From category products -> back to categories
      setSelectedCategory(null);
      setView('categories');
    } else if (view === 'categories') {
      // From categories -> back to companies
      resetToCompanies();
    }
  };

  const resetToCompanies = () => {
    setView('companies');
    setSelectedCompany(null);
    setSelectedCategory(null);
    setFilteredCategories([]);
    setFilteredProducts([]);
    setSearchQuery("");
  };

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="coral" />
        <Text style={styles.loadingText}>Loading companies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // ============================================================================
  // RENDER CONTENT
  // ============================================================================

  const renderScreen = () => {
    switch (view) {
      case 'companies':
        return (
          <CompaniesScreen 
            companies={companies}
            onCompanySelect={handleCompanySelect}
            getCategoryCount={getCategoryCount}
            getProductCount={getProductCount}
          />
        );

      case 'categories':
        return (
          <CategoriesScreen 
            categories={filteredCategories}
            selectedCompany={selectedCompany}
            onCategorySelect={handleCategorySelect}
            onBack={handleBack}
          />
        );

      case 'products':
        return (
          <ProductsScreen 
            products={filteredProducts}
            selectedCompany={selectedCompany}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={styles.mainContainer}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <ImageCarousel />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput 
          placeholder="Search products..." 
          style={styles.searchInput}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Dynamic Content Area */}
      <View style={styles.contentContainer}>
        {renderScreen()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    top: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 10,
  },
  categoryItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
  },
  // categoryDescription: {
  //   fontSize: 14,
  //   color: "#555",
  //   marginTop: 4,
  // },
  emptyText: {
    color: "#666",
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  imageContainer:{
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 16,
    marginHorizontal: 20,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  input:{
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: 'white',
    marginHorizontal: 20,
  },
  searchIcon:{
    size:15,
    color:"rgba(66, 65, 65, 1)"
  },
  categoryDescription:{
    display:"flex",
    flexDirection:"row",
    gap:10,
  },
  categoryInfo:{
    flex: 1,
    flexDirection:"column",
    justifyContent:"space-around",
    alignItems:"flex-start",
  },
  viewDetailsBtn:{
    marginTop: 5,
    height: 25,
    backgroundColor: 'coral',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  viewDetailsBtnText:{
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  statsText: {
    fontSize: 13,
    color: '#666',
  },
  headerContainer: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
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
});

export default Index;


