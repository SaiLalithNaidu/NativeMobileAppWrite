/**
 * Quick Test - Initialize Sample Warehouse Data
 * 
 * This script creates sample inventory and sales data to populate your warehouse dashboard.
 * Run this by importing it in your warehouse component or calling it from console.
 */

import { SimpleSalesAnalyticsService } from '../services/simpleSalesAnalyticsService';

import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const initializeTestData = async () => {
  try {
    console.log('🚀 Initializing sample warehouse data...');
    
    // Step 1: Get existing products
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    const products = productsSnapshot.docs.slice(0, 10).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📦 Found ${products.length} products`);

    if (products.length === 0) {
      throw new Error('No products found. Please add products first.');
    }

    let totalRecords = 0;

    // Step 2: Create inventory records
    console.log('📋 Creating inventory records...');
    for (const product of products) {
      try {
        const quantity = Math.floor(Math.random() * 100) + 20; // 20-120 items
        const threshold = 10;
        
        const inventoryId = `${product.id}_${product.companyId}`;
        const inventoryRef = doc(db, 'inventory', inventoryId);
        
        const inventoryData = {
          productId: product.id,
          companyId: product.companyId,
          quantity: quantity,
          threshold: threshold,
          isOutOfStock: quantity === 0,
          isLowStock: quantity <= threshold,
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedBy: 'sample_data_generator'
        };

        await setDoc(inventoryRef, inventoryData);
        totalRecords++;
        
        console.log(`✅ Inventory created for ${product.title}: ${quantity} units`);
      } catch (error) {
        console.error(`❌ Failed to create inventory for ${product.title}:`, error);
      }
    }

    // Step 3: Create sample sales records
    console.log('💰 Creating sample sales records...');
    for (let i = 0; i < 20; i++) {
      try {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const saleDate = new Date();
        saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
        
        const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 items
        const unitPrice = Math.floor(Math.random() * 500) + 100; // ₹100-600
        const revenue = quantity * unitPrice;
        
        await SimpleSalesAnalyticsService.recordSale({
          productId: randomProduct.id,
          companyId: randomProduct.companyId,
          quantity: quantity,
          revenue: revenue,
          saleDate: saleDate,
          period: saleDate.toISOString().split('T')[0]
        });

        totalRecords++;
        console.log(`💰 Sale recorded: ${randomProduct.title} - ${quantity} units - ₹${revenue}`);
      } catch (error) {
        console.error('❌ Failed to create sale record:', error);
      }
    }

    console.log(`🎉 Sample data initialization complete!`);
    console.log(`📊 Total records created: ${totalRecords}`);
    
    return {
      success: true,
      message: `Successfully created ${totalRecords} records`,
      details: {
        products: products.length,
        inventoryRecords: products.length,
        salesRecords: 20,
        totalRecords
      }
    };

  } catch (error) {
    console.error('❌ Sample data initialization failed:', error);
    return {
      success: false,
      message: `Failed to initialize sample data: ${error.message}`,
      error
    };
  }
};

// Quick warehouse stats generator
export const generateWarehouseStats = async () => {
  try {
    console.log('📊 Generating warehouse statistics...');
    
    // Get all inventory
    const inventoryRef = collection(db, 'inventory');
    const inventorySnapshot = await getDocs(inventoryRef);
    const inventory = inventorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate stats
    const totalProducts = inventory.length;
    const totalStock = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const inStockItems = inventory.filter(item => !item.isOutOfStock).length;
    const outOfStockItems = inventory.filter(item => item.isOutOfStock).length;
    const lowStockItems = inventory.filter(item => item.isLowStock && !item.isOutOfStock).length;

    const stats = {
      totalProducts,
      totalStock,
      inStockItems,
      outOfStockItems,
      lowStockItems,
      stockPercentage: totalProducts > 0 ? Math.round((inStockItems / totalProducts) * 100) : 0
    };

    console.log('📊 Warehouse Statistics:');
    console.log(`   📦 Total Products: ${stats.totalProducts}`);
    console.log(`   📋 Total Stock: ${stats.totalStock}`);
    console.log(`   ✅ In Stock: ${stats.inStockItems}`);
    console.log(`   ⚠️ Low Stock: ${stats.lowStockItems}`);
    console.log(`   ❌ Out of Stock: ${stats.outOfStockItems}`);
    console.log(`   📈 Stock Percentage: ${stats.stockPercentage}%`);

    return stats;

  } catch (error) {
    console.error('❌ Error generating warehouse stats:', error);
    throw error;
  }
};

// Easy-to-use initialization function
export const setupWarehouseDemo = async () => {
  console.log('🏪 Setting up warehouse demo...');
  
  try {
    // Initialize sample data
    const initResult = await initializeTestData();
    
    if (!initResult.success) {
      throw new Error(initResult.message);
    }

    // Generate stats
    const stats = await generateWarehouseStats();
    
    console.log('✅ Warehouse demo setup complete!');
    console.log('🔄 Refresh your warehouse screen to see the data');
    
    return {
      success: true,
      initResult,
      stats,
      message: 'Warehouse demo setup successfully! Refresh the warehouse screen to see sample data.'
    };

  } catch (error) {
    console.error('❌ Warehouse demo setup failed:', error);
    return {
      success: false,
      message: `Demo setup failed: ${error.message}`,
      error
    };
  }
};

export default {
  initializeTestData,
  generateWarehouseStats,
  setupWarehouseDemo
};