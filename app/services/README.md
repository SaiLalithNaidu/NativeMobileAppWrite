# Services Layer

This folder contains all service files that handle business logic and data operations.

## Purpose
- Separate data fetching from UI components
- Centralize business logic for reusability
- Make code more testable and maintainable
- Provide a single source of truth for data operations

## Architecture Pattern
```
Component → Hook → Service → Firebase/API
```

## Available Services

### searchService.js
Handles all search-related operations:
- `loadSearchData()` - Fetch products, companies, and categories in parallel
- `filterProducts(products, query)` - Client-side filtering
- `getCompanyName(companies, id)` - Lookup company name
- `getCategoryTitle(categories, id)` - Lookup category title

**Usage:**
```javascript
import { searchService } from './services/searchService';

// Load all search data
const { products, companies, categories } = await searchService.loadSearchData();

// Filter products
const results = searchService.filterProducts(products, 'laptop');
```

## Best Practices

1. **Keep services stateless** - Services should not maintain state, only perform operations
2. **Use singleton pattern** - Export a single instance for each service
3. **Handle errors gracefully** - Always catch and log errors with meaningful messages
4. **Add JSDoc comments** - Document all public methods with parameters and return types
5. **Console logging** - Use emojis for quick visual scanning (✅ success, ❌ error, 🔍 search)

## Creating a New Service

Template:
```javascript
/**
 * MyService
 * Description of what this service does
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

class MyService {
  /**
   * Method description
   * @param {type} param - Parameter description
   * @returns {Promise<type>} Return description
   */
  async myMethod(param) {
    try {
      // Implementation
      console.log('✅ Success message');
      return result;
    } catch (error) {
      console.error('❌ Error message:', error);
      throw new Error('User-friendly error message');
    }
  }
}

export const myService = new MyService();
```

## Future Services to Add
- `productService.js` - Product CRUD operations
- `cartService.js` - Cart management
- `authService.js` - Authentication operations
- `categoryService.js` - Category operations
- `orderService.js` - Order processing
