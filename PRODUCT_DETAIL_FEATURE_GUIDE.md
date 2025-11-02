# Product Detail Feature - Modular Architecture Guide

## 📋 Overview

This document explains the **Product Detail Feature** implementation following a clean, modular architecture pattern. Every component is separated by responsibility, making it easy for new developers to understand and maintain.

---

## 🏗️ Architecture Pattern

```
┌─────────────────────────────────────────────────┐
│         Product Detail Feature Structure        │
├─────────────────────────────────────────────────┤
│                                                 │
│  📱 Screen Layer (UI Container)                 │
│     app/productDetail.jsx                       │
│     - Orchestrates all components               │
│     - Handles navigation                        │
│     - Manages cart integration                  │
│                                                 │
│  ⬇️                                              │
│                                                 │
│  🎨 Component Layer (UI Components)             │
│     app/components/productDetail/               │
│     - ProductImageGallery.jsx                   │
│     - ProductInfo.jsx                           │
│     - RelatedProducts.jsx                       │
│                                                 │
│  ⬇️                                              │
│                                                 │
│  🎣 Hook Layer (State Management)               │
│     app/hooks/useProductDetail.js               │
│     - Manages product state                     │
│     - Handles loading/error states              │
│     - Auto-loads data                           │
│                                                 │
│  ⬇️                                              │
│                                                 │
│  🔧 Service Layer (Data Operations)             │
│     app/services/productDetailService.js        │
│     - Firebase queries                          │
│     - Data fetching logic                       │
│     - No UI dependencies                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
app/
├── productDetail.jsx                    # Main screen (180 lines)
├── services/
│   └── productDetailService.js          # Data service (180 lines)
├── hooks/
│   └── useProductDetail.js              # Custom hook (100 lines)
└── components/
    └── productDetail/
        ├── ProductImageGallery.jsx      # Image component (60 lines)
        ├── ProductInfo.jsx              # Info component (250 lines)
        └── RelatedProducts.jsx          # Related products (130 lines)
```

**Total: ~900 lines organized into 6 focused files**

---

## 🔧 Service Layer

### `app/services/productDetailService.js`

**Purpose**: Handles all Firebase database operations related to products.

**Functions**:

#### 1. `getProductById(productId)`

- **What**: Fetches a single product by ID
- **Input**: `productId` (string)
- **Output**: Product object or null
- **Usage**:
  ```javascript
  const product = await getProductById("product123");
  ```

#### 2. `getRelatedProductsByCategory(categoryId, currentProductId, maxResults)`

- **What**: Fetches products from the same category
- **Input**:
  - `categoryId` (string)
  - `currentProductId` (string) - to exclude
  - `maxResults` (number, default: 10)
- **Output**: Array of products
- **Usage**:
  ```javascript
  const related = await getRelatedProductsByCategory("cat123", "prod123", 10);
  ```

#### 3. `getRelatedProductsByCompany(companyId, currentProductId, maxResults)`

- **What**: Fetches products from the same company
- **Similar to** getRelatedProductsByCategory but filters by company

#### 4. `getSmartRelatedProducts({ productId, categoryId, companyId, maxResults })`

- **What**: Intelligent combination of category and company products
- **Logic**:
  1. Fetch from same category (priority)
  2. Fill remaining with same company products
  3. Deduplicate and limit results
- **Usage**:
  ```javascript
  const smart = await getSmartRelatedProducts({
    productId: "prod123",
    categoryId: "cat123",
    companyId: "comp123",
    maxResults: 10,
  });
  ```

**Key Features**:

- ✅ Console logging for debugging
- ✅ Error handling
- ✅ Validation
- ✅ No UI dependencies (pure data layer)

---

## 🎣 Hook Layer

### `app/hooks/useProductDetail.js`

**Purpose**: Custom React hook that manages state for product detail screen.

**Exported State**:

- `product` - Current product object
- `relatedProducts` - Array of related products
- `loading` - Main loading state (boolean)
- `loadingRelated` - Related products loading (boolean)
- `error` - Error message (string or null)
- `refresh()` - Function to reload data

**How It Works**:

```javascript
const { product, relatedProducts, loading, error, refresh } =
  useProductDetail(productId);
```

