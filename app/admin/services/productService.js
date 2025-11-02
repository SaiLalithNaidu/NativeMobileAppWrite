import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

/**
 * Product Service - Handles all product-related Firebase operations
 */
export const productService = {
  /**
   * Fetch all products for a specific company and category
   * @param {string} companyId - Company ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of product objects
   */
  async getByCompanyAndCategory(companyId, categoryId) {
    try {
      console.log('🔍 Fetching products for:', { companyId, categoryId });

      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('companyId', '==', companyId),
        where('categoryId', '==', categoryId)
      );
      const snapshot = await getDocs(q);
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📦 Products fetched:', products.length);
      return products;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Fetch all products (for all companies)
   * @returns {Promise<Array>} Array of all product objects
   */
  async getAll() {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📦 All products fetched:', products.length);
      return products;
    } catch (error) {
      console.error('❌ Error fetching all products:', error);
      throw error;
    }
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @param {string} companyId - Company ID for the product
   * @param {string} categoryId - Category ID for the product
   * @returns {Promise<Object>} Created product object
   */
  async create(productData, companyId, categoryId) {
    try {
      // Validate required fields
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      if (!categoryId) {
        throw new Error('Category ID is required');
      }
      if (!productData.title || !productData.title.trim()) {
        throw new Error('Product title is required');
      }
      if (!productData.price || !productData.price.toString().trim()) {
        throw new Error('Product price is required');
      }

      // Prepare data
      const data = {
        title: productData.title.trim(),
        categoryId: categoryId,
        companyId: companyId,
        price: parseInt(productData.price) || 0
      };

      if (productData.description?.trim()) {
        data.description = productData.description.trim();
      }
      if (productData.imageUrl?.trim()) {
        data.imageUrl = productData.imageUrl.trim();
      }
      if (productData.url?.trim()) {
        data.url = productData.url.trim();
      }
      if (productData.originalPrice) {
        data.originalPrice = parseInt(productData.originalPrice) || 0;
      }

      console.log('➕ Creating product:', data);

      const productsRef = collection(db, 'products');
      const docRef = await addDoc(productsRef, data);

      console.log('✅ Product created:', docRef.id);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update an existing product
   * @param {string} productId - Product ID to update
   * @param {Object} productData - Updated product data
   * @returns {Promise<void>}
   */
  async update(productId, productData) {
    try {
      // Validate required fields
      if (!productId) {
        throw new Error('Product ID is required');
      }
      if (!productData.title || !productData.title.trim()) {
        throw new Error('Product title is required');
      }
      if (!productData.price || !productData.price.toString().trim()) {
        throw new Error('Product price is required');
      }

      // Prepare data
      const data = {
        title: productData.title.trim(),
        price: parseInt(productData.price) || 0
      };

      if (productData.description?.trim()) {
        data.description = productData.description.trim();
      }
      if (productData.imageUrl?.trim()) {
        data.imageUrl = productData.imageUrl.trim();
      }
      if (productData.url?.trim()) {
        data.url = productData.url.trim();
      }
      if (productData.originalPrice) {
        data.originalPrice = parseInt(productData.originalPrice) || 0;
      }

      console.log('🔄 Updating product:', productId, data);

      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, data);

      console.log('✅ Product updated:', productId);
    } catch (error) {
      console.error('❌ Error updating product:', error);
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
      console.log('🗑️ Deleting product:', productId);
      
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);

      console.log('✅ Product deleted:', productId);
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
  }
};
