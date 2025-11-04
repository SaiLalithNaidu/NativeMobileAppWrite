import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { COLORS } from '../../src/utils/constants';
import ImageCarousel from '../components/imageCarousel';

// ============================================================================
// SCREEN COMPONENTS
// ============================================================================

// Companies List Screen
const CompaniesScreen = ({ companies, onCompanySelect, getCategoryCount, getProductCount }) => {
  return (
      <View style={styles.companiesListContainer}>
        {/* <View style={styles.sectionHeader}>
          <FontAwesome5 name="building" size={20} color="#002147" />
          <Text style={styles.sectionTitle}>Our Companies</Text>
        </View> */}
        <FlatList
      data={companies}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.categoryItem}
          onPress={() => onCompanySelect(item)}
          activeOpacity={0.7}
        >
            <LinearGradient
              colors={['#f8f9fa', '#ffffff']}
              style={styles.companyCard}
            >
              {item.logoUrl ? (
                <View style={styles.logoWrapper}>
                  <Image 
                    source={{ uri: item.logoUrl }}
                    style={styles.companyLogo}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={[styles.logoWrapper, styles.logoPlaceholder]}>
                  <FontAwesome5 name="building" size={30} color="#002147" />
                </View>
              )}
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>
              {item.name || "Unnamed Company"}
            </Text>
            <View style={styles.categoryDescription}>
                <View style={styles.statsBadge}>
                  <FontAwesome5 name="folder" size={12} color="#0080ff" />
                  <Text style={styles.statsText}>
                    {getCategoryCount(item)}
                  </Text>
                </View>
                <View style={styles.statsBadge}>
                  <FontAwesome5 name="box" size={12} color="#0080ff" />
                  <Text style={styles.statsText}>
                    {getProductCount(item)}
                  </Text>
                </View>
            </View>
          </View>
              <View style={styles.arrowIcon}>
                <FontAwesome5 name="chevron-right" size={16} color="#0080ff" />
              </View>
            </LinearGradient>
        </TouchableOpacity>
      )}
          showsVerticalScrollIndicator={false}
      ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="building" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No companies available</Text>
          </View>
      }
    />
      </View>
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
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
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
        <LinearGradient
          colors={['#002147', '#004080']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.brandText}>Ramesh Aqua</Text>
              <Text style={styles.taglineText}>🦐 Feeds & Needs</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.imageContainer}>
          <ImageCarousel />
        </View>

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
      backgroundColor: '#f5f5f5',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
    headerGradient: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerContent: {
      alignItems: 'center',
      bottom:25,
    },
    welcomeContainer: {
      alignItems: 'center',
    },
    welcomeText: {
      fontSize: 16,
      color: '#b3d9ff',
      fontWeight: '500',
    },
    brandText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: 'white',
      marginTop: 4,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    taglineText: {
      fontSize: 14,
      color: '#b3d9ff',
      marginTop: 4,
    },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
    companiesListContainer: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: '#f5f5f5',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 16,
      gap: 10,
    },
    sectionTitle: {
      fontSize: 20,
    fontWeight: "bold",
      color: '#002147',
  },
  categoryItem: {
    marginBottom: 12,
    },
    companyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
    shadowRadius: 4,
      elevation: 4,
    },
    logoWrapper: {
      width: 70,
      height: 70,
      borderRadius: 12,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    logoPlaceholder: {
      backgroundColor: '#f0f7ff',
  },
  companyLogo: {
      width: 50,
      height: 50,
    },
    categoryInfo: {
      flex: 1,
      gap: 8,
  },
  categoryName: {
      fontSize: 18,
      fontWeight: "700",
      color: '#002147',
      marginBottom: 4,
  },
    categoryDescription: {
      flexDirection: 'row',
      gap: 12,
    },
    statsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f7ff',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      gap: 6,
    },
    statsText: {
      fontSize: 13,
      color: '#0080ff',
      fontWeight: '600',
    },
    arrowIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#f0f7ff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 60,
    },
    emptyText: {
      color: "#999",
      marginTop: 16,
      textAlign: 'center',
      fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
      color: "#666",
      fontSize: 16,
  },
  imageContainer:{
    marginTop: -20,
  },
});

export default Index;


