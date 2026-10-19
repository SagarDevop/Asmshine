import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartWishlistContext = createContext();

export const CartWishlistProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(2);
  const [cartData, setCartData] = useState({
    items: [],
    totalCount: 0,
    totalMRP: 0,
    totalPrice: 0,
    totalDiscount: 0
  });
  const [wishlist, setWishlist] = useState(new Set());
  const [toastMessage, setToastMessage] = useState(null);

  const refreshCart = async () => {
    try {
      const data = await api.getCartFullDetails();
      if (data) {
        setCartData(data);
        setCartCount(data.totalCount);
      }
    } catch (e) {
      console.warn('[CartContext] Failed to load cart full details:', e);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        showToast('Removed from wishlist');
      } else {
        next.add(productId);
        showToast('Saved to wishlist');
      }
      return next;
    });
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.addToCart(productId, quantity);
      await refreshCart();
      showToast('Added to cart');
    } catch (e) {
      // ignore
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      await api.updateCartQuantity(productId, quantity);
      await refreshCart();
      if (quantity === 0) {
        showToast('Item removed from cart');
      }
    } catch (e) {
      // ignore
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.removeFromCart(productId);
      await refreshCart();
      showToast('Item removed from cart');
    } catch (e) {
      // ignore
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      await refreshCart();
      showToast('Cart cleared');
    } catch (e) {
      // ignore
    }
  };

  const addComboToCart = async (items = [], customToast = 'Combo bundle added to cart') => {
    try {
      await api.addComboToCart(items);
      await refreshCart();
      showToast(customToast);
    } catch (e) {
      // ignore
    }
  };

  return (
    <CartWishlistContext.Provider
      value={{
        cartCount,
        cartData,
        wishlist,
        toggleWishlist,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        addComboToCart,
        refreshCart,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
};

export const useCartWishlist = () => useContext(CartWishlistContext);
