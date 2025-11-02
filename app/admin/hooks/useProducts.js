import { useEffect, useState } from 'react';
import { productService } from '../services/productService';

/**
 * Custom Hook for Product Management
 * Handles all product-related state and operations
 */
export const useProducts = (companyId, categoryId) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Load products when company or category changes
  useEffect(() => {
    if (companyId && categoryId) {
      loadProducts(companyId, categoryId);
    } else {
      setProducts([]);
    }
  }, [companyId, categoryId]);

  /**
   * Load all products (for counting purposes)
   */
  const loadAllProducts = async () => {
    try {
      const data = await productService.getAll();
      setAllProducts(data);
      return data;
    } catch (err) {
      console.error('Error loading all products:', err);
      throw err;
    }
  };

  /**
   * Load products for a specific company and category
   * @param {string} companyId - Company ID
   * @param {string} categoryId - Category ID
   */
  const loadProducts = async (companyId, categoryId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getByCompanyAndCategory(companyId, categoryId);
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new product
   * @param {Object} productData - Product data to add
   * @param {string} companyId - Company ID for the product
   * @param {string} categoryId - Category ID for the product
   * @returns {Promise<Object>} Created product
   */
  const addProduct = async (productData, companyId, categoryId) => {
    try {
      const newProduct = await productService.create(productData, companyId, categoryId);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  /**
   * Update an existing product
   * @param {string} productId - Product ID to update
   * @param {Object} productData - Updated product data
   */
  const updateProduct = async (productId, productData) => {
    try {
      await productService.update(productId, productData);
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, ...productData } : p
      ));
      setEditingProduct(null);
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  /**
   * Delete a product
   * @param {string} productId - Product ID to delete
   */
  const deleteProduct = async (productId) => {
    try {
      await productService.delete(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  /**
   * Set product for editing
   * @param {Object} product - Product to edit
   */
  const startEditing = (product) => {
    setEditingProduct(product);
  };

  /**
   * Cancel editing
   */
  const cancelEditing = () => {
    setEditingProduct(null);
  };

  /**
   * Get product count for a specific company
   * @param {string} companyId - Company ID
   * @returns {number} Product count
   */
  const getProductCount = (companyId) => {
    return allProducts.filter(prod => prod.companyId === companyId).length;
  };

  return {
    products,
    allProducts,
    loading,
    error,
    editingProduct,
    loadProducts,
    loadAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    startEditing,
    cancelEditing,
    getProductCount
  };
};
