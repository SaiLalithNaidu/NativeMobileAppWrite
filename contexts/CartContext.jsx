import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get current user from AuthContext

  // Load cart from AsyncStorage when user changes
  useEffect(() => {
    if (user) {
      loadCart(user.uid);
    } else {
      // Clear cart when user logs out
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!loading && user) {
      saveCart(user.uid);
    }
  }, [cartItems, user]);

  const loadCart = async (userId) => {
    try {
      const cartKey = `cart_${userId}`; // User-specific cart key
      const savedCart = await AsyncStorage.getItem(cartKey);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]); // Empty cart for new user
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (userId) => {
    try {
      const cartKey = `cart_${userId}`; // User-specific cart key
      await AsyncStorage.setItem(cartKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        // Increase quantity
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        Toast.show({
          type: 'success',
          text1: 'Added to Cart',
          text2: `${product.title} added to cart`,
          position: 'bottom',
          visibilityTime: 2000,
        });
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        // Decrease quantity
        return prevItems.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        // Remove item completely
        const item = prevItems.find((item) => item.id === productId);
        if (item) {
          Toast.show({
            type: 'info',
            text1: 'Removed from Cart',
            text2: `${item.title} removed from cart`,
            position: 'bottom',
            visibilityTime: 2000,
          });
        }
        return prevItems.filter((item) => item.id !== productId);
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    // Also clear from AsyncStorage
    if (user) {
      try {
        const cartKey = `cart_${user.uid}`;
        await AsyncStorage.removeItem(cartKey);
      } catch (error) {
        console.error('Error clearing cart from storage:', error);
      }
    }
    Toast.show({
      type: 'info',
      text1: 'Cart Cleared',
      text2: 'All items removed from cart',
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getGST = () => {
    const subtotal = getSubtotal();
    return subtotal * 0.18; // 18% GST
  };

  const getDeliveryCharges = () => {
    const subtotal = getSubtotal();
    // Free delivery above ₹500
    return subtotal >= 500 ? 0 : 40;
  };

  const getTotal = () => {
    return getSubtotal() + getGST() + getDeliveryCharges();
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    getTotalItems,
    getSubtotal,
    getGST,
    getDeliveryCharges,
    getTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
