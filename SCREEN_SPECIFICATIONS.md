# 🖥️ Screen Implementation Guide - Ramesh Aqua

**Purpose**: Detailed specifications for each screen's layout, components, and interactions

---

## 📋 Quick Reference: Screen Matrix

| Screen | Type | Tab | Path | Status | Components |
|--------|------|-----|------|--------|------------|
| Home | Tab | Home | `/(tabs)/home` | ✅ Active | Carousel, Grid, Scrollable |
| Categories | Stack | Home | `/categories` | ✅ Active | Gradient Header, Grid |
| Products | Stack | Home | `/products` | ✅ Active | Grid with FAB, Stock Badges |
| Product Detail | Stack | Any | `/productDetail` | ✅ Active | Gallery, Info, Related, FAB |
| Cart | Tab | Cart | `/(tabs)/cart` | ✅ Active | List, Summary, CTA |
| Profile | Tab | Profile | `/(tabs)/profile` | ✅ Active | Info, Settings, Orders |
| Admin Panel | Tab | Admin | `/(tabs)/adminPanel` | ✅ Active | Analytics, Management |
| Search | Screen | Any | `/search` | 🔄 Planned | Search Box, Results Grid |
| Checkout | Stack | Cart | `/checkout` | 🔄 Planned | Form, Confirmation, Payment |

---

## 📱 Detailed Screen Specifications

### 1️⃣ HOME SCREEN (`app/(tabs)/home.jsx`)

#### Purpose
Central hub for browsing companies, categories, and featured products with discovery.

#### Header Section
```
┌─────────────────────────────────┐
│ Ramesh Aqua  [🔍]  [☰]          │  Primary header
│ City location                   │  Subtext
└─────────────────────────────────┘
```

**Styling**:
- Background: Linear gradient (PRIMARY_DARK to lighter)
- Color: White text
- Icon alignment: Left (logo/text), Right (search + menu)
- Height: 80-100px

#### Section 1: Featured Banner
**Layout**: Horizontal carousel (FlatList)

```
┌─────────────────────────────┐
│   [Image Carousel]          │  Height: 200px
│  ◄  •••  ►                 │
└─────────────────────────────┘
```

**Implementation**:
```jsx
<FlatList
  horizontal
  data={banners}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => navigateToBanner(item)}>
      <Image 
        source={{ uri: item.imageUrl }}
        style={{ width: screenWidth - 32, height: 200, borderRadius: 12 }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  )}
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
  contentContainerStyle={{ paddingHorizontal: 16 }}
/>
```

**Behavior**:
- Auto-scroll every 5 seconds (optional)
- Manual scroll with pagination indicators (dots)
- Tap to navigate to specific category/product

#### Section 2: Companies/Suppliers
**Layout**: Horizontal scrollable (FlatList)

```
Companies / Suppliers
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Company │  │ Company │  │ Company │
│  Logo   │  │  Logo   │  │  Logo   │
│  Name   │  │  Name   │  │  Name   │
└─────────┘  └─────────┘  └─────────┘
```

**Styling**:
- Card width: 110px
- Card height: 140px
- Border radius: 12px
- Gap: 12px
- Section title: FONTS.SIZE.LARGE (18px), SEMIBOLD

```jsx
<View>
  <Text style={styles.sectionTitle}>Popular Suppliers</Text>
  <FlatList
    horizontal
    data={companies}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity 
        onPress={() => navigateToCategories(item)}
        activeOpacity={0.8}
      >
        <View style={styles.companyCard}>
          <Image 
            source={{ uri: item.logoUrl }}
            style={styles.companyLogo}
            resizeMode="contain"
          />
          <Text style={styles.companyName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    )}
    contentContainerStyle={styles.companyListContainer}
    showsHorizontalScrollIndicator={false}
  />
</View>
```

**Styles**:
```javascript
companyCard: {
  width: 110,
  height: 140,
  backgroundColor: COLORS.WHITE,
  borderRadius: RADIUS.LARGE,
  padding: SPACING.SMALL,
  alignItems: 'center',
  justifyContent: 'space-between',
  elevation: 3,
}
companyLogo: {
  width: 60,
  height: 60,
  borderRadius: RADIUS.MEDIUM,
}
companyName: {
  fontSize: FONTS.SIZE.SMALL,
  fontWeight: FONTS.WEIGHT.SEMIBOLD,
  textAlign: 'center',
  color: COLORS.SECONDARY,
}
```

