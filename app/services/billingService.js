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

import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

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
 * @returns {Object} Order object
 */
export const createOrderObject = ({ customerName, customerEmail, customerPhone, items, summary }) => {
  const orderId = generateOrderId();
  const orderDate = new Date().toISOString();

  return {
    orderId,
    orderDate,
    customer: {
      name: customerName,
      email: customerEmail || '',
      phone: customerPhone || '',
    },
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice || null,
      quantity: item.quantity,
      imageUrl: item.imageUrl || null,
      total: item.price * item.quantity,
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
    status: 'pending', // pending, confirmed, delivered, cancelled
    paymentStatus: 'pending', // pending, paid, failed
    createdAt: orderDate,
  };
};

/**
 * Save order to Firebase Firestore
 * @param {Object} orderData - Order object from createOrderObject
 * @returns {Promise<string>} Firestore document ID
 */
export const saveOrderToDatabase = async (orderData) => {
  try {
    console.log('💾 Saving order to database...', orderData.orderId);

    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(), // Use server timestamp
    });

    console.log('✅ Order saved successfully. Doc ID:', docRef.id);
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
