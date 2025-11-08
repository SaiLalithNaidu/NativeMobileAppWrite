/**
 * Setup Script for Warehouse Sample Data
 * Run this to populate your warehouse with sample inventory and sales data
 */

import { quickSetup } from './sampleDataGenerator';

// Initialize sample data when this file is imported
export const initializeSampleData = async () => {
  try {
    console.log('🔧 Initializing warehouse sample data...');
    
    // Generate minimal sample data for quick testing
    const result = await quickSetup.minimal();
    
    if (result.success) {
      console.log('✅ Sample data initialized successfully!');
      console.log(`📊 Created ${result.count} records`);
      
      return {
        success: true,
        message: `Successfully created ${result.count} sample records`,
        data: result
      };
    } else {
      throw new Error('Failed to initialize sample data');
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize sample data:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      error
    };
  }
};

// Auto-run sample data setup
export const setupWarehouseData = async () => {
  console.log('🏪 Setting up warehouse sample data...');
  
  try {
    // Quick inventory setup
    const inventoryResult = await quickSetup.inventoryOnly();
    
    if (inventoryResult.success) {
      console.log(`✅ Warehouse inventory setup complete!`);
      console.log(`📦 Created inventory for ${inventoryResult.count} products`);
      
      return {
        success: true,
        inventoryCount: inventoryResult.count,
        message: 'Warehouse data setup completed successfully!'
      };
    }
    
  } catch (error) {
    console.error('❌ Warehouse setup failed:', error);
    return {
      success: false,
      message: `Setup failed: ${error.message}`,
      error
    };
  }
};

// Export for direct usage
export { quickSetup } from './sampleDataGenerator';

// Ready-to-use warehouse initialization
export default {
  initializeSampleData,
  setupWarehouseData,
  quickSetup
};