#### Section 3: Categories
**Layout**: Grid (2 columns)

```
Browse Categories
┌──────────────┬──────────────┐
│ Category     │ Category     │
│ [Image]      │ [Image]      │
│ • 12 prod    │ • 8 prod     │
└──────────────┴──────────────┘
```

**Implementation**: Reuse product card component with category data

#### Section 4: Featured Products
**Layout**: Grid (2 columns) - same as Products screen

```
Featured Products
┌──────────────┬──────────────┐
│ Product      │ Product      │
│ [Image]      │ [Image]      │
│ ₹Price       │ ₹Price       │
│ ADD TO CART  │ ADD TO CART  │
└──────────────┴──────────────┘
```

#### Refresh Behavior
```jsx
const [refreshing, setRefreshing] = useState(false)
const { canFocus } = useFocusEffect(
  useCallback(() => {
    // Auto-refresh when returning to home
    loadContent()
  }, [])
)

const handleRefresh = useCallback(async () => {
  setRefreshing(true)
  await loadContent()
  setRefreshing(false)
}, [])

return (
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
)
```

#### Loading State
- Show skeleton screens for each section
- Stagger loading: Banners → Companies → Categories → Products
- Minimum 300ms display time

---

### 2️⃣ CATEGORIES SCREEN (`app/categories.jsx`)

#### Purpose
Display all categories for a specific company/supplier.

#### Header Section
```
┌─────────────────────────────────┐
│  [Navy Gradient Background]     │
│                                 │
│     [Folder Icon Circle]        │
│                                 │
│     Company Name                │
│     X categories available      │
│                                 │
└─────────────────────────────────┘
```

**Styling**:
```javascript
headerGradient: {
  background: LinearGradient(['#002147', '#004080']),
  paddingTop: 20,
  paddingBottom: 30,
  paddingHorizontal: 20,
}

headerContent: {
  alignItems: 'center',
}

companyIconContainer: {
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
}

headerTitle: {
  fontSize: FONTS.SIZE.XXLARGE,
  fontWeight: FONTS.WEIGHT.BOLD,
  color: COLORS.WHITE,
  marginBottom: 8,
  textShadowColor: 'rgba(0, 0, 0, 0.3)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
}

headerSubtitle: {
  fontSize: FONTS.SIZE.REGULAR,
  color: COLORS.ACCENT_LIGHT,
  textAlign: 'center',
}
```

#### Grid Section
**Layout**: 2-column grid with rounded top

```
[Gradient Header extends up]
┌───────────────────────────────┐
│  Browse Categories (section)  │
├───────────────────────────────┤
│ ┌──────────┐  ┌──────────┐   │
│ │ Category │  │ Category │   │ Card height: 180px
│ │          │  │          │   │
│ │  Name    │  │  Name    │   │
│ │  • info  │  │  • info  │   │
│ └──────────┘  └──────────┘   │
│                               │
│ ┌──────────┐  ┌──────────┐   │
│ │ Category │  │ Category │   │
│ │          │  │          │   │
│ │  Name    │  │  Name    │   │
│ │  • info  │  │  • info  │   │
│ └──────────┘  └──────────┘   │
└───────────────────────────────┘
```

**Category Card Details**:
```javascript
categoryCard: {
  backgroundColor: COLORS.WHITE,
  borderRadius: RADIUS.XLARGE,  // 16px
  width: '48%',
  overflow: 'hidden',
  elevation: 5,
}

categoryImage: {
  height: 140,
  width: '100%',
  backgroundColor: COLORS.BACKGROUND,
}

categoryInfo: {
  padding: SPACING.REGULAR,  // 16px
}

categoryTitle: {
  fontSize: FONTS.SIZE.MEDIUM,
  fontWeight: FONTS.WEIGHT.BOLD,
  color: COLORS.PRIMARY_DARK,
  marginBottom: SPACING.MEDIUM,
}

categoryFooter: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

productBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: COLORS.ACCENT_LIGHT,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: RADIUS.ROUND,
  gap: SPACING.SMALL,
}
```

