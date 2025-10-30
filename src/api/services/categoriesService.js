import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

// ============================================================================
// CATEGORIES SERVICE
// ============================================================================

export const categoriesService = {
  /**
   * Fetch all categories from Firestore
   * @returns {Promise<Array>} Array of category objects
   */
  async getAll() {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('[Categories Service] Fetched:', categories.length);
      return categories;
    } catch (error) {
      console.error('[Categories Service] Error fetching:', error);
      throw error;
    }
  },

  /**
   * Fetch categories for a specific company
   * @param {string} companyId - Company ID to filter by
   * @returns {Promise<Array>} Array of category objects
   */
  async getByCompany(companyId) {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('companyId', '==', companyId));
      const snapshot = await getDocs(q);
      
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('[Categories Service] Fetched for company:', categories.length);
      return categories;
    } catch (error) {
      console.error('[Categories Service] Error fetching by company:', error);
      throw error;
    }
  },

  /**
   * Add a new category
   * @param {Object} categoryData - Category data to add
   * @returns {Promise<Object>} Created category with ID
   */
  async create(categoryData) {
    try {
      const categoriesRef = collection(db, 'categories');
      const docRef = await addDoc(categoriesRef, categoryData);
      
      console.log('[Categories Service] Created:', docRef.id);
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error('[Categories Service] Error creating:', error);
      throw error;
    }
  },

  /**
   * Delete a category and all its products (cascade)
   * @param {string} categoryId - Category ID to delete
   * @returns {Promise<void>}
   */
  async delete(categoryId) {
    try {
      // Delete category document
      await deleteDoc(doc(db, 'categories', categoryId));
      
      // Delete all related products
      const productsSnapshot = await getDocs(
        query(collection(db, 'products'), where('categoryId', '==', categoryId))
      );
      
      const productDeletes = productsSnapshot.docs.map(docSnap =>
        deleteDoc(doc(db, 'products', docSnap.id))
      );
      
      await Promise.all(productDeletes);
      
      console.log('[Categories Service] Deleted:', categoryId);
    } catch (error) {
      console.error('[Categories Service] Error deleting:', error);
      throw error;
    }
  }
};
