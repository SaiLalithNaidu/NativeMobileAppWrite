# Home Screen Navigation Flow

## 📱 Screen Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOME TAB                                 │
│  (All navigation happens within this single tab)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      🏢 COMPANIES SCREEN                │
        │  ┌───────────────────────────────────┐  │
        │  │ [Search: Search products...]      │  │
        │  └───────────────────────────────────┘  │
        │                                          │
        │  ┌─────────────────────────────────┐    │
        │  │  Aqua Solutions                 │    │
        │  │  📂 3 Categories  📦 12 Products│    │
        │  │  [View Categories →]            │◄───┼─── User clicks here
        │  └─────────────────────────────────┘    │
        │  ┌─────────────────────────────────┐    │
        │  │  Marine Products               │    │
        │  │  📂 5 Categories  📦 20 Products│    │
        │  │  [View Categories →]            │    │
        │  └─────────────────────────────────┘    │
        └─────────────────────────────────────────┘
                              │
                    View Categories clicked
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │    📂 CATEGORIES SCREEN                 │
        │  ┌───────────────────────────────────┐  │
        │  │ ← Back to Companies               │  │
        │  │ Aqua Solutions - Categories       │  │
        │  │ 3 categories found                │  │
        │  └───────────────────────────────────┘  │
        │                                          │
        │  ┌─────────────────────────────────┐    │
        │  │  🧪 Minerals                    │    │
        │  │  High-quality mineral solutions │    │
        │  │  [View Products →]              │◄───┼─── User clicks here
        │  └─────────────────────────────────┘    │
        │  ┌─────────────────────────────────┐    │
        │  │  🦠 Probiotics                  │    │
        │  │  Beneficial bacteria cultures   │    │
        │  │  [View Products →]              │    │
        │  └─────────────────────────────────┘    │
        │  ┌─────────────────────────────────┐    │
        │  │  🧹 Bottom Cleansers            │    │
        │  │  Tank cleaning solutions        │    │
        │  │  [View Products →]              │    │
        │  └─────────────────────────────────┘    │
        └─────────────────────────────────────────┘
                              │
                    View Products clicked
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      📦 PRODUCTS SCREEN                 │
        │  ┌───────────────────────────────────┐  │
        │  │ ← Back to Categories              │  │
        │  │ Minerals - Products               │  │
        │  │ 6 products found                  │  │
        │  └───────────────────────────────────┘  │
        │                                          │
        │  ┌─────────────────────────────────┐    │
        │  │  [Product Image]                │    │
        │  │  Aqua Minerals Premium          │    │
        │  │  Essential minerals for aquatic │    │
        │  │  health and growth              │    │
        │  │  ₹1299  ₹999                    │    │
        │  └─────────────────────────────────┘    │
        │  ┌─────────────────────────────────┐    │
        │  │  [Product Image]                │    │
        │  │  Trace Mineral Mix              │    │
        │  │  Complete trace mineral solution│    │
        │  │  ₹799                           │    │
        │  └─────────────────────────────────┘    │
        └─────────────────────────────────────────┘
```

---

## 🔍 Search Flow

```
┌─────────────────────────────────────────┐
│      🏢 COMPANIES SCREEN                │
│  ┌───────────────────────────────────┐  │
│  │ [Search: Probiotic___]            │◄───── User types here
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
         Search triggered automatically
                    │
                    ▼
┌─────────────────────────────────────────┐
│      📦 PRODUCTS SCREEN                 │  ← Screen changes instantly
│  ┌───────────────────────────────────┐  │
│  │ ← Back to Companies               │  │
│  │ Search Results for "Probiotic"    │  │
│  │ 4 products found                  │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │  [Product Image]                │    │
│  │  Probiotic Boost                │    │  ← Matching products
│  │  Beneficial bacteria formula    │    │    from ALL companies
│  │  ₹599                           │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  [Product Image]                │    │
│  │  Advanced Probiotic Mix         │    │
│  │  Enhanced culture blend         │    │
│  │  ₹899                           │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 🔄 Back Navigation Logic

### Scenario 1: Company → Category → Product → Back
```
Companies Screen
     ↓ (select Aqua Solutions)
Categories Screen (Aqua Solutions)
     ↓ (select Minerals)
Products Screen (Minerals)
     ↓ (click back)
Categories Screen (Aqua Solutions) ← Returns here
     ↓ (click back)
Companies Screen ← Returns here
```

### Scenario 2: Search → Back
```
Companies Screen
     ↓ (search "probiotic")
Products Screen (Search Results)
     ↓ (click back)
Companies Screen ← Returns directly, clears search
```

---

## 🎯 State Changes

### Initial State
```javascript
view: 'companies'
selectedCompany: null
selectedCategory: null
searchQuery: ""
```

### After Company Selection
```javascript
view: 'categories'              // ← Screen changes
selectedCompany: {id: '1', name: 'Aqua Solutions'}
selectedCategory: null
searchQuery: ""
filteredCategories: [...]       // ← Filtered data
```

### After Category Selection
```javascript
view: 'products'                // ← Screen changes
selectedCompany: {id: '1', name: 'Aqua Solutions'}
selectedCategory: {id: '5', title: 'Minerals'}
searchQuery: ""
filteredProducts: [...]         // ← Filtered data
```

### After Search
```javascript
view: 'products'                // ← Screen changes
selectedCompany: null           // ← Cleared
selectedCategory: null          // ← Cleared
searchQuery: "probiotic"
filteredProducts: [...]         // ← Search results
```

---

## 📊 Component Hierarchy

```
Index (Main Component)
│
├── ImageCarousel
│
├── Search Bar
│
└── Dynamic Content Area
    │
    ├─► CompaniesScreen (when view === 'companies')
    │   └── FlatList of companies
    │
    ├─► CategoriesScreen (when view === 'categories')
    │   ├── Header with back button
    │   └── FlatList of categories
    │
    └─► ProductsScreen (when view === 'products')
        ├── Header with back button
        └── FlatList of products
```

---

## 🎬 Animation Concepts (Future Enhancement)

```javascript
// Smooth transitions between screens
view: 'companies' → 'categories'
  ↓
  Slide from right →
  ↓
Categories Screen appears

Back button clicked
  ↓
  ← Slide from left
  ↓
Companies Screen appears
```

---

## 🧪 Test Scenarios

### Test 1: Basic Navigation
1. ✅ Open app → See companies
2. ✅ Click company → See categories
3. ✅ Click category → See products
4. ✅ Click back → Return to categories
5. ✅ Click back → Return to companies

### Test 2: Search
1. ✅ Type in search → See products
2. ✅ Clear search → Return to companies
3. ✅ Search again → See different products

### Test 3: Mixed Navigation
1. ✅ Select company → Categories
2. ✅ Search product → Products (search)
3. ✅ Click back → Companies (not categories!)
4. ✅ Select company again → Categories

### Test 4: Empty States
1. ✅ Company with no categories → Show empty message
2. ✅ Category with no products → Show empty message
3. ✅ Search with no results → Show "No products found"

---

## 💡 Key Benefits

1. **Single Tab Experience**: Everything happens in Home tab
2. **Clear Navigation**: User always knows where they are
3. **Smart Back Button**: Context-aware navigation
4. **Fast Search**: Instant product search across all data
5. **Clean UI**: No clutter, clear hierarchy
6. **Maintainable Code**: Easy to modify and extend

---

**The screen changes smoothly within the same tab, giving users a seamless browsing experience!** 🎉
