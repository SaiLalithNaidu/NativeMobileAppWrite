import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/constants';
import { calculateDiscount, formatPrice } from '../../utils/helpers';

// ============================================================================
// COMPANY CARD
// ============================================================================

export const CompanyCard = ({ company, onPress, categoriesCount, productsCount }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {company.logoUrl && (
          <Image
            source={{ uri: company.logoUrl }}
            style={styles.companyLogo}
            resizeMode="contain"
          />
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {company.name || 'Unnamed Company'}
          </Text>
          {company.description && (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {company.description}
            </Text>
          )}
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              📂 {categoriesCount} Categories
            </Text>
            <Text style={styles.statsText}>
              📦 {productsCount} Products
            </Text>
          </View>
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Categories →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// CATEGORY CARD
// ============================================================================

export const CategoryCard = ({ category, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {category.imageUrl && (
          <Image
            source={{ uri: category.imageUrl }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {category.title || 'Unnamed Category'}
          </Text>
          {category.description && (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {category.description}
            </Text>
          )}
          {category.productsCount && (
            <Text style={styles.statsText}>
              {category.productsCount} products
            </Text>
          )}
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Products →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// PRODUCT CARD
// ============================================================================

export const ProductCard = ({ product, onPress }) => {
  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {product.imageUrl && (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
      )}
      {discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}% OFF</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title || 'Unnamed Product'}
        </Text>
        {product.description && (
          <Text style={styles.productDescription} numberOfLines={3}>
            {product.description}
          </Text>
        )}
        <View style={styles.priceContainer}>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
          <Text style={styles.price}>
            {formatPrice(product.price || 0)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// LIST ITEM CARD (for admin panel)
// ============================================================================

export const ListItemCard = ({ title, subtitle, selected, onPress, onDelete, icon }) => {
  return (
    <View style={styles.listItemContainer}>
      <TouchableOpacity
        style={[styles.listItem, selected && styles.listItemSelected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {icon && <View style={styles.listItemIcon}>{icon}</View>}
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.listItemSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          {icon && React.cloneElement(icon, { color: COLORS.ERROR })}
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.REGULAR,
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  companyLogo: {
    width: 60,
    height: 60,
    marginRight: SPACING.MEDIUM,
    borderRadius: RADIUS.MEDIUM,
  },
  categoryImage: {
    width: 60,
    height: 60,
    marginRight: SPACING.MEDIUM,
    borderRadius: RADIUS.MEDIUM,
  },
  cardTitle: {
    fontSize: FONTS.SIZE.MEDIUM,
    fontWeight: FONTS.WEIGHT.SEMIBOLD,
    color: COLORS.SECONDARY,
    marginBottom: SPACING.TINY,
  },
  cardDescription: {
    fontSize: FONTS.SIZE.SMALL,
    color: COLORS.GRAY,
    marginBottom: SPACING.SMALL,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  statsText: {
    fontSize: FONTS.SIZE.SMALL,
    color: COLORS.GRAY,
  },
  actionButton: {
    marginTop: SPACING.TINY,
    paddingVertical: SPACING.TINY,
    paddingHorizontal: SPACING.SMALL,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.SMALL,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZE.SMALL,
    fontWeight: FONTS.WEIGHT.MEDIUM,
  },
  // Product Card
  productCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.SMALL,
    right: SPACING.SMALL,
    backgroundColor: COLORS.ERROR,
    paddingVertical: SPACING.TINY,
    paddingHorizontal: SPACING.SMALL,
    borderRadius: RADIUS.SMALL,
  },
  discountText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZE.SMALL,
    fontWeight: FONTS.WEIGHT.BOLD,
  },
  productInfo: {
    padding: SPACING.REGULAR,
  },
  productTitle: {
    fontSize: FONTS.SIZE.LARGE,
    fontWeight: FONTS.WEIGHT.SEMIBOLD,
    color: COLORS.SECONDARY,
    marginBottom: SPACING.SMALL,
  },
  productDescription: {
    fontSize: FONTS.SIZE.SMALL,
    color: COLORS.GRAY,
    marginBottom: SPACING.SMALL,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SMALL,
    marginTop: SPACING.SMALL,
  },
  price: {
    fontSize: FONTS.SIZE.XLARGE,
    fontWeight: FONTS.WEIGHT.BOLD,
    color: COLORS.PRIMARY,
  },
  originalPrice: {
    fontSize: FONTS.SIZE.MEDIUM,
    color: COLORS.GRAY,
    textDecorationLine: 'line-through',
  },
  // List Item Card
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.REGULAR,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  listItemSelected: {
    backgroundColor: '#fff0f0',
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
  },
  listItemIcon: {
    marginRight: SPACING.SMALL,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: FONTS.SIZE.MEDIUM,
    fontWeight: FONTS.WEIGHT.MEDIUM,
    color: COLORS.SECONDARY,
  },
  listItemSubtitle: {
    fontSize: FONTS.SIZE.SMALL,
    color: COLORS.GRAY,
    marginTop: SPACING.TINY,
  },
  checkmark: {
    fontSize: FONTS.SIZE.XLARGE,
    color: COLORS.PRIMARY,
    fontWeight: FONTS.WEIGHT.BOLD,
  },
  deleteButton: {
    marginLeft: SPACING.SMALL,
    padding: SPACING.SMALL,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
});

export default {
  CompanyCard,
  CategoryCard,
  ProductCard,
  ListItemCard,
};
