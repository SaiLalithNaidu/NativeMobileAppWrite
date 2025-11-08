/**
 * Order Processing Service
 * Integrates inventory management with order placement and sales tracking
 * 
 * Features:
 * - Process orders with automatic stock deduction
 * - Validate stock availability before order confirmation
 * - Record sales transactions
 * - Handle order status updates
 * - Generate order confirmations
 */

import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { InventoryService } from './inventoryService';
import { SalesAnalyticsService } from './salesAnalyticsService';

export class OrderProcessingService {
  /**
   * Process a complete order with inventory and sales tracking
   * @param {Object} orderData - Complete order data
   * @returns {Promise<Object>} Order processing result
   */
  static async processOrder(orderData) {
    try {
      const {
        customerId,
        customerEmail,
        customerName,
        companyId,
        items,
        subtotal,
        gst,
        deliveryCharges,
        totalAmount,
        paymentMethod = 'cash',
        deliveryAddress,
        contactNumber
      } = orderData;

      console.log('🔄 Processing order for customer:', customerId);

      // Step 1: Validate stock availability
      const stockValidation = await this.validateStockAvailability(items);
      if (!stockValidation.isValid) {
        return {
          success: false,
          error: 'Insufficient stock',
          stockIssues: stockValidation.issues
        };
      }

      // Step 2: Create order record
      const orderRecord = await this.createOrderRecord({
        customerId,
        customerEmail,
        customerName,
        companyId,
        items,
        subtotal,
        gst,
        deliveryCharges,
        totalAmount,
        paymentMethod,
        deliveryAddress,
        contactNumber,
        status: 'confirmed',
        orderDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Step 3: Deduct stock from inventory
      const stockUpdate = await InventoryService.deductStockForOrder(items, orderRecord.id);
      if (!stockUpdate.success) {
        // If stock deduction fails, mark order as failed
        await this.updateOrderStatus(orderRecord.id, 'failed', 'Stock deduction failed');
        return {
          success: false,
          error: 'Failed to update inventory',
          stockIssues: stockUpdate
        };
      }

      // Step 4: Record sale for analytics
      const saleRecord = await SalesAnalyticsService.recordSale({
        orderId: orderRecord.id,
        customerId,
        customerEmail,
        companyId,
        items,
        subtotal,
        gst,
        deliveryCharges,
        totalAmount,
        paymentMethod,
        status: 'completed'
      });

      // Step 5: Update order status to processing
      await this.updateOrderStatus(orderRecord.id, 'processing', 'Order confirmed and stock allocated');

      console.log('✅ Order processed successfully:', orderRecord.id);

      return {
        success: true,
        order: orderRecord,
        sale: saleRecord,
        stockUpdates: stockUpdate.updatedProducts,
        lowStockAlerts: stockUpdate.updatedProducts.filter(p => p.isLowStock),
        outOfStockAlerts: stockUpdate.updatedProducts.filter(p => p.isOutOfStock)
      };

    } catch (error) {
      console.error('❌ Error processing order:', error);
      throw new Error('Failed to process order');
    }
  }

  /**
   * Validate stock availability for all items in the order
   * @param {Array} items - Order items
   * @returns {Promise<Object>} Validation result
   */
  static async validateStockAvailability(items) {
    try {
      const validation = {
        isValid: true,
        issues: []
      };

      for (const item of items) {
        const inventory = await InventoryService.getProductInventory(item.id);
        
        if (!inventory) {
          validation.isValid = false;
          validation.issues.push({
            productId: item.id,
            productTitle: item.title,
            issue: 'Product not found in inventory',
            available: 0,
            requested: item.quantity
          });
          continue;
        }

        if (inventory.isOutOfStock) {
          validation.isValid = false;
          validation.issues.push({
            productId: item.id,
            productTitle: item.title,
            issue: 'Product is out of stock',
            available: 0,
            requested: item.quantity
          });
          continue;
        }

        if (inventory.quantity < item.quantity) {
          validation.isValid = false;
          validation.issues.push({
            productId: item.id,
            productTitle: item.title,
            issue: 'Insufficient stock',
            available: inventory.quantity,
            requested: item.quantity
          });
        }
      }

      return validation;
    } catch (error) {
      console.error('❌ Error validating stock availability:', error);
      throw new Error('Failed to validate stock availability');
    }
  }

  /**
   * Create order record in database
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  static async createOrderRecord(orderData) {
    try {
      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, orderData);

      console.log('✅ Order record created:', docRef.id);
      return { id: docRef.id, ...orderData };
    } catch (error) {
      console.error('❌ Error creating order record:', error);
      throw new Error('Failed to create order record');
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @param {string} notes - Optional status notes
   * @returns {Promise<void>}
   */
  static async updateOrderStatus(orderId, status, notes = '') {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData = {
        status,
        lastUpdated: serverTimestamp()
      };

      if (notes) {
        updateData.statusNotes = notes;
      }

      await updateDoc(orderRef, updateData);
      
      // Log status change
      await this.logOrderStatusChange(orderId, status, notes);

      console.log(`✅ Order status updated: ${orderId} -> ${status}`);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  /**
   * Log order status changes for audit trail
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @param {string} notes - Status notes
   * @returns {Promise<void>}
   */
  static async logOrderStatusChange(orderId, status, notes) {
    try {
      const statusLogRef = collection(db, 'orderStatusLogs');
      await addDoc(statusLogRef, {
        orderId,
        status,
        notes,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error logging order status change:', error);
      // Don't throw error to avoid breaking main operation
    }
  }

  /**
   * Cancel order and restore inventory
   * @param {string} orderId - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  static async cancelOrder(orderId, reason = 'Customer request') {
    try {
      // Get order details
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await orderRef.get();
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      const orderData = orderDoc.data();
      
      // Only restore inventory if order was confirmed/processing
      if (['confirmed', 'processing'].includes(orderData.status)) {
        // Restore inventory
        for (const item of orderData.items) {
          await InventoryService.updateStock(
            item.id,
            item.quantity,
            'order_cancellation',
            orderId
          );
        }
      }

      // Update order status
      await this.updateOrderStatus(orderId, 'cancelled', reason);

      console.log('✅ Order cancelled and inventory restored:', orderId);
      
      return {
        success: true,
        orderId,
        reason,
        inventoryRestored: ['confirmed', 'processing'].includes(orderData.status)
      };

    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  /**
   * Get stock status for cart items (before checkout)
   * @param {Array} cartItems - Cart items to check
   * @returns {Promise<Array>} Stock status for each item
   */
  static async getCartStockStatus(cartItems) {
    try {
      const stockStatus = [];

      for (const item of cartItems) {
        const inventory = await InventoryService.getProductInventory(item.id);
        
        const status = {
          productId: item.id,
          title: item.title,
          requestedQuantity: item.quantity,
          availableQuantity: inventory ? inventory.quantity : 0,
          isAvailable: inventory ? inventory.quantity >= item.quantity : false,
          isOutOfStock: inventory ? inventory.isOutOfStock : true,
          isLowStock: inventory ? inventory.isLowStock : false,
          maxOrderQuantity: inventory ? inventory.quantity : 0
        };

        stockStatus.push(status);
      }

      return stockStatus;
    } catch (error) {
      console.error('❌ Error getting cart stock status:', error);
      throw new Error('Failed to get cart stock status');
    }
  }

  /**
   * Reserve stock temporarily during checkout process
   * @param {Array} items - Items to reserve
   * @param {string} customerId - Customer ID
   * @param {number} reservationMinutes - Minutes to hold reservation
   * @returns {Promise<Object>} Reservation result
   */
  static async reserveStock(items, customerId, reservationMinutes = 15) {
    try {
      const reservationId = `res_${Date.now()}_${customerId}`;
      const expiresAt = new Date(Date.now() + reservationMinutes * 60 * 1000);

      const reservationData = {
        reservationId,
        customerId,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          title: item.title
        })),
        expiresAt,
        status: 'active',
        createdAt: new Date()
      };

      // Store reservation
      const reservationsRef = collection(db, 'stockReservations');
      await addDoc(reservationsRef, reservationData);

      console.log('✅ Stock reserved:', reservationId);
      
      return {
        success: true,
        reservationId,
        expiresAt,
        items: reservationData.items
      };

    } catch (error) {
      console.error('❌ Error reserving stock:', error);
      throw new Error('Failed to reserve stock');
    }
  }

  /**
   * Release stock reservation
   * @param {string} reservationId - Reservation ID
   * @returns {Promise<void>}
   */
  static async releaseStockReservation(reservationId) {
    try {
      // In a real implementation, you would update the reservation status
      // For now, we'll just log it
      console.log('✅ Stock reservation released:', reservationId);
    } catch (error) {
      console.error('❌ Error releasing stock reservation:', error);
      // Don't throw error to avoid breaking other operations
    }
  }

  /**
   * Get low stock alerts for a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Low stock alerts
   */
  static async getLowStockAlerts(companyId) {
    try {
      const lowStockProducts = await InventoryService.getLowStockProducts(companyId);
      
      const alerts = lowStockProducts.map(inventory => ({
        type: 'low_stock',
        severity: 'warning',
        productId: inventory.productId,
        companyId: inventory.companyId,
        currentQuantity: inventory.quantity,
        threshold: inventory.lowStockThreshold,
        message: `Low stock alert: Only ${inventory.quantity} items remaining`
      }));

      return alerts;
    } catch (error) {
      console.error('❌ Error getting low stock alerts:', error);
      throw new Error('Failed to get low stock alerts');
    }
  }

  /**
   * Get out of stock alerts for a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Out of stock alerts
   */
  static async getOutOfStockAlerts(companyId) {
    try {
      const outOfStockProducts = await InventoryService.getOutOfStockProducts(companyId);
      
      const alerts = outOfStockProducts.map(inventory => ({
        type: 'out_of_stock',
        severity: 'critical',
        productId: inventory.productId,
        companyId: inventory.companyId,
        currentQuantity: 0,
        message: 'Product is out of stock and unavailable for orders'
      }));

      return alerts;
    } catch (error) {
      console.error('❌ Error getting out of stock alerts:', error);
      throw new Error('Failed to get out of stock alerts');
    }
  }

  /**
   * Bulk process multiple orders (for batch operations)
   * @param {Array} orders - Array of order data
   * @returns {Promise<Array>} Processing results
   */
  static async processBulkOrders(orders) {
    try {
      const results = [];

      for (const orderData of orders) {
        try {
          const result = await this.processOrder(orderData);
          results.push({
            success: true,
            orderId: result.order?.id,
            customerId: orderData.customerId,
            result
          });
        } catch (error) {
          results.push({
            success: false,
            customerId: orderData.customerId,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      console.log(`✅ Bulk order processing completed: ${successCount} success, ${failCount} failed`);
      
      return {
        totalOrders: orders.length,
        successCount,
        failCount,
        results
      };

    } catch (error) {
      console.error('❌ Error processing bulk orders:', error);
      throw new Error('Failed to process bulk orders');
    }
  }
}

export default OrderProcessingService;