/**
 * Skeleton Loader Component - Flipkart-style shimmer effect
 * Reusable skeleton screens for grid and list views
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * Single Skeleton Card for Grid View
 */
export const SkeletonProductCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonCard}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonSubtitle, { opacity }]} />
        <View style={styles.skeletonFooter}>
          <Animated.View style={[styles.skeletonPrice, { opacity }]} />
          <Animated.View style={[styles.skeletonButton, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

/**
 * Grid Skeleton Loader (for product grid - 2 columns)
 */
export const SkeletonProductGrid = ({ count = 6 }) => {
  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.gridItemWrapper}>
          <SkeletonProductCard />
        </View>
      ))}
    </View>
  );
};

/**
 * List Item Skeleton for Search Results
 */
export const SkeletonSearchItem = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.searchItemSkeleton}>
      <Animated.View style={[styles.searchImageSkeleton, { opacity }]} />
      <View style={styles.searchContentSkeleton}>
        <Animated.View style={[styles.searchTitleSkeleton, { opacity }]} />
        <Animated.View style={[styles.searchSubtitleSkeleton, { opacity }]} />
        <Animated.View style={[styles.searchPriceSkeleton, { opacity }]} />
      </View>
    </View>
  );
};

/**
 * Category Card Skeleton for Home Screen
 */
export const SkeletonCategoryCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.categorySkeleton}>
      <Animated.View style={[styles.categoryImageSkeleton, { opacity }]} />
      <Animated.View style={[styles.categoryNameSkeleton, { opacity }]} />
    </View>
  );
};

/**
 * Company Card Skeleton
 */
export const SkeletonCompanyCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.companySkeleton}>
      <Animated.View style={[styles.companyImageSkeleton, { opacity }]} />
      <Animated.View style={[styles.companyNameSkeleton, { opacity }]} />
      <Animated.View style={[styles.companySubtitleSkeleton, { opacity }]} />
    </View>
  );
};

/**
 * Dashboard Stat Card Skeleton Row (two cards side-by-side)
 */
export const SkeletonStatCardRow = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.statRowSkeleton}>
      {[0, 1].map((i) => (
        <View key={i} style={styles.statCardSkeleton}>
          <Animated.View style={[styles.statIconSkeleton, { opacity }]} />
          <Animated.View style={[styles.statNumberSkeleton, { opacity }]} />
          <Animated.View style={[styles.statLabelSkeleton, { opacity }]} />
        </View>
      ))}
    </View>
  );
};

/**
 * Inventory List Item Skeleton (for warehouse list rows)
 */
export const SkeletonInventoryItem = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.inventoryItemSkeleton}>
      <View style={styles.inventoryTextSkeleton}>
        <Animated.View style={[styles.inventoryTitleSkeleton, { opacity }]} />
        <Animated.View style={[styles.inventorySubSkeleton, { opacity }]} />
        <Animated.View style={[styles.inventorySubSmallSkeleton, { opacity }]} />
      </View>
      <Animated.View style={[styles.inventoryActionSkeleton, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Product Grid Skeleton
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  gridItemWrapper: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e0e0e0',
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 12,
    width: '70%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  skeletonPrice: {
    height: 18,
    width: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonButton: {
    height: 32,
    width: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },

  // Search Item Skeleton
  searchItemSkeleton: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchImageSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  searchContentSkeleton: {
    flex: 1,
    justifyContent: 'space-between',
  },
  searchTitleSkeleton: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  searchSubtitleSkeleton: {
    height: 12,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  searchPriceSkeleton: {
    height: 18,
    width: 70,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },

  // Category Card Skeleton
  categorySkeleton: {
    width: 100,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  categoryImageSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  categoryNameSkeleton: {
    width: 60,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },

  // Company Card Skeleton
  companySkeleton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyImageSkeleton: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  companyNameSkeleton: {
    height: 18,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  companySubtitleSkeleton: {
    height: 14,
    width: '40%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },

  // Dashboard Stat Skeletons
  statRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statCardSkeleton: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  statNumberSkeleton: {
    marginTop: 10,
    height: 20,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  statLabelSkeleton: {
    marginTop: 8,
    height: 12,
    width: '40%',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },

  // Inventory List Item Skeleton
  inventoryItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inventoryTextSkeleton: {
    flex: 1,
    marginRight: 12,
  },
  inventoryTitleSkeleton: {
    height: 16,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  inventorySubSkeleton: {
    height: 12,
    width: '40%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  inventorySubSmallSkeleton: {
    height: 10,
    width: '30%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  inventoryActionSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
});

export default {
  SkeletonProductCard,
  SkeletonProductGrid,
  SkeletonSearchItem,
  SkeletonCategoryCard,
  SkeletonCompanyCard,
  SkeletonStatCardRow,
  SkeletonInventoryItem,
};
