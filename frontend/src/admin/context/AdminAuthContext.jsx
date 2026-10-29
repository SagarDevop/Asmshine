import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('asm_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('asm_admin_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify active admin session on mount
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const storedToken = localStorage.getItem('asm_admin_token');
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await adminApi.getMe();
        if (isMounted && res.success && res.user) {
          const userRole = res.user.role || 'customer';
          if (['superadmin', 'admin', 'order_manager', 'inventory_manager'].includes(userRole)) {
            setAdmin(res.user);
            localStorage.setItem('asm_admin_user', JSON.stringify(res.user));
          } else {
            // Not an admin
            logout();
          }
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await adminApi.login(email, password);
    if (!res.success || !res.user) {
      throw new Error(res.message || 'Authentication failed.');
    }

    const userRole = res.user.role || 'customer';
    if (!['superadmin', 'admin', 'order_manager', 'inventory_manager'].includes(userRole)) {
      throw new Error('Access denied. This account does not possess staff or administrator privileges.');
    }

    const activeToken = res.token || localStorage.getItem('cleanora_token');
    if (!activeToken) {
      throw new Error('Failed to retrieve secure session token.');
    }

    localStorage.setItem('asm_admin_token', activeToken);
    localStorage.setItem('asm_admin_user', JSON.stringify(res.user));
    setToken(activeToken);
    setAdmin(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('asm_admin_token');
    localStorage.removeItem('asm_admin_user');
    setAdmin(null);
    setToken(null);
  };

  const isAuthorized = (requiredRole) => {
    if (!admin) return false;
    if (admin.role === 'superadmin') return true;
    if (requiredRole === 'admin') return ['superadmin', 'admin'].includes(admin.role);
    if (requiredRole === 'order_manager') return ['superadmin', 'admin', 'order_manager'].includes(admin.role);
    if (requiredRole === 'inventory_manager') return ['superadmin', 'admin', 'inventory_manager'].includes(admin.role);
    return admin.role === requiredRole;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(admin && token),
        isAuthorized
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
