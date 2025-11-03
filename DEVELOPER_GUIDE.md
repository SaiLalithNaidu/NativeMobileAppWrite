# Developer Guide - Clean Architecture

## 🚀 For New Team Members

### Your First 15 Minutes
1. Read `ARCHITECTURE.md` (5 min) - Understand the 4 layers
2. Read `SEARCH_ARCHITECTURE_DIAGRAM.md` (5 min) - See visual flow  
3. Open `app/services/searchService.js` + `app/hooks/useSearch.js` + `app/(tabs)/search.jsx` side-by-side (5 min)

### What You'll Learn
- How to separate UI from logic
- How to create reusable services
- How to write clean, maintainable code
- How to follow our established patterns

---

## 📝 Creating a New Feature in 3 Steps

### Step 1: Service (Business Logic)
**File**: `app/services/myFeatureService.js`

```javascript
/**
 * MyFeature Service
 * Handles [describe functionality]
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

class MyFeatureService {
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

export const myFeatureService = new MyFeatureService();
```

### Step 2: Hook (State Management)
**File**: `app/hooks/useMyFeature.js`

```javascript
/**
 * useMyFeature Hook
 * Manages state for MyFeature
 */

import { useState, useEffect } from 'react';
import { myFeatureService } from '../../app/services/myFeatureService';

export const useMyFeature = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await myFeatureService.fetchData();
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

### Step 3: Component (UI Only)
**File**: `app/(tabs)/myFeature.jsx`

```javascript
/**
 * MyFeature Screen
 * Displays [what it shows]
 */

import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useMyFeature } from '../hooks/useMyFeature';

const MyFeature = () => {
  const { data, loading, error } = useMyFeature();

  if (loading) return <LoadingUI />;
  if (error) return <ErrorUI message={error} />;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ItemCard item={item} />}
    />
  );
};

export default MyFeature;
```

---

## ✅ Code Quality Checklist

Before committing, verify:

### Service ✅
- [ ] JSDoc comments on all functions
- [ ] Try/catch for error handling
- [ ] Console logs with emojis (✅ ❌ 🔍)
- [ ] No React code (no useState, useEffect)
- [ ] Singleton export

### Hook ✅
- [ ] Named with 'use' prefix
- [ ] Returns object (not array)
- [ ] JSDoc comment with return types
- [ ] useMemo for expensive operations
- [ ] useCallback for functions

### Component ✅
- [ ] UI rendering only
- [ ] Uses custom hook for logic
- [ ] Handles loading/error states
- [ ] JSDoc header comment
- [ ] StyleSheet.create() for styles

---

## 🎯 Common Patterns

### Fetch on Mount
```javascript
useEffect(() => {
  const load = async () => {
    const result = await service.fetch();
    setData(result);
  };
  load();
}, []);
```

### Map Lookups (O(1))
```javascript
const nameMap = useMemo(() => {
  const m = new Map();
  items.forEach(i => m.set(i.id, i.name));
  return m;
}, [items]);
```

### Parallel Fetching
```javascript
const [a, b, c] = await Promise.all([
  service1.fetch(),
  service2.fetch(),
  service3.fetch()
]);
```

### Navigation
```javascript
router.push({
  pathname: '/detail',
  params: { id: item.id }
});
```

---

## 📚 Essential Reading

| Document | Purpose | Time |
|----------|---------|------|
| `ARCHITECTURE.md` | Complete architecture guide | 15 min |
| `CODE_REFERENCE.md` | All functions & patterns | 20 min |
| `SEARCH_ARCHITECTURE_DIAGRAM.md` | Visual flow diagrams | 10 min |
| `REFACTOR_SUMMARY.md` | What was done & why | 5 min |

---

## 🐛 Debugging

### Service not working?
1. Check console for ❌ errors
2. Verify Firestore collection name
3. Check Firebase rules

### Hook not updating?
1. Check useEffect dependencies
2. Verify service call succeeds
3. Use React DevTools

### Component not rendering?
1. Check loading/error states
2. Verify FlatList keyExtractor
3. Use React Native Debugger

---

## 💡 Best Practices

1. **Separation of Concerns**
   - Service = Data operations
   - Hook = State management
   - Component = UI rendering

2. **Always Document**
   - JSDoc for functions
   - Header comments for files

3. **Handle All States**
   - Loading, Error, Empty, Success

4. **Performance**
   - useMemo for expensive calculations
   - useCallback for function props

---

## 🎉 You're Ready!

Study the examples:
- `app/services/searchService.js` - Perfect service example
- `app/hooks/useSearch.js` - Perfect hook example
- `app/(tabs)/search.jsx` - Perfect component example

**Follow these patterns and you'll write clean, maintainable code!** 🚀

---

*For detailed templates and examples, see CODE_REFERENCE.md*
