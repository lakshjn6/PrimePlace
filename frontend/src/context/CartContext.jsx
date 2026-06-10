import React, { createContext, useContext, useState, useCallback } from 'react';
import { cartAPI } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user }             = useAuth();
  const [cart, setCart]      = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], total: 0, count: 0 }); return; }
    setLoading(true);
    try {
      const { data } = await cartAPI.getCart();
      setCart(data);
    } catch {}
    finally { setLoading(false); }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
  const { data } = await cartAPI.addToCart(productId, quantity);  // ✅ CORRECT!
  await fetchCart();
  return data;
};

  const updateItem = async (itemId, quantity) => {
    await cartAPI.updateCart(itemId,quantity);
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await cartAPI.removeFromCart(itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartAPI.clearCart();
    setCart({ items: [], total: 0, count: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
