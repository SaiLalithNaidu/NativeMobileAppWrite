# Search Feature Architecture

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
│                 (Types in Search Input Field)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT LAYER                             │
│                    app/(tabs)/search.jsx                         │
│                                                                   │
│  • Renders UI (TextInput, FlatList, Loading states)             │
│  • Handles user events (onChangeText, onPress)                  │
│  • Delegates logic to useSearch hook                            │
│                                                                   │
│  const { results, handleSearch } = useSearch();                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         HOOK LAYER                               │
│                    app/hooks/useSearch.js                        │
│                                                                   │
│  • Manages state (searchQuery, results, loading, error)         │
│  • useEffect: Load initial data on mount                        │
│  • useMemo: Create lookup Maps (O(1) performance)               │
│  • handleSearch: Filter logic orchestration                     │
│                                                                   │
│  const { products, companies } = await searchService.loadData() │
│  const filtered = searchService.filterProducts(products, query) │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│                  app/services/searchService.js                   │
│                                                                   │
│  • Pure business logic (no React, no state)                     │
│  • Data fetching: fetchProducts(), fetchCompanies()             │
│  • Data operations: filterProducts(), getCompanyName()          │
│  • Error handling with try/catch                                │
│  • Console logging with emojis (✅ ❌ 🔍)                        │
│                                                                   │
│  const productsRef = collection(db, 'products');                │
│  const snapshot = await getDocs(productsRef);                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE/API LAYER                          │
│                     lib/firebase.js (db)                         │
│                                                                   │
│  • Firebase configuration                                        │
│  • Firestore database instance                                  │
│  • Collections: products, companies, categories                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
MOUNT PHASE:
Component → Hook → Service → Firebase
    ↓         ↓        ↓         ↓
  Render → useEffect → loadSearchData() → getDocs()
                  ↓                            ↓
            setState() ← Return Data ← Snapshot

SEARCH PHASE:
User Types → Component → Hook → Service
    ↓           ↓          ↓        ↓
onChangeText → handleSearch → filterProducts(local)
                         ↓              ↓
                   setState() ← Filtered Array
                         ↓
                   Re-render with results

NAVIGATION PHASE:
User Taps → Component → Router
    ↓           ↓          ↓
onPress → handleProductPress → router.push()
                                    ↓
                            productDetail screen
```

## File Dependencies

```
search.jsx
  ├── useSearch.js (hook)
  │     ├── searchService.js (service)
  │     │     └── firebase.js (config)
  │     ├── React hooks (useState, useEffect, useMemo)
  │     └── Returns: { results, loading, error, handleSearch, ... }
  │
  ├── expo-router (useRouter)
  ├── React Native components
  └── FontAwesome5 icons
```

## State Management

```javascript
// Component State: NONE (delegated to hook)

// Hook State:
{
  searchQuery: "",           // User input
  results: [],               // Filtered products
  loading: true,             // Initial load state
  error: "",                 // Error messages
  allProducts: [],           // Full dataset (local cache)
  companies: [],             // Company lookup data
  categories: []             // Category lookup data
}

// Computed Values (useMemo):
{
  companyMap: Map,           // O(1) company ID → name
  categoryMap: Map           // O(1) category ID → title
}
```

## Performance Optimizations

1. **Parallel Data Loading**: `Promise.all()` for 3 collections
2. **Map Lookups**: O(1) instead of array.find() O(n)
3. **useMemo**: Prevent Map recreation on every render
4. **Client-Side Filtering**: No API calls during search typing
5. **TouchableOpacity**: activeOpacity for better UX feedback

## Error Handling Strategy

```
Service Level:
  try { ... } 
  catch { 
    console.error('❌ Error');
    throw new Error('User-friendly message');
  }

Hook Level:
  try { const data = await service.method(); }
  catch (err) { setError(err.message); }

Component Level:
  if (error) return <ErrorUI />
```

## Testing Strategy (Future)

```javascript
// Unit Tests - Service Layer
describe('searchService', () => {
  test('filterProducts returns matching items', () => {
    const products = [{ title: 'Soap' }, { title: 'Shampoo' }];
    const results = searchService.filterProducts(products, 'soap');
    expect(results).toHaveLength(1);
  });
});

// Integration Tests - Hook Layer
describe('useSearch', () => {
  test('loads data on mount', async () => {
    const { result } = renderHook(() => useSearch());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.allProducts.length).toBeGreaterThan(0);
  });
});

// E2E Tests - Component Layer
describe('Search Screen', () => {
  test('user can search and navigate', async () => {
    render(<Search />);
    fireEvent.changeText(searchInput, 'soap');
    await waitFor(() => screen.getByText('Soap Product'));
    fireEvent.press(screen.getByText('Soap Product'));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/productDetail',
      params: { productId: '123' }
    });
  });
});
```

## Scalability Considerations

### Current Implementation (Client-Side)
- ✅ Good for: < 1,000 products
- ✅ Instant results (no network delay)
- ✅ Works offline after initial load
- ❌ Bad for: Large datasets (memory, initial load time)

### Future Enhancement (Server-Side)
When product count exceeds 1,000:
1. Implement Firestore full-text search (limited)
2. Add Algolia integration for advanced search
3. Implement pagination (load on scroll)
4. Add debouncing to reduce API calls

```javascript
// Future: Server-side search with Algolia
const handleSearch = useCallback(
  debounce(async (text) => {
    const results = await algolia.search(text);
    setResults(results);
  }, 300),
  []
);
```

## Reusability Guide

To replicate this architecture for other features:

1. **Create Service**: `app/services/myFeatureService.js`
   - Class with pure functions
   - Firebase operations
   - Error handling

2. **Create Hook**: `app/hooks/useMyFeature.js`
   - State management
   - useEffect for data loading
   - useMemo for optimizations
   - Return object with data and handlers

3. **Refactor Component**: `app/(tabs)/myFeature.jsx`
   - Import and use hook
   - Keep component thin (UI only)
   - Handle loading/error states

4. **Document**:
   - Add to CODE_REFERENCE.md
   - Update ARCHITECTURE.md
   - Create README in services/hooks folders

---

## Quick Copy-Paste Templates

### Service Template
```javascript
// app/services/myService.js
class MyService {
  async fetchData() {
    try {
      const ref = collection(db, 'collectionName');
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('✅ Data fetched:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error:', error);
      throw new Error('Failed to fetch data');
    }
  }
}
export const myService = new MyService();
```

### Hook Template
```javascript
// app/hooks/useMyFeature.js
export const useMyFeature = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await myService.fetchData();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return { data, loading, error };
};
```

### Component Template
```javascript
// app/(tabs)/myScreen.jsx
import { useMyFeature } from '../hooks/useMyFeature';

const MyScreen = () => {
  const { data, loading, error } = useMyFeature();

  if (loading) return <LoadingUI />;
  if (error) return <ErrorUI message={error} />;

  return <FlatList data={data} />;
};
```

---

*This diagram complements ARCHITECTURE.md and CODE_REFERENCE.md*
