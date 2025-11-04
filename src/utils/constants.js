// ============================================================================
// APP CONSTANTS
// ============================================================================

// Collection Names
export const COLLECTIONS = {
  COMPANIES: 'companies',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  ORDERS: 'orders',
};

// Shop Configuration
export const SHOP_CONFIG = {
  name: 'Ramesh Aqua',
  address: 'Shop Address Line 1, City, State - Pincode',
  phone: '+91 1234567890',
  email: 'rameshaqua@example.com',
  gstin: 'GSTIN1234567890', // Optional GST number
};

// View States
export const VIEWS = {
  COMPANIES: 'companies',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'productDetail',
  SEARCH: 'search',
};

// Screen Names
export const SCREENS = {
  // Auth Screens
  AUTH: 'Auth',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Tab Screens
  HOME: 'Home',
  CATEGORIES: 'Categories',
  CART: 'Cart',
  PROFILE: 'Profile',
  ADMIN_PANEL: 'AdminPanel',
  
  // Stack Screens
  COMPANIES_LIST: 'CompaniesList',
  CATEGORIES_LIST: 'CategoriesList',
  PRODUCTS_LIST: 'ProductsList',
  PRODUCT_DETAIL: 'ProductDetail',
};

// Colors
export const COLORS = {
  // Brand palette (Ramesh Aqua)
  PRIMARY: '#0080ff',        // Primary action blue
  PRIMARY_DARK: '#002147',   // Navy brand
  ACCENT_LIGHT: '#b3d9ff',   // Light blue accents

  SECONDARY: '#333',
  BACKGROUND: '#f5f5f5',
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY: '#666',
  LIGHT_GRAY: '#ddd',
  ERROR: '#ff4444',
  SUCCESS: '#28a745',
  WARNING: '#856404',
  INFO: '#17a2b8',
};

// Typography
export const FONTS = {
  SIZE: {
    SMALL: 12,
    REGULAR: 14,
    MEDIUM: 16,
    LARGE: 18,
    XLARGE: 20,
    XXLARGE: 24,
  },
  WEIGHT: {
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: 'bold',
  },
};

// Spacing
export const SPACING = {
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  REGULAR: 16,
  LARGE: 20,
  XLARGE: 24,
  XXLARGE: 32,
};

// Border Radius
export const RADIUS = {
  SMALL: 4,
  MEDIUM: 8,
  LARGE: 12,
  XLARGE: 16,
  ROUND: 50,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  FETCH_FAILED: 'Failed to load data. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please check your credentials.',
  INVALID_EMAIL: 'Invalid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters.',
  REQUIRED_FIELD: 'This field is required.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  LOGOUT_FAILED: 'Failed to logout. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully!',
  SIGNUP: 'Account created successfully!',
  LOGOUT: 'Logged out successfully!',
  ITEM_ADDED: 'Item added successfully!',
  ITEM_DELETED: 'Item deleted successfully!',
  ITEM_UPDATED: 'Item updated successfully!',
};

export default {
  COLLECTIONS,
  VIEWS,
  SCREENS,
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SHOP_CONFIG,
};
