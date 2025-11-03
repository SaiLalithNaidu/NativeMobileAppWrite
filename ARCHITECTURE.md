# Architecture Documentation

## Project Structure

```
app/
├── hooks/                    # Custom React hooks
│   ├── useSearch.js         # Search functionality hook
│   └── README.md            # Hooks documentation
│
├── services/                 # Business logic & data services
│   ├── searchService.js     # Search service (fetch & filter)
│   └── README.md            # Services documentation
│
├── components/               # Reusable UI components
│   ├── imageCarousel.jsx    # Image carousel component
│   └── AlertCard.jsx        # Custom alert component
│
├── (tabs)/                   # Bottom tab navigation screens
│   ├── home.jsx             # Home screen
│   ├── search.jsx           # Search screen
│   ├── cart.jsx             # Shopping cart
│   ├── profile.jsx          # User profile
│   └── adminPanel.jsx       # Admin CRUD operations
│
├── categories.jsx            # Full-screen categories view
├── products.jsx              # Full-screen products view
└── productDetail.jsx         # Full-screen product detail

contexts/
└── AuthContext.jsx           # Authentication context

lib/
└── firebase.js               # Firebase configuration
```

## Architecture Layers

### 1. Component Layer (UI)
**Location**: `app/(tabs)/*.jsx`, `app/*.jsx`
**Responsibility**: Render UI, handle user interactions
**Examples**: `search.jsx`, `home.jsx`, `productDetail.jsx`

**Best Practices**:
- Keep components thin and focused on UI only
- Use hooks for logic and state management
- Extract reusable UI elements to `app/components/`
- Document component with JSDoc header

### 2. Hook Layer (State & Effects)
**Location**: `app/hooks/*.js`
**Responsibility**: Encapsulate component logic, manage state, side effects
**Examples**: `useSearch.js`, `useProductDetail.js`

**Best Practices**:
- Name with 'use' prefix
- Return objects (not arrays) for multiple values
- Use useMemo/useCallback for optimization
- Document return values with JSDoc

### 3. Service Layer (Business Logic)
**Location**: `app/services/*.js`
**Responsibility**: Data fetching, business rules, API calls
**Examples**: `searchService.js`

**Best Practices**:
- Keep stateless (no internal state)
- Use singleton pattern
- Handle errors with try/catch
- Add console logs with emojis (✅ ❌ 🔍)

### 4. Context Layer (Global State)
**Location**: `contexts/*.jsx`
**Responsibility**: Shared state across app
**Examples**: `AuthContext.jsx`, `CartContext.jsx`

**Best Practices**:
- Only for truly global state
- Provide actions/methods, not just setters
- Use useMemo to prevent unnecessary re-renders

## Data Flow

```
User Action (Component)
    ↓
Custom Hook (useSearch)
    ↓
Service (searchService)
    ↓
Firebase/API
    ↓
Service processes response
    ↓
Hook updates state
    ↓
Component re-renders with new data
```

## Example: Search Feature

### Component (`search.jsx`)
```javascript
// ONLY UI rendering and event handlers
const Search = () => {
  const { results, loading, handleSearch } = useSearch();
  
  return (
    <View>
      <TextInput onChangeText={handleSearch} />
      <FlatList data={results} />
    </View>
  );
};
```

### Hook (`useSearch.js`)
```javascript
// State management and orchestration
export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch initial data
    const data = await searchService.loadSearchData();
    setAllProducts(data.products);
  }, []);
  
  const handleSearch = (text) => {
    const filtered = searchService.filterProducts(allProducts, text);
    setResults(filtered);
  };
  
  return { results, loading, handleSearch };
};
```

### Service (`searchService.js`)
```javascript
// Pure business logic - no state, no React
class SearchService {
  async loadSearchData() {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  filterProducts(products, query) {
    return products.filter(p => 
      p.title?.toLowerCase().includes(query.toLowerCase())
    );
  }
}
```

## Navigation Architecture

### Expo Router File-Based Routing
- `(tabs)/` folder → Bottom tab navigation
- Standalone files → Full-screen stack routes
- Pass params with `router.push({ pathname, params })`
- Receive params with `useLocalSearchParams()`

### Navigation Flows

**Home Flow**:
```
home.jsx → categories.jsx → products.jsx → productDetail.jsx
(tab)        (full-screen)    (full-screen)    (full-screen)
```

**Search Flow**:
```
search.jsx → productDetail.jsx
(tab)         (full-screen)
```

## Code Standards

### File Naming
- Components: PascalCase (e.g., `AlertCard.jsx`)
- Screens: camelCase (e.g., `productDetail.jsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useSearch.js`)
- Services: camelCase with 'Service' suffix (e.g., `searchService.js`)

### Import Order
1. React & React Native core
2. Third-party libraries (expo, firebase, etc.)
3. Custom hooks
4. Components
5. Services
6. Utils
7. Assets

### Documentation
- Add JSDoc header to all files describing purpose
- Document all public functions with param and return types
- Include usage examples in service/hook README files

## Performance Optimization

### useMemo
Use for expensive computations:
```javascript
const companyMap = useMemo(() => {
  const map = new Map();
  companies.forEach(c => map.set(c.id, c.name));
  return map;
}, [companies]);
```

### useCallback
Use for functions passed as props:
```javascript
const handlePress = useCallback((id) => {
  router.push(`/product/${id}`);
}, []);
```

### FlatList
- Always provide `keyExtractor`
- Use `getItemLayout` for fixed-height items
- Implement `onEndReached` for pagination

## Testing Strategy

### Unit Tests (Future)
- Test services independently (pure functions)
- Test hooks with React Testing Library
- Mock Firebase calls

### Integration Tests (Future)
- Test complete user flows
- Mock navigation
- Test error handling

## Future Enhancements

1. **Add more services**:
   - `productService.js` - Product CRUD
   - `cartService.js` - Cart operations
   - `orderService.js` - Order processing

2. **Add more hooks**:
   - `useCart.js` - Cart state management
   - `useProducts.js` - Products with filters/pagination
   - `useForm.js` - Generic form handling

3. **Optimize performance**:
   - Implement React.memo for list items
   - Add pagination to search results
   - Lazy load images

4. **Improve error handling**:
   - Create custom error boundary
   - Add retry mechanism for failed requests
   - Better offline support

## References

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
