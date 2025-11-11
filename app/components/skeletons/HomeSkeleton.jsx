/**
 * Home Screen Skeleton Loader
 * Flipkart-style shimmer skeleton for home screen
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';

const HomeSkeleton = () => {
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
    <ScrollView style={styles.container}>
      {/* Header Banner Skeleton */}
      <Animated.View style={[styles.banner, { opacity }]} />

      {/* Categories Section */}
      <View style={styles.section}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.categoryItem}>
                <Animated.View style={[styles.categoryCircle, { opacity }]} />
                <Animated.View style={[styles.categoryLabel, { opacity }]} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Companies Section */}
      <View style={styles.section}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        <View style={styles.companiesContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.companyCard}>
              <Animated.View style={[styles.companyImage, { opacity }]} />
              <Animated.View style={[styles.companyName, { opacity }]} />
              <Animated.View style={[styles.companySubtitle, { opacity }]} />
            </View>
          ))}
        </View>
      </View>

      {/* Featured Products Section */}
      <View style={styles.section}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        <View style={styles.productsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.productCard}>
              <Animated.View style={[styles.productImage, { opacity }]} />
              <View style={styles.productInfo}>
                <Animated.View style={[styles.productTitle, { opacity }]} />
                <Animated.View style={[styles.productPrice, { opacity }]} />
                <Animated.View style={[styles.productButton, { opacity }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  banner: {
    height: 180,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    height: 20,
    width: 150,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  categoryLabel: {
    width: 60,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  companiesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  companyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyImage: {
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
  },
  companyName: {
    height: 18,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  companySubtitle: {
    height: 14,
    width: '40%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    height: 140,
    backgroundColor: '#e0e0e0',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  productPrice: {
    height: 18,
    width: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  productButton: {
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
});

export default HomeSkeleton;
