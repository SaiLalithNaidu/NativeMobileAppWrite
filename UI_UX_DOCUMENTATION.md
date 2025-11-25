# Ramesh Aqua - Mobile App UI/UX Documentation

**Purpose**: Comprehensive UI/UX specification for the Ramesh Aqua native mobile application. This document outlines all screens, their content structure, user flows, and design consistency standards for implementation across all screens.

**Target Design Platforms**: PhonePe, Flipkart, Swiggy, Zomato (Industry-standard e-commerce patterns)

**Document Version**: 1.0  
**Last Updated**: November 19, 2025

---

## Table of Contents

1. [Design System & Brand Guidelines](#design-system--brand-guidelines)
2. [Navigation Structure](#navigation-structure)
3. [Screen Inventory](#screen-inventory)
4. [Detailed Screen Specifications](#detailed-screen-specifications)
5. [Common Components & Patterns](#common-components--patterns)
6. [User Flows](#user-flows)
7. [Consistency Guidelines](#consistency-guidelines)

---

## Design System & Brand Guidelines

### Color Palette
- **Primary Blue**: `#0080ff` - Main action buttons, highlights, interactive elements
- **Dark Navy**: `#002147` - Headers, primary text, dark backgrounds
- **Light Gray**: `#f5f5f5` - Page backgrounds, neutral surfaces
- **White**: `#ffffff` - Card backgrounds, elevated surfaces
- **Success Green**: `#059669` - Positive actions, confirmations, stock availability
- **Error Red**: `#dc2625` - Errors, out of stock, warnings
- **Warning Orange**: `#f59e0b` - Low stock, pending items
- **Text Gray**: `#333333` - Primary text
- **Secondary Gray**: `#666666` - Secondary text
- **Light Gray**: `#999999` - Tertiary text, disabled states

### Typography
- **Headers**: 24px, bold (700), Dark Navy (#002147)
- **Section Titles**: 18px, bold (700), Dark Navy
- **Card Titles**: 15-16px, semi-bold (600), Dark Navy
- **Body Text**: 14-15px, regular (400), Text Gray
- **Small Text**: 11-12px, regular (400), Secondary Gray
- **Badge Text**: 10-11px, bold (700), Primary Blue

### Spacing System
- **Base Unit**: 8px
- **Padding**: 8px, 12px, 16px, 20px, 24px
- **Margins**: 8px, 12px, 16px, 20px
- **Gap**: 8px, 10px, 12px, 16px

### Shadow & Elevation
- **Card Elevation**: 
  - Shadow Offset: {0, 2-4px}
  - Shadow Opacity: 0.1-0.15
  - Shadow Radius: 4-8px
  - Elevation (Android): 3-8
- **Floating Button Elevation**:
  - Shadow Offset: {0, 4px}
  - Shadow Opacity: 0.3
  - Shadow Radius: 8px
  - Elevation (Android): 10

### Border Radius
- **Cards & Sections**: 12-16px
- **Buttons**: 8-12px
- **Badges**: 6-10px
- **Circle/Icons**: 50% (circular)

---

## Navigation Structure

### Navigation Hierarchy

```
App Root (index.jsx)
├── Loading State (shows spinner until auth check complete)
├── Conditional Redirect
│   ├── If Authenticated → Tab Navigation (/(tabs)/)
│   └── If Not Authenticated → Auth Screen (/auth)
│
Tab Navigation (5 tabs, bottom-tab style)
├── Home Tab (/(tabs)/home)
├── Search Tab (/(tabs)/search)
├── Cart Tab (/(tabs)/cart)
├── Orders Tab (/(tabs)/orders)
└── Profile Tab (user profile menu)
│
Auth Flow
├── Login/Signup (/auth or /signup)
├── Password Reset (modal on /auth)
└── Onboarding (if new user)
│
Shopping Flow
├── Home → Select Company
├── Categories (/:company/categories)
├── Products List (/products)
├── Product Detail (/productDetail)
├── View Cart (/(tabs)/cart)
├── Checkout (/checkout)
└── Order Confirmation (/orderConfirmation)
│
Order Management Flow
├── Orders List (/(tabs)/orders)
└── Order Detail (/orderDetail)
│
Admin Flow
├── Admin Panel (/(tabs)/adminPanel)
├── Add Stock (/addStock)
├── Edit Product (/editProduct)
└── Warehouse Management (/(tabs)/warehouse)
```

---

## Screen Inventory

| # | Screen Name | Route | Type | Purpose |
|---|---|---|---|---|
| 1 | Splash/Loading | `/index` | Entry | Auth state check, initial load |
| 2 | Login | `/auth` | Auth | User authentication with email/password |
| 3 | Signup | `/signup` | Auth | New user registration |
| 4 | Home | `/(tabs)/home` | Main | Browse companies and featured content |
| 5 | Categories | `/categories` | Browse | View product categories for selected company |
| 6 | Products | `/products` | Browse | List products in selected category |
| 7 | Product Detail | `/productDetail` | Browse | Full product information & add to cart |
| 8 | Search | `/(tabs)/search` | Browse | Search products across all companies |
| 9 | Cart | `/(tabs)/cart` | Shopping | Review cart items, bill summary, checkout |
| 10 | Checkout | `/checkout` | Shopping | Billing information, payment, order creation |
| 11 | Order Confirmation | `/orderConfirmation` | Shopping | Order success confirmation & details |
| 12 | Orders List | `/(tabs)/orders` | Account | User's order history & tracking |
| 13 | Order Detail | `/orderDetail` | Account | Full order information |
| 14 | Profile | `/(tabs)/profile` | Account | User profile & settings |
| 15 | Admin Panel | `/(tabs)/adminPanel` | Admin | Admin dashboard overview |
| 16 | Add Stock | `/addStock` | Admin | Add new products to inventory |
| 17 | Edit Product | `/editProduct` | Admin | Modify product information |
| 18 | Warehouse | `/(tabs)/warehouse` | Admin | Inventory management |

---

## Detailed Screen Specifications

### 1. Splash/Loading Screen (`/index`)

**Purpose**: Initial entry point that checks authentication state and routes to appropriate screen

**Content Structure**:
- Full-screen centered layout
- Animated spinner (ActivityIndicator)
- Primary blue color (`#0080ff`)
- No navigation header

**User Flow**:
- App starts → Show spinner
- Check auth state (Firebase)
- Authenticated → Navigate to Home
- Not authenticated → Navigate to Login

**Visual Hierarchy**:
```
[Centered Spinner - Primary Blue]
```

**Constraints**:
- Display time: 1-3 seconds
- No user interaction required
- Auto-dismiss based on auth check

---

### 2. Login Screen (`/auth`)

**Purpose**: Authenticate existing users with email and password

**Content Structure**:

**Header Section**:
- Company logo/branding
- App title
- Subtitle: "Login to your account"

**Form Section**:
- Email input field
  - Placeholder: "Enter your email"
  - Type: email
  - Icon: envelope
  - Validation: Real-time format check
  
- Password input field
  - Placeholder: "Enter your password"
  - Type: password (toggle visibility)
  - Icon: eye/eye-off
  - Min length: 6 characters
  
- "Forgot Password?" link (opens modal)
  - Text style: Light blue, underlined
  - Opens password reset modal

**Button Section**:
- Primary: "Login" button (full width)
  - Background: Primary Blue (#0080ff)
  - Text: White, bold
  - State: Enabled/Loading/Error
  
- Secondary: "Don't have account? Sign Up"
  - Text: Gray with blue underline
  - Link to signup screen

**Error Section**:
- Alert card below form
- Red background, error icon, error message
- Auto-dismiss after 5 seconds
- Manual close button

**Forgot Password Modal**:
- Modal overlay with white card
- "Reset Password" title
- Email input field
- "Send Reset Email" button
- "Cancel" button
- Success/Error states

**Visual Hierarchy**:
```
[Logo/Brand]
[Title: "Login"]
[Subtitle: "Login to your account"]

[Email Input Field]
[Password Input with Toggle]
[Forgot Password Link - Right aligned]

[Alert Card - if error]

[Login Button - Full Width]
[Sign Up Link - Centered]
```

**Constraints**:
- Keyboard avoiding view (iOS/Android)
- Form validation before submission
- Error messages clear and user-friendly
- Loading state shows spinner

**Related Modals**:
- Password Reset Modal
- Error Alert Card

---

### 3. Signup Screen (`/signup`)

**Purpose**: Register new users with email and password

**Content Structure**:

**Header Section**:
- App title/logo
- Subtitle: "Create a new account"

**Form Section**:
- Full name input field
  - Placeholder: "Enter your full name"
  - Type: text
  - Icon: user
  
- Email input field
  - Placeholder: "Enter your email"
  - Type: email
  - Icon: envelope
  
- Phone number field
  - Placeholder: "+91 XXXXX XXXXX"
  - Type: phone
  - Icon: phone
  
- Password input field
  - Placeholder: "Create password (min 6 chars)"
  - Type: password (toggle visibility)
  - Min length: 6 characters
  
- Confirm password field
  - Placeholder: "Confirm password"
  - Type: password (toggle visibility)
  - Must match password field

**Validation Messages**:
- Email format validation
- Password strength indicator
- Password confirmation check
- Phone format validation

**Button Section**:
- Primary: "Create Account" button (full width)
  - Background: Primary Blue
  - Text: White, bold
  - State: Enabled/Loading/Error
  
- Secondary: "Already have account? Login"
  - Link to login screen

**Visual Hierarchy**:
```
[Title: "Sign Up"]
[Subtitle: "Create new account"]

[Full Name Input]
[Email Input]
[Phone Number Input]
[Password Input with Toggle]
[Confirm Password Input with Toggle]

[Create Account Button - Full Width]
[Login Link - Centered]
```

**Constraints**:
- All fields required
- Form validation before submission
- Error messages below each field
- Success → Auto-login and navigate to Home

---

### 4. Home Screen (`/(tabs)/home`)

**Purpose**: Browse and explore companies, see featured products, personalized greeting

**Content Structure**:

**Header Section** (Gradient Navy Blue):
- Time-based greeting emoji (🌅 Morning, ☀️ Afternoon, 🌙 Evening)
- Personalized greeting text: "[Greeting] [User First Name]"
- Fallback: "Good [time] Guest" (if not logged in)
- Tagline/subtitle: "🦐 Feeds & Needs"

**Content Sections**:

1. **Featured Image Carousel**
   - Auto-scrolling banner images
   - 3-5 featured products/promotions
   - Page dots/indicators at bottom
   - Tap to view product detail

2. **Image Carousel** (below greeting)
   - Horizontal scrollable cards
   - Featured products or promotions
   - Image, title, and price visible

3. **Companies List Section**
   - Section header: "Our Companies" (with icon)
   - List of company cards (full width, stacked)
   
   **Company Card Content**:
   - Company logo (left side, square)
   - Company name (large, bold)
   - Stats badges showing:
     - Category count (📁 [number])
     - Product count (📦 [number])
   - Chevron icon (right side, indicating navigation)
   - Gradient white background
   - Shadow effect
   - Tap to navigate to categories screen

**Refresh Functionality**:
- Pull-to-refresh gesture support
- Reload companies and featured products
- Spinner during refresh

**Visual Hierarchy**:
```
[Gradient Header - Dark Navy]
  🌅 Good Morning
  John
  🦐 Feeds & Needs

[Featured Carousel]
  [Image] [Image] [Image]
  ●●●

[Companies Section Header]
  📁 Our Companies

[Company Card 1]
  [Logo] | Company Name      | [#Categories] [#Products] | →
[Company Card 2]
  [Logo] | Company Name      | [#Categories] [#Products] | →
[Company Card 3]
  [Logo] | Company Name      | [#Categories] [#Products] | →
...

[Empty State - if no companies]
  🏢
  "No companies available"
```

**Loading State**:
- Skeleton loaders for company cards
- Carousel placeholder
- Gradient placeholder for header

**Constraints**:
- Navigation header: Hidden (custom header used)
- Pull-to-refresh enabled
- Company cards should be responsive
- Auto-scroll carousel (5-second intervals)

**Related Components**:
- ImageCarousel component
- CompanyCard component
- SkeletonCompanyCard component

---

### 5. Categories Screen (`/categories`)

**Purpose**: Browse product categories for selected company

**Content Structure**:

**Header Section** (Gradient Navy Blue):
- Company icon (folder open)
- Company name (large, bold, white)
- Subtitle: "[Count] categories available"
- Gradient background (#002147 to #004080)

**Navigation Header**:
- Back button (standard navigation)
- Header title: Empty (custom header used)

**Content Section**:

**Section Header**:
- Icon: th-large (grid icon)
- Title: "Browse Categories" (bold, dark navy)

**Categories Grid**:
- 2-column layout
- Grid spacing: 16px between items
- Horizontal padding: 15px

**Category Card Content**:
- Category image (top, 140px height)
- Gradient overlay at bottom (dark at bottom for text contrast)
- Category title (bold, 15px, dark navy)
- Product count badge (📦 [count])
- Arrow icon (right side, indicating navigation)
- White background with rounded corners
- Shadow effect

**Card Tap Behavior**:
- Navigate to products screen
- Pass: companyId, companyName, categoryId, categoryName

**Floating View Cart Button** (NEW - Floating Always Visible):
- Position: Fixed at bottom (20px margin)
- Background: Primary Blue (#0080ff)
- Z-index: 99 (always on top)
- Visible when: getTotalItems() > 0
- Height: 52px
- Full width with 16px left/right margin

**Cart Button Content**:
- Left section:
  - White circular badge (32x32px) with item count
  - Text: "View Cart" (white, bold)
- Right section:
  - Total price: "₹[amount]" (white, bold)
  - Arrow icon (right, white)

**Cart Button Interaction**:
- Tap → Navigate to cart screen
- Active opacity: 0.9
- Shadow: Strong (elevation: 10)

**Empty State**:
- Large icon (box-open)
- Message: "No categories found for this company"

**Visual Hierarchy**:
```
[Gradient Header - Dark Navy]
  📁 [Company Name]
  [Count] categories available

[Section Header]
  📊 Browse Categories

[Category Grid - 2 Columns]
  [Category Card] [Category Card]
  [Category Card] [Category Card]
  [Category Card] [Category Card]

[Floating View Cart Button - Fixed at bottom]
  [Badge: Count] | View Cart | ₹[Total] →
```

**Loading State**:
- Skeleton category cards (8 items)
- Gradient placeholder for header
- No floating button visible

**Constraints**:
- ScrollView for vertical scrolling
- FlatList with scrollEnabled={false} inside ScrollView
- Floating button needs `position: 'absolute'` at parent View level
- Button should not overlap content when scrolling
- Safe area bottom margin consideration

**Related Components**:
- CategoryCard component
- SkeletonCategoryCard component
- Floating View Cart Button

---

### 6. Products Screen (`/products`)

**Purpose**: Browse products in selected category with add-to-cart functionality

**Content Structure**:

**Navigation Header**:
- Category name (as title)
- Back button

**Compact Header Section**:
- Company name (14px, semi-bold)
- Subtitle: "[Count] products available"
- Background: White
- Border bottom: Light gray

**Products Grid**:
- 2-column layout
- Grid spacing: 12px vertical
- Horizontal padding: 8px per side

**Product Card Content**:
- Product image (160px height, or placeholder)
- Placeholder: Light gray with box icon
- Out-of-stock state: 50% opacity overlay
- Product title (14px, bold, dark navy, 2 lines max)
- Description (11px, gray, 2 lines max)
- Price section:
  - Original price (strikethrough, small, if available)
  - Current price (16px, bold, primary blue)
- Stock information (11px, green, "X available")
- Add to cart button or quantity control

**Stock Status Badges** (Top-right corner):
- "OUT OF STOCK": Red background
- "LOW STOCK": Orange background
- Font size: 10px, bold, white text

**Add to Cart Controls**:
- Not in cart: "ADD TO CART" button
  - Background: Primary blue
  - Text: White, bold
  - Tap → Add to cart, update quantity controls
  
- In cart: Quantity control (Swiggy/Zomato style)
  - Background: Primary blue
  - Left button: Minus icon (remove 1)
  - Center: Current quantity (white text)
  - Right button: Plus icon (add 1)
  - Plus button disabled if max quantity reached

- Out of stock: "OUT OF STOCK" button
  - Background: Gray (#9ca3af)
  - Text: White, disabled state

**Stock-Aware Behavior**:
- Show available quantity under price
- Low stock warning (< 5 items)
- Disable plus button when max quantity reached
- Show "Last Item" toast when taking final item

**Floating View Cart Button**:
- Same as Categories screen
- Fixed at bottom (20px margin)
- Background: Primary Blue
- Shows item count and total price
- Navigate to cart on tap

**Empty State**:
- Large icon (shopping-bag)
- Message: "No products found in this category"

**Loading State**:
- Compact header skeleton
- 6 product card skeletons
- Grid layout maintained

**Visual Hierarchy**:
```
[Company Name]
[# products available]

[Product Grid - 2 Columns]
  [Product Image] [Product Image]
  [Stock Badge-OOS] [Stock Badge-LS]
  [Title]          [Title]
  [Description]    [Description]
  [Price Info]     [Price Info]
  [Stock Info]     [Stock Info]
  [Add Button]     [Qty Control]
  
  [Product Image] [Product Image]
  ...

[Floating View Cart Button - Fixed at bottom]
  [Badge: Count] | View Cart | ₹[Total] →
```

**Constraints**:
- Inventory service for real-time stock checking
- Toast notifications for stock warnings
- Pull-to-refresh not needed (products static)
- FlatList with proper column wrapper styling
- Floating button with `paddingBottom: 100` in gridContainer

**Related Components**:
- ProductCard component
- StockBadge component
- QuantityControl component
- SkeletonProductGrid component
- Toast notification system

---

### 7. Product Detail Screen (`/productDetail`)

**Purpose**: View complete product information and make detailed add-to-cart decision

**Content Structure**:

**Navigation Header**:
- Title: "Product Details"
- Back button

**Product Image Gallery Section**:
- Large image carousel/gallery view
- Touch to zoom capability
- Image carousel indicators (dots)
- Fallback placeholder with box icon

**Product Information Section**:
- Product title (20px, bold, dark navy)
- Rating/reviews section (if available)
  - Star rating display
  - Review count link
- Price section:
  - Original price (strikethrough, if available)
  - Current price (24px, bold, primary blue)
  - Discount percentage (if available)

**Product Details Section**:
- Description: Full product description text
- Category info: "[Company Name] > [Category Name]"
- Product ID or SKU
- Availability status with stock count

**Add to Cart Section**:
- Large primary button: "Add to Cart"
  - Or quantity control if already added
  - Height: 56px
  - Full width
  - Background: Primary blue
  - Text: White, bold

**Related Products Section** (Carousel):
- Title: "Similar Products" or "You might also like"
- Horizontal scrollable cards
- Each card shows:
  - Product image (small)
  - Product title
  - Price
  - Tap to navigate to product detail

**Floating View Cart Button**:
- Same as other screens
- Fixed at bottom
- Visible when getTotalItems() > 0

**Loading State**:
- Full page skeleton
- Image placeholder
- Text placeholders

**Error State**:
- Error icon
- Error message: "Product not found or unavailable"
- "Go Back" button

**Visual Hierarchy**:
```
[Product Image Gallery]
  ●●●

[Product Title]
[Rating: ⭐ 4.5 (120 reviews)]

[Original Price: ₹100]
[Price: ₹75]
[10% OFF]

[Description]

[Category: Aqua > Fish Feed]
[Availability: 50+ in stock]

[Add to Cart Button - Full Width]

[Related Products]
  [Prod1] [Prod2] [Prod3]

[Floating View Cart Button - Fixed at bottom]
  [Badge: Count] | View Cart | ₹[Total] →
```

**Constraints**:
- ScrollView for vertical content
- Image gallery as touchable carousel
- Related products as horizontal FlatList
- SafeAreaView wrapper
- Floating button with zIndex consideration

**Related Components**:
- ProductImageGallery component
- ProductInfo component
- RelatedProducts component
- AddToCartButton component

---

### 8. Search Screen (`/(tabs)/search`)

**Purpose**: Search for products across all companies and categories

**Content Structure**:

**Search Bar Section** (Top, sticky):
- Search icon (left)
- Input field with placeholder: "Search products..."
- Clear icon (right, shows when text entered)
- Background: White with border
- Padding: 12px horizontal

**Search Results Section**:

**If searching (query exists)**:
- Products grid (2 columns, same as products screen)
- Stock status badges
- Add to cart controls
- Price information

**If no results**:
- Large icon (search)
- Message: "No products found for '[query]'"
- Suggestion: "Try different keywords"

**Search History Section** (when search box focused/empty):
- "Recent Searches" title (optional)
- List of previous search queries
- Each history item is tappable to repeat search
- "Clear history" button (right-aligned)
- Max 5 recent searches shown

**Initial State** (search box empty, no history):
- Welcome icon
- Message: "Search for products by name, category, or company"
- Featured categories or trending searches (optional)

**Loading State**:
- Skeleton product grid
- Search bar shows placeholder

**Empty History State**:
- Empty state message: "No search history yet"
- Search bar ready for input

**Visual Hierarchy**:
```
[Search Bar - Sticky at top]
  🔍 [Input: "Search..."] ✕

[Results or History]

IF Results:
[Product Grid - 2 Columns]
  [Product Card] [Product Card]
  [Product Card] [Product Card]
  ...

IF No Results:
  🔍
  "No products found for 'xyz'"
  "Try different keywords"

IF History:
  Recent Searches
  - previous search 1
  - previous search 2
  - previous search 3
  [Clear History]
```

**Floating View Cart Button**:
- Same as other screens
- Fixed at bottom when results exist
- Visible when getTotalItems() > 0

**Constraints**:
- Real-time search as user types
- Search history stored locally
- Debounced search queries (300ms)
- Stock status loaded with batch queries
- FlatList with 2-column grid layout

**Related Components**:
- SearchBar component
- ProductCard component (reused)
- SearchHistory component
- SkeletonProductGrid component

---

### 9. Cart Screen (`/(tabs)/cart`)

**Purpose**: Review shopping cart items, modify quantities, and proceed to checkout

**Content Structure**:

**Header Section**:
- Title: "My Cart"
- Clear cart button (trash icon + "Clear" text)
  - Right-aligned
  - Red color (error color)
  - Confirmation: "Clear all items?" prompt

**Cart Items Section**:
- List of cart items (FlatList, vertical)

**Cart Item Card Content** (per item):
- Product image (left, 80x80px)
- Product details (center):
  - Product title (bold, 14px)
  - Company and category info (small, gray)
  - Price per unit: "₹[price]" (bold, primary blue)
- Quantity controls (right):
  - Minus button (remove 1)
  - Quantity display (center number)
  - Plus button (add 1)
- Item total: "[Quantity] × ₹[price]" below quantity
- Remove button: X or trash icon

**Bill Summary Section** (Card, white background):
- Subtotal: "₹[amount]" (label left, value right)
- Tax/GST: "₹[amount]"
- Delivery (if applicable): "₹[amount]"
- Total: "₹[amount]" (bold, larger font, primary blue)

**Empty Cart State**:
- Large icon (shopping-cart)
- Message: "Your cart is empty"
- Suggestion: "Start shopping to add items"
- "Continue Shopping" button (navigates to home)

**Checkout Section** (Fixed at bottom):
- Total amount display (left):
  - "₹[total]" (large, bold)
  - "[count] items" (small, gray)
- Proceed to Checkout button (right):
  - Background: Primary blue
  - Text: White, bold
  - Arrow icon (right)
  - Height: 56px
  - Full width minus margin

**Visual Hierarchy**:
```
[Header: "My Cart"]
  [Trash Icon] Clear

[Cart Items List]
  [Item 1 Card]
    [Image] | Title, Company    | -1 +1
           | ₹price | 2 × ₹price |
           | Remove
  
  [Item 2 Card]
    [Image] | Title, Company    | -1 +1
           | ₹price | 1 × ₹price |
           | Remove

[Bill Summary Card]
  Subtotal:    ₹500
  Tax (5%):    ₹25
  Total:       ₹525

[Checkout Section - Fixed at bottom]
  ₹525          [Proceed to Checkout →]
  2 items
```

**Constraints**:
- SafeAreaView wrapper
- FlatList for scrollable items
- Bill summary card as ListFooterComponent
- Fixed footer with checkout button
- Confirmation dialog for clear cart
- Item removal with immediate re-render

**Related Components**:
- CartItem component (per item)
- BillSummary component
- EmptyCart component
- QuantityControl component

---

### 10. Checkout Screen (`/checkout`)

**Purpose**: Collect billing information and create order with payment options

**Content Structure**:

**Header Section**:
- Title: "Billing Details"
- Subtitle: "Enter your details to complete the order"

**Order Summary Card** (Collapsible):
- Total items count
- Subtotal amount
- Tap to expand/show full breakdown

**Customer Information Form**:

**Name Field**:
- Label: "Full Name"
- Placeholder: "John Doe"
- Type: text
- Icon: user
- Validation: Required, min 3 characters

**Email Field**:
- Label: "Email Address"
- Placeholder: "john@example.com"
- Type: email
- Icon: envelope
- Validation: Required, valid email format

**Phone Field**:
- Label: "Phone Number"
- Placeholder: "+91 98765 43210"
- Type: phone
- Icon: phone
- Validation: Required, valid phone format

**Payment Section**:

**Total Bill Display** (Highlighted card):
- "Total Bill: ₹[amount]" (large, bold)
- Background: Light blue

**Payment Amount Input**:
- Label: "Pay Now (Optional)"
- Placeholder: "Enter amount to pay now"
- Type: number
- Keyboard: Decimal pad
- Validation: 0 to total amount
- Default: Full amount (if entered as full payment)

**Payment Breakdown Card** (shows only if paidAmount > 0):
- Total Bill: ₹[total]
- ✓ Paid Now: ₹[paidAmount] (green)
- ⚠ Remaining: ₹[remaining] (warning color)
- Visual progress bar showing paid vs remaining

**Order Placement Button**:
- Background: Primary blue
- Text: "Place Order" (white, bold)
- Full width
- Height: 56px
- Loading state: Spinner instead of text
- Disabled when form invalid

**Order Creation Flow**:
1. Validate all fields
2. Create order object with items and billing info
3. Save to Firebase
4. Show success
5. Navigate to order confirmation screen

**Error Handling**:
- Error card at top
- Red background, error icon
- Specific error message
- Auto-dismiss or manual close

**Discount Code Section** (Optional):
- Input field: "Enter promo code"
- Apply button
- Applied discount display

**Visual Hierarchy**:
```
[Header]
Billing Details
Enter your details...

[Order Summary Card]
Subtotal: ₹500
Tax: ₹25
Total: ₹525

[Form Fields]
[Full Name Input]
[Email Input]
[Phone Input]

[Total Bill Card - Highlighted]
Total Bill: ₹525

[Payment Amount Section]
Pay Now (Optional)
[Input: Enter amount...]

[Payment Breakdown - if amount entered]
Total Bill:    ₹525
✓ Paid Now:    ₹250
⚠ Remaining:   ₹275

[Place Order Button - Full Width]
```

**Constraints**:
- KeyboardAvoidingView for form
- All fields required for order
- Payment amount optional (can be 0)
- Form validation before submission
- Loading spinner during order creation
- Toast notifications for errors
- Navigation to order confirmation on success

**Related Components**:
- BillingForm component
- PaymentBreakdown component
- OrderSummary component
- FormInput component (custom text input)

---

### 11. Order Confirmation Screen (`/orderConfirmation`)

**Purpose**: Confirm successful order placement and display order details

**Content Structure**:

**Success Section** (Top):
- Large checkmark icon (green)
- Success message: "Order Placed Successfully!"
- Subtitle: "Your order has been confirmed"
- Order ID: "#[ORDER_ID]" (large, bold)

**Order Details Card**:
- Order date and time
- Total amount: "₹[amount]" (large, bold, primary blue)
- Number of items: "[count] items"
- Estimated delivery (if applicable)

**Billing Summary Card**:
- Customer name
- Email address
- Phone number
- Delivery address (if applicable)

**Order Items Section**:
- List of items in order
- Per item: Product name, quantity, price
- Item total: "[qty] × ₹[price]"

**Amount Breakdown Card**:
- Subtotal: ₹[amount]
- Tax/GST: ₹[amount]
- Delivery: ₹[amount]
- **Total: ₹[amount]** (bold, large)

**Payment Status Section**:
- Status label (Paid/Pending/Partial)
- Paid amount: ₹[amount] (green if paid)
- Remaining amount: ₹[amount] (if partial/pending)

**Action Buttons** (Bottom, full width):
- Primary: "Continue Shopping" button
  - Navigate to home screen
  - Clear cart on navigation
  
- Secondary: "View Order Details" button
  - Navigate to order detail screen
  - Pass order ID as param

**Visual Hierarchy**:
```
[Success Icon - Green]
✓ Order Placed Successfully!
Your order has been confirmed

[Order ID: #ORD-2025-11-12-001]

[Order Details Card]
Date: 19-Nov-2025, 2:30 PM
Items: 3 items
Total: ₹525

[Billing Summary Card]
Name: John Doe
Email: john@example.com
Phone: +91 98765 43210

[Order Items]
1. Product Name 1         Qty: 2    ₹250
2. Product Name 2         Qty: 1    ₹275

[Amount Breakdown]
Subtotal:    ₹500
Tax (5%):    ₹25
Total:       ₹525

[Payment Status]
Status: Paid ✓
Amount Paid: ₹525

[Action Buttons]
[Continue Shopping Button - Full Width]
[View Order Details Button - Full Width]
```

**Constraints**:
- ScrollView for long content
- SafeAreaView wrapper
- Auto-dismiss after timeout (optional)
- Share order button (optional)
- Print order button (optional)

**Related Components**:
- OrderSummary component
- BillingInfo component
- OrderItems component
- AmountBreakdown component

---

### 12. Orders List Screen (`/(tabs)/orders`)

**Purpose**: View user's order history with tracking and payment status

**Content Structure**:

**Header Section**:
- Title: "My Orders"
- Subtitle: "[count] orders" or "No orders yet"

**Filter Section** (Optional):
- Filter pills/buttons: "All", "Pending", "Paid", "Partial"
- Horizontal scrollable
- Selected filter highlighted in primary blue

**Search Section** (Optional):
- Search by order ID or date
- Search icon + text input

**Orders List**:

**Order Card** (per order):
- Order ID: "#[ORDER_ID]" (bold, 14px)
- Order date: "19-Nov-2025, 2:30 PM" (small, gray)
- Item count: "[count] items"
- Order status badge:
  - "Pending" (red background)
  - "Paid" (green background)
  - "Partial" (orange background)
- Total amount: "₹[amount]" (bold, primary blue, right-aligned)
- Payment status: "Paid ₹[amount] / Remaining ₹[amount]" (if partial)
- Tap → Navigate to order detail screen

**Empty State**:
- Large icon (shopping-bag)
- Message: "No orders yet"
- Suggestion: "Start shopping to place your first order"
- "Start Shopping" button (navigates to home)

**Pull-to-Refresh**:
- Refresh orders list
- Spinner during refresh

**Sorting** (Optional):
- Newest first (default)
- Oldest first
- Amount high to low
- Amount low to high

**Visual Hierarchy**:
```
[Header: "My Orders"]
"5 orders"

[Filter Pills - Horizontal]
All | Pending | Paid | Partial

[Orders List]
  [Order Card 1]
    #ORD-2025-11-12-001
    19-Nov-2025, 2:30 PM | 3 items | [Paid]
    ₹525

  [Order Card 2]
    #ORD-2025-11-11-005
    18-Nov-2025, 1:15 PM | 2 items | [Pending]
    ₹350
    Paid: ₹0 | Remaining: ₹350

  [Order Card 3]
    #ORD-2025-11-10-003
    17-Nov-2025, 3:45 PM | 1 item | [Partial]
    ₹200
    Paid: ₹100 | Remaining: ₹100
```

**Constraints**:
- FlatList with refresh control
- Pull-to-refresh enabled
- Real-time order status updates
- SafeAreaView wrapper
- Order cards tappable for detail view

**Related Components**:
- OrderCard component
- OrderStatus badge component
- FilterPill component

---

### 13. Order Detail Screen (`/orderDetail`)

**Purpose**: View comprehensive order information, tracking, and payment details

**Content Structure**:

**Navigation Header**:
- Title: "Order Details"
- Back button

**Order Header Section**:
- Order ID: "#[ORDER_ID]" (large, bold)
- Order status badge: Pending/Paid/Partial
- Order date: "19-Nov-2025, 2:30 PM"

**Order Timeline** (Optional):
- Step 1: Order Placed ✓ (with timestamp)
- Step 2: Processing → (in progress)
- Step 3: Shipped (pending)
- Step 4: Delivered (pending)

**Shipping Information Card** (if applicable):
- Tracking number
- Estimated delivery date
- Current location
- Delivery address
- Contact number for delivery

**Order Items Section**:
- Per item card:
  - Product image (left, 80x80px)
  - Product title and category
  - Quantity: "Qty: [count]"
  - Price per unit: "₹[price]"
  - Item total: "[qty] × ₹[price]"

**Bill Summary Card**:
- Subtotal: ₹[amount]
- Tax/GST: ₹[amount]
- Shipping: ₹[amount] (if applicable)
- **Total: ₹[amount]** (bold, large)

**Payment Details Card**:
- Payment status: Paid/Pending/Partial
- Paid amount: ₹[amount] (green if paid)
- Remaining amount: ₹[amount] (if not fully paid)
- Payment date: (if paid)
- Payment method: (if applicable)
- "Pay Remaining" button (if partial/pending)

**Customer Information Card**:
- Name, email, phone
- Billing address (if different from shipping)

**Action Buttons**:
- Secondary: "Download Invoice" (if paid)
- Secondary: "Share Order"
- Primary: "Pay Remaining" (if partial/pending)
  - Navigate to payment screen with pre-filled amount

**Visual Hierarchy**:
```
[Order Header]
#ORD-2025-11-12-001 [Paid]
19-Nov-2025, 2:30 PM

[Order Timeline]
✓ Order Placed (19-Nov, 2:30 PM)
→ Processing (in progress)
⏳ Shipped (pending)
⏳ Delivered (pending)

[Shipping Information]
Tracking: TRK-123456789
Est. Delivery: 25-Nov-2025
Current: In Transit
Address: 123, Main Street, Mumbai
Contact: +91 98765 43210

[Order Items]
1. Product 1      Qty: 2   ₹100/unit
   2 × ₹100 = ₹200

2. Product 2      Qty: 1   ₹325/unit
   1 × ₹325 = ₹325

[Bill Summary]
Subtotal:    ₹525
Tax (5%):    ₹26.25
Total:       ₹551.25

[Payment Details]
Status: Paid ✓
Amount Paid: ₹551.25
Date: 19-Nov-2025

[Customer Information]
Name: John Doe
Email: john@example.com
Phone: +91 98765 43210

[Action Buttons]
[Download Invoice] [Share Order] [Pay Remaining]
```

**Constraints**:
- ScrollView for long content
- SafeAreaView wrapper
- Payment status color-coded
- Timeline shows order progression
- Tappable items for detail (optional)

**Related Components**:
- OrderTimeline component
- ShippingInfo component
- OrderItems component
- BillingInfo component
- PaymentDetails component

---

### 14. Profile Screen (`/(tabs)/profile`)

**Purpose**: User profile management and account settings

**Content Structure**:

**Profile Header Section**:
- User avatar/initial circle (120x120px, primary blue)
- User name (large, bold, dark navy)
- User email (gray, medium)
- Phone number (gray, medium)

**Profile Menu Sections**:

**Account Section**:
- Edit Profile (→)
- Change Password (→)
- Saved Addresses (→)
- Payment Methods (→)

**Help & Support Section**:
- Help Center (→)
- Contact Us (→)
- FAQs (→)
- Report Issue (→)

**Settings Section**:
- Notifications (toggle)
- Language (current language, →)
- Theme (Light/Dark, toggle)
- Privacy Settings (→)

**About Section**:
- About Ramesh Aqua (→)
- Terms & Conditions (→)
- Privacy Policy (→)
- Version: v1.0.0

**Logout Section**:
- Logout button (red/warning color)
- Confirmation dialog: "Are you sure you want to logout?"

**Visual Hierarchy**:
```
[User Avatar - Circular]
[User Name - Large]
john@example.com
+91 98765 43210

[Account Section Header]
🔐 Account
Edit Profile               →
Change Password            →
Saved Addresses            →
Payment Methods            →

[Help & Support Header]
❓ Help & Support
Help Center                →
Contact Us                 →
FAQs                       →
Report Issue               →

[Settings Header]
⚙️ Settings
Notifications          [Toggle ON]
Language: English      →
Theme: Light           [Toggle]
Privacy Settings       →

[About Section Header]
ℹ️ About
About Ramesh Aqua      →
Terms & Conditions     →
Privacy Policy         →
Version v1.0.0

[Logout Button - Red/Warning]
```

**Constraints**:
- SafeAreaView wrapper
- ScrollView for long menu
- Menu items as TouchableOpacity
- Logout with confirmation dialog
- Toggle switches for binary settings
- Icons on left, labels in center, icons on right for navigation items

**Related Components**:
- MenuItem component
- ProfileHeader component
- ToggleSwitch component

---

### 15-18. Admin Screens (Admin Panel, Add Stock, Edit Product, Warehouse)

**Purpose**: Admin functions for inventory and order management

**Content Structure**:

#### Admin Panel (`/(tabs)/adminPanel`)

**Purpose**: Dashboard overview for admin operations

**Header Section**:
- Title: "Admin Panel"
- Date/time display

**Quick Stats Section** (4-column cards):
- Total Orders (count + trend)
- Pending Payments (count + trend)
- Total Revenue (amount + trend)
- Inventory Items (count + trend)

**Quick Actions Menu**:
- Add New Product (→ /addStock)
- View Orders (→ /(tabs)/orders)
- Manage Inventory (→ /(tabs)/warehouse)
- Edit Products (→ /editProduct)

**Recent Orders Section**:
- Last 5 orders with status
- Each card shows order ID, date, total, status
- Tap to view order detail

---

#### Add Stock (`/addStock`)

**Purpose**: Add new products to inventory

**Form Sections**:
- Product title (required)
- Company selection (dropdown)
- Category selection (dropdown)
- Description (multi-line text)
- Price (number input)
- Original price (number input)
- Stock quantity (number input)
- Image upload (camera/gallery)
- Submit button: "Add Product"

---

#### Edit Product (`/editProduct`)

**Purpose**: Modify existing product information

**Same as Add Stock but with pre-filled fields and update button**

---

#### Warehouse (`/(tabs)/warehouse`)

**Purpose**: Inventory management

**Features**:
- List all products
- Current stock count per product
- Low stock indicators
- Update stock quantity
- Delete products
- Search by product name

---

## Common Components & Patterns

### Floating View Cart Button (NEW - Improved)

**Purpose**: Provide persistent access to cart from browse screens

**Visual Design**:
- Position: Fixed at bottom of screen (outside ScrollView)
- Width: Full width minus 16px margins (left + right)
- Height: 52px
- Background: Primary Blue (#0080ff)
- Border radius: 12px
- Shadow: Elevation 10 (strong shadow)

**Content Layout**:
- Left section (flex 1):
  - White circular badge (32x32px) showing item count
  - Text "View Cart" (white, bold, 17px)
  - Gap: 12px between badge and text

- Right section (flex 1):
  - Total price: "₹[amount]" (white, bold, 16px)
  - Arrow icon (right, white, 16px)
  - Gap: 10px between price and arrow

**Behavior**:
- Visible when: `getTotalItems() > 0`
- Tap action: Navigate to `/(tabs)/cart`
- Active opacity: 0.9
- Z-index: 99 (always on top)

**Implementation**:
- Placed inside parent View with `position: 'relative'`
- Button has `position: 'absolute'`
- Bottom: 20px
- Left: 16px, Right: 16px

**Variants**:
- Visible on: Home, Categories, Products, Product Detail, Search screens
- Hidden on: Cart, Checkout, Orders, Profile screens

**Related Code**:
```jsx
{getTotalItems() > 0 && (
  <TouchableOpacity 
    style={styles.viewCartButton}
    onPress={() => router.push('/(tabs)/cart')}
    activeOpacity={0.9}
  >
    <View style={styles.cartButtonLeft}>
      <View style={styles.cartItemBadge}>
        <Text style={styles.cartItemBadgeText}>{getTotalItems()}</Text>
      </View>
      <Text style={styles.viewCartText}>View Cart</Text>
    </View>
    <View style={styles.cartButtonRight}>
      <Text style={styles.cartTotalText}>₹{getTotal().toFixed(2)}</Text>
      <FontAwesome5 name="arrow-right" size={16} color="white" />
    </View>
  </TouchableOpacity>
)}
```

---

### Input Fields (Reusable Pattern)

**Components**:
- Label (optional, above field)
- Input field (TextInput)
- Icon (left or right)
- Helper text (below field)
- Error message (below field, red)
- Validation feedback (real-time)

**Variations**:
- Text input (name, description)
- Email input (with @ validation)
- Phone input (with +91 prefix)
- Number input (price, quantity)
- Password input (with toggle visibility)
- Multi-line textarea

---

### Card Component (Reusable Pattern)

**Structure**:
- White background
- Border radius: 12-16px
- Padding: 16px
- Shadow: Light shadow (elevation: 2-3)
- Margin: Bottom 12px

**Content**:
- Header (title + optional action)
- Content (varies per card type)
- Footer (optional)

---

### Button Styles (Reusable Pattern)

**Primary Button**:
- Background: Primary Blue (#0080ff)
- Text: White, bold
- Padding: 14px vertical, 16px horizontal
- Border radius: 8-12px
- Width: Full or fixed

**Secondary Button**:
- Background: Transparent or light gray
- Text: Primary Blue or gray
- Border: 1px primary blue border
- Padding: 12px vertical, 16px horizontal
- Border radius: 8px

**Danger Button**:
- Background: Error Red (#dc2625)
- Text: White, bold
- Padding: 12px vertical, 16px horizontal
- Border radius: 8px

**Disabled State**:
- Opacity: 0.5
- Not tappable

---

### Loading States (Reusable Pattern)

**Skeleton Loaders**:
- Gray placeholder (animate shimmer effect)
- Match actual content height
- Use for: Cards, lists, images, text

**Spinner**:
- Centered spinner (ActivityIndicator)
- Primary blue color
- With optional loading text below

---

### Toast Notifications (Reusable Pattern)

**Success Toast**:
- Green icon (checkmark)
- White background
- "Action completed successfully"
- Auto-dismiss: 3 seconds

**Error Toast**:
- Red icon (X or error)
- White background
- Error message
- Auto-dismiss: 4 seconds

**Info Toast**:
- Blue icon (info)
- White background
- Information message
- Auto-dismiss: 3 seconds

**Warning Toast**:
- Orange icon (warning)
- White background
- Warning message
- Auto-dismiss: 4 seconds

---

## User Flows

### User Journey 1: First-Time Purchase

```
1. App Launch (index.jsx)
   ↓ (Not authenticated)
2. Login Screen (/auth)
   - Enter email & password
   - OR click "Sign Up" → Signup screen
   ↓ (After successful login)
3. Home Screen (/(tabs)/home)
   - See greeting with user name
   - Browse companies
   ↓ (Tap company)
4. Categories Screen (/categories)
   - See categories for selected company
   - View floating cart button (will be empty)
   ↓ (Tap category)
5. Products Screen (/products)
   - See products in category
   - Add products to cart (cart button becomes visible)
   ↓ (Tap product)
6. Product Detail (/productDetail)
   - View full product info
   - Add to cart or view related products
   ↓ (Tap "View Cart" button or cart tab)
7. Cart Screen (/(tabs)/cart)
   - Review items and bill
   ↓ (Tap "Proceed to Checkout")
8. Checkout Screen (/checkout)
   - Enter billing info
   - Choose payment amount
   ↓ (Tap "Place Order")
9. Order Confirmation (/orderConfirmation)
   - See success message and order details
   ↓ (Tap "Continue Shopping" or cart icon)
10. Back to Home or Cart
```

### User Journey 2: Search and Purchase

```
1. Home Screen (/(tabs)/home)
   ↓ (Tap search tab)
2. Search Screen (/(tabs)/search)
   - Type product name/category
   - See results in grid
   ↓ (Tap product)
3. Product Detail (/productDetail)
   - View full details
   - Add to cart
   ↓ (Tap "View Cart")
4. Cart Screen (/(tabs)/cart)
   - Review and modify
   ↓ (Tap "Proceed to Checkout")
5. Checkout Screen → Order Confirmation
```

### User Journey 3: Track Orders

```
1. Home Screen (/(tabs)/home)
   ↓ (Tap orders tab)
2. Orders List (/(tabs)/orders)
   - See all past orders
   ↓ (Tap order)
3. Order Detail (/orderDetail)
   - See tracking, status, items
   - Can pay remaining amount if needed
```

---

## Consistency Guidelines

### Visual Consistency

1. **Color Usage**:
   - Primary action buttons: Always Primary Blue (#0080ff)
   - Warnings/errors: Always Error Red (#dc2625)
   - Success confirmations: Always Success Green (#059669)
   - Headers: Always Dark Navy (#002147)
   - Backgrounds: Always Light Gray (#f5f5f5)

2. **Typography**:
   - Headers: Always 24px, bold (700), Dark Navy
   - Section titles: Always 18px, bold (700), Dark Navy
   - Card titles: Always 15-16px, bold (600) or semi-bold, Dark Navy
   - Body text: Always 14-15px, regular, gray
   - Always maintain proper line heights (1.2-1.5)

3. **Spacing**:
   - Consistency in padding: 16px inside cards
   - Consistency in margins: 8-12px between elements
   - Consistent gap values in flexbox layouts

4. **Shadow & Elevation**:
   - Cards: Consistent shadow (elevation 2-3)
   - Floating elements: Consistent shadow (elevation 8-10)
   - No shadow variance between similar elements

### Interaction Consistency

1. **Button Behavior**:
   - All buttons should show active opacity (0.8-0.9)
   - All buttons should have loading state (spinner)
   - All buttons should have disabled state (opacity 0.5)
   - All buttons should show touch feedback

2. **List Items**:
   - All list items should be tappable
   - All list items should show chevron or arrow on right
   - All list items should have consistent height/padding
   - Swipe-to-delete pattern consistent across all lists

3. **Forms**:
   - All forms should validate in real-time
   - All error messages should appear below field
   - All required fields should have asterisk (*)
   - All forms should show loading spinner on submit

### Navigation Consistency

1. **Headers**:
   - All top-level screens should show custom gradient header or standard header
   - Back button always positioned on top-left
   - Title always centered or left-aligned consistently
   - No header flashing between screens

2. **Tab Navigation**:
   - 5 fixed tabs at bottom
   - Tab labels: Home, Search, Cart, Orders, Profile
   - Active tab highlighted in Primary Blue
   - Icons above labels

3. **Navigation Params**:
   - Always pass required data as route params
   - Use route names consistently
   - Always handle missing params gracefully

### Error & Loading Consistency

1. **Loading States**:
   - Always show spinner for network requests
   - Always show skeleton for list/grid items
   - Always disable user interaction during loading
   - Loading text: "Loading..." or "Please wait..."

2. **Error States**:
   - Error message in alert card or toast
   - Error icon (X or error symbol)
   - Retry button always available
   - Consistent error message formatting

3. **Empty States**:
   - Large icon (relevant to content)
   - Descriptive message
   - "Start [action]" or "Go Back" button
   - Consistent empty state design

### Accessibility

1. **Contrast Ratios**:
   - Text on background: Minimum 4.5:1 contrast
   - Icons on background: Minimum 3:1 contrast

2. **Touch Targets**:
   - Minimum 44x44 pt for all touchable elements
   - Sufficient padding around interactive elements

3. **Text Scaling**:
   - Support system font size scaling
   - Maximum zoom to 200% without loss of function

4. **Keyboard Navigation**:
   - Tab through form fields in logical order
   - Keyboard avoidance for input fields

---

## Implementation Priorities

### Phase 1 (Core Shopping Flow)
✅ Splash/Loading  
✅ Login/Signup  
✅ Home  
✅ Categories  
✅ Products  
✅ Product Detail  
✅ Cart  
✅ Checkout  
✅ Order Confirmation  

### Phase 2 (Account & Orders)
⏳ Orders List  
⏳ Order Detail  
⏳ Profile  

### Phase 3 (Discovery)
⏳ Search  
⏳ Wishlist (future)  

### Phase 4 (Admin)
⏳ Admin Panel  
⏳ Add Stock  
⏳ Edit Product  
⏳ Warehouse  

---

## Design System Components Checklist

**Required Components**:
- [ ] Floating View Cart Button (NEW)
- [ ] Text Input Field
- [ ] Card Container
- [ ] Primary Button
- [ ] Secondary Button
- [ ] Loading Spinner
- [ ] Skeleton Loader
- [ ] Empty State
- [ ] Error Alert
- [ ] Toast Notification
- [ ] Modal Dialog
- [ ] Tab Navigation
- [ ] Product Card
- [ ] Order Card
- [ ] Cart Item Card
- [ ] Quantity Control
- [ ] Stock Badge
- [ ] Payment Breakdown

---

## Future Enhancements

1. **Dark Mode Support**: All screens support dark theme
2. **Animations**: Smooth transitions between screens
3. **Real-time Updates**: WebSocket for order tracking
4. **Push Notifications**: Order status updates
5. **Wishlist Feature**: Save favorite products
6. **Ratings & Reviews**: User feedback system
7. **Share Orders**: Social sharing functionality
8. **Multiple Payment Options**: Credit card, UPI, etc.
9. **Coupon/Promo Codes**: Discount system
10. **Order History Export**: Download invoice as PDF

---

## Support & Questions

For questions or clarifications about this UI/UX specification, please refer to the screen specifications above or contact the design team.

**Document Created**: November 19, 2025  
**Last Reviewed**: November 19, 2025  
**Next Review**: December 2025
