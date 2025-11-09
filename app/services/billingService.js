/**
 * Billing Service
 * Handles order creation, storage, and retrieval from Firebase
 * 
 * Features:
 * - Create new orders
 * - Save orders to Firestore
 * - Retrieve order history
 * - Generate order IDs
 */

import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SimpleSalesAnalyticsService } from './simpleSalesAnalyticsService';

/**
 * Generate unique order ID
 * Format: ORD-YYYYMMDD-XXXXX
 * @returns {string} Order ID
 */
export const generateOrderId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 90000) + 10000; // 5-digit random number
  
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Create order object from cart data
 * @param {Object} params - Order parameters
 * @param {string} params.customerName - Customer name
 * @param {string} params.customerEmail - Customer email (optional)
 * @param {string} params.customerPhone - Customer phone (optional)
 * @param {Array} params.items - Cart items
 * @param {Object} params.summary - Cart summary from cartService
 * @param {number} params.paidAmount - Amount paid by customer (optional, defaults to 0)
 * @returns {Object} Order object
 */
export const createOrderObject = async ({ customerName, customerEmail, customerPhone, items, summary, paidAmount = 0 }) => {
  const orderId = generateOrderId();
  const orderDate = new Date().toISOString();
  
  // Debug: Check cart items structure
  console.log('🛍️ Cart items received in createOrderObject:', JSON.stringify(items.map(item => ({
    id: item.id,
    title: item.title,
    companyId: item.companyId,
    categoryId: item.categoryId,
    hasCompanyId: !!item.companyId,
    hasCategory: !!item.categoryId
  })), null, 2));
  
  // Enrich cart items with missing fields if needed
  const enrichedItems = await Promise.all(items.map(async (item) => {
    if (item.companyId && item.categoryId) {
      // Item already has all required fields
      return item;
    }
    
    // Fetch missing fields from product document
    try {
      console.log(`🔍 Enriching item ${item.title} with missing fields...`);
      const productRef = doc(db, 'products', item.id);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const enrichedItem = {
          ...item,
          companyId: item.companyId || productData.companyId,
          categoryId: item.categoryId || productData.categoryId,
          // Preserve any other fields that might be missing
          company: item.company || productData.company,
          category: item.category || productData.category
        };
        console.log(`✅ Enriched ${item.title} with companyId: ${enrichedItem.companyId}`);
        return enrichedItem;
      } else {
        console.error(`❌ Product ${item.id} not found for enrichment`);
        return item; // Return original item if enrichment fails
      }
    } catch (error) {
      console.error(`❌ Error enriching item ${item.title}:`, error);
      return item; // Return original item if enrichment fails
    }
  }));
  
  console.log('✅ Items enriched, using enriched items for order creation');
  
  // Calculate payment status
  const paid = parseFloat(paidAmount) || 0;
  const pending = summary.total - paid;
  let paymentStatus = 'pending';
  
  if (paid === 0) {
    paymentStatus = 'pending';
  } else if (paid >= summary.total) {
    paymentStatus = 'paid';
  } else {
    paymentStatus = 'partial';
  }

  return {
    orderId,
    orderDate,
    customer: {
      name: customerName,
      email: customerEmail || '',
      phone: customerPhone || '',
    },
    items: enrichedItems.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice || null,
      quantity: item.quantity,
      imageUrl: item.imageUrl || null,
      total: item.price * item.quantity,
      companyId: item.companyId, // Include companyId for inventory updates
      categoryId: item.categoryId, // Include categoryId if needed
    })),
    billing: {
      subtotal: summary.subtotal,
      gst: summary.gst,
      gstRate: 18, // 18%
      delivery: summary.delivery,
      total: summary.total,
      savings: summary.savings,
      itemCount: summary.itemCount,
    },
    payment: {
      paidAmount: paid,
      pendingAmount: pending,
      lastUpdated: orderDate,
    },
    status: 'pending', // pending, confirmed, delivered, cancelled
    paymentStatus: paymentStatus, // pending, partial, paid
    createdAt: orderDate,
  };
};

/**
 * Update inventory quantities after order placement
 * @param {Array} orderItems - Array of order items
 */
const updateInventoryForOrder = async (orderItems) => {
  try {
    console.log('📦 Updating inventory for order items...');
    console.log('📦 Order items structure:', JSON.stringify(orderItems.map(item => ({
      id: item.id,
      title: item.title,
      companyId: item.companyId,
      hasCompanyId: !!item.companyId
    })), null, 2));
    
    for (const item of orderItems) {
      let companyId = item.companyId;
      
      // If companyId is missing, try to get it from the product document
      if (!companyId) {
        console.warn(`⚠️ Item ${item.title} (${item.id}) missing companyId - attempting to fetch from product data`);
        try {
          const productRef = doc(db, 'products', item.id);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            companyId = productSnap.data().companyId;
            console.log(`✅ Found companyId ${companyId} for product ${item.title}`);
          } else {
            console.error(`❌ Product ${item.id} not found in database`);
            continue;
          }
        } catch (error) {
          console.error(`❌ Error fetching product data for ${item.id}:`, error);
          continue;
        }
      }

      if (!companyId) {
        console.warn(`⚠️ Unable to determine companyId for item ${item.title} (${item.id}) - skipping inventory update`);
        continue;
      }

      // Find existing inventory for this product and company
      const inventoryRef = collection(db, 'inventory');
      const q = query(
        inventoryRef,
        where('productId', '==', item.id),
        where('companyId', '==', companyId)
      );
      
      const inventorySnapshot = await getDocs(q);
      
      if (!inventorySnapshot.empty) {
        const inventoryDoc = inventorySnapshot.docs[0];
        const currentInventory = inventoryDoc.data();
        const currentQuantity = currentInventory.quantity || 0;
        const newQuantity = Math.max(0, currentQuantity - item.quantity);
        
        // Update inventory
        await updateDoc(inventoryDoc.ref, {
          quantity: newQuantity,
          isOutOfStock: newQuantity === 0,
          isLowStock: newQuantity <= (currentInventory.threshold || 5),
          lastUpdated: new Date()
        });
        
        // Create inventory transaction record
        const transactionRef = collection(db, 'inventoryTransactions');
        await addDoc(transactionRef, {
          productId: item.id,
          companyId: companyId,
          type: 'stock_out',
          quantity: item.quantity,
          reason: 'Order placed',
          timestamp: new Date(),
          performedBy: 'system',
          notes: `Stock deducted for order - ${item.quantity} units of ${item.title}`
        });
        
        console.log(`✅ Updated inventory for ${item.title}: ${currentQuantity} → ${newQuantity}`);
      } else {
        console.warn(`⚠️ No inventory found for product ${item.title} (${item.id})`);
      }
    }
    
    console.log('✅ Inventory updated successfully for all items');
  } catch (error) {
    console.error('❌ Error updating inventory:', error);
    throw new Error('Failed to update inventory');
  }
};

