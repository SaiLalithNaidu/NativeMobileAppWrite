/**
 * Inventory Initialization Helper
 * Use this to initialize inventory for existing products in your database
 * 
 * This script helps you:
 * 1. Fetch all existing products
 * 2. Initialize inventory records for each product
 * 3. Set initial stock quantities and thresholds
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { InventoryService } from '../services/inventoryService';

export class InventoryInitializer {
  /**
   * Initialize inventory for all existing products
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} Initialization results
   */
  static async initializeAllProducts(options = {}) {
    const {
      defaultQuantity = 50,        // Default stock quantity
      defaultThreshold = 5,        // Default low stock threshold
      skipExisting = true          // Skip products that already have inventory
    } = options;

    try {
      console.log('🚀 Starting inventory initialization...');
      
      // Get all products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📦 Found ${products.length} products to process`);

      // Get existing inventory records
      let existingInventory = [];
      if (skipExisting) {
        const inventoryRef = collection(db, 'inventory');
        const inventorySnapshot = await getDocs(inventoryRef);
        existingInventory = inventorySnapshot.docs.map(doc => doc.data().productId);
        console.log(`📋 Found ${existingInventory.length} existing inventory records`);
      }

      // Initialize inventory for each product
      const results = {
        total: products.length,
        initialized: 0,
        skipped: 0,
        errors: []
      };

      for (const product of products) {
        try {
          // Skip if inventory already exists
          if (skipExisting && existingInventory.includes(product.id)) {
            console.log(`⏭️ Skipping ${product.title} - inventory already exists`);
            results.skipped++;
            continue;
          }

          // Initialize inventory
          await InventoryService.initializeInventory(
            product.id,
            product.companyId,
            defaultQuantity,
            defaultThreshold
          );

          console.log(`✅ Initialized inventory for: ${product.title}`);
          results.initialized++;

        } catch (error) {
          console.error(`❌ Failed to initialize inventory for ${product.title}:`, error);
          results.errors.push({
            productId: product.id,
            productTitle: product.title,
            error: error.message
          });
        }

        // Add small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('🎉 Inventory initialization completed!');
      console.log(`✅ Initialized: ${results.initialized}`);
      console.log(`⏭️ Skipped: ${results.skipped}`);
      console.log(`❌ Errors: ${results.errors.length}`);

      return results;

    } catch (error) {
      console.error('❌ Failed to initialize inventory:', error);
      throw new Error('Inventory initialization failed');
    }
  }

  /**
   * Initialize inventory for a specific company's products
   * @param {string} companyId - Company ID
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} Initialization results
   */
  static async initializeCompanyProducts(companyId, options = {}) {
    const {
      defaultQuantity = 50,
      defaultThreshold = 5,
      skipExisting = true
    } = options;

    try {
      console.log(`🏢 Initializing inventory for company: ${companyId}`);
      
      // Get products for this company
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const companyProducts = productsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => product.companyId === companyId);

      console.log(`📦 Found ${companyProducts.length} products for this company`);

      // Get existing inventory for this company
      let existingInventory = [];
      if (skipExisting) {
        const inventoryRef = collection(db, 'inventory');
        const inventorySnapshot = await getDocs(inventoryRef);
        existingInventory = inventorySnapshot.docs
          .filter(doc => doc.data().companyId === companyId)
          .map(doc => doc.data().productId);
      }

      const results = {
        companyId,
        total: companyProducts.length,
        initialized: 0,
        skipped: 0,
        errors: []
      };

      for (const product of companyProducts) {
        try {
          if (skipExisting && existingInventory.includes(product.id)) {
            results.skipped++;
            continue;
          }

          await InventoryService.initializeInventory(
            product.id,
            companyId,
            defaultQuantity,
            defaultThreshold
          );

          console.log(`✅ Initialized: ${product.title}`);
          results.initialized++;

        } catch (error) {
          console.error(`❌ Failed: ${product.title}`, error);
          results.errors.push({
            productId: product.id,
            productTitle: product.title,
            error: error.message
          });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return results;

    } catch (error) {
      console.error('❌ Company inventory initialization failed:', error);
      throw error;
    }
  }

  /**
   * Update stock quantities for existing inventory
   * @param {Object} stockUpdates - Object with productId as key and quantity as value
   * @returns {Promise<Object>} Update results
   */
  static async bulkUpdateStock(stockUpdates) {
    try {
      console.log(`🔄 Updating stock for ${Object.keys(stockUpdates).length} products`);
      
      const results = {
        total: Object.keys(stockUpdates).length,
        updated: 0,
        errors: []
      };

      for (const [productId, quantity] of Object.entries(stockUpdates)) {
        try {
          await InventoryService.updateStock(
            productId,
            quantity,
            'bulk_update'
          );
          
          console.log(`✅ Updated stock for product ${productId}: ${quantity}`);
          results.updated++;

        } catch (error) {
          console.error(`❌ Failed to update stock for ${productId}:`, error);
          results.errors.push({
            productId,
            quantity,
            error: error.message
          });
        }

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      console.log('🎉 Bulk stock update completed!');
      return results;

    } catch (error) {
      console.error('❌ Bulk stock update failed:', error);
      throw error;
    }
  }

  /**
   * Generate sample stock data for testing
   * @param {Array} productIds - Array of product IDs
   * @returns {Object} Sample stock data
   */
  static generateSampleStockData(productIds) {
    const stockData = {};
    
    productIds.forEach(productId => {
      // Generate random stock quantities for testing
      const randomQuantity = Math.floor(Math.random() * 100) + 1; // 1-100
      stockData[productId] = randomQuantity;
    });

    return stockData;
  }

  /**
   * Get inventory status report
   * @returns {Promise<Object>} Status report
   */
  static async getInventoryStatusReport() {
    try {
      console.log('📊 Generating inventory status report...');
      
      // Get all products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const totalProducts = productsSnapshot.docs.length;

      // Get all inventory
      const inventoryRef = collection(db, 'inventory');
      const inventorySnapshot = await getDocs(inventoryRef);
      const inventory = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const report = {
        totalProducts,
        inventoryRecords: inventory.length,
        productsWithoutInventory: totalProducts - inventory.length,
        inStock: inventory.filter(item => !item.isOutOfStock).length,
        outOfStock: inventory.filter(item => item.isOutOfStock).length,
        lowStock: inventory.filter(item => item.isLowStock).length,
        totalStockQuantity: inventory.reduce((sum, item) => sum + (item.quantity || 0), 0),
        companies: {}
      };

      // Group by company
      inventory.forEach(item => {
        if (!report.companies[item.companyId]) {
          report.companies[item.companyId] = {
            totalProducts: 0,
            totalStock: 0,
            inStock: 0,
            outOfStock: 0,
            lowStock: 0
          };
        }
        
        const companyStats = report.companies[item.companyId];
        companyStats.totalProducts++;
        companyStats.totalStock += item.quantity || 0;
        
        if (item.isOutOfStock) companyStats.outOfStock++;
        else if (item.isLowStock) companyStats.lowStock++;
        else companyStats.inStock++;
      });

      console.log('📊 Inventory Status Report:');
      console.log(`📦 Total Products: ${report.totalProducts}`);
      console.log(`📋 With Inventory: ${report.inventoryRecords}`);
      console.log(`❓ Missing Inventory: ${report.productsWithoutInventory}`);
      console.log(`✅ In Stock: ${report.inStock}`);
      console.log(`⚠️ Low Stock: ${report.lowStock}`);
      console.log(`❌ Out of Stock: ${report.outOfStock}`);
      console.log(`📊 Total Stock Quantity: ${report.totalStockQuantity}`);

      return report;

    } catch (error) {
      console.error('❌ Failed to generate status report:', error);
      throw error;
    }
  }
}

// Example usage functions
export const quickSetupExamples = {
  /**
   * Quick setup for new installation
   */
  async setupNewInstallation() {
    console.log('🚀 Setting up inventory for new installation...');
    
    try {
      // Initialize inventory for all products with default quantities
      const results = await InventoryInitializer.initializeAllProducts({
        defaultQuantity: 50,     // Start with 50 items each
        defaultThreshold: 5,     // Alert when stock drops to 5
        skipExisting: true       // Don't overwrite existing inventory
      });

      console.log('✅ Setup completed:', results);
      return results;
    } catch (error) {
      console.error('❌ Setup failed:', error);
      throw error;
    }
  },

  /**
   * Setup for specific company
   */
  async setupCompany(companyId) {
    console.log(`🏢 Setting up inventory for company: ${companyId}`);
    
    try {
      const results = await InventoryInitializer.initializeCompanyProducts(companyId, {
        defaultQuantity: 100,    // More stock for main company
        defaultThreshold: 10,    // Higher threshold
        skipExisting: false      // Overwrite existing
      });

      console.log('✅ Company setup completed:', results);
      return results;
    } catch (error) {
      console.error('❌ Company setup failed:', error);
      throw error;
    }
  },

  /**
   * Update stock levels with sample data
   */
  async addSampleStock() {
    console.log('📦 Adding sample stock data...');
    
    try {
      // Get some product IDs
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productIds = snapshot.docs.slice(0, 10).map(doc => doc.id);

      // Generate and apply sample stock
      const sampleStock = InventoryInitializer.generateSampleStockData(productIds);
      const results = await InventoryInitializer.bulkUpdateStock(sampleStock);

      console.log('✅ Sample stock added:', results);
      return results;
    } catch (error) {
      console.error('❌ Failed to add sample stock:', error);
      throw error;
    }
  }
};

export default InventoryInitializer;