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
    View
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../lib/firebase';
import { SkeletonCategoryCard } from './components/SkeletonLoader';

const CategoriesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getTotalItems, getTotal } = useCart();
  const { theme } = useTheme();

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
      style={[styles.categoryCard, { backgroundColor: theme.cardBackground }]}
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
            colors={[theme.inputBackground, theme.background]}
            style={[styles.categoryCardImage, styles.placeholderImage]}
          >
            <FontAwesome5 name="box" size={40} color={theme.primary} />
          </LinearGradient>
        )}
        <View style={styles.imageOverlay}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          />
        </View>
      </View>
      <View style={styles.categoryCardInfo}>
        <View style={styles.categoryHeader}>
          <Text style={[styles.categoryCardTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title || "Unnamed Category"}
          </Text>
        </View>
        <View style={styles.categoryFooter}>
          {item.productsCount !== undefined && (
            <View style={[styles.productBadge, { backgroundColor: theme.primary + '15' }]}>
              <FontAwesome5 name="box" size={10} color={theme.primary} />
              <Text style={[styles.productCountText, { color: theme.primary }]}>
                {item.productsCount}
              </Text>
            </View>
          )}
          <View style={[styles.arrowIcon, { backgroundColor: theme.primary + '15' }]}>
            <FontAwesome5 name="arrow-right" size={12} color={theme.primary} />
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
              backgroundColor: theme.primary,
            },
            headerTintColor: 'white',
            headerBackTitle: 'Back',
          }}
        />
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header */}
          <LinearGradient
            colors={[theme.primary, theme.secondary || '#004080']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.companyIconContainer}>
                <FontAwesome5 name="folder-open" size={24} color="white" />
              </View>
              <View style={[styles.headerTitle, { backgroundColor: 'rgba(255,255,255,0.2)', height: 24, borderRadius: 4, width: '60%' }]} />
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
            backgroundColor: theme.primary,
          },
          headerTintColor: 'white',
          headerBackTitle: 'Back',
        }}
      />
      <View style={styles.screenContainer}>
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
          <LinearGradient
            colors={[theme.primary, theme.secondary || '#004080']}
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

          <View style={[styles.categoriesSection, { backgroundColor: theme.background }]}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="th-large" size={16} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Browse Categories</Text>
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
                  <FontAwesome5 name="box-open" size={60} color={theme.textLight} />
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
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
            style={[styles.viewCartButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/cart')}
            activeOpacity={0.9}
          >
            <View style={styles.cartButtonLeft}>
              <View style={styles.cartItemBadge}>
                <Text style={[styles.cartItemBadgeText, { color: theme.primary }]}>{getTotalItems()}</Text>
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
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  categoriesSection: {
    marginTop: -15,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  productCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrowIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
});

export default CategoriesScreen;