#### Empty State
When no categories found:
```
┌─────────────────────────────┐
│                             │
│        📂 Icon              │
│                             │
│  No categories found        │
│  for this company           │
│                             │
└─────────────────────────────┘
```

---

### 3️⃣ PRODUCTS SCREEN (`app/products.jsx`)

#### Purpose
Display all products in a category with filtering and cart operations.

#### Header Section
```
Native Stack Header
┌─────────────────────────┐
│ Category Name  [Back]   │
├─────────────────────────┤
│ Company Name (subtitle) │  Section: 8px padding
│ X products available    │
└─────────────────────────┘
```

**Implementation**:
```jsx
<Stack.Screen 
  options={{
    headerShown: true,
    headerTitle: categoryName || 'Products',
    headerTitleStyle: {
      fontSize: FONTS.SIZE.LARGE,
      fontWeight: FONTS.WEIGHT.BOLD,
    },
    headerBackTitle: 'Back',
    headerBackTitleVisible: true,
  }}
/>
```

#### Product Grid
**Layout**: 2-column grid with 12px gap

```
┌──────────────┬──────────────┐
│   Product    │   Product    │  Gap: 12px
│   (48%)      │   (48%)      │
├──────────────┼──────────────┤
│   Product    │   Product    │
│   (48%)      │   (48%)      │
└──────────────┴──────────────┘
```

#### Product Card Structure
```
┌─────────────────────────┐
│ [Image 160px]           │
│ ┌───────────────────┐   │
│ │ OUT OF STOCK      │   │ Badge (optional)
│ └───────────────────┘   │
├─────────────────────────┤
│                         │  Padding: 12px
│ Title (2 lines max)     │
│ Description (opt)       │
│ ₹Price (bold blue)      │
│ X available (if stock)  │
│                         │
│ [ADD TO CART] button    │
│ or [- Qty +] control    │
│                         │
└─────────────────────────┘
```

**Card Styles**:
```javascript
gridItem: {
  backgroundColor: COLORS.WHITE,
  borderRadius: RADIUS.LARGE,
  width: '48%',
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}

gridImage: {
  width: '100%',
  height: 160,
  backgroundColor: COLORS.BACKGROUND,
}

gridInfo: {
  padding: SPACING.MEDIUM,  // 12px
}

gridTitle: {
  fontSize: FONTS.SIZE.REGULAR,
  fontWeight: FONTS.WEIGHT.SEMIBOLD,
  color: COLORS.SECONDARY,
  minHeight: 36,  // Accommodate 2 lines
}

gridPrice: {
  fontSize: FONTS.SIZE.LARGE,
  fontWeight: FONTS.WEIGHT.BOLD,
  color: COLORS.PRIMARY,
}
```

#### Stock Status Badges

**Out of Stock**:
```
Badge Position: Top-right (8px from edges)
┌──────────────┐
│ ✗ OUT OF    │
│   STOCK     │  Background: #dc2625 (red)
└──────────────┘              Text: white
```

**Low Stock**:
```
┌──────────────┐
│ ⚠ LOW       │  Background: #f59e0b (orange)
│   STOCK     │  Text: white
└──────────────┘
```

**Implementation**:
```jsx
{isOutOfStock && (
  <View style={styles.stockBadge}>
    <Text style={styles.stockBadgeText}>OUT OF STOCK</Text>
  </View>
)}

{isLowStock && !isOutOfStock && (
  <View style={[styles.stockBadge, styles.lowStockBadge]}>
    <Text style={[styles.stockBadgeText, styles.lowStockText]}>
      LOW STOCK
    </Text>
  </View>
)}
```

#### Quantity Controls

**Two States**:

1. **Add to Cart (Qty = 0)**:
```
┌────────────────────────┐
│  ADD TO CART           │
│ (PRIMARY background)   │
└────────────────────────┘
```

