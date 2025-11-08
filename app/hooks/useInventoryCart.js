/**
 * Enhanced Cart Hook with Inventory Integration
 * Extends the existing cart functionality with stock validation and inventory tracking
 * 
 * Features:
 * - Real-time stock validation
 * - Automatic stock status updates
 * - Out of stock prevention
 * - Cart item availability checking
 * - Order processing integration
 */

import { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useCart } from '../../contexts/CartContext';
import { InventoryService } from '../services/inventoryService';
import { OrderProcessingService } from '../services/orderProcessingService';

const InventoryCartContext = createContext();

export const useInventoryCart = () => {
  const context = useContext(InventoryCartContext);
  if (!context) {
    throw new Error('useInventoryCart must be used within an InventoryCartProvider');
  }
  return context;
};

export const InventoryCartProvider = ({ children }) => {
  const cart = useCart();
  const [stockStatuses, setStockStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [cartValidation, setCartValidation] = useState({
    isValid: true,
    issues: []
  });

  // Enhanced add to cart with stock validation
  const addToCartWithValidation = async (product) => {
    try {
      setLoading(true);
      
      // Check stock availability
      const inventory = await InventoryService.getProductInventory(product.id);
      
      if (!inventory) {
        Toast.show({
          type: 'error',
          text1: 'Product Not Found',
          text2: 'This product is not available in inventory',
        });
        return false;
      }

      if (inventory.isOutOfStock) {
        Toast.show({
          type: 'error',
          text1: 'Out of Stock',
          text2: `${product.title} is currently out of stock`,
        });
        return false;
      }

      // Check if adding this item would exceed available stock
      const currentQuantityInCart = cart.getItemQuantity(product.id);
      const requestedQuantity = currentQuantityInCart + 1;

      if (requestedQuantity > inventory.quantity) {
        Toast.show({
          type: 'error',
          text1: 'Insufficient Stock',
          text2: `Only ${inventory.quantity} items available. You have ${currentQuantityInCart} in cart.`,
        });
        return false;
      }

      // Show low stock warning
      if (inventory.isLowStock && requestedQuantity === inventory.quantity) {
        Toast.show({
          type: 'info',
          text1: 'Last Item',
          text2: `This is the last ${product.title} in stock!`,
        });
      }

      // Add to cart using original cart function
      cart.addToCart(product);
      
      // Update local stock status
      updateStockStatus(product.id, inventory);
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add item to cart',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced remove from cart
  const removeFromCartWithValidation = (productId) => {
    cart.removeFromCart(productId);
    // Refresh stock status after removal
    refreshStockStatus(productId);
  };

  // Update quantity with stock validation
  const updateQuantityWithValidation = async (productId, newQuantity) => {
    try {
      const inventory = await InventoryService.getProductInventory(productId);
      
      if (!inventory) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Product not found in inventory',
        });
        return false;
      }

      if (newQuantity > inventory.quantity) {
        Toast.show({
          type: 'error',
          text1: 'Insufficient Stock',
          text2: `Only ${inventory.quantity} items available`,
        });
        return false;
      }

      cart.updateQuantity(productId, newQuantity);
      updateStockStatus(productId, inventory);
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  };

  // Validate entire cart before checkout
  const validateCartStock = async () => {
    try {
      setLoading(true);
      
      const stockValidation = await OrderProcessingService.getCartStockStatus(cart.cartItems);
      
      const issues = stockValidation.filter(item => !item.isAvailable);
      const isValid = issues.length === 0;

      const validation = {
        isValid,
        issues: issues.map(item => ({
          productId: item.productId,
          title: item.title,
          requestedQuantity: item.requestedQuantity,
          availableQuantity: item.availableQuantity,
          isOutOfStock: item.isOutOfStock,
          message: item.isOutOfStock 
            ? `${item.title} is out of stock`
            : `${item.title}: Only ${item.availableQuantity} available, but ${item.requestedQuantity} requested`
        }))
      };

      setCartValidation(validation);
      
      // Update stock statuses for all items
      stockValidation.forEach(item => {
        setStockStatuses(prev => ({
          ...prev,
          [item.productId]: {
            quantity: item.availableQuantity,
            isOutOfStock: item.isOutOfStock,
            isLowStock: item.availableQuantity <= 5 && item.availableQuantity > 0,
            isAvailable: item.isAvailable,
            maxOrderQuantity: item.maxOrderQuantity
          }
        }));
      });

      return validation;
    } catch (error) {
      console.error('Error validating cart:', error);
      return { isValid: false, issues: [] };
    } finally {
      setLoading(false);
    }
  };

  // Process order with inventory integration
  const processOrderWithInventory = async (orderDetails) => {
    try {
      setLoading(true);

      // Final stock validation
      const validation = await validateCartStock();
      if (!validation.isValid) {
        Toast.show({
          type: 'error',
          text1: 'Cart Validation Failed',
          text2: 'Some items are no longer available',
        });
        return { success: false, validation };
      }

      // Process the order
      const orderResult = await OrderProcessingService.processOrder({
        ...orderDetails,
        items: cart.cartItems
      });

      if (orderResult.success) {
        // Clear cart after successful order
        cart.clearCart();
        
        // Show success message
        Toast.show({
          type: 'success',
          text1: 'Order Placed',
          text2: `Order #${orderResult.order.id} placed successfully`,
        });

        // Show stock alerts if any
        if (orderResult.lowStockAlerts.length > 0) {
          Toast.show({
            type: 'info',
            text1: 'Low Stock Alert',
            text2: `${orderResult.lowStockAlerts.length} items are running low`,
          });
        }
      }

      return orderResult;
    } catch (error) {
      console.error('Error processing order:', error);
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: 'Failed to process your order',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update stock status for a product
  const updateStockStatus = (productId, inventory) => {
    setStockStatuses(prev => ({
      ...prev,
      [productId]: {
        quantity: inventory.quantity,
        isOutOfStock: inventory.isOutOfStock,
        isLowStock: inventory.isLowStock,
        lowStockThreshold: inventory.lowStockThreshold,
        lastUpdated: new Date()
      }
    }));
  };

  // Refresh stock status for a specific product
  const refreshStockStatus = async (productId) => {
    try {
      const inventory = await InventoryService.getProductInventory(productId);
      if (inventory) {
        updateStockStatus(productId, inventory);
      }
    } catch (error) {
      console.error('Error refreshing stock status:', error);
    }
  };

  // Refresh all stock statuses
  const refreshAllStockStatuses = async () => {
    try {
      setLoading(true);
      const promises = cart.cartItems.map(item => refreshStockStatus(item.id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error refreshing all stock statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get stock status for a product
  const getStockStatus = (productId) => {
    return stockStatuses[productId] || null;
  };

  // Check if product is available for purchase
  const isProductAvailable = (productId, requestedQuantity = 1) => {
    const status = stockStatuses[productId];
    if (!status) return true; // Assume available if no status data
    
    return !status.isOutOfStock && status.quantity >= requestedQuantity;
  };

  // Get cart summary with stock information
  const getCartSummaryWithStock = () => {
    const cartSummary = {
      ...cart,
      stockInfo: {
        totalAvailable: 0,
        outOfStockItems: 0,
        lowStockItems: 0,
        stockIssues: []
      }
    };

    cart.cartItems.forEach(item => {
      const stockStatus = stockStatuses[item.id];
      if (stockStatus) {
        if (stockStatus.isOutOfStock) {
          cartSummary.stockInfo.outOfStockItems++;
          cartSummary.stockInfo.stockIssues.push({
            productId: item.id,
            title: item.title,
            issue: 'out_of_stock'
          });
        } else if (stockStatus.isLowStock) {
          cartSummary.stockInfo.lowStockItems++;
          cartSummary.stockInfo.stockIssues.push({
            productId: item.id,
            title: item.title,
            issue: 'low_stock',
            available: stockStatus.quantity
          });
        } else {
          cartSummary.stockInfo.totalAvailable++;
        }
      } else {
        cartSummary.stockInfo.totalAvailable++;
      }
    });

    return cartSummary;
  };

  // Auto-refresh stock statuses when cart items change
  useEffect(() => {
    const refreshStockStatuses = async () => {
      if (cart.cartItems.length > 0) {
        try {
          setLoading(true);
          const promises = cart.cartItems.map(async (item) => {
            try {
              const inventory = await InventoryService.getProductInventory(item.id);
              if (inventory) {
                setStockStatuses(prev => ({
                  ...prev,
                  [item.id]: {
                    quantity: inventory.quantity,
                    isOutOfStock: inventory.isOutOfStock,
                    isLowStock: inventory.isLowStock,
                    lowStockThreshold: inventory.lowStockThreshold,
                    lastUpdated: new Date()
                  }
                }));
              }
            } catch (error) {
              console.error('Error refreshing stock status:', error);
            }
          });
          await Promise.all(promises);
        } catch (error) {
          console.error('Error refreshing all stock statuses:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    refreshStockStatuses();
  }, [cart.cartItems]);

  const value = {
    // Original cart functions
    ...cart,
    
    // Enhanced functions with inventory integration
    addToCart: addToCartWithValidation,
    removeFromCart: removeFromCartWithValidation,
    updateQuantity: updateQuantityWithValidation,
    
    // New inventory-related functions
    validateCartStock,
    processOrderWithInventory,
    refreshStockStatus,
    refreshAllStockStatuses,
    getStockStatus,
    isProductAvailable,
    getCartSummaryWithStock,
    
    // State
    stockStatuses,
    cartValidation,
    loading
  };

  return (
    <InventoryCartContext.Provider value={value}>
      {children}
    </InventoryCartContext.Provider>
  );
};

// Custom hook for using inventory-aware cart in components
export const useInventoryAwareCart = () => {
  return useInventoryCart();
};

export default useInventoryCart;