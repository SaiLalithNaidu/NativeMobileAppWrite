# Migration Guide: From Current to New Architecture

## 🎯 Overview

This guide shows how to migrate your existing code to use the new architecture with all the benefits of separation of concerns, reusability, and maintainability.

---

## 📊 Current vs New Structure

### Before (Current)
```
app/
├── _layout.jsx
├── index.jsx                    # Home landing
├── auth.jsx                     # Login
├── signup.jsx                   # Signup
├── (tabs)/
│   ├── home.jsx                 # Main home with companies/categories/products
│   ├── adminPanel.jsx           # Admin panel
│   ├── cart.jsx
│   └── profile.jsx
├── components/
│   └── imageCarousel.jsx
contexts/
└── AuthContext.jsx
lib/
└── firebase.js
```

### After (New Architecture)
```
src/
├── api/                         # ✅ Backend logic
│   ├── firebase/config.js       # ✅ Firebase setup
│   └── services/                # ✅ CRUD operations
├── components/                  # ✅ Reusable UI
│   ├── buttons/
│   ├── inputs/
│   └── cards/
├── context/                     # ✅ State management
│   └── AuthContext.js
├── utils/                       # ✅ Helpers & constants
│   ├── constants.js
│   ├── helpers.js
│   └── validation.js
├── screens/                     # 🚧 To be migrated
└── navigation/                  # 🚧 To be created
```

---

## 🔄 Step-by-Step Migration

### Step 1: Update Firebase Imports

#### Before:
```javascript
// In any file
import { auth, db } from '../../lib/firebase';
```

#### After:
```javascript
// In any file
import { auth, db } from '../../src/api/firebase/config';
```

---

### Step 2: Replace Direct Firestore Calls with Services

#### Before (in home.jsx):
```javascript
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const FetchCompanies = async () => {
  const companiesRef = collection(db, 'companies');
  const snapshot = await getDocs(companiesRef);
  const companiesData = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return companiesData;
};
```

#### After:
```javascript
import { companiesService } from '../../src/api/services';

const fetchCompanies = async () => {
  const companies = await companiesService.getAll();
  return companies;
};
```

**Benefits:**
- ✅ No need to import Firestore methods
- ✅ Consistent error handling
- ✅ Console logging built-in
- ✅ Reusable across screens

---

### Step 3: Replace AuthContext Import

#### Before:
```javascript
import { useAuth } from '../contexts/AuthContext';
```

#### After:
```javascript
import { useAuth } from '../src/context/AuthContext';
```

---

### Step 4: Replace Custom Components with Reusable Ones

#### Before (in adminPanel.jsx):
```jsx
<Button 
  title="Add Company" 
  onPress={handleAddCompany} 
  color="coral" 
/>

<TextInput
  placeholder="Company Name *"
  value={company.name}
  onChangeText={(t) => setCompany({ ...company, name: t })}
  style={styles.input}
/>
```

#### After:
```jsx
import { PrimaryButton } from '../src/components/buttons';
import { Input } from '../src/components/inputs';

<Input
  label="Company Name"
  placeholder="Enter company name"
  value={company.name}
  onChangeText={(t) => setCompany({ ...company, name: t })}
  error={errors.name}
/>

<PrimaryButton
  title="Add Company"
  onPress={handleAddCompany}
  loading={loading}
/>
```

**Benefits:**
- ✅ Consistent styling
- ✅ Built-in error display
- ✅ Loading states
- ✅ No need for custom styles

---

### Step 5: Use Cards Instead of Manual Layouts

#### Before (in home.jsx):
```jsx
<TouchableOpacity 
  style={styles.categoryItem}
  onPress={() => handleCompanySelect(item)}
>
  {item.logoUrl && (
    <Image 
      source={{ uri: item.logoUrl }}
      style={styles.companyLogo}
      resizeMode="contain"
    />
  )}
  <View style={styles.categoryInfo}>
    <Text style={styles.categoryName}>{item.name}</Text>
    <View style={styles.categoryDescription}>
      <Text style={styles.statsText}>
        📂 {getCategoryCount(item)} Categories
      </Text>
      <Text style={styles.statsText}>
        📦 {getProductCount(item)} Products
      </Text>
    </View>
    <View style={styles.viewDetailsBtn}>
      <Text style={styles.viewDetailsBtnText}>View Categories →</Text>
    </View>
  </View>
</TouchableOpacity>
```

#### After:
```jsx
import { CompanyCard } from '../src/components/cards';

<CompanyCard
  company={item}
  onPress={() => handleCompanySelect(item)}
  categoriesCount={getCategoryCount(item)}
  productsCount={getProductCount(item)}
/>
```

**Benefits:**
- ✅ Much cleaner code
- ✅ Consistent design
- ✅ Reusable across screens
- ✅ Built-in responsiveness

---

### Step 6: Use Constants Instead of Hardcoded Values

#### Before:
```javascript
const styles = StyleSheet.create({
  button: {
    backgroundColor: 'coral',
    borderRadius: 8,
    padding: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
  }
});

Toast.show({
  type: 'error',
  text1: 'Error',
  text2: 'Failed to load data',
});
```

#### After:
```javascript
import { COLORS, SPACING, RADIUS, FONTS, ERROR_MESSAGES } from '../src/utils/constants';

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.REGULAR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZE.REGULAR,
  }
});

Toast.show({
  type: 'error',
  text1: 'Error',
  text2: ERROR_MESSAGES.FETCH_FAILED,
});
```

