/**
 * Search Screen Skeleton Loader
 * Flipkart-style shimmer skeleton for search results
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const SearchSkeleton = () => {
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
    <View style={styles.container}>
      {/* Search Bar Skeleton */}
      <View style={styles.searchBarContainer}>
        <Animated.View style={[styles.searchBar, { opacity }]} />
      </View>

      {/* Filter Chips Skeleton */}
      <View style={styles.filtersContainer}>
        {[1, 2, 3, 4].map((i) => (
          <Animated.View key={i} style={[styles.filterChip, { opacity }]} />
        ))}
      </View>

      {/* Search Results List */}
      <View style={styles.resultsList}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={styles.resultItem}>
            <Animated.View style={[styles.resultImage, { opacity }]} />
            <View style={styles.resultInfo}>
              <Animated.View style={[styles.resultTitle, { opacity }]} />
              <Animated.View style={[styles.resultSubtitle, { opacity }]} />
              <Animated.View style={[styles.resultPrice, { opacity }]} />
              <View style={styles.resultFooter}>
                <Animated.View style={[styles.resultRating, { opacity }]} />
                <Animated.View style={[styles.resultButton, { opacity }]} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchBarContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    height: 48,
    backgroundColor: '#e0e0e0',
    borderRadius: 24,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  filterChip: {
    height: 32,
    width: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImage: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultTitle: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  resultSubtitle: {
    height: 12,
    width: '70%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  resultPrice: {
    height: 18,
    width: 70,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultRating: {
    height: 20,
    width: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  resultButton: {
    height: 32,
    width: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
});

export default SearchSkeleton;
