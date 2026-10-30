import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Selected delivery address (shared dynamically across Home, Cart, and Checkout)
  const [selectedAddress, setSelectedAddressState] = useState(() => {
    try {
      const saved = localStorage.getItem('asm_selected_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out legacy fictional Aarav Sharma test identity if found
        if (parsed && (parsed.fullName === 'Aarav Sharma' || parsed.name === 'Aarav Sharma')) {
          localStorage.removeItem('asm_selected_address');
          return null;
        }
        if (parsed && parsed.city && parsed.city.startsWith('Area (') && parsed.pincode) {
          if (parsed.pincode === '210001') {
            parsed.city = 'Banda';
            parsed.state = 'Uttar Pradesh';
            parsed.street = parsed.street ? parsed.street.replace(/Area \(\d+\)/g, 'Banda') : 'Delivery Hub, Banda';
          }
        }
        return parsed;
      }
    } catch (e) {}
    return null;
  });

  const selectAddress = (addr) => {
    if (!addr) {
      setSelectedAddressState(null);
      try {
        localStorage.removeItem('asm_selected_address');
      } catch (e) {}
      return;
    }
    const formatted = {
      ...addr,
      fullName: addr.fullName || addr.name || '',
      name: addr.name || addr.fullName || '',
      type: addr.type || 'HOME'
    };
    setSelectedAddressState(formatted);
    try {
      localStorage.setItem('asm_selected_address', JSON.stringify(formatted));
    } catch (e) {}
  };

  // Automatically heal legacy or incomplete addresses using live pincode resolver
  useEffect(() => {
    if (selectedAddress?.pincode && (!selectedAddress.city || selectedAddress.city.startsWith('Area ('))) {
      api.lookupPincode(selectedAddress.pincode).then((info) => {
        if (info && info.city) {
          selectAddress({
            ...selectedAddress,
            city: info.city,
            state: info.state || selectedAddress.state || 'India',
            street: (selectedAddress.street || '').replace(/Area \(\d+\)/g, info.city) || `Delivery Hub, ${info.city}`
          });
        }
      }).catch(() => {});
    }
  }, [selectedAddress?.pincode]);

  // Sync selectedAddress whenever user's saved addresses load or change
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const targetId = selectedAddress?._id || selectedAddress?.id;
      const matched = targetId
        ? user.addresses.find((a) => (a._id || a.id) === targetId)
        : null;
      const active = matched || user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (active) {
        selectAddress(active);
      }
    } else if (!user) {
      setSelectedAddressState(null);
      try {
        localStorage.removeItem('asm_selected_address');
      } catch (e) {}
    }
  }, [user]);

  // Restore session on initial load
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    setAuthError(null);
    try {
      const response = await api.login({ email, password });
      if (response && response.user) {
        setUser(response.user);
        return response.user;
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const loginWithGoogle = async (credential) => {
    setAuthError(null);
    try {
      const response = await api.googleAuth(credential);
      if (response && response.user) {
        setUser(response.user);
        return response.user;
      }
    } catch (err) {
      setAuthError(err.message || 'Google authentication failed');
      throw err;
    }
  };

  const sendSignupOtp = async ({ name, email, password }) => {
    setAuthError(null);
    try {
      const response = await api.sendSignupOtp({ name, email, password });
      return response;
    } catch (err) {
      setAuthError(err.message || 'Failed to send verification code');
      throw err;
    }
  };

  const verifySignupOtp = async ({ email, otp }) => {
    setAuthError(null);
    try {
      const response = await api.verifySignupOtp({ email, otp });
      if (response && response.user) {
        setUser(response.user);
        return response.user;
      }
    } catch (err) {
      setAuthError(err.message || 'Verification failed');
      throw err;
    }
  };

  const resendSignupOtp = async (email) => {
    setAuthError(null);
    try {
      const response = await api.resendSignupOtp(email);
      return response;
    } catch (err) {
      setAuthError(err.message || 'Failed to resend code');
      throw err;
    }
  };

  const registerDirect = async ({ name, email, password }) => {
    setAuthError(null);
    try {
      const response = await api.register({ name, email, password });
      if (response && response.user) {
        setUser(response.user);
        return response.user;
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const updateProfile = async ({ name, phone }) => {
    try {
      const updatedUser = await api.updateProfile({ name, phone });
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  const getAddresses = async () => {
    return api.getAddresses();
  };

  const addAddress = async (addressData) => {
    const updatedAddresses = await api.addAddress(addressData);
    if (user) {
      setUser({ ...user, addresses: updatedAddresses });
    }
    const newlyAdded = updatedAddresses[updatedAddresses.length - 1];
    if (newlyAdded) {
      selectAddress(newlyAdded);
    }
    return updatedAddresses;
  };

  const deleteAddress = async (addressId) => {
    const updatedAddresses = await api.deleteAddress(addressId);
    if (user) {
      setUser({ ...user, addresses: updatedAddresses });
    }
    const currentId = selectedAddress?._id || selectedAddress?.id;
    if (currentId === addressId) {
      const nextDefault = updatedAddresses.find((a) => a.isDefault) || updatedAddresses[0] || null;
      if (nextDefault) {
        selectAddress(nextDefault);
      }
    }
    return updatedAddresses;
  };

  const getOrders = async () => {
    return api.getOrders();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('[AuthContext] Backend logout request error:', err.message);
    } finally {
      setUser(null);
      setSelectedAddressState(null);
      try {
        localStorage.removeItem('asm_selected_address');
      } catch (e) {}
      setAuthError(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    authError,
    setAuthError,
    selectedAddress,
    selectAddress,
    setSelectedAddress: selectAddress,
    login,
    loginWithGoogle,
    sendSignupOtp,
    verifySignupOtp,
    resendSignupOtp,
    register: registerDirect,
    updateProfile,
    getAddresses,
    addAddress,
    deleteAddress,
    getOrders,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
