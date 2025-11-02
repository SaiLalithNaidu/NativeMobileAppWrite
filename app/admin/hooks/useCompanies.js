import { useEffect, useState } from 'react';
import { companyService } from '../services/companyService';

/**
 * Custom Hook for Company Management
 * Handles all company-related state and operations
 */
export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  /**
   * Load all companies from Firebase
   */
  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (err) {
      console.error('Error loading companies:', err);
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new company
   * @param {Object} companyData - Company data to add
   * @returns {Promise<Object>} Created company
   */
  const addCompany = async (companyData) => {
    try {
      const newCompany = await companyService.create(companyData);
      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (err) {
      console.error('Error adding company:', err);
      throw err;
    }
  };

  /**
   * Delete a company
   * @param {string} companyId - Company ID to delete
   */
  const deleteCompany = async (companyId) => {
    try {
      await companyService.delete(companyId);
      setCompanies(prev => prev.filter(c => c.id !== companyId));
    } catch (err) {
      console.error('Error deleting company:', err);
      throw err;
    }
  };

  /**
   * Get company by ID
   * @param {string} companyId - Company ID
   * @returns {Object|null} Company object or null
   */
  const getCompanyById = (companyId) => {
    return companies.find(c => {
      const id = companyService.getIdentifier(c);
      return id === companyId;
    }) || null;
  };

  return {
    companies,
    loading,
    error,
    loadCompanies,
    addCompany,
    deleteCompany,
    getCompanyById
  };
};
