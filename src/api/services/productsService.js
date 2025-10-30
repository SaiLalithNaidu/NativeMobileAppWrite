import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

// ============================================================================
// PRODUCTS SERVICE
// ============================================================================

export const productsService = {
  /**
   * Fetch all products from Firestore
   * @returns {Promise<Array>} Array of product objects
   */
  async getAll() {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('[Products Service] Fetched:', products.length);
      return products;
    } catch (error) {
      console.error('[Products Service] Error fetching:', error);
      throw error;
    }
  },

  /**
   * Fetch products for a specific category
   * @param {string} categoryId - Category ID to filter by
   * @param {string} companyId - Company ID to filter by
   * @returns {Promise<Array>} Array of product objects
   */
  async getByCategory(categoryId, companyId) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('categoryId', '==', categoryId),
        where('companyId', '==', companyId)
      );
      const snapshot = await getDocs(q);
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('[Products Service] Fetched for category:', products.length);
      return products;
    } catch (error) {
      console.error('[Products Service] Error fetching by category:', error);
      throw error;
    }
  },

  /**
   * Fetch products for a specific company
   * @param {string} companyId - Company ID to filter by
   * @returns {Promise<Array>} Array of product objects
   */
  async getByCompany(companyId) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('companyId', '==', companyId));
      const snapshot = await getDocs(q);
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('[Products Service] Fetched for company:', products.length);
      return products;
    } catch (error) {
      console.error('[Products Service] Error fetching by company:', error);
      throw error;
    }
  },

  /**
   * Search products by title or description
   * @param {string} searchTerm - Search term
   * @param {Array} products - Array of products to search through
   * @returns {Array} Filtered products
   */
  search(searchTerm, products) {
    if (!searchTerm.trim()) return products;
    
    const searchLower = searchTerm.toLowerCase();
    return products.filter(product =>
      product.title?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower)
    );
  },

  /**
   * Add a new product
   * @param {Object} productData - Product data to add
   * @returns {Promise<Object>} Created product with ID
   */
  async create(productData) {
    try {
      const productsRef = collection(db, 'products');
      const docRef = await addDoc(productsRef, productData);
      
      console.log('[Products Service] Created:', docRef.id);
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error('[Products Service] Error creating:', error);
      throw error;
    }
  },

  /**
   * Delete a product
   * @param {string} productId - Product ID to delete
   * @returns {Promise<void>}
   */
  async delete(productId) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      console.log('[Products Service] Deleted:', productId);
    } catch (error) {
      console.error('[Products Service] Error deleting:', error);
      throw error;
    }
  }
};
