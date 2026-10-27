import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartWishlistContext = createContext();

export const CartWishlistProvider = ({ children }) => {
  const { user } = useAuth();

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

  const refreshCart = async () => {
    try {
      if (user) {
        const data = await api.getCartFullDetails();
        if (data && Array.isArray(data.items)) {
          setCartData(data);
          setCartCount(data.totalCount || 0);
        }
      } else {
        const guestData = await api.getGuestCartFullDetails();
        if (guestData && Array.isArray(guestData.items)) {
          setCartData(guestData);
          setCartCount(guestData.totalCount || 0);
        }
      }
    } catch (e) {
      console.warn('[CartContext] Failed to load cart full details:', e);
    }
  };

  const refreshWishlist = async () => {
    try {
      if (user) {
        const items = await api.getWishlist();
        setWishlist(new Set(Array.isArray(items) ? items : []));
      } else {
        const items = api.getGuestWishlistItems();
        setWishlist(new Set(Array.isArray(items) ? items : []));
      }
    } catch (e) {
      console.warn('[CartContext] Failed to load wishlist:', e);
    }
  };

  // Sync on mount and whenever authentication user changes
  useEffect(() => {
    let isMounted = true;

    const syncUserData = async () => {
      if (user) {
        // Authenticated: merge any guest cart & wishlist into user's DB records
        try {
          const guestCartItems = api.getGuestCartItems();
          if (guestCartItems && guestCartItems.length > 0) {
            await api.syncCart(guestCartItems);
          }
        } catch (e) {
          console.warn('[CartContext] Guest cart merge warning:', e.message);
        }

        try {
          const guestWishlistItems = api.getGuestWishlistItems();
          if (guestWishlistItems && guestWishlistItems.length > 0) {
            await api.syncWishlist(guestWishlistItems);
          }
        } catch (e) {
          console.warn('[CartContext] Guest wishlist merge warning:', e.message);
        }

        if (isMounted) {
          await refreshCart();
          await refreshWishlist();
        }
      } else {
        // Guest visitor: load instantly from guest storage without server 401 calls
        if (isMounted) {
          try {
            const guestData = await api.getGuestCartFullDetails();
            if (isMounted && guestData && Array.isArray(guestData.items)) {
              setCartData(guestData);
              setCartCount(guestData.totalCount || 0);
            }
          } catch (e) {}

          const items = api.getGuestWishlistItems();
          if (isMounted) {
            setWishlist(new Set(Array.isArray(items) ? items : []));
          }
        }
      }
    };

    syncUserData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const showToast = (msg) => {
    if (!msg) return;
    // Keep toast messages compact and single-line (max 42 chars)
    const cleanMsg = typeof msg === 'string' && msg.length > 44
      ? msg.slice(0, 41).trim() + '...'
      : msg;
    setToastMessage(cleanMsg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === cleanMsg ? null : prev));
    }, 2500);
  };

  const toggleWishlist = async (productId) => {
    if (!productId) return;
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
      console.warn('[Wishlist] Toggle failed:', e);
    }
  };

  const addToCart = async (productId, quantity = 1, size = '') => {
    try {
      await api.addToCart(productId, quantity, size);
      await refreshCart();
      showToast('Added to cart');
    } catch (e) {
      showToast(e.message || 'Could not add item to cart');
    }
  };

  const updateCartQuantity = async (productId, quantity, size = '') => {
    try {
      await api.updateCartQuantity(productId, quantity, size);
      await refreshCart();
      if (quantity <= 0) {
        showToast('Item removed from cart');
      }
    } catch (e) {
      console.warn('[CartContext] Update quantity failed:', e);
    }
  };

  const removeFromCart = async (productId, size = '') => {
    try {
      await api.removeFromCart(productId, size);
      await refreshCart();
      showToast('Item removed from cart');
    } catch (e) {
      console.warn('[CartContext] Remove item failed:', e);
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      await refreshCart();
      showToast('Cart cleared');
    } catch (e) {
      console.warn('[CartContext] Clear cart failed:', e);
    }
  };

  const addComboToCart = async (items = [], customToast = 'Combo bundle added to cart') => {
    try {
      await api.addComboToCart(items);
      await refreshCart();
      showToast(customToast);
    } catch (e) {
      console.warn('[CartContext] Add combo failed:', e);
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
