import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

/**
 * Category Service - Handles all category-related Firebase operations
 */
export const categoryService = {
  /**
   * Fetch all categories for a specific company
   * @param {string} companyId - Company ID to fetch categories for
   * @returns {Promise<Array>} Array of category objects
   */
  async getByCompany(companyId) {
    try {
      console.log('🔍 Fetching categories for company:', companyId);

      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('companyId', '==', companyId));
      const snapshot = await getDocs(q);
      
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📂 Categories fetched:', categories.length);
      return categories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Fetch all categories (for all companies)
   * @returns {Promise<Array>} Array of all category objects
   */
  async getAll() {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📂 All categories fetched:', categories.length);
      return categories;
    } catch (error) {
      console.error('❌ Error fetching all categories:', error);
      throw error;
    }
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data to create
   * @param {string} companyId - Company ID for the category
   * @returns {Promise<Object>} Created category object
   */
  async create(categoryData, companyId) {
    try {
      // Validate required fields
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      if (!categoryData.title || !categoryData.title.trim()) {
        throw new Error('Category title is required');
      }

      // Prepare data
      const data = {
        title: categoryData.title.trim(),
        companyId: companyId
      };

      if (categoryData.description?.trim()) {
        data.description = categoryData.description.trim();
      }
      if (categoryData.imageUrl?.trim()) {
        data.imageUrl = categoryData.imageUrl.trim();
      }
      if (categoryData.url?.trim()) {
        data.url = categoryData.url.trim();
      }
      if (categoryData.productsCount) {
        data.productsCount = parseInt(categoryData.productsCount) || 0;
      }

      console.log('➕ Creating category:', data);

      const categoriesRef = collection(db, 'categories');
      const docRef = await addDoc(categoriesRef, data);

      console.log('✅ Category created:', docRef.id);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('❌ Error creating category:', error);
      throw error;
    }
  },

  /**
   * Delete a category
   * @param {string} categoryId - Category ID to delete
   * @returns {Promise<void>}
   */
  async delete(categoryId) {
    try {
      console.log('🗑️ Deleting category:', categoryId);
      
      const categoryRef = doc(db, 'categories', categoryId);
      await deleteDoc(categoryRef);

      console.log('✅ Category deleted:', categoryId);
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      throw error;
    }
  }
};