2. **Quantity Control (Qty > 0)**:
```
┌─────────────────────────┐
│ [-]  2  [+]            │  All in PRIMARY
│ (Buttons have opacity) │
└─────────────────────────┘
```

**Implementation**:
```jsx
{quantity === 0 ? (
  <TouchableOpacity style={styles.addButton}>
    <Text style={styles.addButtonText}>ADD TO CART</Text>
  </TouchableOpacity>
) : (
  <View style={styles.quantityControl}>
    <TouchableOpacity onPress={decrementQty}>
      <FontAwesome5 name="minus" size={12} color="#fff" />
    </TouchableOpacity>
    <Text style={styles.quantityText}>{quantity}</Text>
    <TouchableOpacity onPress={incrementQty}>
      <FontAwesome5 name="plus" size={12} color="#fff" />
    </TouchableOpacity>
  </View>
)}
```

#### Floating "View Cart" Button

**Position**: Fixed at bottom (20px from bottom, 16px margins)
**Visibility**: Only show when `getTotalItems() > 0`

```
┌─────────────────────────────────┐
│ [2] View Cart    ₹450.00    →  │  FAB
│                                 │
└─────────────────────────────────┘
^                                 ^
Bottom: 20px                  Right: 16px
```

**Styling**:
```javascript
viewCartButton: {
  position: 'absolute',
  bottom: SPACING.LARGE,  // 20px
  left: SPACING.REGULAR,  // 16px
  right: SPACING.REGULAR, // 16px
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: COLORS.PRIMARY,
  paddingHorizontal: SPACING.REGULAR,
  paddingVertical: 14,
  borderRadius: RADIUS.LARGE,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}

cartButtonLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: SPACING.MEDIUM,
}

cartItemBadge: {
  backgroundColor: COLORS.WHITE,
  width: 32,
  height: 32,
  borderRadius: RADIUS.MEDIUM,
  justifyContent: 'center',
  alignItems: 'center',
}

cartItemBadgeText: {
  color: COLORS.PRIMARY,
  fontSize: FONTS.SIZE.LARGE,
  fontWeight: FONTS.WEIGHT.BOLD,
}

viewCartText: {
  color: COLORS.WHITE,
  fontSize: FONTS.SIZE.LARGE,
  fontWeight: FONTS.WEIGHT.BOLD,
}

cartButtonRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: SPACING.MEDIUM,
}

cartTotalText: {
  color: COLORS.WHITE,
  fontSize: FONTS.SIZE.MEDIUM,
  fontWeight: FONTS.WEIGHT.BOLD,
}
```

#### Interaction Flow
1. User taps product → Navigate to detail (optional) or stays on grid
2. User taps "ADD TO CART" → Item added, button becomes quantity control
3. User adjusts quantity → Cart updates in real-time
4. "View Cart" button appears when 1+ items added
5. User taps "View Cart" → Navigate to cart screen
6. Floating button stays visible until user removes all items

---

### 4️⃣ PRODUCT DETAIL SCREEN (`app/productDetail.jsx`)

#### Purpose
Show detailed product information with full image gallery and related products.

#### Header
```
Native Stack Header
┌──────────────────────┐
│ Product Name [Back]  │
└──────────────────────┘
```

#### Image Gallery Section
```
┌─────────────────────────┐
│   [Large Product Image] │  Height: 280px
│  ◄  • • •  ►           │
└─────────────────────────┘
```

**Gallery Implementation**:
```jsx
const [currentImageIndex, setCurrentImageIndex] = useState(0)
const [imageCarouselRef, setImageCarouselRef] = useState(null)

<FlatList
  ref={imageCarouselRef}
  horizontal
  pagingEnabled
  data={product.images}
  renderItem={({ item }) => (
    <Image 
      source={{ uri: item }}
      style={{ width: screenWidth - 32, height: 280 }}
      resizeMode="contain"
    />
  )}
  onMomentumScrollEnd={(event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const currentIndex = Math.round(contentOffsetX / (screenWidth - 32))
    setCurrentImageIndex(currentIndex)
  }}
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 16 }}
/>

{/* Pagination Dots */}
<View style={styles.paginationContainer}>
  {product.images.map((_, index) => (
    <View 
      key={index}
      style={[
        styles.paginationDot,
        index === currentImageIndex && styles.activeDot
      ]}
    />
  ))}
</View>
```

