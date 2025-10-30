# Project Architecture Documentation

## 📂 Project Structure

```
NativeMobileAppWrite/
├── src/
│   ├── api/                      # All network/database logic
│   │   ├── firebase/             # Firebase-specific logic
│   │   │   └── config.js         # Firebase initialization & config
│   │   ├── services/             # API service functions
│   │   │   ├── companiesService.js
│   │   │   ├── categoriesService.js
│   │   │   ├── productsService.js
│   │   │   └── index.js          # Centralized exports
│   │   └── queries/              # Complex queries (future use)
│   │
│   ├── components/               # Reusable UI components
│   │   ├── buttons/
│   │   │   └── index.js          # PrimaryButton, SecondaryButton, IconButton, TextButton
│   │   ├── inputs/
│   │   │   └── index.js          # Input, SearchInput
│   │   └── cards/
│   │       └── index.js          # CompanyCard, CategoryCard, ProductCard, ListItemCard
│   │
│   ├── screens/                  # Application screens
│   │   ├── Auth/                 # Authentication screens
│   │   │   ├── LoginScreen.js    # (To be migrated)
│   │   │   ├── SignupScreen.js   # (To be migrated)
│   │   │   └── AuthScreen.js     # (To be migrated)
│   │   ├── Home/                 # Home feature screens
│   │   │   ├── HomeScreen.js     # (To be migrated)
│   │   │   ├── CompaniesScreen.js
│   │   │   ├── CategoriesScreen.js
│   │   │   └── ProductsScreen.js
│   │   └── Admin/                # Admin panel screens
│   │       └── AdminPanelScreen.js # (To be migrated)
│   │
│   ├── navigation/               # Navigation configuration
│   │   ├── TabNavigator.js       # Bottom tab navigation
│   │   ├── StackNavigator.js     # Stack navigation
│   │   └── index.js              # Main navigation entry
│   │
│   ├── context/                  # Global context providers
│   │   ├── AuthContext.js        # ✅ Authentication context
│   │   └── AppProvider.js        # (Future: Combined providers)
│   │
│   ├── utils/                    # Helper functions & constants
│   │   ├── constants.js          # ✅ App-wide constants
│   │   ├── helpers.js            # ✅ Utility functions
│   │   └── validation.js         # ✅ Form validation functions
│   │
│   └── assets/                   # Static assets
│       └── images/               # Image files
│
├── app/                          # Current Expo Router structure (to be migrated)
├── .env                          # Environment variables
├── package.json
└── README.md
```

---

## ✅ Completed Components

### 1. API Layer (`src/api/`)

#### Firebase Config (`src/api/firebase/config.js`)
- ✅ Centralized Firebase initialization
- ✅ Environment variable support
- ✅ Exports: `auth`, `db`, `app`

#### Services (`src/api/services/`)
- ✅ **companiesService**: CRUD operations for companies
  - `getAll()` - Fetch all companies
  - `create(data)` - Create new company
  - `delete(id)` - Delete company (cascade)
  
- ✅ **categoriesService**: CRUD operations for categories
  - `getAll()` - Fetch all categories
  - `getByCompany(id)` - Filter by company
  - `create(data)` - Create new category
  - `delete(id)` - Delete category (cascade)
  
- ✅ **productsService**: CRUD operations for products
  - `getAll()` - Fetch all products
  - `getByCategory(categoryId, companyId)` - Filter by category
  - `getByCompany(companyId)` - Filter by company
  - `search(term, products)` - Search products
  - `create(data)` - Create new product
  - `delete(id)` - Delete product

### 2. Context Layer (`src/context/`)

#### AuthContext (`src/context/AuthContext.js`)
- ✅ Authentication state management
- ✅ Functions: `signup()`, `login()`, `logout()`
- ✅ Auto-state monitoring with `onAuthStateChanged`
- ✅ Hook: `useAuth()`

### 3. Utils Layer (`src/utils/`)

#### Constants (`src/utils/constants.js`)
- ✅ Collection names
- ✅ View states
- ✅ Screen names
- ✅ Color palette
- ✅ Typography scales
- ✅ Spacing system
- ✅ Border radius values
- ✅ Error & success messages

#### Helpers (`src/utils/helpers.js`)
- ✅ `getCompanyIdentifier()` - Get company ID
- ✅ `formatPrice()` - Format currency
- ✅ `truncateText()` - Truncate long text
- ✅ `calculateDiscount()` - Calculate discount %
- ✅ `isValidEmail()` - Email validation
- ✅ `validatePassword()` - Password validation
- ✅ `formatDate()` - Date formatting
- ✅ `debounce()` - Debounce function
- ✅ `filterBySearch()` - Search filter
- ✅ `groupBy()` - Group array by key
- ✅ `sortBy()` - Sort array
- ✅ `isEmpty()` - Check empty object
- ✅ `sleep()` - Async delay

#### Validation (`src/utils/validation.js`)
- ✅ `validateEmail()` - Email validation with errors
- ✅ `validatePassword()` - Password validation with errors
- ✅ `validateRequired()` - Required field validation
- ✅ `validateNumber()` - Number validation with min/max
- ✅ `validateURL()` - URL format validation
- ✅ `validateLoginForm()` - Complete login form validation
- ✅ `validateSignupForm()` - Complete signup form validation
- ✅ `validateCompanyForm()` - Company form validation
- ✅ `validateCategoryForm()` - Category form validation
- ✅ `validateProductForm()` - Product form validation

### 4. Components Layer (`src/components/`)

#### Buttons (`src/components/buttons/index.js`)
- ✅ **PrimaryButton** - Filled button with loading state
- ✅ **SecondaryButton** - Outlined button
- ✅ **IconButton** - Icon-only button
- ✅ **TextButton** - Text-only button

