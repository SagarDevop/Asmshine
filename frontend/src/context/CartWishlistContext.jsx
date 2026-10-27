import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartWishlistContext = createContext();

export const CartWishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [cartData, setCartData] = useState({
    items: [],
    totalCount: 0,
    totalMRP: 0,
    totalPrice: 0,
    totalDiscount: 0
  });
  const [wishlist, setWishlist] = useState(new Set());
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    if (!msg) return;
    const cleanMsg = typeof msg === 'string' && msg.length > 44
      ? msg.slice(0, 41).trim() + '...'
      : msg;
    setToastMessage(cleanMsg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === cleanMsg ? null : prev));
    }, 2500);
  };

  const refreshCart = async () => {
    if (!user) {
      setCartData({
        items: [],
        totalCount: 0,
        totalMRP: 0,
        totalPrice: 0,
        totalDiscount: 0
      });
      setCartCount(0);
      return;
    }

    try {
      const data = await api.getCartFullDetails();
      if (data && Array.isArray(data.items)) {
        setCartData(data);
        setCartCount(data.totalCount || 0);
      }
    } catch (e) {
      console.warn('[CartContext] Failed to load cart full details:', e.message);
    }
  };

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist(new Set());
      return;
    }

    try {
      const items = await api.getWishlist();
      setWishlist(new Set(Array.isArray(items) ? items : []));
    } catch (e) {
      console.warn('[CartContext] Failed to load wishlist:', e.message);
    }
  };

  // Sync whenever user state changes (login / logout)
  useEffect(() => {
    let isMounted = true;

    if (user) {
      refreshCart();
      refreshWishlist();
    } else {
      setCartData({
        items: [],
        totalCount: 0,
        totalMRP: 0,
        totalPrice: 0,
        totalDiscount: 0
      });
      setCartCount(0);
      setWishlist(new Set());
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!productId) return;
    if (!user) {
      showToast('Please login to save to wishlist');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      const res = await api.toggleWishlist(productId);
      setWishlist((prev) => {
        const next = new Set(prev);
        if (res && res.inWishlist !== undefined) {
          if (res.inWishlist) next.add(productId);
          else next.delete(productId);
        } else {
          if (next.has(productId)) next.delete(productId);
          else next.add(productId);
        }
        return next;
      });
      showToast(res?.message || (wishlist.has(productId) ? 'Removed from wishlist' : 'Saved to wishlist'));
    } catch (e) {
      showToast(e.message || 'Wishlist update failed');
    }
  };

  const addToCart = async (productId, quantity = 1, size = '') => {
    if (!user) {
      showToast('Please login to add items to cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      await api.addToCart(productId, quantity, size);
      await refreshCart();
      showToast('Added to cart');
    } catch (e) {
      showToast(e.message || 'Could not add item to cart');
    }
  };

  const updateCartQuantity = async (productId, quantity, size = '') => {
    if (!user) {
      showToast('Please login to update cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      await api.updateCartQuantity(productId, quantity, size);
      await refreshCart();
      if (quantity <= 0) {
        showToast('Item removed from cart');
      }
    } catch (e) {
      showToast(e.message || 'Update quantity failed');
    }
  };

  const removeFromCart = async (productId, size = '') => {
    if (!user) {
      showToast('Please login to manage cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      await api.removeFromCart(productId, size);
      await refreshCart();
      showToast('Item removed from cart');
    } catch (e) {
      showToast(e.message || 'Remove item failed');
    }
  };

  const clearCart = async () => {
    if (!user) {
      showToast('Please login to manage cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      await api.clearCart();
      await refreshCart();
      showToast('Cart cleared');
    } catch (e) {
      showToast(e.message || 'Clear cart failed');
    }
  };

  const addComboToCart = async (items = [], customToast = 'Combo bundle added to cart') => {
    if (!user) {
      showToast('Please login to add items to cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      await api.addComboToCart(items);
      await refreshCart();
      showToast(customToast);
    } catch (e) {
      showToast(e.message || 'Add combo failed');
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
        refreshWishlist,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
};

export const useCartWishlist = () => useContext(CartWishlistContext);
