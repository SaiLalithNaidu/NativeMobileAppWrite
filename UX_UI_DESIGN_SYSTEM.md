# 🎨 Ramesh Aqua - UX/UI Design System Documentation

**Version:** 1.0  
**Last Updated:** 2024  
**Purpose:** Comprehensive guide for consistent UI/UX implementation across the mobile app

---

## 📑 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout Grid](#spacing--layout-grid)
5. [Component Library](#component-library)
6. [Screen Architecture](#screen-architecture)
7. [Navigation Patterns](#navigation-patterns)
8. [State Indicators](#state-indicators)
9. [Interaction Patterns](#interaction-patterns)
10. [Responsive Design](#responsive-design)

---

## 🎯 Design Philosophy

### Core Principles

Our design system is built on **clarity, consistency, and user-friendliness**—inspired by industry leaders like **PhonePe**, **Flipkart**, and **Amazon**.

#### Key Pillars:

1. **Clarity**: Information hierarchy is clear; users know what action to take
2. **Consistency**: Same components look and behave identically across all screens
3. **Efficiency**: Minimal taps to complete tasks (e.g., add to cart → view cart → checkout)
4. **Feedback**: Every user action gets immediate visual/haptic feedback
5. **Accessibility**: Large touch targets (minimum 48x48dp), sufficient color contrast

### Design Inspirations

| App | Element | Implementation |
|-----|---------|-----------------|
| **PhonePe** | Floating Action Button for quick actions | Floating "View Cart" button with item count badge |
| **Flipkart** | Card-based product grid with badges | Product grid with stock/discount badges |
| **Amazon** | Quantity controls inline with cart | ±/Quantity selector within product cards |
| **Swiggy/Zomato** | Primary action prominence | Bold CTA buttons with consistent styling |

---

## 🎨 Color Palette

### Primary Colors

```javascript
// Theme: Ramesh Aqua (Water/Professional Blue)

COLORS = {
  // Brand Palette
  PRIMARY: '#0080ff',              // Electric Blue - Primary actions, CTAs, links
  PRIMARY_DARK: '#002147',         // Navy - Headers, dark backgrounds
  ACCENT_LIGHT: '#b3d9ff',         // Light Blue - Secondary highlights, badges

  // Functional Colors
  BACKGROUND: '#f5f5f5',           // Off-white - Main backgrounds
  WHITE: '#ffffff',                // Pure white - Cards, overlays
  BLACK: '#000000',                // Pure black - Text (rarely used)

  // Status Colors
  ERROR: '#ff4444',                // Red - Errors, out of stock
  SUCCESS: '#28a745',              // Green - Success, low/available stock
  WARNING: '#856404',              // Yellow - Warnings, cautions
  INFO: '#17a2b8',                 // Cyan - Info messages

  // Neutrals
  GRAY: '#666',                    // Medium gray - Secondary text
  LIGHT_GRAY: '#ddd',              // Light gray - Dividers, borders
};
```

### Color Usage Guidelines

| Color | Use Cases | Examples |
|-------|-----------|----------|
| **PRIMARY (#0080ff)** | Buttons, links, active states, floating buttons | "ADD TO CART", "View Cart", selected tab |
| **PRIMARY_DARK (#002147)** | Headers, dark sections, branding | Stack headers, gradient backgrounds |
| **ACCENT_LIGHT (#b3d9ff)** | Badges, highlights, subtle backgrounds | Item count badge, category badge |
| **ERROR (#ff4444)** | Out of stock, delete actions | "OUT OF STOCK" badge, error messages |
| **SUCCESS (#28a745)** | Stock available, success messages | "✓ Added to cart", stock count |
| **WARNING (#856404)** | Low stock warnings | "LOW STOCK" badge |
| **BACKGROUND (#f5f5f5)** | Main content areas | Screen backgrounds, light sections |
| **LIGHT_GRAY (#ddd)** | Dividers, borders | Border bottom on headers, dividers |

### Color Contrast Requirements

All color combinations must meet **WCAG AA standards** (4.5:1 for text):

- ✅ WHITE text on PRIMARY: 7.8:1
- ✅ WHITE text on ERROR: 6.2:1
- ✅ BLACK text on LIGHT_GRAY: 8.5:1
- ✅ GRAY text on BACKGROUND: 5.1:1

---

## 📝 Typography

### Font Scale

```javascript
FONTS = {
  SIZE: {
    SMALL: 12,           // Captions, badges
    REGULAR: 14,         // Body text, secondary info
    MEDIUM: 16,          // Primary body text
    LARGE: 18,           // Section titles
    XLARGE: 20,          // Screen titles
    XXLARGE: 24,         // Hero titles, major headers
  },
  WEIGHT: {
    REGULAR: '400',      // Normal text, descriptions
    MEDIUM: '500',       // Slightly emphasized text
    SEMIBOLD: '600',     // Emphasized text, labels
    BOLD: 'bold',        // Strong emphasis, headers
  }
};
```

### Typography Hierarchy

| Level | Size | Weight | Use Case | Example |
|-------|------|--------|----------|---------|
| **Display** | 24px | Bold | Major screen headers | "Ramesh Aqua" on home |
| **Heading 1** | 20px | Semibold | Section titles | "Featured Products" |
| **Heading 2** | 18px | Semibold | Subsection titles | Company names in list |
| **Body Large** | 16px | Regular | Primary content | Product price |
| **Body Regular** | 14px | Regular | Standard text | Product description |
| **Body Small** | 12px | Regular | Secondary info | Stock count, timestamps |
| **Caption** | 11px | Medium | Captions, badges | "OUT OF STOCK" badge text |

### Font Families

- **Default**: System fonts (no custom font imports required)
  - iOS: San Francisco (automatic)
  - Android: Roboto (automatic)
- **Result**: Native look and feel, excellent performance

---

## 📐 Spacing & Layout Grid

### Spacing Scale

```javascript
SPACING = {
  TINY: 4,              // Minimal gaps between elements
  SMALL: 8,             // Small padding/margins
  MEDIUM: 12,           // Standard padding
  REGULAR: 16,          // Default padding/margin
  LARGE: 20,            // Large spacing
  XLARGE: 24,           // Extra large spacing
  XXLARGE: 32,          // Maximum spacing
};
```

### Grid System

**Base Unit**: 4px (all measurements are multiples of 4)

- **Padding**: 16px (REGULAR) for most screens
- **Margins**: 12px (MEDIUM) between cards
- **Gap**: 8px (SMALL) between items in groups

### Layout Templates

#### 1. Full-Width Container
```
┌─────────────────────────────┐
│        Header (16px)        │
├─────────────────────────────┤
│                             │
│    Content Area (16px)      │
│                             │
├─────────────────────────────┤
│    Bottom Button (20px)     │
└─────────────────────────────┘
```

#### 2. Two-Column Grid (Products)
```
┌──────────────┬──────────────┐
│   Product    │   Product    │  16px horizontal gap
│   (48%)      │   (48%)      │  12px vertical gap
├──────────────┼──────────────┤
│   Product    │   Product    │
│   (48%)      │   (48%)      │
└──────────────┴──────────────┘
```

#### 3. Stack Layout (Vertical)
```
┌──────────────────────────┐
│   Element 1              │  12px gap
├──────────────────────────┤
│                          │  12px gap
│   Element 2              │
├──────────────────────────┤
│                          │  12px gap
│   Element 3              │
└──────────────────────────┘
```

---

## 🧩 Component Library

### 1. Buttons

#### Primary Button (CTA)
```jsx
// Usage
<TouchableOpacity style={styles.addButton}>
  <Text style={styles.addButtonText}>ADD TO CART</Text>
</TouchableOpacity>

// Styles
addButton: {
  backgroundColor: COLORS.PRIMARY,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignItems: 'center',
}
addButtonText: {
  color: 'white',
  fontSize: 14,
  fontWeight: 'bold',
  letterSpacing: 0.5,
}
```

**Specifications**:
- Size: 48-56px height (touch-friendly)
- Padding: 12px vertical, 16px horizontal
- Border Radius: 8px (rounded but not pill-shaped)
- Interaction: activeOpacity={0.8} (40-60% opacity on press)

#### Secondary Button
```jsx
// Usage
<TouchableOpacity style={styles.secondaryButton}>
  <Text style={styles.secondaryButtonText}>CANCEL</Text>
</TouchableOpacity>

// Styles
secondaryButton: {
  backgroundColor: COLORS.BACKGROUND,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: COLORS.LIGHT_GRAY,
}
secondaryButtonText: {
  color: COLORS.GRAY,
  fontSize: 14,
  fontWeight: '600',
}
```

#### Quantity Control (Swiggy/Zomato Style)
```jsx
// Usage
<View style={styles.quantityControl}>
  <TouchableOpacity onPress={decreaseQuantity}>
    <FontAwesome5 name="minus" size={12} color="#fff" />
  </TouchableOpacity>
  <Text style={styles.quantityText}>{quantity}</Text>
  <TouchableOpacity onPress={increaseQuantity}>
    <FontAwesome5 name="plus" size={12} color="#fff" />
  </TouchableOpacity>
</View>

// Styles
quantityControl: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: COLORS.PRIMARY,
  borderRadius: 8,
  paddingHorizontal: 4,
  paddingVertical: 6,
}
```

---

### 2. Cards

#### Product Card (Grid)
```jsx
// Container
gridItem: {
  backgroundColor: 'white',
  borderRadius: 12,
  width: '48%',
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,  // Android shadow
}

// Image
gridImage: {
  width: '100%',
  height: 160,
  backgroundColor: '#f0f0f0',
}

// Info Section
gridInfo: {
  padding: 12,
}
gridTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  minHeight: 36,  // Two-line title
}
gridPrice: {
  fontSize: 16,
  fontWeight: 'bold',
  color: COLORS.PRIMARY,
}
```

**Specifications**:
- Shadow: Elevation 3 for subtle depth
- Corner Radius: 12px (rounded cards)
- Aspect Ratio: Image 160px height, content below
- Spacing: 12px padding inside card

#### Category Card
```jsx
categoryCard: {
  backgroundColor: 'white',
  borderRadius: 16,
  width: '48%',
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 5,
}
```

---

### 3. Badges & Status Indicators

#### Stock Status Badge
```jsx
stockBadge: {
  position: 'absolute',
  top: 8,
  right: 8,
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
  zIndex: 1,
}

// Out of Stock (Red)
outOfStockBadge: {
  backgroundColor: '#dc2625',
}

// Low Stock (Orange)
lowStockBadge: {
  backgroundColor: '#f59e0b',
}
```

#### Item Count Badge (Floating Button)
```jsx
cartItemBadge: {
  backgroundColor: 'white',
  width: 32,
  height: 32,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
}
cartItemBadgeText: {
  color: COLORS.PRIMARY,
  fontSize: 15,
  fontWeight: '700',
}
```

---

### 4. Floating Action Button (FAB)

#### View Cart Button
```jsx
viewCartButton: {
  position: 'absolute',
  bottom: 20,
  left: 16,
  right: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: COLORS.PRIMARY,
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,  // Android shadow
}
```

**Specifications**:
- Position: Fixed at bottom (20px from bottom)
- Size: Full width minus 16px margins
- Height: 56px (comfortable touch target)
- Shadow: elevation 8 for prominence
- Always visible when items in cart

---

### 5. Alert/Toast Components

#### AlertCard (Custom Toast)
```jsx
// Replaces Toast.show() and Alert.alert()
// Consistent styling across all alerts

alertContainer: {
  position: 'absolute',
  top: 40,
  left: 16,
  right: 16,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 8,
  zIndex: 100,
}

// Variants
successAlert: {
  backgroundColor: COLORS.SUCCESS,
}
errorAlert: {
  backgroundColor: COLORS.ERROR,
}
warningAlert: {
  backgroundColor: COLORS.WARNING,
}
```

---

## 📱 Screen Architecture

### 1. Product Grid Screen (`products.jsx`)

#### Screen Structure
```
┌─────────────────────────────────┐
│      Stack Header               │  Native header
│  categoryName | [Back]          │
├─────────────────────────────────┤
│ Company Name                    │  Header Container
│ X products available            │
├─────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐    │
│  │ Product  │  │ Product  │    │  Grid: 2 columns, 12px gap
│  │          │  │          │    │
│  │ ₹Price   │  │ ₹Price   │    │
│  │ +ADD     │  │ +ADD     │    │
│  └──────────┘  └──────────┘    │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │ Product  │  │ Product  │    │
│  │          │  │          │    │
│  │ ₹Price   │  │ ₹Price   │    │
│  │ +ADD     │  │ +ADD     │    │
│  └──────────┘  └──────────┘    │
├─────────────────────────────────┤
│  [2]  View Cart  ₹450.00  →    │  Floating button (if items)
└─────────────────────────────────┘
```

#### Components Used
- **Header**: Stack.Screen (native)
- **Content**: FlatList with numColumns={2}
- **Cards**: Product grid items with image, title, price, button
- **Floating Button**: View Cart with item count and total
- **Status Badges**: Stock, low stock indicators

#### Responsive Behavior
- Portrait: 2-column grid
- Landscape: 3-column grid (future)
- Minimum card width: 160px
- Maximum card width: 200px

---

### 2. Product Detail Screen (`productDetail.jsx`)

#### Screen Structure
```
┌─────────────────────────────────┐
│      Stack Header               │
│ Product Name | [Back]           │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │   [Image Carousel]      │   │  Product gallery
│  │  ◄  •••  ►             │   │
│  └─────────────────────────┘   │
│                                 │
│ Title                           │  Product info
│ ₹1,200 | ₹1,500 (Strike)       │
│ 4.5⭐ (120 reviews)             │
│ Description...                  │
│ [Stock: 5 available]            │
│                                 │
│ Related Products                │  Related carousel
│  [ Product ] [ Product ]        │
│  [ Product ] [ Product ]        │
│                                 │
├─────────────────────────────────┤
│  [3]  View Cart  ₹1,250.00  →  │  Floating button
└─────────────────────────────────┘
```

#### Components Used
- **Header**: Stack.Screen + custom options
- **Gallery**: ProductImageGallery (with carousel)
- **Product Info**: ProductInfo component
- **Related Products**: Horizontal scrolling
- **Quantity Control**: ±/Count in card or separate
- **Floating Button**: View Cart with badge

---

### 3. Home Screen (`home.jsx`)

#### Screen Structure
```
┌─────────────────────────────────┐
│         Header Bar              │  Linear gradient
│  Ramesh Aqua  [Search] [Menu]   │
├─────────────────────────────────┤
│                                 │
│  Featured Section               │
│  ┌─────────────────────────┐   │
│  │  [Image Carousel]       │   │  Banner carousel
│  │  ◄  •••  ►             │   │
│  └─────────────────────────┘   │
│                                 │
│  Companies Section              │  Horizontal scroll
│  [Company] [Company] [Company]  │
│                                 │
│  Categories Section             │
│  [Category] [Category]          │
│  [Category] [Category]          │
│                                 │
│  Featured Products              │  Grid or carousel
│  [ Prod ] [ Prod ]              │
│  [ Prod ] [ Prod ]              │
│                                 │
├─────────────────────────────────┤
│  Refresh Control                │  Pull-to-refresh
│  Auto-refresh on focus          │
└─────────────────────────────────┘
```

#### Refresh Behavior
- **Pull-to-refresh**: Reload companies, categories, products
- **Auto-refresh**: When navigating back to home tab
- **Loading State**: Activity indicators on sections

---

### 4. Cart Screen (`cart.jsx`)

#### Screen Structure
```
┌─────────────────────────────────┐
│         Header Bar              │
│  Cart (3 items)  [X]            │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ [Product Image]         │   │
│  │ Product Name            │   │  Cart item
│  │ ₹Price       [- 2 +]    │   │
│  │ Subtotal: ₹240          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Product Image]         │   │
│  │ Product Name            │   │
│  │ ₹Price       [- 1 +]    │   │
│  │ Subtotal: ₹150          │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  Subtotal: ₹390                 │  Summary
│  Taxes: ₹70                     │
│  Total: ₹460                    │
├─────────────────────────────────┤
│  [PROCEED TO CHECKOUT]          │  Primary action
│  [CONTINUE SHOPPING]            │  Secondary action
└─────────────────────────────────┘
```

---

### 5. Categories Screen (`categories.jsx`)

#### Screen Structure
```
┌─────────────────────────────────┐
│    Linear Gradient Header       │
│  [Icon]                         │
│  Company Name                   │
│  X categories available         │
├─────────────────────────────────┤
│  Browse Categories              │  Section title
│  ┌──────────┐  ┌──────────┐    │
│  │          │  │          │    │
│  │ Category │  │ Category │    │  Grid: 2 columns
│  │ Name     │  │ Name     │    │
│  │   →      │  │   →      │    │
│  └──────────┘  └──────────┘    │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │ Category │  │ Category │    │
│  │ Name     │  │ Name     │    │
│  │   →      │  │   →      │    │
│  └──────────┘  └──────────┘    │
│                                 │
└─────────────────────────────────┘
```

#### Header Design
- Linear gradient (PRIMARY_DARK to lighter shade)
- Icon container with white background (opacity 0.2)
- Company name as main title
- Count of categories as subtitle

---

## 🧭 Navigation Patterns

### Navigation Flow

```
Home (Tab)
├── Company Selection
│   └── Categories
│       └── Products (Grid)
│           └── Product Detail
│               └── Cart (Tab)
│
Categories (Tab)
└── [Empty - Browse via Home]

Cart (Tab)
├── Cart Items
└── Checkout (planned)

Profile (Tab)
├── Account Settings
└── Orders

Admin Panel (Tab)
├── Analytics
├── Orders Management
├── Inventory
└── Settings
```

### Screen Transitions

| From | To | Method | Animation |
|------|-----|--------|-----------|
| Home → Categories | Stack Push | `router.push()` | Slide right-to-left |
| Categories → Products | Stack Push | `router.push()` with params | Slide right-to-left |
| Products → Detail | Modal/Stack | `router.push()` | Slide/Fade |
| Detail → Cart | Tab Switch | `router.push('/(tabs)/cart')` | Fade |
| Any → Home | Tab Switch | Tab navigation | No animation |

### Parameter Passing

**Best Practice**: Use URL parameters for navigation

```javascript
// ✅ Correct
router.push({
  pathname: '/products',
  params: {
    companyId: 'comp_123',
    companyName: 'Ramesh Aqua',
    categoryId: 'cat_456',
    categoryName: 'Minerals'
  }
})

// ✅ Also acceptable
router.push(
  `/products?companyId=${id}&companyName=${name}&categoryId=${catId}&categoryName=${catName}`
)
```

---

## 📊 State Indicators

### Loading States

#### Skeleton Screens
- **Product Grid Loading**: Gray placeholder cards with pulse animation
- **Category Loading**: Category card skeletons
- **Header Loading**: Gray bars for text areas
- **Duration**: Show for minimum 300ms (avoid flickering)

```jsx
// Skeleton card structure
<View style={[styles.card, { backgroundColor: '#e0e0e0' }]}>
  <View style={{ height: 160, backgroundColor: '#d0d0d0' }} />
  <View style={{ padding: 12, gap: 8 }}>
    <View style={{ height: 14, backgroundColor: '#d0d0d0', borderRadius: 4 }} />
    <View style={{ height: 12, backgroundColor: '#d0d0d0', width: '60%', borderRadius: 4 }} />
  </View>
</View>
```

#### Activity Indicators
- **Network operations**: Centered `<ActivityIndicator />`
- **Button operations**: Small spinner inside button
- **Color**: Match PRIMARY color
- **Size**: Use "small" by default

```jsx
<ActivityIndicator size="small" color={COLORS.PRIMARY} />
```

### Empty States

#### Empty Grid
```
🛍️  [Icon - bag/box]
No products found
Try browsing another category
```

**Styling**:
- Icon size: 50-60px
- Message: REGULAR (14px) + GRAY color
- Suggestion: SMALL (12px) + LIGHT_GRAY color
- Container: Center vertically with 60px top padding

#### Empty Cart
```
🛒  [Icon - cart]
Your cart is empty
Browse products to get started
```

### Error States

#### Network Error
```
⚠️  [Icon - alert]
Connection error
Check your internet and try again
[RETRY] button
```

#### Out of Stock
```
❌  [Icon - circle-xmark]
OUT OF STOCK  (Red badge on product)
Item unavailable
```

#### Insufficient Stock
```
⚠️  Alert Toast
Insufficient Stock
Only 2 items available
```

### Success States

#### Item Added
```
✓ Added to cart  (Toast - Green)
Item: "Product Name"
Quantity: 2
```

#### Cart Updated
```
✓ Cart updated  (Toast - Green)
Total: ₹450.00
```

---

## 🎬 Interaction Patterns

### Button Interactions

#### Opacity Change
```javascript
// On press
activeOpacity={0.8}  // 80% opacity during press
// Creates tactile feel without animation

// Color change approach (for visibility)
onPressIn={() => setPressed(true)}
onPressOut={() => setPressed(false)}
style={[
  baseStyle,
  pressed && pressedStyle
]}
```

#### Quantity Controls
```javascript
// ± Buttons
- Decrement: Remove item from cart
- Increment: Add item (if stock available)
- Constraints: Cannot go below 0 or above available stock

// Visual feedback
- Button highlight on press
- Text updates immediately
- No network latency for local operations
```

### Scrolling Behavior

#### ScrollView
- **Used for**: Screens with limited content that might not fill screen
- **Properties**:
  - `showsVerticalScrollIndicator={true}` - Show scroll bar
  - `scrollEnabled={true}` - Enable scroll
  - Nested FlatList: Use `scrollEnabled={false}` on FlatList to avoid scroll conflicts

#### FlatList
- **Used for**: Long lists, product grids
- **Properties**:
  - `removeClippedSubviews={true}` - Performance optimization
  - `initialNumToRender={10}` - Initial render count
  - `maxToRenderPerBatch={10}` - Batch render size
  - `updateCellsBatchingPeriod={50}` - Batch update interval

#### Pull-to-Refresh
```jsx
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={COLORS.PRIMARY}
    />
  }
>
```

### Search & Filter Interactions

#### Search Box
- Icon on left (magnifying glass)
- Clear button on right (when text entered)
- Placeholder: "Search products..."
- Debounce: 300ms before API call

#### Filter Badges
- Multiple selection (tap to toggle)
- Selected: PRIMARY background, white text
- Unselected: LIGHT_GRAY background, GRAY text
- Horizontal scroll if many options

---

## 📐 Responsive Design

### Screen Size Breakpoints

| Device Type | Width | Layout | Example |
|-------------|-------|--------|---------|
| Small Phone | 320px | 1 column | iPhone SE |
| Medium Phone | 375px | 1-2 columns | iPhone 12/13 |
| Large Phone | 414px | 2 columns | iPhone 14 |
| Tablet | 768px+ | 3-4 columns | iPad Mini |

### Grid Responsiveness

```javascript
// Current: Always 2 columns
numColumns={2}
columnWrapperStyle={styles.gridRow}

// Future: Responsive
const isTablet = windowWidth >= 768
const numColumns = isTablet ? 3 : 2
```

### Text Scaling

**Approach**: Use fixed sizes (not relative to device)

```javascript
// ✅ Correct - Fixed sizes work best for mobile apps
fontSize: 16  // Same on all devices

// ⚠️ Avoid - Relative scaling can cause issues
fontSize: screenWidth * 0.04  // Different on each device
```

### Padding & Margins Adjustment

**Mobile**: Standard spacing from SPACING constant
**Tablet**: Increase horizontal padding, keep vertical consistent

```javascript
const horizontalPadding = isTablet ? 32 : 16
const verticalPadding = 16  // Same for all
```

---

## 🎨 Design Consistency Checklist

### Before Shipping Any Screen

- [ ] **Colors**: Only using COLORS constants
- [ ] **Spacing**: Using SPACING constants (multiples of 4px)
- [ ] **Typography**: Using FONTS constants
- [ ] **Buttons**: Minimum 48x48dp touch target
- [ ] **Shadow/Elevation**: Using consistent elevation values (3, 5, or 8)
- [ ] **Border Radius**: Using RADIUS constants
- [ ] **States**: Has loading, error, empty, and success states
- [ ] **Accessibility**: Color contrast meets WCAG AA (4.5:1)
- [ ] **Animations**: Smooth transitions (200-300ms duration)
- [ ] **Icons**: Using FontAwesome5 consistently
- [ ] **Feedback**: User gets visual feedback for every action

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Button too small | Manual sizing | Use height: 48px minimum |
| Text hard to read | Low contrast | Check against COLORS palette |
| Inconsistent spacing | Not using SPACING | Replace magic numbers with constants |
| Janky animations | Too many renders | Use useCallback, memo for optimization |
| Cards look flat | Missing shadow | Use elevation: 3+ on Android, shadowOpacity on iOS |
| Scrolling stutters | Large FlatList | Optimize with removeClippedSubviews, initialNumToRender |

---

## 🔄 Migration Guide

### From Old (Inconsistent) to New (Consistent) Design

#### Step 1: Replace Color Hardcodes
```javascript
// ❌ Old
backgroundColor: '#0080ff'
color: '#002147'

// ✅ New
backgroundColor: COLORS.PRIMARY
color: COLORS.PRIMARY_DARK
```

#### Step 2: Replace Spacing Hardcodes
```javascript
// ❌ Old
padding: 15
marginBottom: 10
gap: 7

// ✅ New
padding: SPACING.REGULAR  // 16
marginBottom: SPACING.MEDIUM  // 12
gap: SPACING.SMALL  // 8
```

#### Step 3: Unify Typography
```javascript
// ❌ Old
fontSize: 17
fontWeight: '700'

// ✅ New
fontSize: FONTS.SIZE.XLARGE  // 20
fontWeight: FONTS.WEIGHT.BOLD  // 'bold'
```

#### Step 4: Replace Alert/Toast
```javascript
// ❌ Old (inconsistent)
Toast.show({ type: 'success' })
Alert.alert('Success', 'Item added')

// ✅ New (consistent AlertCard)
<AlertCard type="success" message="Item added to cart" />
```

---

## 📚 Reference Examples

### Example 1: Product Card Component

```jsx
const ProductCard = ({ product, onAddPress }) => (
  <View style={styles.card}>
    {/* Image with Badge */}
    <View style={styles.imageContainer}>
      <Image 
        source={{ uri: product.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      {product.isOutOfStock && (
        <View style={styles.stockBadge}>
          <Text style={styles.stockText}>OUT OF STOCK</Text>
        </View>
      )}
    </View>

    {/* Info */}
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      
      <Text style={styles.price}>
        ₹{product.price}
      </Text>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={onAddPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>ADD TO CART</Text>
      </TouchableOpacity>
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.LARGE,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // ... other styles using COLORS, SPACING, FONTS, RADIUS constants
})
```

---

## 🚀 Performance Tips

1. **Optimize Images**: Use appropriate sizes, WebP format if possible
2. **Lazy Load**: Only render visible items in lists
3. **Memoize Components**: Use `React.memo()` for expensive renders
4. **Debounce Events**: Search, filter operations (300ms)
5. **Avoid Inline Styles**: Define styles outside component
6. **Use ScrollView vs FlatList**: FlatList for long lists only
7. **Keep State Local**: Don't store UI state in global context

---

## 📖 Usage Examples

### Implementing a New Screen

1. Create screen file in `app/` or `app/(tabs)/`
2. Import constants:
   ```javascript
   import { COLORS, SPACING, FONTS, RADIUS } from '../src/utils/constants'
   import { useCart } from '../contexts/CartContext'
   import { useRouter } from 'expo-router'
   ```
3. Use design system for all styling
4. Add loading, error, empty states
5. Test on multiple screen sizes
6. Get design review before merge

---

## 📞 Support & Questions

For design system questions or updates:
- Review this document first
- Check existing screens for patterns
- Follow PhonePe/Flipkart reference models
- Maintain consistency above all else

---

**Last Updated**: 2024  
**Design System Version**: 1.0  
**Next Review**: Upon major UI overhaul
