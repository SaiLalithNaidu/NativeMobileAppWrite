/**
 * Search Service
 * Handles all search-related business logic and data fetching
 * 
 * Features:
 * - Fetches products, companies, and categories from Firestore
 * - Provides client-side filtering for search queries
 * - Centralized error handling
 * - Easily testable and reusable across components
 * 
 * Usage:
 * import { searchService } from './services/searchService';
 * const data = await searchService.loadSearchData();
 * const filtered = searchService.filterProducts(products, 'query');
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

class SearchService {
  /**
   * Fetch all products from Firestore
   * @returns {Promise<Array>} Array of product objects
   */
  async fetchProducts() {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`✅ Products fetched: ${products.length}`);
      return products;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Fetch all companies from Firestore
   * @returns {Promise<Array>} Array of company objects
   */
  async fetchCompanies() {
    try {
      const companiesRef = collection(db, 'companies');
      const snapshot = await getDocs(companiesRef);
      const companies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`✅ Companies fetched: ${companies.length}`);
      return companies;
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      throw new Error('Failed to fetch companies');
    }
  }

  /**
   * Fetch all categories from Firestore
   * @returns {Promise<Array>} Array of category objects
   */
  async fetchCategories() {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`✅ Categories fetched: ${categories.length}`);
      return categories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Load all search data (products, companies, categories) in parallel
   * @returns {Promise<Object>} Object containing products, companies, and categories arrays
   */
  async loadSearchData() {
    try {
      const [products, companies, categories] = await Promise.all([
        this.fetchProducts(),
        this.fetchCompanies(),
        this.fetchCategories()
      ]);

      return { products, companies, categories };
    } catch (error) {
      console.error('❌ Error loading search data:', error);
      throw error;
    }
  }

  /**
   * Filter products based on search query
   * Searches in product title and description
   * @param {Array} products - Array of product objects
   * @param {string} query - Search query string
   * @returns {Array} Filtered array of products
   */
  filterProducts(products, query) {
    if (!query || !query.trim()) {
      return [];
    }

    const searchLower = query.toLowerCase().trim();
    
    const filtered = products.filter(product => 
      product.title?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower)
    );

    console.log(`🔍 Search: "${query}" | ${filtered.length} results`);
    return filtered;
  }

  /**
   * Get company name by ID from companies array
   * @param {Array} companies - Array of company objects
   * @param {string} companyId - Company ID to lookup
   * @returns {string} Company name or 'Unknown Company'
   */
  getCompanyName(companies, companyId) {
    const company = companies.find(c => (c.companyId || c.id) === companyId);
    return company?.name || 'Unknown Company';
  }

  /**
   * Get category title by ID from categories array
   * @param {Array} categories - Array of category objects
   * @param {string} categoryId - Category ID to lookup
   * @returns {string} Category title or 'Unknown Category'
   */
  getCategoryTitle(categories, categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category?.title || 'Unknown Category';
  }
}

// Export singleton instance
export const searchService = new SearchService();
