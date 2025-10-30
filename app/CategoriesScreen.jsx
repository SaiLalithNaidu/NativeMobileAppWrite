import { FontAwesome5 } from '@expo/vector-icons';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CategoriesScreen = ({ 
  categories = [], 
  selectedCompany, 
  onCategorySelect, 
  onBack 
}) => {
  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => onCategorySelect(item)}
    >
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.categoryCardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.categoryCardImage, styles.placeholderImage]}>
          <FontAwesome5 name="box" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.categoryCardInfo}>
        <Text style={styles.categoryCardTitle} numberOfLines={2}>
          {item.title || "Unnamed Category"}
        </Text>
        {item.productCount !== undefined && item.productCount !== null && (
          <Text style={styles.productCountText}>
            {item.productCount} Products
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.categoriesContainer}>
      {/* Header */}
      <View style={styles.categoriesHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={18} color="#333" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.categoriesTitle}>
          {selectedCompany?.name || "Categories"}
        </Text>
        <Text style={styles.categoriesSubtitle}>
          {categories?.length || 0} categories
        </Text>
      </View>

      {/* Categories Grid */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContainer}
        renderItem={renderCategoryCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="box-open" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              No categories found for this company
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  categoriesHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  categoriesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  categoriesSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  gridContainer: {
    paddingHorizontal: 5,
    paddingVertical: 15,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardInfo: {
    padding: 12,
  },
  categoryCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    minHeight: 36,
  },
  productCountText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default CategoriesScreen;