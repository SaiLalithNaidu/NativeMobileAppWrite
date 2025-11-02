/**
 * useProductDetail Hook
 * Custom React hook for managing product detail screen state
 * 
 * Features:
 * - Load single product details
 * - Load related products
 * - Handle loading and error states
 * - Auto-refresh when product ID changes
 */

import { useEffect, useState } from 'react';
import { getProductById, getSmartRelatedProducts } from '../services/productDetailService';

/**
 * Custom hook for product detail screen
 * @param {string} productId - The ID of the product to display
 * @returns {Object} Product detail state and functions
 */
export const useProductDetail = (productId) => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  /**
   * Load product details
   */
  const loadProduct = async () => {
    if (!productId) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productData = await getProductById(productId);
      
      if (productData) {
        setProduct(productData);
        // Load related products after main product is loaded
        loadRelatedProducts(productData);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load related products based on current product
   */
  const loadRelatedProducts = async (currentProduct) => {
    if (!currentProduct) return;

    try {
      setLoadingRelated(true);

      const related = await getSmartRelatedProducts({
        productId: currentProduct.id,
        categoryId: currentProduct.categoryId,
        companyId: currentProduct.companyId,
        maxResults: 10
      });

      setRelatedProducts(related);
    } catch (err) {
      console.error('Error loading related products:', err);
      // Don't set error for related products - just log it
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  /**
   * Refresh product data
   */
  const refresh = () => {
    loadProduct();
  };

  // Auto-load when productId changes
  useEffect(() => {
    loadProduct();
  }, [productId]);

  return {
    product,
    relatedProducts,
    loading,
    loadingRelated,
    error,
    refresh,
  };
};

export default useProductDetail;
