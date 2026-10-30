import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartWishlistContext = createContext();

const CART_CACHE_KEY = 'asm_cart_cache';

const getInitialCartData = () => {
  try {
    const raw = localStorage.getItem(CART_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (e) {}
  return {
    items: [],
    totalCount: 0,
    totalMRP: 0,
    totalPrice: 0,
    totalDiscount: 0
  };
};

const saveCartToCache = (data) => {
  try {
    if (data && Array.isArray(data.items)) {
      localStorage.setItem(CART_CACHE_KEY, JSON.stringify(data));
    }
  } catch (e) {}
};

const clearCartCache = () => {
  try {
    localStorage.removeItem(CART_CACHE_KEY);
  } catch (e) {}
};

export const CartWishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartData, setCartData] = useState(getInitialCartData);
  const [cartCount, setCartCount] = useState(() => {
    const initial = getInitialCartData();
    return initial.totalCount || initial.items?.length || 0;
  });
  const [isCartLoading, setIsCartLoading] = useState(() => {
    const initial = getInitialCartData();
    return initial.items.length === 0;
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

  const refreshCart = async (showLoadingIfEmpty = false) => {
    if (!user) {
      const empty = {
        items: [],
        totalCount: 0,
        totalMRP: 0,
        totalPrice: 0,
        totalDiscount: 0
      };
      setCartData(empty);
      setCartCount(0);
      clearCartCache();
      setIsCartLoading(false);
      return;
    }

    if (showLoadingIfEmpty && cartData.items.length === 0) {
      setIsCartLoading(true);
    }

    try {
      const data = await api.getCartFullDetails();
      if (data && Array.isArray(data.items)) {
        setCartData(data);
        setCartCount(data.totalCount || data.items.length || 0);
        saveCartToCache(data);
      }
    } catch (e) {
      console.warn('[CartContext] Failed to load cart full details:', e.message);
    } finally {
      setIsCartLoading(false);
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
      refreshCart(cartData.items.length === 0);
      refreshWishlist();
    } else {
      const empty = {
        items: [],
        totalCount: 0,
        totalMRP: 0,
        totalPrice: 0,
        totalDiscount: 0
      };
      setCartData(empty);
      setCartCount(0);
      clearCartCache();
      setWishlist(new Set());
      setIsCartLoading(false);
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

  const addToCart = async (productId, quantity = 1, size = '', productSnapshot = null) => {
    if (!user) {
      showToast('Please login to add items to cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Instant optimistic update if productSnapshot is provided
    if (productSnapshot) {
      setCartData((prev) => {
        const items = [...(prev.items || [])];
        const existingIdx = items.findIndex(
          (it) =>
            (it.productId === productId || it.product?.id === productId) &&
            (it.size || '') === (size || '')
        );
        const unitPrice = productSnapshot.price || 0;
        const unitMRP = productSnapshot.originalPrice || productSnapshot.price || 0;
        const addQty = quantity || 1;

        if (existingIdx > -1) {
          const cur = items[existingIdx];
          const newQty = (cur.quantity || 1) + addQty;
          items[existingIdx] = {
            ...cur,
            quantity: newQty,
            itemTotal: unitPrice * newQty,
            itemMRP: unitMRP * newQty,
            itemSavings: (unitMRP - unitPrice) * newQty
          };
        } else {
          items.push({
            productId,
            size: size || '',
            quantity: addQty,
            product: {
              id: productSnapshot.id || productId,
              name: productSnapshot.name,
              shortName: productSnapshot.shortName,
              price: unitPrice,
              originalPrice: unitMRP,
              image: productSnapshot.image,
              category: productSnapshot.category,
              inStock: true
            },
            itemTotal: unitPrice * addQty,
            itemMRP: unitMRP * addQty,
            itemSavings: (unitMRP - unitPrice) * addQty
          });
        }

        const newCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
        const newTotal = items.reduce((sum, it) => sum + (it.itemTotal || 0), 0);
        const newMRP = items.reduce((sum, it) => sum + (it.itemMRP || 0), 0);
        const optimistic = {
          items,
          totalCount: newCount,
          totalPrice: newTotal,
          totalMRP: newMRP,
          totalDiscount: Math.max(0, newMRP - newTotal)
        };
        saveCartToCache(optimistic);
        setCartCount(newCount);
        return optimistic;
      });
      setIsCartLoading(false);
    }

    try {
      // Direct call to backend addToCart which returns full updated cartData!
      const res = await api.addToCart(productId, quantity, size);
      if (res && res.success && Array.isArray(res.items)) {
        setCartData(res);
        setCartCount(res.totalCount || res.items.length || 0);
        saveCartToCache(res);
      } else {
        await refreshCart();
      }
      showToast('Added to cart');
    } catch (e) {
      showToast(e.message || 'Could not add item to cart');
      await refreshCart();
    }
  };

  const updateCartQuantity = async (productId, quantity, size = '') => {
    if (!user) {
      showToast('Please login to update cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Instant optimistic update
    setCartData((prev) => {
      let items = [...(prev.items || [])];
      if (quantity <= 0) {
        items = items.filter(
          (it) => !(it.productId === productId && (it.size || '') === (size || ''))
        );
      } else {
        items = items.map((it) => {
          if (it.productId === productId && (it.size || '') === (size || '')) {
            const unitPrice = it.product?.price || (it.itemTotal / it.quantity) || 0;
            const unitMRP = it.product?.originalPrice || (it.itemMRP / it.quantity) || unitPrice;
            return {
              ...it,
              quantity,
              itemTotal: unitPrice * quantity,
              itemMRP: unitMRP * quantity,
              itemSavings: (unitMRP - unitPrice) * quantity
            };
          }
          return it;
        });
      }
      const newCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
      const newTotal = items.reduce((sum, it) => sum + (it.itemTotal || 0), 0);
      const newMRP = items.reduce((sum, it) => sum + (it.itemMRP || 0), 0);
      const updated = {
        items,
        totalCount: newCount,
        totalPrice: newTotal,
        totalMRP: newMRP,
        totalDiscount: Math.max(0, newMRP - newTotal)
      };
      setCartCount(newCount);
      saveCartToCache(updated);
      return updated;
    });

    try {
      const res = await api.updateCartQuantity(productId, quantity, size);
      if (res && res.success && Array.isArray(res.items)) {
        setCartData(res);
        setCartCount(res.totalCount || res.items.length || 0);
        saveCartToCache(res);
      }
      if (quantity <= 0) {
        showToast('Item removed from cart');
      }
    } catch (e) {
      showToast(e.message || 'Update quantity failed');
      await refreshCart();
    }
  };

  const removeFromCart = async (productId, size = '') => {
    if (!user) {
      showToast('Please login to manage cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Instant optimistic removal
    setCartData((prev) => {
      const items = (prev.items || []).filter(
        (it) => !(it.productId === productId && (it.size || '') === (size || ''))
      );
      const newCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
      const newTotal = items.reduce((sum, it) => sum + (it.itemTotal || 0), 0);
      const newMRP = items.reduce((sum, it) => sum + (it.itemMRP || 0), 0);
      const updated = {
        items,
        totalCount: newCount,
        totalPrice: newTotal,
        totalMRP: newMRP,
        totalDiscount: Math.max(0, newMRP - newTotal)
      };
      setCartCount(newCount);
      saveCartToCache(updated);
      return updated;
    });

    try {
      const res = await api.removeFromCart(productId, size);
      if (res && res.success && Array.isArray(res.items)) {
        setCartData(res);
        setCartCount(res.totalCount || res.items.length || 0);
        saveCartToCache(res);
      }
      showToast('Item removed from cart');
    } catch (e) {
      showToast(e.message || 'Remove item failed');
      await refreshCart();
    }
  };

  const clearCart = async () => {
    if (!user) {
      showToast('Please login to manage cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    const empty = {
      items: [],
      totalCount: 0,
      totalMRP: 0,
      totalPrice: 0,
      totalDiscount: 0
    };
    setCartData(empty);
    setCartCount(0);
    clearCartCache();

    try {
      await api.clearCart();
      showToast('Cart cleared');
    } catch (e) {
      showToast(e.message || 'Clear cart failed');
      await refreshCart();
    }
  };

  const addComboToCart = async (items = [], customToast = 'Combo bundle added to cart') => {
    if (!user) {
      showToast('Please login to add items to cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      const res = await api.addComboToCart(items);
      if (res && res.success && Array.isArray(res.items)) {
        setCartData(res);
        setCartCount(res.totalCount || res.items.length || 0);
        saveCartToCache(res);
      } else {
        await refreshCart();
      }
      showToast(customToast);
    } catch (e) {
      showToast(e.message || 'Add combo failed');
      await refreshCart();
    }
  };

  return (
    <CartWishlistContext.Provider
      value={{
        cartCount,
        cartData,
        isCartLoading,
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
