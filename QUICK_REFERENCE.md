# ⚡ Quick Reference Guide - Ramesh Aqua UI/UX

**For developers**: Quick copy-paste snippets and common patterns

---

## 🎨 Color Constants (Copy-Paste)

```javascript
import { COLORS } from '../src/utils/constants'

// Primary Actions
backgroundColor: COLORS.PRIMARY        // #0080ff (Blue button)
color: COLORS.PRIMARY                  // Blue text/links

// Headers & Dark Sections
backgroundColor: COLORS.PRIMARY_DARK   // #002147 (Navy header)
color: COLORS.WHITE                    // White text on dark

// Light Accents & Badges
backgroundColor: COLORS.ACCENT_LIGHT   // #b3d9ff (Light blue badge)

// Status Colors
backgroundColor: COLORS.ERROR          // #ff4444 (Out of stock)
backgroundColor: COLORS.SUCCESS        // #28a745 (Stock available)
backgroundColor: COLORS.WARNING        // #856404 (Low stock)

// Backgrounds & Borders
backgroundColor: COLORS.BACKGROUND     // #f5f5f5 (Page background)
borderColor: COLORS.LIGHT_GRAY         // #ddd (Divider lines)
color: COLORS.GRAY                     // #666 (Secondary text)
```

---

## 📐 Spacing Constants (Copy-Paste)

```javascript
import { SPACING } from '../src/utils/constants'

padding: SPACING.REGULAR        // 16px (Default padding)
marginBottom: SPACING.MEDIUM    // 12px (Space between items)
gap: SPACING.SMALL              // 8px (Space between flex items)

// Full list:
// SPACING.TINY: 4
// SPACING.SMALL: 8
// SPACING.MEDIUM: 12
// SPACING.REGULAR: 16
// SPACING.LARGE: 20
// SPACING.XLARGE: 24
// SPACING.XXLARGE: 32
```

---

## 📝 Typography Constants (Copy-Paste)

```javascript
import { FONTS } from '../src/utils/constants'

// Large Title
fontSize: FONTS.SIZE.XXLARGE          // 24px
fontWeight: FONTS.WEIGHT.BOLD         // 'bold'

// Regular Text
fontSize: FONTS.SIZE.REGULAR          // 14px
fontWeight: FONTS.WEIGHT.REGULAR      // '400'

// Section Title
fontSize: FONTS.SIZE.LARGE            // 18px
fontWeight: FONTS.WEIGHT.SEMIBOLD     // '600'

// Small Caption
fontSize: FONTS.SIZE.SMALL            // 12px
fontWeight: FONTS.WEIGHT.REGULAR      // '400'
```

---

## 🔘 Common Components

### Primary Button
```jsx
<TouchableOpacity 
  style={styles.button}
  onPress={handlePress}
  activeOpacity={0.8}
>
  <Text style={styles.buttonText}>ACTION</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
    minHeight: 48,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZE.REGULAR,
    fontWeight: FONTS.WEIGHT.BOLD,
    letterSpacing: 0.5,
  }
})
```

### Card Container
```jsx
<View style={styles.card}>
  {/* Content */}
</View>

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.LARGE,
    padding: SPACING.REGULAR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,  // Android
  }
})
```

### Stock Badge
```jsx
{isOutOfStock && (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>OUT OF STOCK</Text>
  </View>
)}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.SMALL,
    zIndex: 1,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZE.SMALL,
    fontWeight: FONTS.WEIGHT.BOLD,
  }
})
```

### Loading Indicator
```jsx
<ActivityIndicator 
  size="small" 
  color={COLORS.PRIMARY} 
/>

// Large/centered
<ActivityIndicator 
  size="large" 
  color={COLORS.PRIMARY}
  style={{ marginTop: 40 }}
/>
```