**Benefits:**
- ✅ Consistent values app-wide
- ✅ Easy to update globally
- ✅ Self-documenting code
- ✅ Theme support ready

---

### Step 7: Use Validation Functions

#### Before (in auth.jsx):
```javascript
const handleLogin = async () => {
  if (!email || !email.includes('@')) {
    Alert.alert('Error', 'Invalid email');
    return;
  }
  if (!password || password.length < 6) {
    Alert.alert('Error', 'Password too short');
    return;
  }
  // Login logic...
};
```

#### After:
```javascript
import { validateLoginForm } from '../src/utils/validation';

const handleLogin = async () => {
  const validation = validateLoginForm({ email, password });
  
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }
  
  // Login logic...
};
```

**Benefits:**
- ✅ Reusable validation
- ✅ Structured error messages
- ✅ Consistent validation rules
- ✅ Easy to test

---

### Step 8: Use Helper Functions

#### Before:
```javascript
const formatPrice = (price) => {
  return `₹${price}`;
};

const getCompanyId = (company) => {
  return company.companyId || company.id;
};
```

#### After:
```javascript
import { formatPrice, getCompanyIdentifier } from '../src/utils/helpers';

// Use directly
const priceText = formatPrice(999); // '₹999'
const companyId = getCompanyIdentifier(company);
```

---

## 📋 Complete Migration Example

### Before: adminPanel.jsx (Old)
```jsx
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminPanel() {
  const [company, setCompany] = useState({ name: '', description: '' });
  
  const handleAddCompany = async () => {
    if (!company.name.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Name required' });
      return;
    }
    
    try {
      const companiesRef = collection(db, 'companies');
      await addDoc(companiesRef, company);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Added!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    }
  };
  
  return (
    <View>
      <TextInput
        placeholder="Company Name"
        value={company.name}
        onChangeText={(t) => setCompany({ ...company, name: t })}
        style={styles.input}
      />
      <Button title="Add Company" onPress={handleAddCompany} color="coral" />
    </View>
  );
}
```

### After: AdminPanel.jsx (New)
```jsx
import { companiesService } from '../src/api/services';
import { PrimaryButton } from '../src/components/buttons';
import { Input } from '../src/components/inputs';
import { validateCompanyForm } from '../src/utils/validation';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../src/utils/constants';

export default function AdminPanel() {
  const [company, setCompany] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const handleAddCompany = async () => {
    // Validate
    const validation = validateCompanyForm(company);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    try {
      setLoading(true);
      await companiesService.create(company);
      Toast.show({ type: 'success', text1: 'Success', text2: SUCCESS_MESSAGES.ITEM_ADDED });
      setCompany({ name: '', description: '' });
      setErrors({});
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: ERROR_MESSAGES.FETCH_FAILED });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View>
      <Input
        label="Company Name"
        placeholder="Enter company name"
        value={company.name}
        onChangeText={(t) => setCompany({ ...company, name: t })}
        error={errors.name}
      />
      <PrimaryButton
        title="Add Company"
        onPress={handleAddCompany}
        loading={loading}
      />
    </View>
  );
}
```

**What Changed:**
- ✅ Using `companiesService` instead of direct Firestore
- ✅ Using `Input` and `PrimaryButton` components
- ✅ Using `validateCompanyForm` for validation
- ✅ Using constants for messages
- ✅ Proper loading states
- ✅ Structured error handling

---

## 🔄 Import Path Quick Reference

### Old → New

| Old Path | New Path |
|----------|----------|
| `../../lib/firebase` | `../../src/api/firebase/config` |
| `../contexts/AuthContext` | `../src/context/AuthContext` |
| Direct Firestore calls | `../src/api/services` |
| Custom styles | `../src/utils/constants` |
| Manual validation | `../src/utils/validation` |
| Custom helpers | `../src/utils/helpers` |
| Custom buttons | `../src/components/buttons` |
| Custom inputs | `../src/components/inputs` |
| Custom cards | `../src/components/cards` |

---

## ✅ Migration Checklist

For each screen file:

- [ ] Update Firebase imports to use `src/api/firebase/config`
- [ ] Replace Firestore calls with service functions
- [ ] Update AuthContext import
- [ ] Replace custom buttons with reusable Button components
- [ ] Replace custom inputs with reusable Input components
- [ ] Replace manual card layouts with Card components
- [ ] Replace hardcoded colors/sizes with constants
- [ ] Replace manual validation with validation functions
- [ ] Replace custom helpers with utility helpers
- [ ] Test the screen thoroughly
- [ ] Remove unused styles
- [ ] Remove unused imports

---

## 🚀 Benefits After Migration

1. **Less Code**: Screens become 50-70% smaller
2. **Consistency**: Same look & feel everywhere
3. **Maintainability**: Change once, update everywhere
4. **Testability**: Services and utilities are easily testable
5. **Scalability**: Easy to add new features
6. **Team Collaboration**: Clear structure for everyone
7. **Error Handling**: Built-in and consistent
8. **Performance**: Optimized reusable components

---

## 📝 Next Steps

1. Start with one screen (e.g., `auth.jsx` → `LoginScreen.js`)
2. Migrate incrementally, testing after each change
3. Keep old files until migration is confirmed working
4. Update navigation after all screens are migrated
5. Clean up old files and unused code

---

**Migration Status: Ready to Begin!** 🎉

The foundation is complete - now it's time to move your screens to the new architecture!
