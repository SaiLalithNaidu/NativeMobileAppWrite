/**
 * Sample Warehouse Data Generator
 * This script creates sample inventory and sales data for testing the warehouse dashboard
 */

import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export class SampleDataGenerator {
  /**
   * Generate sample inventory data for existing products
   */
  static async generateSampleInventory() {
    try {
      console.log('🚀 Generating sample inventory data...');
      
      // Get existing products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📦 Found ${products.length} products`);

      const batch = writeBatch(db);
      let count = 0;

      // Create inventory for each product
      for (const product of products) {
        const inventoryId = `${product.id}_${product.companyId}`;
        const inventoryRef = doc(db, 'inventory', inventoryId);
        
        // Generate random but realistic inventory data
        const quantity = Math.floor(Math.random() * 150) + 10; // 10-160 items
        const threshold = Math.floor(quantity * 0.1) + 2; // 10% of quantity + 2
        const isLowStock = quantity <= threshold;
        const isOutOfStock = quantity === 0;

        const inventoryData = {
          productId: product.id,
          companyId: product.companyId,
          quantity: quantity,
          threshold: threshold,
          isOutOfStock: isOutOfStock,
          isLowStock: isLowStock,
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedBy: 'system'
        };

        batch.set(inventoryRef, inventoryData);
        count++;

        console.log(`✅ ${count}. ${product.title}: ${quantity} units (threshold: ${threshold})`);
      }

      // Commit the batch
      await batch.commit();
      
      console.log(`🎉 Successfully created inventory for ${count} products!`);
      return { success: true, count };

    } catch (error) {
      console.error('❌ Error generating sample inventory:', error);
      throw error;
    }
  }

  /**
   * Generate sample sales data for the last 30 days
   */
  static async generateSampleSales() {
    try {
      console.log('📊 Generating sample sales data...');
      
      // Get existing products with inventory
      const inventoryRef = collection(db, 'inventory');
      const inventorySnapshot = await getDocs(inventoryRef);
      const inventoryItems = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📦 Found ${inventoryItems.length} inventory items`);

      const batch = writeBatch(db);
      let salesCount = 0;

      // Generate sales for the last 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Generate 1-5 sales per day randomly
        const dailySalesCount = Math.floor(Math.random() * 5) + 1;
        
        for (let j = 0; j < dailySalesCount; j++) {
          // Pick a random product
          const randomInventory = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
          
          // Generate realistic sales data
          const quantity = Math.floor(Math.random() * 10) + 1; // 1-10 items sold
          const basePrice = Math.floor(Math.random() * 500) + 50; // ₹50-550 base price
          const revenue = quantity * basePrice;

          const saleData = {
            productId: randomInventory.productId,
            companyId: randomInventory.companyId,
            quantity: quantity,
            revenue: revenue,
            basePrice: basePrice,
            saleDate: currentDate,
            period: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
            createdAt: currentDate,
            status: 'completed'
          };

          const salesRef = doc(collection(db, 'sales'));
          batch.set(salesRef, saleData);
          salesCount++;
        }
      }

      // Commit the batch
      await batch.commit();
      
      console.log(`🎉 Successfully created ${salesCount} sales records!`);
      return { success: true, count: salesCount };

    } catch (error) {
      console.error('❌ Error generating sample sales:', error);
      throw error;
    }
  }

  /**
   * Generate sample orders data
   */
  static async generateSampleOrders() {
    try {
      console.log('🛒 Generating sample orders data...');
      
      // Get some products for orders
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const products = productsSnapshot.docs.slice(0, 20).map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const batch = writeBatch(db);
      let orderCount = 0;

      // Generate 15 sample orders
      for (let i = 0; i < 15; i++) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 15)); // Last 15 days

        // Pick 1-4 random products for this order
        const orderItemsCount = Math.floor(Math.random() * 4) + 1;
        const orderItems = [];
        let totalAmount = 0;

        for (let j = 0; j < orderItemsCount; j++) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 5) + 1;
          const price = Math.floor(Math.random() * 300) + 100; // ₹100-400
          const itemTotal = quantity * price;
          totalAmount += itemTotal;

          orderItems.push({
            productId: randomProduct.id,
            productTitle: randomProduct.title || 'Sample Product',
            quantity: quantity,
            price: price,
            total: itemTotal
          });
        }

        const orderData = {
          userId: 'sample_user_' + (i + 1),
          items: orderItems,
          totalAmount: totalAmount,
          status: ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
          createdAt: orderDate,
          updatedAt: orderDate,
          customerName: `Customer ${i + 1}`,
          customerEmail: `customer${i + 1}@example.com`,
          deliveryAddress: `Address ${i + 1}, City, State`,
          paymentMethod: ['cash', 'online', 'card'][Math.floor(Math.random() * 3)]
        };

        const orderRef = doc(collection(db, 'orders'));
        batch.set(orderRef, orderData);
        orderCount++;
      }

      await batch.commit();
      
      console.log(`🎉 Successfully created ${orderCount} sample orders!`);
      return { success: true, count: orderCount };

    } catch (error) {
      console.error('❌ Error generating sample orders:', error);
      throw error;
    }
  }

  /**
   * Generate sample inventory transactions
   */
  static async generateSampleTransactions() {
    try {
      console.log('📝 Generating sample inventory transactions...');
      
      // Get some inventory items
      const inventoryRef = collection(db, 'inventory');
      const inventorySnapshot = await getDocs(inventoryRef);
      const inventoryItems = inventorySnapshot.docs.slice(0, 10).map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const batch = writeBatch(db);
      let transactionCount = 0;

      // Generate various types of transactions
      const transactionTypes = [
        { type: 'stock_in', reason: 'Purchase from supplier' },
        { type: 'stock_out', reason: 'Sale to customer' },
        { type: 'adjustment', reason: 'Inventory count adjustment' },
        { type: 'damaged', reason: 'Damaged goods removal' },
        { type: 'return', reason: 'Customer return' }
      ];

      for (const inventory of inventoryItems) {
        // Generate 2-5 transactions per inventory item
        const transactionsPerItem = Math.floor(Math.random() * 4) + 2;
        
        for (let i = 0; i < transactionsPerItem; i++) {
          const randomTransaction = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
          const transactionDate = new Date();
          transactionDate.setDate(transactionDate.getDate() - Math.floor(Math.random() * 20));
          
          const quantity = Math.floor(Math.random() * 20) + 1;
          
          const transactionData = {
            productId: inventory.productId,
            companyId: inventory.companyId,
            type: randomTransaction.type,
            quantity: quantity,
            reason: randomTransaction.reason,
            timestamp: transactionDate,
            performedBy: 'system',
            notes: `Auto-generated sample transaction`
          };

          const transactionRef = doc(collection(db, 'inventoryTransactions'));
          batch.set(transactionRef, transactionData);
          transactionCount++;
        }
      }

      await batch.commit();
      
      console.log(`🎉 Successfully created ${transactionCount} inventory transactions!`);
      return { success: true, count: transactionCount };

    } catch (error) {
      console.error('❌ Error generating sample transactions:', error);
      throw error;
    }
  }

  /**
   * Generate all sample data at once
   */
  static async generateAllSampleData() {
    try {
      console.log('🚀 Starting complete sample data generation...');
      
      const results = {
        inventory: { success: false, count: 0 },
        sales: { success: false, count: 0 },
        orders: { success: false, count: 0 },
        transactions: { success: false, count: 0 }
      };

      // Generate inventory data first
      console.log('\n1️⃣ Generating inventory data...');
      results.inventory = await this.generateSampleInventory();
      
      // Wait a bit for data to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate sales data
      console.log('\n2️⃣ Generating sales data...');
      results.sales = await this.generateSampleSales();
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate orders data
      console.log('\n3️⃣ Generating orders data...');
      results.orders = await this.generateSampleOrders();
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate transactions data
      console.log('\n4️⃣ Generating transactions data...');
      results.transactions = await this.generateSampleTransactions();

      console.log('\n🎉 All sample data generated successfully!');
      console.log('📊 Summary:');
      console.log(`   • Inventory records: ${results.inventory.count}`);
      console.log(`   • Sales records: ${results.sales.count}`);
      console.log(`   • Orders: ${results.orders.count}`);
      console.log(`   • Transactions: ${results.transactions.count}`);

      return results;

    } catch (error) {
      console.error('❌ Error generating complete sample data:', error);
      throw error;
    }
  }

  /**
   * Quick sample data for testing (smaller dataset)
   */
  static async generateQuickSampleData() {
    try {
      console.log('⚡ Generating quick sample data for testing...');
      
      // Get first 5 products only
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const products = productsSnapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const batch = writeBatch(db);
      let totalCount = 0;

      // Create inventory for 5 products
      for (const product of products) {
        const inventoryId = `${product.id}_${product.companyId}`;
        const inventoryRef = doc(db, 'inventory', inventoryId);
        
        const quantity = Math.floor(Math.random() * 50) + 20; // 20-70 items
        const threshold = 5;

        const inventoryData = {
          productId: product.id,
          companyId: product.companyId,
          quantity: quantity,
          threshold: threshold,
          isOutOfStock: false,
          isLowStock: quantity <= threshold,
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedBy: 'system'
        };

        batch.set(inventoryRef, inventoryData);
        totalCount++;

        // Create 2-3 sales records for each product
        for (let i = 0; i < 3; i++) {
          const saleDate = new Date();
          saleDate.setDate(saleDate.getDate() - i);
          
          const saleData = {
            productId: product.id,
            companyId: product.companyId,
            quantity: Math.floor(Math.random() * 5) + 1,
            revenue: Math.floor(Math.random() * 1000) + 200,
            saleDate: saleDate,
            period: saleDate.toISOString().split('T')[0],
            createdAt: saleDate,
            status: 'completed'
          };

          const salesRef = doc(collection(db, 'sales'));
          batch.set(salesRef, saleData);
          totalCount++;
        }
      }

      await batch.commit();
      
      console.log(`⚡ Quick sample data generated! Total records: ${totalCount}`);
      return { success: true, count: totalCount };

    } catch (error) {
      console.error('❌ Error generating quick sample data:', error);
      throw error;
    }
  }
}

// Easy-to-use helper functions
export const quickSetup = {
  // Generate minimal test data
  async minimal() {
    console.log('🔥 Setting up minimal test data...');
    return await SampleDataGenerator.generateQuickSampleData();
  },

  // Generate full sample data
  async complete() {
    console.log('🚀 Setting up complete sample data...');
    return await SampleDataGenerator.generateAllSampleData();
  },

  // Just inventory data
  async inventoryOnly() {
    console.log('📦 Setting up inventory data only...');
    return await SampleDataGenerator.generateSampleInventory();
  }
};

export default SampleDataGenerator;