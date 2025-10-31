import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
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
          activeOpacity={0.7}
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



// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Index = () => {
  const router = useRouter();
  
  // State Management
  const [companies, setCompanies] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    console.log('🏢 Navigating to categories for:', company.name);
    
    // Navigate to full-screen categories page (PhonePe style)
    router.push({
      pathname: '/categories',
      params: {
        company: JSON.stringify(company)
      }
    });
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
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={styles.mainContainer}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <ImageCarousel />
      </View>

      {/* Companies List */}
      <View style={styles.contentContainer}>
        <CompaniesScreen 
          companies={companies}
          onCompanySelect={handleCompanySelect}
          getCategoryCount={getCategoryCount}
          getProductCount={getProductCount}
        />
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
  // Categories Grid Styles
  categoriesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  categoriesHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  categoriesSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  gridContainer: {
    paddingHorizontal: 5,
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
});

export default Index;


