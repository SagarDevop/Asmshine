// ASM SHINE - Client API Layer (Connected to Express REST API & MongoDB Database)

// Base API configuration (Supports Vercel & Render production hosting)
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
  ? String(import.meta.env.VITE_API_URL).trim() 
  : '').replace(/\/$/, '');

const getAuthHeaders = (extraHeaders = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cleanora_token') : null;
  return {
    ...extraHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const hasAuthToken = () => {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem('cleanora_token'));
};

const apiFetch = (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  return fetch(url, {
    ...options,
    headers: getAuthHeaders(options.headers || {}),
    credentials: 'include'
  });
};

// API Service Layer (Connected to Express REST API & MongoDB Database)
export const api = {
  // -------------------------------------------------------------
  // Authentication Endpoints
  // -------------------------------------------------------------
  register: async ({ name, email, password }) => {
    const res = await apiFetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('cleanora_token', data.token);
    }
    return data;
  },

  login: async ({ email, password }) => {
    const res = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('cleanora_token', data.token);
    }
    return data;
  },

  googleAuth: async (credential) => {
    const res = await apiFetch('/api/v1/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ credential })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Google sign-in failed');
    }
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('cleanora_token', data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      const res = await apiFetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await res.json().catch(() => ({}));
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cleanora_token');
      }
      return data;
    } catch (e) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cleanora_token');
      }
      return { success: true };
    }
  },

  getCurrentUser: async () => {
    if (!hasAuthToken()) {
      return null;
    }
    const res = await apiFetch('/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.status === 401) {
      return null;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch current user profile');
    }
    return data.user || null;
  },

  // Email OTP Signup Endpoints
  sendSignupOtp: async ({ name, email, password }) => {
    const res = await apiFetch('/api/v1/auth/signup/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to send verification code');
      err.cooldownRemaining = data.cooldownRemaining;
      throw err;
    }
    return data;
  },

  verifySignupOtp: async ({ email, otp }) => {
    const res = await apiFetch('/api/v1/auth/signup/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Verification failed');
    }
    return data;
  },

  resendSignupOtp: async (email) => {
    const res = await apiFetch('/api/v1/auth/signup/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to resend code');
      err.cooldownRemaining = data.cooldownRemaining;
      throw err;
    }
    return data;
  },

  // Account Profile & Address API
  updateProfile: async ({ name, phone }) => {
    const res = await apiFetch('/api/v1/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name, phone })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
    return data.user;
  },

  getAddresses: async () => {
    if (!hasAuthToken()) {
      return [];
    }
    const res = await apiFetch('/api/v1/auth/addresses', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch addresses');
    }
    return data.data || [];
  },

  addAddress: async (addressData) => {
    const res = await apiFetch('/api/v1/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(addressData)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to save address');
    }
    return data.data;
  },

  deleteAddress: async (addressId) => {
    const res = await apiFetch(`/api/v1/auth/addresses/${encodeURIComponent(addressId)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete address');
    }
    return data.data;
  },

  // -------------------------------------------------------------
  // Dynamic Catalog API (Pure Backend MongoDB - Zero Hardcoded Data)
  // -------------------------------------------------------------

  getProducts: async (filters = {}) => {
    const { category, search } = filters;
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await apiFetch(`/api/v1/products${queryString}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch products (HTTP ${res.status})`);
    }
    const result = await res.json();
    return result.data || [];
  },

  getProductById: async (id) => {
    if (!id) return null;
    const res = await apiFetch(`/api/v1/products/${encodeURIComponent(id)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      return null;
    }
    const result = await res.json();
    return result.data || null;
  },

  getSimilarProducts: async (productId, category) => {
    try {
      const products = await api.getProducts({ category });
      const others = products.filter((p) => p.id !== productId && p._id !== productId);
      if (others.length >= 3) return others.slice(0, 4);

      const all = await api.getProducts();
      return all.filter((p) => p.id !== productId && p._id !== productId).slice(0, 4);
    } catch (e) {
      return [];
    }
  },

  getComboDetails: async (productId) => {
    try {
      const mainProduct = await api.getProductById(productId);
      if (!mainProduct) return null;

      let companionProduct = null;
      if (mainProduct.companionId) {
        companionProduct = await api.getProductById(mainProduct.companionId);
      }
      if (!companionProduct) {
        const all = await api.getProducts();
        companionProduct = all.find((p) => p.id !== productId && p._id !== productId) || null;
      }
      if (!companionProduct) return null;

      const combinedOriginal = (mainProduct.originalPrice || mainProduct.price) + (companionProduct.originalPrice || companionProduct.price);
      const combinedStandardPrice = mainProduct.price + companionProduct.price;
      const discount = mainProduct.comboDiscount || 50;
      const comboPrice = Math.max(combinedStandardPrice - discount, 149);
      const totalSavings = combinedOriginal - comboPrice;

      return {
        mainProduct,
        companionProduct,
        combinedOriginal,
        combinedStandardPrice,
        comboPrice,
        totalSavings,
        discount
      };
    } catch (e) {
      return null;
    }
  },

  getCategories: async () => {
    const res = await apiFetch('/api/v1/categories', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      return [];
    }
    const result = await res.json();
    return result.data || [];
  },

  getBanners: async () => {
    const res = await apiFetch('/api/v1/banners', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      return null;
    }
    const result = await res.json();
    return result.data || null;
  },

  // -------------------------------------------------------------
  // Persistent Cart API (MongoDB Per-User - Strictly Authenticated)
  // -------------------------------------------------------------

  getCart: async () => {
    if (!hasAuthToken()) {
      return { totalCount: 0, data: [] };
    }
    try {
      const res = await apiFetch('/api/v1/cart', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        return {
          totalCount: data.totalCount || 0,
          data: data.items || data.data || []
        };
      }
    } catch (e) {}
    return { totalCount: 0, data: [] };
  },

  getCartFullDetails: async () => {
    if (!hasAuthToken()) {
      return {
        items: [],
        totalCount: 0,
        totalMRP: 0,
        totalPrice: 0,
        totalDiscount: 0
      };
    }
    const res = await apiFetch('/api/v1/cart', {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error(`Failed to load cart (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data && data.success
      ? data
      : { items: [], totalCount: 0, totalMRP: 0, totalPrice: 0, totalDiscount: 0 };
  },

  addToCart: async (productId, quantity = 1, size = '') => {
    if (!hasAuthToken()) {
      throw new Error('Please login to add items to your cart');
    }
    const res = await apiFetch('/api/v1/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity, size })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to add item to cart');
    }
    return await res.json();
  },

  updateCartQuantity: async (productId, quantity, size = '') => {
    if (!hasAuthToken()) {
      throw new Error('Please login to update cart');
    }
    const res = await apiFetch('/api/v1/cart/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity, size })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update item quantity');
    }
    return await res.json();
  },

  removeFromCart: async (productId, size = '') => {
    if (!hasAuthToken()) {
      throw new Error('Please login to remove items from cart');
    }
    const query = size ? `?size=${encodeURIComponent(size)}` : '';
    const res = await apiFetch(`/api/v1/cart/remove/${encodeURIComponent(productId)}${query}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to remove item from cart');
    }
    return await res.json();
  },

  clearCart: async () => {
    if (!hasAuthToken()) {
      return { success: true, totalCount: 0, items: [] };
    }
    const res = await apiFetch('/api/v1/cart/clear', {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to clear cart');
    }
    return await res.json();
  },

  addComboToCart: async (items = []) => {
    if (!hasAuthToken()) {
      throw new Error('Please login to add items to your cart');
    }
    for (const item of items) {
      await api.addToCart(item.productId, item.quantity || 1, item.size || '');
    }
    return api.getCartFullDetails();
  },

  syncCart: async (items = []) => {
    if (!hasAuthToken() || !Array.isArray(items) || items.length === 0) {
      return api.getCartFullDetails();
    }
    const res = await apiFetch('/api/v1/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ items })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to sync cart with server.');
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // Persistent Wishlist API (MongoDB Per-User)
  // -------------------------------------------------------------

  getWishlist: async () => {
    if (!hasAuthToken()) {
      return [];
    }
    try {
      const res = await apiFetch('/api/v1/auth/wishlist', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        return data.wishlist || [];
      }
    } catch (e) {}
    return [];
  },

  toggleWishlist: async (productId) => {
    if (!hasAuthToken()) {
      throw new Error('Please login to save items to your wishlist');
    }
    const res = await apiFetch('/api/v1/auth/wishlist/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ productId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update wishlist');
    }
    return await res.json();
  },

  syncWishlist: async (productIds = []) => {
    if (!hasAuthToken() || !Array.isArray(productIds) || productIds.length === 0) {
      return api.getWishlist();
    }
    const res = await apiFetch('/api/v1/auth/wishlist/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ productIds })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to sync wishlist with server.');
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // Genuine Order Management API (MongoDB Backed)
  // -------------------------------------------------------------

  createOrder: async (orderPayload) => {
    const res = await apiFetch('/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Failed to create order (HTTP ${res.status})`);
    }
    return data;
  },

  getOrders: async () => {
    if (!hasAuthToken()) {
      return [];
    }
    const res = await apiFetch('/api/v1/orders', {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch order history');
    }
    return data.orders || data.data || [];
  },

  getOrderById: async (orderId) => {
    if (!hasAuthToken()) {
      return null;
    }
    const res = await apiFetch(`/api/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch order details');
    }
    return data.order || null;
  }
};
