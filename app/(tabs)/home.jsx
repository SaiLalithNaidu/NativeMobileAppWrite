import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../lib/firebase';
import ImageCarousel from '../components/imageCarousel';
import { SkeletonCompanyCard } from '../components/SkeletonLoader';

// ============================================================================
// SCREEN COMPONENTS
// ============================================================================

// Companies List Screen
const CompaniesScreen = ({ companies, onCompanySelect, getCategoryCount, getProductCount, refreshing, onRefresh, theme }) => {
  return (
    <View style={[styles.companiesListContainer, { backgroundColor: theme.background }]}>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            progressBackgroundColor={theme.cardBackground}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => onCompanySelect(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.companyCard, { backgroundColor: theme.cardBackground }]}>
              {item.logoUrl ? (
                <View style={[styles.logoWrapper, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <Image
                    source={{ uri: item.logoUrl }}
                    style={styles.companyLogo}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={[styles.logoWrapper, styles.logoPlaceholder, { borderColor: theme.border }]}>
                  <FontAwesome5 name="building" size={30} color={theme.primary} />
                </View>
              )}
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {item.name || "Unnamed Company"}
                </Text>
                <View style={styles.categoryDescription}>
                  <View style={[styles.statsBadge, { backgroundColor: theme.iconBackground }]}>
                    <FontAwesome5 name="folder" size={12} color={theme.primary} />
                    <Text style={[styles.statsText, { color: theme.primary }]}>
                      {getCategoryCount(item)}
                    </Text>
                  </View>
                  <View style={[styles.statsBadge, { backgroundColor: theme.iconBackground }]}>
                    <FontAwesome5 name="box" size={12} color={theme.primary} />
                    <Text style={[styles.statsText, { color: theme.primary }]}>
                      {getProductCount(item)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.arrowIcon, { backgroundColor: theme.iconBackground }]}>
                <FontAwesome5 name="chevron-right" size={16} color={theme.primary} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="building" size={50} color={theme.textLight} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No companies available</Text>
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
  const { user } = useAuth();
  const { theme } = useTheme();

  // Get greeting based on time of day
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  }, []);

  const getUserName = useCallback(() => {
    return user?.displayName?.split(' ')[0] || 'Guest';
  }, [user]);

  // State Management
  const [companies, setCompanies] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(true);

  // ============================================================================
  // DATA FETCHING FUNCTIONS
  // ============================================================================

  const fetchCompanies = useCallback(async () => {
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
  }, []);

  const fetchCategories = useCallback(async () => {
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
  }, []);

  const fetchProducts = useCallback(async () => {
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
  }, []);

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  // Load all data on mount and on manual refresh
  const loadData = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [companiesData, categoriesData, productsData] = await Promise.all([
        fetchCompanies(),
        fetchCategories(),
        fetchProducts()
      ]);

      setCompanies(companiesData);
      setAllCategories(categoriesData);
      setAllProducts(productsData);
      setError("");

      if (companiesData.length === 0) {
        setError("No companies found");
      }
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchCompanies, fetchCategories, fetchProducts]);

  // Load all data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when screen comes into focus (e.g., after company deleted from admin)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Home screen focused - Refreshing companies...');
      loadData();
    }, [loadData])
  );

  // Handle manual pull-to-refresh
  const onRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

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
      <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.headerGradient}
        >
        </LinearGradient>

        {/* Carousel Skeleton */}
        <View style={styles.imageContainer}>
          <View style={[styles.carouselSkeleton, { backgroundColor: theme.border, height: 200, borderRadius: 12 }]} />
        </View>

        {/* Company Cards Skeleton */}
        <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
          <SkeletonCompanyCard />
          <SkeletonCompanyCard />
          <SkeletonCompanyCard />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      </View>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {/* Welcome Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd, theme.primary]}
              style={styles.modalGradient}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalGreeting}>{getGreeting()}</Text>
                <Text style={styles.modalUserName}>{getUserName()}</Text>
                <Text style={styles.modalTagline}>Browse our exclusive aquatic collection</Text>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.cardBackground }]}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modalButtonText, { color: theme.primary }]}>Get Started</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* <LinearGradient
        colors={['#002147', '#004080']}
        style={styles.headerGradient}
      >
      </LinearGradient> */}

      <View style={styles.imageContainer}>
        <ImageCarousel />
      </View>

      <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
        <CompaniesScreen
          companies={companies}
          onCompanySelect={handleCompanySelect}
          getCategoryCount={getCategoryCount}
          getProductCount={getProductCount}
          refreshing={refreshing}
          onRefresh={onRefresh}
          theme={theme}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContainer: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
    bottom: 25,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 18,
    color: '#b3d9ff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  userNameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  taglineText: {
    fontSize: 13,
    color: '#b3d9ff',
    marginTop: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  contentContainer: {
    flex: 1,
  },
  companiesListContainer: {
    flex: 1,
    paddingHorizontal: 16,
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
    marginBottom: 4,
  },
  categoryDescription: {
    flexDirection: 'row',
    gap: 12,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  arrowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  imageContainer: {
    marginTop: -20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalGradient: {
    padding: 40,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalGreeting: {
    fontSize: 20,
    color: '#b3d9ff',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalUserName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  modalTagline: {
    fontSize: 15,
    color: '#b3d9ff',
    marginBottom: 30,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtonText: {
    color: '#0080ff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default Index;


