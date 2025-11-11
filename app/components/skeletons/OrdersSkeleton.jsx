/**
 * Orders Screen Skeleton Loader
 * Flipkart-style shimmer skeleton for orders list
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';

const OrdersSkeleton = () => {
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
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statCard}>
            <Animated.View style={[styles.statNumber, { opacity }]} />
            <Animated.View style={[styles.statLabel, { opacity }]} />
          </View>
        ))}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[1, 2, 3, 4].map((i) => (
          <Animated.View key={i} style={[styles.filterTab, { opacity }]} />
        ))}
      </View>

      {/* Orders List */}
      <View style={styles.ordersList}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <Animated.View style={[styles.orderNumber, { opacity }]} />
              <Animated.View style={[styles.orderStatus, { opacity }]} />
            </View>
            
            {/* Order Items */}
            <View style={styles.orderItems}>
              <Animated.View style={[styles.orderItemImage, { opacity }]} />
              <View style={styles.orderItemInfo}>
                <Animated.View style={[styles.orderItemTitle, { opacity }]} />
                <Animated.View style={[styles.orderItemSubtitle, { opacity }]} />
                <Animated.View style={[styles.orderItemPrice, { opacity }]} />
              </View>
            </View>

            {/* Order Footer */}
            <View style={styles.orderFooter}>
              <View style={styles.orderFooterLeft}>
                <Animated.View style={[styles.orderDate, { opacity }]} />
                <Animated.View style={[styles.orderTotal, { opacity }]} />
              </View>
              <Animated.View style={[styles.orderButton, { opacity }]} />
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    height: 24,
    width: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  statLabel: {
    height: 12,
    width: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  filterTab: {
    height: 36,
    width: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 18,
  },
  ordersList: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderNumber: {
    height: 16,
    width: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  orderStatus: {
    height: 24,
    width: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
  orderItems: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginRight: 12,
  },
  orderItemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderItemTitle: {
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
  },
  orderItemSubtitle: {
    height: 12,
    width: '70%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
  },
  orderItemPrice: {
    height: 16,
    width: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  orderFooterLeft: {
    flex: 1,
  },
  orderDate: {
    height: 12,
    width: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  orderTotal: {
    height: 16,
    width: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  orderButton: {
    height: 36,
    width: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
});

export default OrdersSkeleton;
