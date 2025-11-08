/**
 * Inventory Management Service
 * Handles warehouse tracking, stock levels, and inventory operations
 * 
 * Features:
 * - Track product quantities per company
 * - Update stock levels automatically
 * - Handle out-of-stock scenarios
 * - Low stock alerts
 * - Inventory history tracking
 */

import { addDoc, collection, doc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export class InventoryService {
  /**
   * Initialize inventory for a product
   * @param {string} productId - Product ID
   * @param {string} companyId - Company ID
   * @param {number} initialQuantity - Initial stock quantity
   * @param {number} lowStockThreshold - Threshold for low stock alerts
   * @returns {Promise<Object>} Inventory record
   */
  static async initializeInventory(productId, companyId, initialQuantity = 0, lowStockThreshold = 5) {
    try {
      const inventoryData = {
        productId,
        companyId,
        quantity: initialQuantity,
        lowStockThreshold,
        isOutOfStock: initialQuantity === 0,
        isLowStock: initialQuantity <= lowStockThreshold,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const inventoryRef = collection(db, 'inventory');
      const docRef = await addDoc(inventoryRef, inventoryData);

      console.log('✅ Inventory initialized:', docRef.id);
      return { id: docRef.id, ...inventoryData };
    } catch (error) {
      console.error('❌ Error initializing inventory:', error);
      throw new Error('Failed to initialize inventory');
    }
  }

  /**
   * Get inventory for a specific product
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Inventory record or null
   */
  static async getProductInventory(productId) {
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(inventoryRef, where('productId', '==', productId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('❌ Error fetching product inventory:', error);
      throw new Error('Failed to fetch inventory');
    }
  }

  /**
   * Get inventory for all products in a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Array of inventory records
   */
  static async getCompanyInventory(companyId) {
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(inventoryRef, where('companyId', '==', companyId));
      const snapshot = await getDocs(q);

      const inventory = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Company inventory fetched: ${inventory.length} items`);
      return inventory;
    } catch (error) {
      console.error('❌ Error fetching company inventory:', error);
      throw new Error('Failed to fetch company inventory');
    }
  }

  /**
   * Update stock quantity (increase or decrease)
   * @param {string} productId - Product ID
   * @param {number} quantityChange - Positive to add, negative to subtract
   * @param {string} reason - Reason for the change (e.g., 'sale', 'restock', 'adjustment')
   * @param {string} orderId - Optional order ID for tracking
   * @returns {Promise<Object>} Updated inventory record
   */
  static async updateStock(productId, quantityChange, reason = 'adjustment', orderId = null) {
    try {
      // Get current inventory
      const currentInventory = await this.getProductInventory(productId);
      if (!currentInventory) {
        throw new Error('Product inventory not found');
      }

      const newQuantity = Math.max(0, currentInventory.quantity + quantityChange);
      const isOutOfStock = newQuantity === 0;
      const isLowStock = newQuantity <= currentInventory.lowStockThreshold && newQuantity > 0;

      // Update inventory
      const inventoryRef = doc(db, 'inventory', currentInventory.id);
      const updateData = {
        quantity: newQuantity,
        isOutOfStock,
        isLowStock,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(inventoryRef, updateData);

      // Log inventory transaction
      await this.logInventoryTransaction({
        productId,
        companyId: currentInventory.companyId,
        quantityChange,
        previousQuantity: currentInventory.quantity,
        newQuantity,
        reason,
        orderId,
        timestamp: serverTimestamp()
      });

      console.log(`✅ Stock updated: ${productId} | Change: ${quantityChange} | New: ${newQuantity}`);
      return { ...currentInventory, ...updateData, quantity: newQuantity };
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      throw new Error('Failed to update stock');
    }
  }

  /**
   * Deduct stock when order is placed
   * @param {Array} orderItems - Array of order items with productId and quantity
   * @param {string} orderId - Order ID for tracking
   * @returns {Promise<Object>} Result with success status and any out-of-stock items
   */
  static async deductStockForOrder(orderItems, orderId) {
    try {
      const results = {
        success: true,
        outOfStockItems: [],
        insufficientStockItems: [],
        updatedProducts: []
      };

      // Check stock availability first
      for (const item of orderItems) {
        const inventory = await this.getProductInventory(item.productId);
        if (!inventory) {
          results.success = false;
          results.outOfStockItems.push({
            productId: item.productId,
            reason: 'Inventory not found'
          });
          continue;
        }

        if (inventory.quantity < item.quantity) {
          results.success = false;
          results.insufficientStockItems.push({
            productId: item.productId,
            available: inventory.quantity,
            requested: item.quantity
          });
        }
      }

      // If any items have insufficient stock, don't process the order
      if (!results.success) {
        return results;
      }

      // Process stock deductions using batch write for atomicity
      const batch = writeBatch(db);
      const transactionPromises = [];

      for (const item of orderItems) {
        const inventory = await this.getProductInventory(item.productId);
        const newQuantity = inventory.quantity - item.quantity;
        const isOutOfStock = newQuantity === 0;
        const isLowStock = newQuantity <= inventory.lowStockThreshold && newQuantity > 0;

        // Update inventory in batch
        const inventoryRef = doc(db, 'inventory', inventory.id);
        batch.update(inventoryRef, {
          quantity: newQuantity,
          isOutOfStock,
          isLowStock,
          lastUpdated: serverTimestamp()
        });

        // Prepare transaction log
        transactionPromises.push(
          this.logInventoryTransaction({
            productId: item.productId,
            companyId: inventory.companyId,
            quantityChange: -item.quantity,
            previousQuantity: inventory.quantity,
            newQuantity,
            reason: 'sale',
            orderId,
            timestamp: serverTimestamp()
          })
        );

        results.updatedProducts.push({
          productId: item.productId,
          previousQuantity: inventory.quantity,
          newQuantity,
          isOutOfStock,
          isLowStock
        });
      }

      // Commit batch update
      await batch.commit();
      
      // Log all transactions
      await Promise.all(transactionPromises);

      console.log(`✅ Stock deducted for order: ${orderId}`);
      return results;
    } catch (error) {
      console.error('❌ Error deducting stock for order:', error);
      throw new Error('Failed to deduct stock for order');
    }
  }

  /**
   * Restock products (add inventory)
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @param {string} reason - Reason for restocking
   * @returns {Promise<Object>} Updated inventory
   */
  static async restockProduct(productId, quantity, reason = 'restock') {
    return await this.updateStock(productId, quantity, reason);
  }

  /**
   * Get low stock products for a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Array of low stock products
   */
  static async getLowStockProducts(companyId) {
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(
        inventoryRef,
        where('companyId', '==', companyId),
        where('isLowStock', '==', true)
      );
      const snapshot = await getDocs(q);

      const lowStockItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`⚠️ Low stock items found: ${lowStockItems.length}`);
      return lowStockItems;
    } catch (error) {
      console.error('❌ Error fetching low stock products:', error);
      throw new Error('Failed to fetch low stock products');
    }
  }

  /**
   * Get out of stock products for a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Array of out of stock products
   */
  static async getOutOfStockProducts(companyId) {
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(
        inventoryRef,
        where('companyId', '==', companyId),
        where('isOutOfStock', '==', true)
      );
      const snapshot = await getDocs(q);

      const outOfStockItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`🚫 Out of stock items found: ${outOfStockItems.length}`);
      return outOfStockItems;
    } catch (error) {
      console.error('❌ Error fetching out of stock products:', error);
      throw new Error('Failed to fetch out of stock products');
    }
  }

  /**
   * Log inventory transaction for audit trail
   * @param {Object} transactionData - Transaction details
   * @returns {Promise<Object>} Transaction record
   */
  static async logInventoryTransaction(transactionData) {
    try {
      const transactionsRef = collection(db, 'inventoryTransactions');
      const docRef = await addDoc(transactionsRef, transactionData);
      
      return { id: docRef.id, ...transactionData };
    } catch (error) {
      console.error('❌ Error logging inventory transaction:', error);
      // Don't throw error here to avoid breaking the main operation
    }
  }

  /**
   * Get inventory transaction history
   * @param {string} productId - Product ID
   * @param {number} limit - Number of records to fetch
   * @returns {Promise<Array>} Array of transaction records
   */
  static async getInventoryHistory(productId, limit = 20) {
    try {
      const transactionsRef = collection(db, 'inventoryTransactions');
      const q = query(
        transactionsRef,
        where('productId', '==', productId)
      );
      const snapshot = await getDocs(q);

      const transactions = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate())
        .slice(0, limit);

      return transactions;
    } catch (error) {
      console.error('❌ Error fetching inventory history:', error);
      throw new Error('Failed to fetch inventory history');
    }
  }

  /**
   * Real-time inventory monitoring
   * @param {string} companyId - Company ID
   * @param {Function} callback - Callback function for real-time updates
   * @returns {Function} Unsubscribe function
   */
  static subscribeToInventoryUpdates(companyId, callback) {
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(inventoryRef, where('companyId', '==', companyId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const inventory = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(inventory);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up inventory subscription:', error);
      throw new Error('Failed to subscribe to inventory updates');
    }
  }
}

export default InventoryService;