#### Product Information Section
```
Title
₹1,299 ₹1,499 (Strike)
⭐ 4.5 (120 reviews)

Stock: 5 available
Short Description
Full Description

Specifications
• Feature 1
• Feature 2
```

#### Related Products Section
```
Related Products
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Product │  │ Product │  │ Product │
│ (Grid)  │  │ (Grid)  │  │ (Grid)  │
└─────────┘  └─────────┘  └─────────┘

Horizontal scroll, 3 visible, same card style as grid
```

#### Floating View Cart Button
Same as Products screen - appears at bottom when items added

---

### 5️⃣ CART SCREEN (`app/(tabs)/cart.jsx`)

#### Purpose
Review cart items, adjust quantities, and proceed to checkout.

#### Header
```
┌─────────────────────────────┐
│ Cart (3 items)        [X]   │
└─────────────────────────────┘
```

#### Cart Items List
```
┌─────────────────────────────┐
│ [Product Image]             │
│ Product Name                │
│ ₹Price × Qty = ₹Subtotal    │
│             [- 2 +]         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ [Product Image]             │
│ Product Name                │
│ ₹Price × Qty = ₹Subtotal    │
│             [- 1 +]         │
└─────────────────────────────┘
```

**Item Card Layout**:
```javascript
cartItem: {
  backgroundColor: COLORS.WHITE,
  borderRadius: RADIUS.MEDIUM,
  marginHorizontal: SPACING.REGULAR,
  marginBottom: SPACING.MEDIUM,
  padding: SPACING.MEDIUM,
  elevation: 2,
}

cartItemRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

cartItemImage: {
  width: 80,
  height: 80,
  borderRadius: RADIUS.MEDIUM,
}

cartItemInfo: {
  flex: 1,
  marginLeft: SPACING.MEDIUM,
}

cartItemTitle: {
  fontSize: FONTS.SIZE.REGULAR,
  fontWeight: FONTS.WEIGHT.SEMIBOLD,
  color: COLORS.SECONDARY,
}

cartItemPrice: {
  fontSize: FONTS.SIZE.REGULAR,
  fontWeight: FONTS.WEIGHT.BOLD,
  color: COLORS.PRIMARY,
  marginVertical: SPACING.SMALL,
}
```

#### Summary Section
```
┌─────────────────────────────┐
│ PRICE DETAILS               │
│                             │
│ Subtotal    ₹450.00         │
│ Taxes       ₹75.00          │
│ Delivery    ₹40.00 (if add) │
│ ─────────────────────────   │
│ Total       ₹565.00         │
└─────────────────────────────┘
```

**Summary Styles**:
```javascript
summaryContainer: {
  backgroundColor: COLORS.WHITE,
  marginHorizontal: SPACING.REGULAR,
  marginBottom: SPACING.LARGE,
  padding: SPACING.REGULAR,
  borderRadius: RADIUS.MEDIUM,
  elevation: 2,
}

summaryTitle: {
  fontSize: FONTS.SIZE.MEDIUM,
  fontWeight: FONTS.WEIGHT.BOLD,
  color: COLORS.SECONDARY,
  marginBottom: SPACING.MEDIUM,
}

summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: SPACING.SMALL,
}

summaryLabel: {
  fontSize: FONTS.SIZE.REGULAR,
  color: COLORS.GRAY,
}

summaryValue: {
  fontSize: FONTS.SIZE.REGULAR,
  fontWeight: FONTS.WEIGHT.SEMIBOLD,
  color: COLORS.SECONDARY,
}

summaryTotal: {
  fontSize: FONTS.SIZE.LARGE,
  fontWeight: FONTS.WEIGHT.BOLD,
  color: COLORS.PRIMARY,
}
```

#### Action Buttons
```
┌─────────────────────────────┐
│  PROCEED TO CHECKOUT        │  Primary button
│  Width: Full - 32px margins │
│  Height: 56px              │
├─────────────────────────────┤
│  CONTINUE SHOPPING          │  Secondary button
│  Width: Full - 32px margins │
│  Height: 48px              │
└─────────────────────────────┘
```

