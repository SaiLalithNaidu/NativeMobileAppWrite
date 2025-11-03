# Code Structure Reference

This document catalogs all custom functions, hooks, and services for easy reference and reuse in future implementations.

## Table of Contents
1. [Custom Hooks](#custom-hooks)
2. [Service Functions](#service-functions)
3. [Utility Functions](#utility-functions)
4. [Component Patterns](#component-patterns)
5. [Navigation Patterns](#navigation-patterns)

---

## Custom Hooks

### useSearch
**File**: `app/hooks/useSearch.js`

**Purpose**: Manages search functionality with data fetching and filtering

**Returns**:
```javascript
{
  searchQuery: string,        // Current search text
  results: Array,             // Filtered products
  loading: boolean,           // Loading state
  error: string,              // Error message
  companyMap: Map,            // ID → name lookup
  categoryMap: Map,           // ID → title lookup
  handleSearch: (text) => void // Search handler
}
```

**Usage**:
```javascript
import { useSearch } from '../hooks/useSearch';

const MyComponent = () => {
  const { results, loading, handleSearch } = useSearch();
  
  return (
    <TextInput onChangeText={handleSearch} />
    <FlatList data={results} />
  );
};
```

**Implementation Details**:
- Fetches all products/companies/categories on mount
- Uses `useMemo` for Map lookups (O(1) performance)
- Client-side filtering for real-time search
- Delegates data operations to `searchService`

---

### useProductDetail
**File**: `app/hooks/useProductDetail.js` (existing)

**Purpose**: Fetches product details and related products

**Returns**:
```javascript
{
  product: Object,            // Product data
  relatedProducts: Array,     // Related products
  loading: boolean,
  error: string
}
```

---

## Service Functions

### SearchService
**File**: `app/services/searchService.js`

**Purpose**: Handles all search-related data operations

**Class**: `SearchService` (singleton exported as `searchService`)

#### Methods:

##### 1. fetchProducts()
```javascript
async fetchProducts(): Promise<Array>
```
- Fetches all products from Firestore
- Returns array of product objects with `id` field
- Logs count with ✅ emoji

**Usage**:
```javascript
const products = await searchService.fetchProducts();
```

##### 2. fetchCompanies()
```javascript
async fetchCompanies(): Promise<Array>
```
- Fetches all companies from Firestore
- Returns array of company objects

##### 3. fetchCategories()
```javascript
async fetchCategories(): Promise<Array>
```
- Fetches all categories from Firestore
- Returns array of category objects

##### 4. loadSearchData()
```javascript
async loadSearchData(): Promise<{
  products: Array,
  companies: Array,
  categories: Array
}>
```
- Loads all search data in parallel using `Promise.all`
- Most efficient way to fetch multiple collections
- Handles errors gracefully

**Usage**:
```javascript
const { products, companies, categories } = await searchService.loadSearchData();
```

##### 5. filterProducts()
```javascript
filterProducts(products: Array, query: string): Array
```
- Client-side filtering by title and description
- Case-insensitive search
- Logs search query and result count with 🔍 emoji

**Usage**:
```javascript
const results = searchService.filterProducts(allProducts, 'soap');
```

##### 6. getCompanyName()
```javascript
getCompanyName(companies: Array, companyId: string): string
```
- Helper to get company name by ID
- Returns 'Unknown Company' if not found

##### 7. getCategoryTitle()
```javascript
getCategoryTitle(categories: Array, categoryId: string): string
```
- Helper to get category title by ID
- Returns 'Unknown Category' if not found

---

## Utility Functions

### Map-Based Lookups
**Pattern**: Convert arrays to Maps for O(1) lookups

```javascript
const companyMap = useMemo(() => {
  const map = new Map();
  companies.forEach(c => map.set(c.companyId || c.id, c.name));
  return map;
}, [companies]);

// Usage
const companyName = companyMap.get(product.companyId) || 'Unknown';
```

**Why**: Much faster than `array.find()` which is O(n)

---

## Component Patterns

### Grid Layout with FlatList
**Pattern**: 2-column grid with TouchableOpacity navigation

```javascript
<FlatList
  data={items}
  numColumns={2}
  columnWrapperStyle={styles.gridRow}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handlePress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Text>{item.title}</Text>
    </TouchableOpacity>
  )}
/>

const styles = StyleSheet.create({
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: '48%',  // Leave 4% gap between columns
    backgroundColor: 'white',
    borderRadius: 10,
  },
  productImage: {
    width: '100%',
    height: 140,
  },
});
```

---

### Loading & Error States
**Pattern**: Centralized loading and error UI

```javascript
if (loading) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="coral" />
      <Text style={{ marginTop: 8, color: '#666' }}>Loading...</Text>
    </View>
  );
}

if (error) {
  return (
    <View style={styles.center}>
      <FontAwesome5 name="exclamation-circle" size={48} color="coral" />
      <Text style={{ marginTop: 16, color: '#666' }}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
```

---

### Search Input with Icon
**Pattern**: Search bar with FontAwesome icon

```javascript
<View style={styles.searchContainer}>
  <FontAwesome5 name="search" size={20} color="#999" style={styles.searchIcon} />
  <TextInput 
    placeholder="Search products…" 
    style={styles.searchInput}
    value={searchQuery}
    onChangeText={handleSearch}
    autoCorrect={false}
    autoCapitalize="none"
    returnKeyType="search"
  />
</View>

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 16,
    backgroundColor: 'white',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
});
```

---

## Navigation Patterns

### Router Push with Params
**Pattern**: Navigate to screen with parameters

```javascript
import { useRouter } from 'expo-router';

const MyComponent = () => {
  const router = useRouter();
  
  const handleNavigation = (item) => {
    router.push({
      pathname: '/productDetail',
      params: { productId: item.id }
    });
  };
  
  return (
    <TouchableOpacity onPress={() => handleNavigation(item)}>
      <Text>View Details</Text>
    </TouchableOpacity>
  );
};
```

### Receive Params in Target Screen
**Pattern**: Get params from navigation

```javascript
import { useLocalSearchParams } from 'expo-router';

const ProductDetail = () => {
  const { productId } = useLocalSearchParams();
  
  useEffect(() => {
    // Fetch product using productId
  }, [productId]);
};
```

### Pass Complex Objects
**Pattern**: Serialize objects through route params

```javascript
// Sender
router.push({
  pathname: '/categories',
  params: { company: JSON.stringify(companyObject) }
});

// Receiver
const { company } = useLocalSearchParams();
const companyData = JSON.parse(company);
```

---

## Firebase Patterns

### Fetch Collection
**Pattern**: Get all documents from a collection

```javascript
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const fetchData = async () => {
  try {
    const collectionRef = collection(db, 'collectionName');
    const snapshot = await getDocs(collectionRef);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Query with Filters
**Pattern**: Filter documents in a collection

```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';

const fetchFiltered = async (companyId) => {
  const collectionRef = collection(db, 'products');
  const q = query(
    collectionRef,
    where('companyId', '==', companyId),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Parallel Fetches
**Pattern**: Fetch multiple collections simultaneously

```javascript
const loadAllData = async () => {
  const [products, companies, categories] = await Promise.all([
    fetchProducts(),
    fetchCompanies(),
    fetchCategories()
  ]);
  
  return { products, companies, categories };
};
```

---

## Performance Patterns

### useMemo for Expensive Computations
**When**: Creating Maps, filtering large arrays, complex calculations

```javascript
const expensiveValue = useMemo(() => {
  // Expensive computation
  return computeExpensiveValue(data);
}, [data]); // Only recompute when data changes
```

### useCallback for Function Props
**When**: Passing functions to child components

```javascript
const handlePress = useCallback((id) => {
  router.push(`/product/${id}`);
}, []); // Function identity remains stable
```

---

## Error Handling Patterns

### Try-Catch in Services
**Pattern**: Catch errors and throw user-friendly messages

```javascript
async fetchData() {
  try {
    const result = await apiCall();
    console.log('✅ Success:', result.length);
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw new Error('Failed to load data. Please try again.');
  }
}
```

### Error State in Hooks
**Pattern**: Store and expose error state

```javascript
const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setError(null);
      const data = await service.fetchData();
      setData(data);
    } catch (err) {
      setError(err.message);
    }
  };
  
  loadData();
}, []);

return { data, error, loading };
```

---

## JSDoc Documentation Patterns

### Function Documentation
```javascript
/**
 * Function description
 * @param {type} paramName - Parameter description
 * @returns {type} Return value description
 */
```

### Hook Documentation
```javascript
/**
 * useMyHook
 * Hook description and purpose
 * 
 * @param {type} param - Parameter description
 * @returns {Object} Object containing:
 *   - property1: Description
 *   - property2: Description
 */
```

### File Header Documentation
```javascript
/**
 * File Name
 * Brief description of what this file does
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * Usage:
 * import { myFunction } from './myFile';
 * const result = myFunction();
 */
```

---

## Quick Reference Checklist

When creating new features:

- [ ] Create service in `app/services/` for business logic
- [ ] Create hook in `app/hooks/` for state management
- [ ] Keep component focused on UI only
- [ ] Use `useMemo` for Maps and expensive computations
- [ ] Use `useCallback` for functions passed as props
- [ ] Add JSDoc comments to all public functions
- [ ] Handle loading and error states
- [ ] Add console logs with emojis (✅ ❌ 🔍)
- [ ] Test navigation flows
- [ ] Update this documentation for reusable patterns

---

## Migration Todos

Future enhancements to replicate this structure:

1. **Cart Feature**:
   - Create `cartService.js` with add/remove/clear methods
   - Create `useCart.js` hook for cart state
   - Refactor existing CartContext to use service

2. **Products Feature**:
   - Create `productService.js` with CRUD operations
   - Create `useProducts.js` hook with filters/pagination
   - Refactor products.jsx to use hook

3. **Categories Feature**:
   - Create `categoryService.js`
   - Create `useCategories.js` hook
   - Refactor categories.jsx

4. **Authentication**:
   - Create `authService.js`
   - Create `useAuth.js` hook
   - Migrate AuthContext to use service

---

*Last Updated: November 3, 2025*
*This document is maintained as a living reference for the project architecture*