### Image Card (Product/Category)
```jsx
<TouchableOpacity 
  style={styles.card}
  onPress={handlePress}
  activeOpacity={0.7}
>
  <Image 
    source={{ uri: imageUrl }}
    style={styles.image}
    resizeMode="cover"
  />
  <View style={styles.info}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
</TouchableOpacity>

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.LARGE,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.BACKGROUND,
  },
  info: {
    padding: SPACING.MEDIUM,
  },
  title: {
    fontSize: FONTS.SIZE.REGULAR,
    fontWeight: FONTS.WEIGHT.SEMIBOLD,
    color: COLORS.SECONDARY,
  },
  subtitle: {
    fontSize: FONTS.SIZE.SMALL,
    color: COLORS.GRAY,
    marginTop: SPACING.SMALL,
  }
})
```

---

## 📋 Common Patterns

### Two-Column Grid
```jsx
<FlatList
  data={items}
  numColumns={2}
  columnWrapperStyle={styles.gridRow}
  contentContainerStyle={styles.gridContainer}
  renderItem={({ item }) => <GridItem item={item} />}
/>

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: SPACING.REGULAR,
    paddingVertical: SPACING.REGULAR,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM,
  },
  gridItem: {
    width: '48%',
  }
})
```

### Horizontal Scroll List
```jsx
<FlatList
  horizontal
  data={items}
  renderItem={({ item }) => <Item item={item} />}
  contentContainerStyle={styles.horizontalList}
  showsHorizontalScrollIndicator={false}
  ItemSeparatorComponent={() => <View style={{ width: SPACING.MEDIUM }} />}
/>

const styles = StyleSheet.create({
  horizontalList: {
    paddingHorizontal: SPACING.REGULAR,
    gap: SPACING.MEDIUM,
  }
})
```

### Pull-to-Refresh
```jsx
const [refreshing, setRefreshing] = useState(false)

const handleRefresh = async () => {
  setRefreshing(true)
  await loadData()
  setRefreshing(false)
}

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={COLORS.PRIMARY}
    />
  }
>
  {/* Content */}
</ScrollView>
```

### Stack Header Styling
```jsx
<Stack.Screen 
  options={{
    headerShown: true,
    headerTitle: 'Screen Title',
    headerTitleStyle: {
      fontSize: FONTS.SIZE.XLARGE,
      fontWeight: FONTS.WEIGHT.BOLD,
    },
    headerStyle: {
      backgroundColor: COLORS.WHITE,
      elevation: 3,
    },
    headerBackTitle: 'Back',
    headerBackTitleVisible: true,
  }}
/>
```

### Gradient Header
```jsx
import { LinearGradient } from 'expo-linear-gradient'

<LinearGradient
  colors={[COLORS.PRIMARY_DARK, '#004080']}
  style={styles.header}
>
  <Text style={styles.headerText}>Title</Text>
</LinearGradient>

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: SPACING.REGULAR,
    alignItems: 'center',
  },
  headerText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZE.XXLARGE,
    fontWeight: FONTS.WEIGHT.BOLD,
  }
})
```

### Quantity Selector
```jsx
<View style={styles.quantityControl}>
  <TouchableOpacity onPress={() => setQty(qty - 1)}>
    <FontAwesome5 name="minus" size={12} color="white" />
  </TouchableOpacity>
  <Text style={styles.quantityText}>{qty}</Text>
  <TouchableOpacity onPress={() => setQty(qty + 1)}>
    <FontAwesome5 name="plus" size={12} color="white" />
  </TouchableOpacity>
</View>

const styles = StyleSheet.create({
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.MEDIUM,
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: 6,
    gap: SPACING.SMALL,
  },
  quantityText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZE.REGULAR,
    fontWeight: FONTS.WEIGHT.BOLD,
    minWidth: 30,
    textAlign: 'center',
  }
})
```