#### Empty State
When no items in cart:
```
┌─────────────────────────────┐
│                             │
│        🛒 Icon (large)       │
│                             │
│  Your cart is empty         │
│                             │
│  [CONTINUE SHOPPING]        │
│                             │
└─────────────────────────────┘
```

---

### 6️⃣ PROFILE SCREEN (`app/(tabs)/profile.jsx`)

#### Purpose
Show user profile, preferences, and order history.

#### User Info Section
```
┌──────────────────────────┐
│  [Avatar Image]          │  Avatar: 80x80, circular
│  User Name               │
│  user@email.com          │
├──────────────────────────┤
│  ✏️ EDIT PROFILE         │  Button
└──────────────────────────┘
```

#### Menu Options
```
Preferences
├─ 📍 Saved Addresses
├─ 💳 Payment Methods
├─ 🔔 Notifications
└─ 🔧 Settings

Support
├─ ❓ Help & FAQ
├─ 📞 Contact Us
└─ 📋 Terms & Privacy

Account
├─ 🚪 Logout
└─ 🗑️ Delete Account
```

---

### 7️⃣ ADMIN PANEL SCREEN (`app/(tabs)/adminPanel.jsx`)

#### Purpose
Manage inventory, orders, and view analytics.

#### Dashboard Widgets
```
┌──────────┐ ┌──────────┐
│ Revenue  │ │ Orders   │  4 stat cards
│ ₹50K     │ │ 234      │
└──────────┘ └──────────┘

┌──────────┐ ┌──────────┐
│ Products │ │ Customers│
│ 1,234    │ │ 567      │
└──────────┘ └──────────┘
```

#### Navigation Tabs
```
┌────────────────────────┐
│ Analytics │ Orders │ Inventory │ Settings │
└────────────────────────┘
```

---

## 🎯 Implementation Checklist

For **every new screen** or **screen update**:

- [ ] **Colors**: Using only COLORS constants
- [ ] **Spacing**: Using only SPACING constants
- [ ] **Typography**: Using only FONTS constants
- [ ] **Border Radius**: Using only RADIUS constants
- [ ] **Button Height**: Minimum 48px
- [ ] **Header**: Using Stack.Screen options
- [ ] **Loading State**: Skeleton screens + minimum 300ms
- [ ] **Empty State**: Appropriate icon + message
- [ ] **Error State**: Retry mechanism visible
- [ ] **Responsive**: Tested on multiple screen sizes
- [ ] **Accessibility**: Color contrast ≥ 4.5:1
- [ ] **Interactions**: All buttons have activeOpacity
- [ ] **Feedback**: Toast/Alert for user actions
- [ ] **Performance**: FlatList for long lists, ScrollView for short content

---

## 🔗 Component Reuse Across Screens

| Component | Used In | Purpose |
|-----------|---------|---------|
| Product Card | Home, Featured, Search | Display product with image, price, action |
| Category Card | Categories, Home | Navigate to products |
| Company Card | Home | Navigate to categories |
| Quantity Control | Products, Details, Cart | Adjust item quantity |
| Stock Badge | Products, Details, Cart | Show stock status |
| Floating FAB | Products, Details | Quick access to cart |
| Summary Card | Cart, Checkout | Show total breakdown |
| Alert Card | All screens | Consistent notifications |

---

## 📱 Testing Checklist

**Device Sizes to Test**:
- [ ] Small Phone (iPhone SE, ~320px width)
- [ ] Medium Phone (iPhone 12, ~390px width)
- [ ] Large Phone (iPhone 14 Plus, ~430px width)
- [ ] Android variations

**Orientations**:
- [ ] Portrait (primary)
- [ ] Landscape (if applicable)

**Interactions**:
- [ ] Tap all buttons
- [ ] Swipe/scroll on lists
- [ ] Fill all forms
- [ ] Test all error states
- [ ] Verify all navigation flows

---

**Version**: 1.0  
**Last Updated**: 2024  
**Template for Screen Design Specifications**
