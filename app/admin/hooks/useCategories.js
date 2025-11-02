import { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';

/**
 * Custom Hook for Category Management
 * Handles all category-related state and operations
 */
export const useCategories = (companyId) => {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load categories when company changes
  useEffect(() => {
    if (companyId) {
      loadCategories(companyId);
    } else {
      setCategories([]);
    }
  }, [companyId]);

  /**
   * Load all categories (for counting purposes)
   */
  const loadAllCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setAllCategories(data);
      return data;
    } catch (err) {
      console.error('Error loading all categories:', err);
      throw err;
    }
  };

  /**
   * Load categories for a specific company
   * @param {string} companyId - Company ID
   */
  const loadCategories = async (companyId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getByCompany(companyId);
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new category
   * @param {Object} categoryData - Category data to add
   * @param {string} companyId - Company ID for the category
   * @returns {Promise<Object>} Created category
   */
  const addCategory = async (categoryData, companyId) => {
    try {
      const newCategory = await categoryService.create(categoryData, companyId);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  };

  /**
   * Delete a category
   * @param {string} categoryId - Category ID to delete
   */
  const deleteCategory = async (categoryId) => {
    try {
      await categoryService.delete(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  /**
   * Get category count for a specific company
   * @param {string} companyId - Company ID
   * @returns {number} Category count
   */
  const getCategoryCount = (companyId) => {
    return allCategories.filter(cat => cat.companyId === companyId).length;
  };

  return {
    categories,
    allCategories,
    loading,
    error,
    loadCategories,
    loadAllCategories,
    addCategory,
    deleteCategory,
    getCategoryCount
  };
};
