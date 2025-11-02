import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

/**
 * Company Service - Handles all company-related Firebase operations
 */
export const companyService = {
  /**
   * Fetch all companies from Firebase
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
      
      console.log('📦 Companies fetched:', companies.length);
      return companies;
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      throw error;
    }
  },

  /**
   * Create a new company
   * @param {Object} companyData - Company data to create
   * @returns {Promise<Object>} Created company object
   */
  async create(companyData) {
    try {
      // Validate required fields
      if (!companyData.name || !companyData.name.trim()) {
        throw new Error('Company name is required');
      }

      // Prepare data - only include fields that have values
      const data = {
        name: companyData.name.trim()
      };

      if (companyData.description?.trim()) {
        data.description = companyData.description.trim();
      }
      if (companyData.logoUrl?.trim()) {
        data.logoUrl = companyData.logoUrl.trim();
      }
      if (companyData.websiteUrl?.trim()) {
        data.websiteUrl = companyData.websiteUrl.trim();
      }

      console.log('➕ Creating company:', data);

      const companiesRef = collection(db, 'companies');
      const docRef = await addDoc(companiesRef, data);

      console.log('✅ Company created:', docRef.id);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('❌ Error creating company:', error);
      throw error;
    }
  },

  /**
   * Delete a company and its related data
   * @param {string} companyId - Company ID to delete
   * @returns {Promise<void>}
   */
  async delete(companyId) {
    try {
      console.log('🗑️ Deleting company:', companyId);
      
      const companyRef = doc(db, 'companies', companyId);
      await deleteDoc(companyRef);

      console.log('✅ Company deleted:', companyId);
    } catch (error) {
      console.error('❌ Error deleting company:', error);
      throw error;
    }
  },

  /**
   * Get company identifier (handles both companyId and id fields)
   * @param {Object} company - Company object
   * @returns {string} Company identifier
   */
  getIdentifier(company) {
    return company.companyId || company.id;
  }
};
