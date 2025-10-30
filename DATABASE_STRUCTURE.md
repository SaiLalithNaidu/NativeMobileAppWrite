# Database Structure & Navigation Flow

## Hierarchical Database Structure

Your app uses a **3-level hierarchical structure**:

```
Companies
  └── Categories (linked by companyId)
       └── Products (linked by categoryId and companyId)
```

### Firebase Collections

#### 1. **companies** Collection
```javascript
{
  id: "auto-generated-by-firebase",
  name: "Company Name",
  description: "Company description",
  logoUrl: "https://...",
  websiteUrl: "https://...",
  companyId: "optional-custom-identifier" // If you want a custom ID
}
```

#### 2. **categories** Collection
```javascript
{
  id: "auto-generated-by-firebase",
  title: "Category Title",
  companyId: "company-id-or-custom-identifier", // MUST match company's id or companyId
  description: "Category description",
  imageUrl: "https://...",
  url: "https://..."
}
```

#### 3. **products** Collection
```javascript
{
  id: "auto-generated-by-firebase",
  title: "Product Title",
  companyId: "company-identifier", // Links to company
  categoryId: "category-document-id", // Links to category
  description: "Product description",
  imageUrl: "https://...",
  price: 1500,
  originalPrice: 2000,
  url: "https://..."
}
```

---

## User Navigation Flow

### 1. **Company Selection (Home Screen)**
- **View:** Shows all companies with their stats
- **Display:**
  - Company logo
  - Company name
  - Number of categories
  - Number of products
- **Action:** Tap "View Details" → Navigate to Categories

### 2. **Category Selection**
- **View:** Shows categories for the selected company
- **Display:**
  - Category image
  - Category title
  - Category description
  - Back button to companies
- **Action:** Tap "View Products" → Navigate to Products

### 3. **Product Listing**
- **View:** Shows products for the selected category (or all products if no category selected)
- **Display:**
  - Product image
  - Product title
  - Product description
  - Price (with original price if on sale)
  - Back button to categories
- **Action:** Can view product details

### 4. **Search Functionality**
- **Feature:** Search bar at the top
- **Behavior:**
  - Search across all products by name/description
  - Displays matched products with their company and category context
  - Clear search → Returns to company view

---

## How Data Linking Works

### Company → Categories
When a user selects a company:
```javascript
// Get company identifier
const companyIdentifier = company.companyId || company.id;

// Filter categories
const companyCategories = allCategories.filter(
  cat => cat.companyId === companyIdentifier
);
```

### Category → Products
When a user selects a category:
```javascript
// Filter products by both category and company
const categoryProducts = allProducts.filter(
  prod => prod.categoryId === category.id && 
          prod.companyId === companyIdentifier
);
```

### Search → Products
When searching:
```javascript
// Search in product title and description
const matchedProducts = allProducts.filter(prod =>
  prod.title?.toLowerCase().includes(searchQuery) ||
  prod.description?.toLowerCase().includes(searchQuery)
);
```

---

## Admin Panel Flow

### Adding a Company
1. Fill company details (name, description, logo, website)
2. Submit → Creates document in `companies` collection
3. Document gets auto-generated `id` from Firebase

### Adding a Category
1. **Select a company first** (required)
2. Fill category details (title, description, image, url)
3. Submit → Creates document in `categories` collection with `companyId` field

### Adding a Product
1. **Select a company** (required)
2. **Select a category** within that company (required)
3. Fill product details (title, description, image, price, etc.)
4. Submit → Creates document in `products` collection with both `companyId` and `categoryId`

---

## Important Notes

### 1. **CompanyId Field**
The `companyId` field in categories and products can be:
- The Firebase auto-generated document `id` of the company
- A custom identifier stored in the company's `companyId` field
- The code checks both: `company.companyId || company.id`

### 2. **Data Consistency**
Always ensure:
- Categories have valid `companyId` pointing to existing companies
- Products have valid `categoryId` and `companyId`
- All IDs match correctly for proper filtering

### 3. **Performance**
- All data is fetched once on app load
- Filtering happens client-side for fast navigation
- For large datasets, consider using Firebase queries with `.where()` instead

### 4. **Error Handling**
- Shows "No companies found" if database is empty
- Shows "No categories" if company has no categories
- Shows "No products" if category has no products
- Search shows "No products found" if no matches

---

## State Management

The home screen maintains these states:

```javascript
- companies: [] // All companies
- allCategories: [] // All categories (unfiltered)
- allProducts: [] // All products (unfiltered)
- filteredCategories: [] // Categories for selected company
- filteredProducts: [] // Products for selected category
- selectedCompany: null // Currently selected company
- selectedCategory: null // Currently selected category
- searchQuery: "" // Current search text
- view: 'companies' // Current view: 'companies', 'categories', or 'products'
```

---

## Testing Your Structure

### 1. Test Company Flow
```
1. Create a company "ABC Corp"
2. View home screen → Should show "ABC Corp" with 0 categories, 0 products
```

### 2. Test Category Flow
```
1. Select "ABC Corp"
2. Add category "Electronics" with companyId = ABC Corp's ID
3. Go back to home, select "ABC Corp"
4. Should show "Electronics" category
```

### 3. Test Product Flow
```
1. Select "ABC Corp" → Select "Electronics"
2. Add product "Laptop" with categoryId = Electronics ID, companyId = ABC Corp ID
3. Navigate: Home → ABC Corp → Electronics
4. Should show "Laptop" product
```

### 4. Test Search
```
1. Type "Laptop" in search bar
2. Should show matching products
3. Clear search → Returns to companies view
```

---

## Database Structure Example

```
companies/
  ├── doc1: { id: "doc1", name: "Leo Aqua", companyId: "company_leo_aqua" }
  └── doc2: { id: "doc2", name: "ABC Corp" }

categories/
  ├── cat1: { id: "cat1", title: "Fish Feed", companyId: "company_leo_aqua" }
  ├── cat2: { id: "cat2", title: "Equipment", companyId: "company_leo_aqua" }
  └── cat3: { id: "cat3", title: "Electronics", companyId: "doc2" }

products/
  ├── prod1: { id: "prod1", title: "Premium Feed", categoryId: "cat1", companyId: "company_leo_aqua", price: 500 }
  ├── prod2: { id: "prod2", title: "Oxygen Pump", categoryId: "cat2", companyId: "company_leo_aqua", price: 1500 }
  └── prod3: { id: "prod3", title: "Laptop", categoryId: "cat3", companyId: "doc2", price: 50000 }
```

---

**Navigation implemented successfully! Users can now browse through companies → categories → products with proper data filtering and search functionality.** 🎉
