/**
 * Cart Service
 * Handles all cart-related business logic and calculations
 * 
 * Features:
 * - Cart calculations (subtotal, GST, delivery, total)
 * - Discount calculations
 * - Business rules (free delivery threshold, GST rate)
 * - Pure functions (no side effects)
 */

/**
 * Business Rules Configuration
 */
const BUSINESS_RULES = {
  GST_RATE: 0.18, // 18% GST
  FREE_DELIVERY_THRESHOLD: 500, // Free delivery above ₹500
  DELIVERY_CHARGE: 40, // ₹40 delivery charge
};

/**
 * Calculate subtotal from cart items
 * @param {Array} cartItems - Array of cart items
 * @returns {number} Subtotal amount
 */
export const calculateSubtotal = (cartItems = []) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return 0;
  }

  return cartItems.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return total + (price * quantity);
  }, 0);
};

/**
 * Calculate GST amount
 * @param {number} subtotal - Subtotal amount
 * @returns {number} GST amount
 */
export const calculateGST = (subtotal) => {
  const amount = parseFloat(subtotal) || 0;
  return amount * BUSINESS_RULES.GST_RATE;
};

/**
 * Calculate delivery charges based on subtotal
 * @param {number} subtotal - Subtotal amount
 * @returns {number} Delivery charge amount
 */
export const calculateDeliveryCharges = (subtotal) => {
  const amount = parseFloat(subtotal) || 0;
  return amount >= BUSINESS_RULES.FREE_DELIVERY_THRESHOLD 
    ? 0 
    : BUSINESS_RULES.DELIVERY_CHARGE;
};

/**
 * Calculate how much more needed for free delivery
 * @param {number} subtotal - Subtotal amount
 * @returns {number} Amount needed for free delivery (0 if already qualified)
 */
export const calculateAmountForFreeDelivery = (subtotal) => {
  const amount = parseFloat(subtotal) || 0;
  if (amount >= BUSINESS_RULES.FREE_DELIVERY_THRESHOLD) {
    return 0;
  }
  return BUSINESS_RULES.FREE_DELIVERY_THRESHOLD - amount;
};

/**
 * Calculate total amount (subtotal + GST + delivery)
 * @param {number} subtotal - Subtotal amount
 * @param {number} gst - GST amount
 * @param {number} delivery - Delivery charge
 * @returns {number} Total amount
 */
export const calculateTotal = (subtotal, gst, delivery) => {
  const sub = parseFloat(subtotal) || 0;
  const gstAmount = parseFloat(gst) || 0;
  const deliveryAmount = parseFloat(delivery) || 0;
  return sub + gstAmount + deliveryAmount;
};

/**
 * Calculate total savings from discounts
 * @param {Array} cartItems - Array of cart items
 * @returns {number} Total savings amount
 */
export const calculateTotalSavings = (cartItems = []) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return 0;
  }

  return cartItems.reduce((total, item) => {
    const originalPrice = parseFloat(item.originalPrice) || 0;
    const currentPrice = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;

    if (originalPrice > currentPrice) {
      return total + ((originalPrice - currentPrice) * quantity);
    }
    return total;
  }, 0);
};

/**
 * Calculate total number of items in cart
 * @param {Array} cartItems - Array of cart items
 * @returns {number} Total item count
 */
export const calculateTotalItems = (cartItems = []) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return 0;
  }

  return cartItems.reduce((total, item) => {
    const quantity = parseInt(item.quantity) || 0;
    return total + quantity;
  }, 0);
};

/**
 * Get complete cart summary with all calculations
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} Cart summary object
 */
export const getCartSummary = (cartItems = []) => {
  const subtotal = calculateSubtotal(cartItems);
  const gst = calculateGST(subtotal);
  const delivery = calculateDeliveryCharges(subtotal);
  const total = calculateTotal(subtotal, gst, delivery);
  const savings = calculateTotalSavings(cartItems);
  const itemCount = calculateTotalItems(cartItems);
  const amountForFreeDelivery = calculateAmountForFreeDelivery(subtotal);

  return {
    subtotal,
    gst,
    delivery,
    total,
    savings,
    itemCount,
    amountForFreeDelivery,
    hasFreeDelivery: delivery === 0,
  };
};

/**
 * Find cart item by product ID
 * @param {Array} cartItems - Array of cart items
 * @param {string} productId - Product ID to find
 * @returns {Object|null} Cart item or null
 */
export const findCartItem = (cartItems = [], productId) => {
  if (!Array.isArray(cartItems) || !productId) {
    return null;
  }
  return cartItems.find(item => item.id === productId) || null;
};

/**
 * Get quantity of a specific product in cart
 * @param {Array} cartItems - Array of cart items
 * @param {string} productId - Product ID
 * @returns {number} Quantity
 */
export const getProductQuantity = (cartItems = [], productId) => {
  const item = findCartItem(cartItems, productId);
  return item ? parseInt(item.quantity) || 0 : 0;
};

/**
 * Validate cart item data
 * @param {Object} item - Item to validate
 * @returns {boolean} Is valid
 */
export const isValidCartItem = (item) => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const hasId = !!item.id;
  const hasTitle = !!item.title;
  const hasPrice = typeof item.price === 'number' && item.price >= 0;

  return hasId && hasTitle && hasPrice;
};

/**
 * Business Rules Getters
 */
export const getGSTRate = () => BUSINESS_RULES.GST_RATE;
export const getFreeDeliveryThreshold = () => BUSINESS_RULES.FREE_DELIVERY_THRESHOLD;
export const getDeliveryCharge = () => BUSINESS_RULES.DELIVERY_CHARGE;

export default {
  calculateSubtotal,
  calculateGST,
  calculateDeliveryCharges,
  calculateAmountForFreeDelivery,
  calculateTotal,
  calculateTotalSavings,
  calculateTotalItems,
  getCartSummary,
  findCartItem,
  getProductQuantity,
  isValidCartItem,
  getGSTRate,
  getFreeDeliveryThreshold,
  getDeliveryCharge,
};