#### Inputs (`src/components/inputs/index.js`)
- ✅ **Input** - Text input with label & error
- ✅ **SearchInput** - Search bar with icon

#### Cards (`src/components/cards/index.js`)
- ✅ **CompanyCard** - Display company with stats
- ✅ **CategoryCard** - Display category info
- ✅ **ProductCard** - Display product with price & discount
- ✅ **ListItemCard** - List item for admin panel with delete

---

## 🚧 Pending Migration

### Screens (To be moved to `src/screens/`)
- [ ] `app/index.jsx` → `src/screens/Home/HomeScreen.js`
- [ ] `app/auth.jsx` → `src/screens/Auth/LoginScreen.js`
- [ ] `app/signup.jsx` → `src/screens/Auth/SignupScreen.js`
- [ ] `app/(tabs)/home.jsx` → `src/screens/Home/HomeScreen.js`
- [ ] `app/(tabs)/adminPanel.jsx` → `src/screens/Admin/AdminPanelScreen.js`
- [ ] `app/(tabs)/cart.jsx` → `src/screens/Cart/CartScreen.js`
- [ ] `app/(tabs)/profile.jsx` → `src/screens/Profile/ProfileScreen.js`

### Navigation (To be created in `src/navigation/`)
- [ ] Create `TabNavigator.js` for bottom tabs
- [ ] Create `StackNavigator.js` for screen stacks
- [ ] Create main navigation entry point

### Components (To be moved)
- [ ] `app/components/imageCarousel.jsx` → `src/components/carousel/ImageCarousel.js`

---

## 📖 Usage Examples

### Using API Services

```javascript
// Import service
import { companiesService } from '../api/services';

// Fetch all companies
const companies = await companiesService.getAll();

// Create company
const newCompany = await companiesService.create({
  name: 'Aqua Solutions',
  description: 'Marine products',
  logoUrl: 'https://example.com/logo.png'
});

// Delete company (cascade delete)
await companiesService.delete('company-id');
```

### Using AuthContext

```javascript
// Import hook
import { useAuth } from '../context/AuthContext';

function LoginScreen() {
  const { login, user, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      console.log('Logged in:', result.user);
    }
  };
}
```

### Using Validation

```javascript
// Import validators
import { validateLoginForm } from '../utils/validation';

const formData = { email: 'test@example.com', password: '123456' };
const validation = validateLoginForm(formData);

if (validation.isValid) {
  // Proceed with login
} else {
  // Show errors
  console.log(validation.errors.email);
  console.log(validation.errors.password);
}
```

### Using Components

```javascript
// Import components
import { PrimaryButton } from '../components/buttons';
import { Input } from '../components/inputs';
import { CompanyCard } from '../components/cards';

function MyScreen() {
  return (
    <View>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      
      <PrimaryButton
        title="Submit"
        onPress={handleSubmit}
        loading={loading}
      />
      
      <CompanyCard
        company={company}
        onPress={handleCompanyPress}
        categoriesCount={5}
        productsCount={20}
      />
    </View>
  );
}
```

### Using Constants

```javascript
// Import constants
import { COLORS, SCREENS, ERROR_MESSAGES } from '../utils/constants';

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.PRIMARY, // 'coral'
  },
  text: {
    color: COLORS.SECONDARY, // '#333'
  }
});

// Navigate to screen
navigation.navigate(SCREENS.HOME);

// Show error
Toast.show({ text: ERROR_MESSAGES.FETCH_FAILED });
```

### Using Helpers

```javascript
// Import helpers
import { formatPrice, calculateDiscount, filterBySearch } from '../utils/helpers';

// Format price
const priceText = formatPrice(999); // '₹999'

// Calculate discount
const discount = calculateDiscount(1299, 999); // 23%

// Filter products
const results = filterBySearch(products, 'probiotic', ['title', 'description']);
```

---

## 🎯 Benefits of This Architecture

### 1. **Separation of Concerns**
- API logic separate from UI
- Business logic separate from presentation
- Reusable components

### 2. **Maintainability**
- Easy to find and update specific functionality
- Clear file organization
- Self-documenting structure

### 3. **Scalability**
- Easy to add new features
- Components can be reused across screens
- Services can be extended

### 4. **Testability**
- Services can be tested independently
- Components can be tested in isolation
- Validation logic is pure functions

### 5. **Code Reusability**
- Shared components across screens
- Common utilities and helpers
- Centralized constants

### 6. **Team Collaboration**
- Clear boundaries between features
- Easy to work on different parts simultaneously
- Consistent patterns throughout

---

## 🔄 Migration Strategy

### Phase 1: ✅ COMPLETED
1. ✅ Create directory structure
2. ✅ Move Firebase config
3. ✅ Create API services
4. ✅ Move AuthContext
5. ✅ Create utilities (constants, helpers, validation)
6. ✅ Create reusable components (buttons, inputs, cards)

### Phase 2: PENDING
1. Extract screen components from current `app/` structure
2. Refactor screens to use new components & services
3. Create navigation structure
4. Update all imports
5. Test thoroughly

### Phase 3: FUTURE
1. Add more reusable components
2. Implement state management (Redux/Zustand) if needed
3. Add animations
4. Add offline support
5. Add testing suite

---

## 📝 Notes

- All services use console.log with prefixes like `[Companies Service]` for easy debugging
- Error handling is built into all service functions
- Validation functions return structured error objects
- Components use constants for consistent styling
- All async functions are properly error-handled

---

**Architecture Status: Phase 1 Complete ✅**

Next Step: Migrate existing screens to use this new structure!
