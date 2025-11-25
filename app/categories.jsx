import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import { db } from '../lib/firebase';
import { COLORS } from '../src/utils/constants';
import { SkeletonCategoryCard } from './components/SkeletonLoader';

const CategoriesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getTotalItems, getTotal } = useCart();
  
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
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }}
              style={styles.categoryCardImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#f0f7ff', '#e0f0ff']}
              style={[styles.categoryCardImage, styles.placeholderImage]}
            >
              <FontAwesome5 name="box" size={40} color="#0080ff" />
            </LinearGradient>
          )}
          <View style={styles.imageOverlay}>
            <LinearGradient
              colors={['transparent', 'rgba(0,33,71,0.8)']}
              style={styles.gradientOverlay}
            />
          </View>
        </View>
      <View style={styles.categoryCardInfo}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryCardTitle} numberOfLines={2}>
              {item.title || "Unnamed Category"}
          </Text>
          </View>
          <View style={styles.categoryFooter}>
            {item.productsCount !== undefined && (
              <View style={styles.productBadge}>
                <FontAwesome5 name="box" size={10} color="#0080ff" />
                <Text style={styles.productCountText}>
                  {item.productsCount}
                </Text>
              </View>
            )}
            <View style={styles.arrowIcon}>
              <FontAwesome5 name="arrow-right" size={12} color="#0080ff" />
            </View>
          </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: { 
              backgroundColor: '#002147',
            },
            headerTintColor: 'white',
            headerBackTitle: 'Back',
          }} 
        />
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient
            colors={['#002147', '#004080']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.companyIconContainer}>
                <FontAwesome5 name="folder-open" size={24} color="white" />
              </View>
              <View style={[styles.headerTitle, { backgroundColor: '#ffffff33', height: 24, borderRadius: 4, width: '60%' }]} />
            </View>
          </LinearGradient>

          {/* Categories Skeleton */}
          <View style={styles.categoriesGrid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCategoryCard key={index} />
            ))}
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
            headerTitle: '',
            headerStyle: { 
              backgroundColor: '#002147',
            },
            headerTintColor: 'white',
          headerBackTitle: 'Back',
        }} 
      />
      <View style={styles.screenContainer}>
        <ScrollView style={styles.container}>
            <LinearGradient
              colors={['#002147', '#004080']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.companyIconContainer}>
                  <FontAwesome5 name="folder-open" size={24} color="white" />
                </View>
                <Text style={styles.headerTitle}>
                  {company?.name || 'Categories'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="th-large" size={16} color="#002147" />
                <Text style={styles.sectionTitle}>Browse Categories</Text>
              </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContainer}
            renderItem={renderCategoryCard}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                  <FontAwesome5 name="box-open" size={60} color="#ccc" />
                <Text style={styles.emptyText}>
                  No categories found for this company
                </Text>
              </View>
            }
          />
            </View>
        </ScrollView>

        {/* Floating View Cart Button - Outside ScrollView */}
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
  screenContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
    headerGradient: {
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    headerContent: {
      alignItems: 'center',
    },
    companyIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      marginBottom: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#b3d9ff',
      textAlign: 'center',
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
    categoriesSection: {
      marginTop: -15,
      backgroundColor: '#f5f5f5',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 8,
  },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#002147',
  },
  gridContainer: {
      paddingHorizontal: 15,
    paddingBottom: 60,
  },
  gridRow: {
    justifyContent: 'space-between',
      marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
      borderRadius: 16,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 140,
  },
  categoryCardImage: {
    width: '100%',
    height: 140,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
    gradientOverlay: {
      flex: 1,
    },
  categoryCardInfo: {
      padding: 14,
    },
    categoryHeader: {
      marginBottom: 10,
  },
  categoryCardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#002147',
      lineHeight: 20,
    },
    categoryFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    productBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f7ff',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      gap: 5,
  },
  productCountText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#0080ff',
    },
    arrowIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#f0f7ff',
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
      paddingTop: 80,
      paddingHorizontal: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
      marginTop: 16,
      lineHeight: 24,
  },
  
  // Floating View Cart Button
  viewCartButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 99,
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
    elevation: 10,
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
});export default CategoriesScreen;
