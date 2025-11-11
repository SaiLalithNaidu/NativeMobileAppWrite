/**
 * Warehouse Skeleton Loader
 * Flipkart-style shimmer skeleton for warehouse screen
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const WarehouseSkeleton = () => {
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
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Animated.View style={[styles.headerTitle, { opacity }]} />
        <Animated.View style={[styles.headerSubtitle, { opacity }]} />
      </View>

      {/* Quick Actions Skeleton */}
      <View style={styles.quickActions}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        <View style={styles.actionsRow}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.actionItem}>
              <Animated.View style={[styles.actionCircle, { opacity }]} />
              <Animated.View style={[styles.actionLabel, { opacity }]} />
            </View>
          ))}
        </View>
      </View>

      {/* Stats Cards Skeleton */}
      <View style={styles.statsSection}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        
        {/* Primary Stats Row */}
        <View style={styles.primaryStatsRow}>
          {[1, 2].map((i) => (
            <View key={i} style={styles.primaryStatCard}>
              <Animated.View style={[styles.statIcon, { opacity }]} />
              <Animated.View style={[styles.statNumber, { opacity }]} />
              <Animated.View style={[styles.statLabel, { opacity }]} />
            </View>
          ))}
        </View>

        {/* Secondary Stats Row */}
        <View style={styles.secondaryStatsRow}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.secondaryStatCard}>
              <Animated.View style={[styles.secondaryStatIcon, { opacity }]} />
              <Animated.View style={[styles.secondaryStatNumber, { opacity }]} />
              <Animated.View style={[styles.secondaryStatLabel, { opacity }]} />
            </View>
          ))}
        </View>

        {/* Value Card */}
        <View style={styles.valueCard}>
          <Animated.View style={[styles.valueTitle, { opacity }]} />
          <Animated.View style={[styles.valueAmount, { opacity }]} />
          <Animated.View style={[styles.valueSubtext, { opacity }]} />
        </View>
      </View>

      {/* Sales Section Skeleton */}
      <View style={styles.salesSection}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        <Animated.View style={[styles.salesSubtitle, { opacity }]} />
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {[1, 2, 3, 4].map((i) => (
            <Animated.View key={i} style={[styles.periodButton, { opacity }]} />
          ))}
        </View>

        {/* Sales Stats Cards */}
        <View style={styles.salesStatsRow}>
          {[1, 2].map((i) => (
            <View key={i} style={styles.salesStatCard}>
              <Animated.View style={[styles.salesStatIcon, { opacity }]} />
              <Animated.View style={[styles.salesStatNumber, { opacity }]} />
              <Animated.View style={[styles.salesStatLabel, { opacity }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0080ff',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    height: 28,
    width: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    marginBottom: 8,
  },
  headerSubtitle: {
    height: 16,
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  quickActions: {
    backgroundColor: '#F5F5F7',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    height: 20,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  actionLabel: {
    height: 12,
    width: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  statsSection: {
    padding: 20,
  },
  primaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  primaryStatCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  statNumber: {
    height: 32,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 4,
  },
  statLabel: {
    height: 14,
    width: '70%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryStatCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryStatIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  secondaryStatNumber: {
    marginTop: 8,
    height: 20,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
  },
  secondaryStatLabel: {
    height: 12,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  valueCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  valueTitle: {
    height: 16,
    width: '40%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
  },
  valueAmount: {
    height: 28,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 4,
  },
  valueSubtext: {
    height: 14,
    width: '45%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  salesSection: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  salesSubtitle: {
    height: 14,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  salesStatsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  salesStatCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  salesStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  salesStatNumber: {
    height: 24,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
  },
  salesStatLabel: {
    height: 12,
    width: '70%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default WarehouseSkeleton;
