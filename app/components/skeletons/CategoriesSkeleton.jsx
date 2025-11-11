/**
 * Categories Screen Skeleton Loader
 * Flipkart-style shimmer skeleton for categories grid
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';

const CategoriesSkeleton = () => {
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
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.headerTitle, { opacity }]} />
        <Animated.View style={[styles.headerSubtitle, { opacity }]} />
      </View>

      {/* Categories Grid */}
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <View key={i} style={styles.categoryCard}>
            <Animated.View style={[styles.categoryImage, { opacity }]} />
            <View style={styles.categoryInfo}>
              <Animated.View style={[styles.categoryName, { opacity }]} />
              <Animated.View style={[styles.categoryCount, { opacity }]} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    height: 24,
    width: 150,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  headerSubtitle: {
    height: 16,
    width: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  categoryImage: {
    height: 120,
    backgroundColor: '#e0e0e0',
  },
  categoryInfo: {
    padding: 12,
  },
  categoryName: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryCount: {
    height: 12,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default CategoriesSkeleton;