**Auto-Loading**: Automatically fetches data when `productId` changes.

**Error Handling**: Catches errors and sets error state without crashing.

---

## 🎨 Component Layer

### 1. `ProductImageGallery.jsx`

**Purpose**: Displays product images in a gallery format.

**Props**:

- `imageUrl` (string) - Product image URL
- `title` (string) - Product title (for alt text)

**Features**:

- 400px height full-width display
- Placeholder for missing images
- Uses `contain` resize mode

**Usage**:

```jsx
<ProductImageGallery imageUrl={product.imageUrl} title={product.title} />
```

---

### 2. `ProductInfo.jsx`

**Purpose**: Displays all product information and add-to-cart controls.

**Props**:

- `product` (object) - Product data
- `onAddToCart` (function) - Add handler
- `onRemoveFromCart` (function) - Remove handler
- `quantity` (number) - Current cart quantity

**Sections**:

1. **Title** - Product name
2. **Rating Badge** - Placeholder ratings (4.3 ⭐)
3. **Price Section**:
   - Current price
   - Original price (strikethrough)
   - Discount badge (% OFF)
4. **Description** - Product details
5. **Specifications** - Product specs (placeholder)
6. **Add to Cart Controls**:
   - Shows "ADD TO CART" button when quantity = 0
   - Shows +/- controls when item is in cart

**Usage**:

```jsx
<ProductInfo
  product={product}
  onAddToCart={handleAddToCart}
  onRemoveFromCart={handleRemoveFromCart}
  quantity={quantity}
/>
```

---

### 3. `RelatedProducts.jsx`

**Purpose**: Horizontal scrollable list of related products.

**Props**:

- `products` (array) - List of related products
- `loading` (boolean) - Loading state
- `onProductPress` (function) - Click handler

**Features**:

- Horizontal scroll
- 160px width cards
- Shows image, title, price, discount
- Auto-hides if no products

**Usage**:

```jsx
<RelatedProducts
  products={relatedProducts}
  loading={loadingRelated}
  onProductPress={handleRelatedProductPress}
/>
```

---

## 📱 Screen Layer

### `app/productDetail.jsx`

**Purpose**: Main container that orchestrates all components.

**Features**:

1. **Loading State** - Shows spinner while loading
2. **Error State** - Shows error message with back button
3. **Product Display** - Combines all components
4. **Cart Integration** - Uses CartContext
5. **Floating Cart Button** - Shows when items in cart
6. **Related Product Navigation** - Click to navigate to new product

**State Management**:

```javascript
const { product, relatedProducts, loading, error } =
  useProductDetail(productId);
const { addToCart, removeFromCart, getItemQuantity, getTotalItems, getTotal } =
  useCart();
```

**Navigation Flow**:

```
Products List → Click Product
    ↓
Product Detail (productId: '123')
    ↓
Click Related Product
    ↓
New Product Detail (productId: '456')
```

---

## 🔄 Data Flow

### Loading a Product:

1. **User clicks product** in products list
2. **Navigation** passes `productId` as param
3. **Screen** receives `productId` from `useLocalSearchParams()`
4. **Hook** `useProductDetail(productId)` auto-executes:
   - Calls `loadProduct()`
   - Hook calls **Service** `getProductById(productId)`
   - Service queries **Firebase**
   - Service returns product data
   - Hook sets `product` state
   - Hook calls `loadRelatedProducts(product)`
   - Service fetches related products
   - Hook sets `relatedProducts` state
5. **Screen** receives updated state
6. **Components** render with data

```
User Click → Navigation → Screen → Hook → Service → Firebase
                                      ↓
User Sees ← Components ← Screen ← Hook ← Data
```

---

## 🎯 Key Benefits

### 1. **Separation of Concerns**

- **Service** = Data only (no UI)
- **Hook** = State only (no data fetching logic)
- **Component** = UI only (no business logic)
- **Screen** = Orchestration only

### 2. **Reusability**

- Components can be used in other screens
- Service functions can be called anywhere
- Hook can be used in multiple screens

### 3. **Testability**

- Each layer can be tested independently
- Mock Firebase in service tests
- Mock service in hook tests
- Mock hook in component tests

### 4. **Maintainability**

