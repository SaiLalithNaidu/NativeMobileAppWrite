import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

// ============================================================================
// COMPANIES SERVICE
// ============================================================================

export const companiesService = {
  /**
   * Fetch all companies from Firestore
   * @returns {Promise<Array>} Array of company objects
   */
  async getAll() {
    try {
      const companiesRef = collection(db, 'companies');
      const snapshot = await getDocs(companiesRef);
      
      const companies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('[Companies Service] Fetched:', companies.length);
      return companies;
    } catch (error) {
      console.error('[Companies Service] Error fetching:', error);
      throw error;
    }
  },

  /**
   * Add a new company
   * @param {Object} companyData - Company data to add
   * @returns {Promise<Object>} Created company with ID
   */
  async create(companyData) {
    try {
      const companiesRef = collection(db, 'companies');
      const docRef = await addDoc(companiesRef, companyData);
      
      console.log('[Companies Service] Created:', docRef.id);
      return { id: docRef.id, ...companyData };
    } catch (error) {
      console.error('[Companies Service] Error creating:', error);
      throw error;
    }
  },

  /**
   * Delete a company and all its related data (cascade)
   * @param {string} companyId - Company ID to delete
   * @returns {Promise<void>}
   */
  async delete(companyId) {
    try {
      // Delete company document
      await deleteDoc(doc(db, 'companies', companyId));
      
      // Delete all related categories
      const categoriesSnapshot = await getDocs(
        query(collection(db, 'categories'), where('companyId', '==', companyId))
      );
      
      const categoryDeletes = categoriesSnapshot.docs.map(docSnap =>
        deleteDoc(doc(db, 'categories', docSnap.id))
      );

      // Delete all related products
      const productsSnapshot = await getDocs(
        query(collection(db, 'products'), where('companyId', '==', companyId))
      );
      
      const productDeletes = productsSnapshot.docs.map(docSnap =>
        deleteDoc(doc(db, 'products', docSnap.id))
      );

      await Promise.all([...categoryDeletes, ...productDeletes]);
      
      console.log('[Companies Service] Deleted:', companyId);
    } catch (error) {
      console.error('[Companies Service] Error deleting:', error);
      throw error;
    }
  }
};