/**
 * Record sale for analytics after successful order
 * @param {Object} orderData - Order data
 * @param {string} docId - Firestore document ID
 */
const recordSaleForAnalytics = async (orderData, docId) => {
  try {
    console.log('📊 Recording sale for analytics...');
    
    // Extract company IDs from items (use first item's company as primary)
    const companyId = orderData.items.length > 0 ? orderData.items[0].companyId : null;
    
    if (!companyId) {
      console.warn('⚠️ No companyId found in order items, skipping sales recording');
      return;
    }

    // Create sales record for each item
    for (const item of orderData.items) {
      await SimpleSalesAnalyticsService.recordSale({
        orderId: docId,
        productId: item.id,
        productTitle: item.title,
        companyId: item.companyId,
        categoryId: item.categoryId,
        quantity: item.quantity,
        unitPrice: item.price,
        revenue: item.total,
        totalAmount: item.total,
        customerEmail: orderData.customer.email,
        customerName: orderData.customer.name,
        saleDate: new Date(),
        period: new Date().toISOString().split('T')[0],
        status: 'completed'
      });
    }

    console.log('✅ Sales recorded for analytics');
  } catch (error) {
    console.error('❌ Error recording sale for analytics:', error);
    // Don't throw error to avoid breaking order saving
  }
};

/**
 * Save order to Firebase Firestore
 * @param {Object} orderData - Order object from createOrderObject
 * @returns {Promise<string>} Firestore document ID
 */
export const saveOrderToDatabase = async (orderData) => {
  try {
    console.log('💾 Saving order to database...', orderData.orderId);

    // First, update inventory for each item
    await updateInventoryForOrder(orderData.items);

    // Save the order
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(), // Use server timestamp
    });

    console.log('✅ Order saved successfully. Doc ID:', docRef.id);

    // Record sale for analytics (don't let this fail the order)
    try {
      await recordSaleForAnalytics(orderData, docRef.id);
    } catch (error) {
      console.error('⚠️ Failed to record sale for analytics, but order was saved:', error);
    }

    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving order:', error);
    throw new Error('Failed to save order to database');
  }
};

/**
 * Get order by document ID
 * @param {string} docId - Firestore document ID
 * @returns {Promise<Object>} Order data
 */
export const getOrderById = async (docId) => {
  try {
    console.log('📥 Fetching order by doc ID:', docId);

    const orderRef = doc(db, 'orders', docId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      const order = {
        id: orderSnap.id,
        ...orderSnap.data(),
      };
      console.log('✅ Order fetched:', order.orderId);
      return order;
    } else {
      console.warn('⚠️ Order not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    throw error;
  }
};

/**
 * Get order by order ID (ORD-...)
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order data
 */
export const getOrderByOrderId = async (orderId) => {
  try {
    console.log('📥 Fetching order by order ID:', orderId);

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', orderId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const orderDoc = snapshot.docs[0];
      const order = {
        id: orderDoc.id,
        ...orderDoc.data(),
      };
      console.log('✅ Order fetched:', order.orderId);
      return order;
    } else {
      console.warn('⚠️ Order not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    throw error;
  }
};

/**
 * Get all orders for a customer (by email)
 * @param {string} customerEmail - Customer email
 * @returns {Promise<Array>} Array of orders
 */
export const getOrdersByCustomer = async (customerEmail) => {
  try {
    console.log('📥 Fetching orders for customer:', customerEmail);

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('customer.email', '==', customerEmail));
    const snapshot = await getDocs(q);

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('✅ Orders fetched:', orders.length);
    return orders;
  } catch (error) {
    console.error('❌ Error fetching customer orders:', error);
    throw error;
  }
};

/**
 * Validate order data before saving
 * @param {Object} orderData - Order object
 * @returns {boolean} Is valid
 */
export const validateOrderData = (orderData) => {
  if (!orderData) return false;
  if (!orderData.orderId) return false;
  if (!orderData.customer || !orderData.customer.name) return false;
  if (!orderData.items || orderData.items.length === 0) return false;
  if (!orderData.billing || typeof orderData.billing.total !== 'number') return false;
  return true;
};

export default {
  generateOrderId,
  createOrderObject,
  saveOrderToDatabase,
  getOrderById,
  getOrderByOrderId,
  getOrdersByCustomer,
  validateOrderData,
};