### Floating Action Button (View Cart)
```jsx
{itemCount > 0 && (
  <TouchableOpacity 
    style={styles.fab}
    onPress={() => router.push('/(tabs)/cart')}
    activeOpacity={0.9}
  >
    <View style={styles.fabLeft}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{itemCount}</Text>
      </View>
      <Text style={styles.fabText}>View Cart</Text>
    </View>
    <View style={styles.fabRight}>
      <Text style={styles.fabTotal}>₹{total}</Text>
      <FontAwesome5 name="arrow-right" size={16} color="white" />
    </View>
  </TouchableOpacity>
)}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: SPACING.LARGE,
    left: SPACING.REGULAR,
    right: SPACING.REGULAR,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.REGULAR,
    paddingVertical: 14,
    borderRadius: RADIUS.LARGE,
    elevation: 8,
  },
  fabLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MEDIUM,
  },
  badge: {
    backgroundColor: COLORS.WHITE,
    width: 32,
    height: 32,
    borderRadius: RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.PRIMARY,
    fontWeight: FONTS.WEIGHT.BOLD,
  },
  fabText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZE.LARGE,
    fontWeight: FONTS.WEIGHT.BOLD,
  },
  fabRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MEDIUM,
  },
  fabTotal: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZE.REGULAR,
    fontWeight: FONTS.WEIGHT.BOLD,
  }
})
```

---

## 🚀 Performance Tips (Copy-Paste)

### Optimize FlatList
```jsx
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  
  // Performance optimizations:
  removeClippedSubviews={true}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  
  // Disable scrolling in nested FlatList
  scrollEnabled={false}
/>
```

### Debounce Search
```jsx
import { useCallback } from 'react'

const [searchTerm, setSearchTerm] = useState('')
let debounceTimer

const handleSearch = useCallback((text) => {
  setSearchTerm(text)
  clearTimeout(debounceTimer)
  
  debounceTimer = setTimeout(() => {
    performSearch(text)  // API call
  }, 300)  // 300ms debounce
}, [])
```

### Memoize Components
```jsx
import { memo } from 'react'

const ProductCard = memo(({ product, onPress }) => (
  // Component JSX
))

export default ProductCard
```

---

## ✅ Before Pushing Code

**Checklist**:
- [ ] All colors from COLORS constant
- [ ] All spacing from SPACING constant
- [ ] All fonts from FONTS constant
- [ ] Button min-height: 48px
- [ ] Button has activeOpacity
- [ ] Images have backgroundColor fallback
- [ ] Lists use keyExtractor
- [ ] Nested FlatList has scrollEnabled={false}
- [ ] Loading state implemented
- [ ] Error state with retry implemented
- [ ] Empty state shows icon + message
- [ ] No console.error/warn in production code
- [ ] No hardcoded values (use constants)
- [ ] Tested on multiple screen sizes
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Toast/Alert feedback for user actions
- [ ] No memory leaks (clean up subscriptions)

---

## 📞 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Buttons not responsive | No `activeOpacity` | Add `activeOpacity={0.8}` |
| Content cut off | ScrollView missing | Wrap in `<ScrollView>` |
| Janky animations | Too many renders | Use `memo()` or `useMemo()` |
| Text overflow | No `numberOfLines` | Add `numberOfLines={2}` |
| Slow list | Large FlatList | Use performance optimizations |
| Image flickers | No `backgroundColor` | Add `backgroundColor` to Image |
| Colors inconsistent | Hardcoded hex | Use COLORS constant |
| Layout breaks on tablet | No responsive check | Test on multiple sizes |

---

**Quick Links**:
- 🎨 [Design System](./UX_UI_DESIGN_SYSTEM.md)
- 📱 [Screen Specifications](./SCREEN_SPECIFICATIONS.md)
- 📚 [Constants Reference](./src/utils/constants.js)
- 🎯 [PhonePe Design Inspiration](https://www.phonepe.com)
- 🛍️ [Flipkart Design Inspiration](https://www.flipkart.com)

---

**Version**: 1.0  
**Last Updated**: 2024
