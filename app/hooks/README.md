# Hooks Layer

This folder contains custom React hooks that encapsulate component logic.

## Purpose
- Extract reusable logic from components
- Make components cleaner and focused on UI
- Improve testability
- Share logic across multiple components

## Architecture Pattern
```
Component → Custom Hook → Service Layer → Firebase/API
```

## Available Hooks

### useSearch.js
Custom hook for search functionality:
- Loads products, companies, and categories on mount
- Provides real-time search filtering
- Returns lookup maps for company and category names
- Handles loading and error states

**Usage:**
```javascript
import { useSearch } from '../hooks/useSearch';

const MyComponent = () => {
  const {
    searchQuery,
    results,
    loading,
    error,
    companyMap,
    categoryMap,
    handleSearch
  } = useSearch();

  // Use the hook data and functions in your component
};
```

### useProductDetail.js
Custom hook for product detail screen (already exists):
- Fetches single product by ID
- Loads related products
- Handles loading states

## Best Practices

1. **Name with 'use' prefix** - All custom hooks must start with 'use'
2. **Return an object** - Return multiple values as an object, not array
3. **Handle side effects** - Use useEffect for data fetching, cleanup, etc.
4. **Memoize expensive computations** - Use useMemo and useCallback
5. **Keep hooks pure** - Don't directly manipulate DOM or perform side effects outside useEffect
6. **Document return values** - Use JSDoc to describe what the hook returns

## Creating a New Hook

Template:
```javascript
/**
 * useMyHook
 * Description of what this hook does
 * 
 * @returns {Object} Object containing:
 *   - data: The main data
 *   - loading: Loading state
 *   - error: Error message
 *   - refetch: Function to reload data
 */

import { useEffect, useState } from 'react';
import { myService } from '../services/myService';

export const useMyHook = (params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await myService.fetchData(params);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  const refetch = () => {
    // Refetch logic
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};
```

## Common Patterns

### Data Fetching Hook
```javascript
export const useDataFetcher = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData(url).then(setData).finally(() => setLoading(false));
  }, [url]);
  
  return { data, loading };
};
```

### Form Hook
```javascript
export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  
  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };
  
  return { values, handleChange };
};
```

## Future Hooks to Add
- `useCart.js` - Cart state management
- `useAuth.js` - Authentication state
- `useCategories.js` - Categories data
- `useProducts.js` - Products listing with filters
- `useForm.js` - Generic form handling
