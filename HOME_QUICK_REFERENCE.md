# Quick Reference: Home Screen Structure

## 📂 File Structure

```javascript
home.jsx
├── SCREEN COMPONENTS (Line 15-200)
│   ├── CompaniesScreen      // Lists all companies
│   ├── CategoriesScreen     // Lists categories for selected company
│   └── ProductsScreen       // Lists products (by category or search)
│
├── MAIN COMPONENT (Line 210)
│   └── State Management     // All useState hooks
│
├── DATA FETCHING (Line 230)
│   ├── fetchCompanies()
│   ├── fetchCategories()
│   └── fetchProducts()
│
├── LIFECYCLE (Line 280)
│   └── useEffect            // Load data on mount
│
├── HELPERS (Line 310)
│   ├── getCompanyIdentifier()
│   ├── getCategoryCount()
│   └── getProductCount()
│
├── NAVIGATION (Line 330)
│   ├── handleCompanySelect()
│   ├── handleCategorySelect()
│   ├── handleSearch()
│   ├── handleBack()
│   └── resetToCompanies()
│
├── LOADING/ERROR (Line 400)
│   ├── Loading spinner
│   └── Error display
│
├── RENDER (Line 430)
│   └── renderScreen()       // Switches between screen components
│
└── MAIN RENDER (Line 470)
    ├── ImageCarousel
    ├── Search Bar
    └── Dynamic Content
```

---

## 🎯 Quick Actions

### To Add a New Screen
1. Create component in SCREEN COMPONENTS section
2. Add new view state (e.g., `'productDetail'`)
3. Add case in `renderScreen()` switch
4. Add navigation handler

### To Modify Navigation
1. Go to NAVIGATION HANDLERS section
2. Update relevant handler function
3. Navigation logic is centralized here

### To Change Data Fetching
1. Go to DATA FETCHING FUNCTIONS section
2. Modify fetch function
3. All Firebase queries are here

### To Update UI
1. Go to SCREEN COMPONENTS section
2. Modify the specific screen component
3. UI is separated from logic

---

## 🔧 Common Modifications

### Add a Filter
```javascript
// In HELPERS section
const filterByPrice = (products, maxPrice) => {
  return products.filter(p => p.price <= maxPrice);
};

// Use in NAVIGATION HANDLERS
const handlePriceFilter = (maxPrice) => {
  const filtered = filterByPrice(filteredProducts, maxPrice);
  setFilteredProducts(filtered);
};
```

### Add Animation
```javascript
// Install: npm install react-native-reanimated

// In MAIN COMPONENT
import Animated, { FadeIn } from 'react-native-reanimated';

// Wrap screen component
<Animated.View entering={FadeIn}>
  <CompaniesScreen {...props} />
</Animated.View>
```

### Add Product Detail
```javascript
// 1. Add new screen component
const ProductDetailScreen = ({ product, onBack }) => (
  <View>
    <TouchableOpacity onPress={onBack}>
      <Text>← Back</Text>
    </TouchableOpacity>
    <Text>{product.title}</Text>
    {/* Full product details */}
  </View>
);

// 2. Add handler
const handleProductSelect = (product) => {
  setSelectedProduct(product);
  setView('productDetail');
};

// 3. Add case in renderScreen()
case 'productDetail':
  return <ProductDetailScreen product={selectedProduct} onBack={handleBack} />;
```

---

## 🐛 Debugging Tips

### Check Current State
```javascript
// Add in render function
console.log('Current view:', view);
console.log('Selected company:', selectedCompany?.name);
console.log('Selected category:', selectedCategory?.title);
console.log('Search query:', searchQuery);
```

### Trace Navigation
```javascript
// Already added in handlers:
handleCompanySelect → console.log(`✓ Selected: ${company.name}`)
handleCategorySelect → console.log(`✓ Selected: ${category.title}`)
handleSearch → console.log(`🔍 Search: "${text}"`)
```

### Check Data
```javascript
console.log('Companies:', companies.length);
console.log('Categories:', allCategories.length);
console.log('Products:', allProducts.length);
console.log('Filtered categories:', filteredCategories.length);
console.log('Filtered products:', filteredProducts.length);
```

---

## 📋 View States Explained

| View State | When Active | Back Button Action |
|-----------|-------------|-------------------|
| `companies` | Initial load, after search clear | N/A |
| `categories` | Company selected | → `companies` |
| `products` | Category selected OR search | → `categories` OR `companies` |

---

## 🎨 Styling Guide

All styles are in the StyleSheet at the bottom of the file:

```javascript
styles.mainContainer      // Main wrapper
styles.imageContainer     // Carousel area
styles.searchContainer    // Search bar
styles.contentContainer   // Dynamic content area

// Company/Category items
styles.categoryItem       // Card container
styles.companyLogo        // Image
styles.categoryInfo       // Text content
styles.viewDetailsBtn     // Action button

// Products
styles.productItem        // Product card
styles.productImage       // Product image
styles.priceContainer     // Price display

// Headers
styles.headerContainer    // Section header
styles.backButton         // Back navigation
styles.headerTitle        // Title text
```

---

## ⚡ Performance Tips

### 1. Memoize Callbacks
```javascript
import { useCallback } from 'react';

const handleCompanySelect = useCallback((company) => {
  // ... logic
}, [allCategories, allProducts]);
```

### 2. Memoize Screen Components
```javascript
import { memo } from 'react';

const CompaniesScreen = memo(({ companies, onCompanySelect, ... }) => {
  // ... render
});
```

### 3. Use FlatList Optimizations
```javascript
<FlatList
  data={products}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

---

## 🚀 Extension Ideas

1. **Pull to Refresh**: Add refresh control to reload data
2. **Infinite Scroll**: Load products in batches
3. **Favorites**: Save favorite products to AsyncStorage
4. **Sort Options**: Sort by price, name, date
5. **Category Icons**: Add icons to categories
6. **Product Badges**: "New", "Sale", "Popular" badges
7. **Share Products**: Share product links
8. **Offline Mode**: Cache data with AsyncStorage

---

## 📱 Testing Commands

```bash
# Run the app
npm start

# Clear cache
npm start -- --clear

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## ✅ Checklist for New Features

Before adding a feature:
- [ ] Determine which section it belongs to
- [ ] Add necessary state variables
- [ ] Create/modify screen component if needed
- [ ] Add navigation handler if needed
- [ ] Add helper function if needed
- [ ] Test all navigation paths
- [ ] Check console logs for errors
- [ ] Update documentation

---

**Quick, clean, and organized! Easy to maintain and extend.** 🎉
