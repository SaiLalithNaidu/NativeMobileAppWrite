/**
 * Product Detail Service
 * Handles all Firebase operations related to product details and related products
 * 
 * Features:
 * - Fetch single product details
 * - Fetch related products by category
 * - Fetch related products by company
 */

import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/**
 * Get product details by ID
 * @param {string} productId - The ID of the product
 * @returns {Promise<Object|null>} Product data or null if not found
 */
export const getProductById = async (productId) => {
  try {
    console.log('📦 Fetching product details for ID:', productId);
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const product = {
        id: productSnap.id,
        ...productSnap.data()
      };
      console.log('✅ Product details fetched:', product.title);
      return product;
    } else {
      console.warn('⚠️ Product not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching product details:', error);
    throw error;
  }
};

/**
 * Get related products by category (excluding current product)
 * @param {string} categoryId - The category ID
 * @param {string} currentProductId - Current product ID to exclude
 * @param {number} maxResults - Maximum number of results (default: 10)
 * @returns {Promise<Array>} Array of related products
 */
export const getRelatedProductsByCategory = async (categoryId, currentProductId, maxResults = 10) => {
  try {
    console.log('🔍 Fetching related products for category:', categoryId);
    
    if (!categoryId) {
      throw new Error('Category ID is required');
    }

    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('categoryId', '==', categoryId),
      limit(maxResults + 1) // Get one extra to filter out current product
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(product => product.id !== currentProductId) // Exclude current product
      .slice(0, maxResults); // Limit results

    console.log('✅ Related products fetched:', products.length);
    return products;
  } catch (error) {
    console.error('❌ Error fetching related products:', error);
    throw error;
  }
};

/**
 * Get related products by company (excluding current product)
 * @param {string} companyId - The company ID
 * @param {string} currentProductId - Current product ID to exclude
 * @param {number} maxResults - Maximum number of results (default: 10)
 * @returns {Promise<Array>} Array of related products
 */
export const getRelatedProductsByCompany = async (companyId, currentProductId, maxResults = 10) => {
  try {
    console.log('🔍 Fetching related products for company:', companyId);
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('companyId', '==', companyId),
      limit(maxResults + 1)
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(product => product.id !== currentProductId)
      .slice(0, maxResults);

    console.log('✅ Related company products fetched:', products.length);
    return products;
  } catch (error) {
    console.error('❌ Error fetching related company products:', error);
    throw error;
  }
};

/**
 * Get smart related products - combines category and company products
 * @param {Object} params - Parameters
 * @param {string} params.productId - Current product ID
 * @param {string} params.categoryId - Category ID
 * @param {string} params.companyId - Company ID
 * @param {number} params.maxResults - Maximum results (default: 10)
 * @returns {Promise<Array>} Array of related products
 */
export const getSmartRelatedProducts = async ({ productId, categoryId, companyId, maxResults = 10 }) => {
  try {
    console.log('🧠 Fetching smart related products...');

    // Fetch both category and company products in parallel
    const [categoryProducts, companyProducts] = await Promise.all([
      getRelatedProductsByCategory(categoryId, productId, 6),
      getRelatedProductsByCompany(companyId, productId, 6)
    ]);

    // Merge and deduplicate
    const allProducts = [...categoryProducts];
    const existingIds = new Set(categoryProducts.map(p => p.id));

    // Add company products that aren't already in the list
    companyProducts.forEach(product => {
      if (!existingIds.has(product.id) && allProducts.length < maxResults) {
        allProducts.push(product);
      }
    });

    console.log('✅ Smart related products merged:', allProducts.length);
    return allProducts.slice(0, maxResults);
  } catch (error) {
    console.error('❌ Error fetching smart related products:', error);
    throw error;
  }
};

export default {
  getProductById,
  getRelatedProductsByCategory,
  getRelatedProductsByCompany,
  getSmartRelatedProducts,
};
