// ASM SHINE — Dedicated Admin API Client
const getApiBase = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '') {
    return String(import.meta.env.VITE_API_URL).trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://asmshine.onrender.com';
  }
  return '';
};

const API_BASE = getApiBase();

const getAdminHeaders = (extra = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('asm_admin_token') : null;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const adminFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: getAdminHeaders(options.headers || {})
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
      localStorage.removeItem('asm_admin_token');
      localStorage.removeItem('asm_admin_user');
      window.location.href = '/admin/login?session=expired';
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const adminApi = {
  // Auth
  login: async (email, password) => {
    return adminFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getMe: async () => {
    return adminFetch('/api/v1/auth/me');
  },

  // Dashboard
  getDashboard: async (range = '30d') => {
    return adminFetch(`/api/v1/admin/dashboard?range=${range}`);
  },

  // Products
  getProducts: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return adminFetch(`/api/v1/admin/products?${qs}`);
  },

  getProduct: async (id) => {
    return adminFetch(`/api/v1/admin/products/${id}`);
  },

  createProduct: async (data) => {
    return adminFetch('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateProduct: async (id, data) => {
    return adminFetch(`/api/v1/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  toggleProductStatus: async (id) => {
    return adminFetch(`/api/v1/admin/products/${id}/status`, {
      method: 'PATCH'
    });
  },

  deleteProduct: async (id) => {
    return adminFetch(`/api/v1/admin/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Inventory
  getInventory: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return adminFetch(`/api/v1/admin/inventory?${qs}`);
  },

  adjustStock: async (data) => {
    return adminFetch('/api/v1/admin/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getMovements: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return adminFetch(`/api/v1/admin/inventory/movements?${qs}`);
  },

  // Orders
  getOrders: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return adminFetch(`/api/v1/admin/orders?${qs}`);
  },

  getOrder: async (id) => {
    return adminFetch(`/api/v1/admin/orders/${id}`);
  },

  updateOrderStatus: async (id, data) => {
    try {
      return await adminFetch(`/api/v1/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } catch (err) {
      return await adminFetch(`/api/v1/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  },

  cancelOrder: async (id, data) => {
    return adminFetch(`/api/v1/admin/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Customers
  getCustomers: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return adminFetch(`/api/v1/admin/customers?${qs}`);
  },

  getCustomer: async (id) => {
    return adminFetch(`/api/v1/admin/customers/${id}`);
  },

  // Coupons
  getCoupons: async () => {
    return adminFetch('/api/v1/admin/coupons');
  },

  createCoupon: async (data) => {
    return adminFetch('/api/v1/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateCoupon: async (id, data) => {
    return adminFetch(`/api/v1/admin/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteCoupon: async (id) => {
    return adminFetch(`/api/v1/admin/coupons/${id}`, {
      method: 'DELETE'
    });
  },

  // Settings & Reports
  getSettings: async () => {
    return adminFetch('/api/v1/admin/settings');
  },

  updateSettings: async (data) => {
    return adminFetch('/api/v1/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  getAuditLogs: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return adminFetch(`/api/v1/admin/audit-logs?${qs}`);
  },

  exportOrdersCsvUrl: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `${API_BASE}/api/v1/admin/reports/export-orders?${qs}`;
  }
};