- Small, focused files (60-250 lines each)
- Clear responsibilities
- Easy to locate issues
- Easy for new developers to understand

### 5. **Scalability**

- Add new components without touching service
- Change data source without touching UI
- Add features without breaking existing code

---

## 📝 How to Use This Feature

### For Users:

1. Browse products in any category
2. Click on a product card
3. See detailed product information
4. Add to cart using + button
5. View related products below
6. Click related product to see its details

### For Developers:

#### To Add a New Field:

1. **Service**: No changes needed (already fetches all fields)
2. **Hook**: No changes needed (passes through data)
3. **Component** (`ProductInfo.jsx`): Add new UI element
4. **Screen**: No changes needed (already passes product)

#### To Change Data Source:

1. **Service**: Update Firebase queries only
2. **Hook**: No changes needed
3. **Components**: No changes needed
4. **Screen**: No changes needed

#### To Add New Related Product Logic:

1. **Service**: Add new function (e.g., `getRelatedByBrand()`)
2. **Hook**: Call new service function
3. **Component**: No changes needed (uses same data format)
4. **Screen**: No changes needed

---

## 🔗 Integration Points

### Cart Context Integration:

```javascript
const { addToCart, removeFromCart, getItemQuantity } = useCart();
```

### Navigation Integration:

```javascript
router.push({
  pathname: "/productDetail",
  params: { productId: product.id },
});
```

### Firebase Integration:

```javascript
import { db } from "../../lib/firebase";
```

---

## 🚀 Future Enhancements

### Easy to Add:

1. **Image Gallery** - Multiple images slider
2. **Reviews Section** - User reviews and ratings
3. **Size/Color Variants** - Product variations
4. **Share Button** - Share product with others
5. **Wishlist** - Save for later functionality
6. **Zoom Image** - Pinch to zoom on image
7. **Video Support** - Product videos
8. **Q&A Section** - Customer questions

### How to Add Review Section (Example):

1. Create `app/components/productDetail/ProductReviews.jsx`
2. Create `app/services/reviewService.js` for review data
3. Update `useProductDetail.js` hook to load reviews
4. Import and use in `productDetail.jsx`
5. **Zero changes** to existing components!

---

## 📚 Code Examples

### Example 1: Using the Service Directly

```javascript
import { getProductById } from "./services/productDetailService";

const fetchProduct = async () => {
  const product = await getProductById("product123");
  console.log(product);
};
```

### Example 2: Using the Hook in a Component

```javascript
import { useProductDetail } from "./hooks/useProductDetail";

const MyComponent = () => {
  const { product, loading, error } = useProductDetail("product123");

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  return <ProductView product={product} />;
};
```

### Example 3: Creating a Similar Feature

To create a "Category Detail" feature following the same pattern:

1. Create `services/categoryDetailService.js`
2. Create `hooks/useCategoryDetail.js`
3. Create `components/categoryDetail/` folder
4. Create `categoryDetail.jsx` screen
5. Follow the same architecture!

---

## ✅ Checklist for New Developers

When working with this feature:

- [ ] Read this documentation first
- [ ] Understand the 4-layer architecture
- [ ] Check Service layer for data operations
- [ ] Check Hook layer for state management
- [ ] Check Component layer for UI elements
- [ ] Check Screen layer for orchestration
- [ ] Test changes in each layer independently
- [ ] Update documentation if adding new features

---

## 🆘 Troubleshooting

### Product not loading?

1. Check Console logs in `productDetailService.js`
2. Verify `productId` is being passed correctly
3. Check Firebase connection
4. Check product exists in database

### Related products not showing?

1. Check if `categoryId` and `companyId` exist in product
2. Verify there are other products in same category/company
3. Check Console logs in service layer

### Component not rendering?

1. Verify data structure matches expected props
2. Check for null/undefined values
3. Add console.log in component to debug

---

## 📞 Support

For questions or issues with this feature:

1. Check Console logs (lots of helpful debugging info)
2. Review the architecture diagram
3. Trace the data flow
4. Check individual component documentation

---

**Last Updated**: November 3, 2025
**Architecture Pattern**: Clean Modular Architecture
**Total Lines of Code**: ~900 lines across 6 files
**Maintainability**: ⭐⭐⭐⭐⭐ (Excellent)
