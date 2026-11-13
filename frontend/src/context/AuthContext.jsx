import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { sanitizeAddressLocation, resolvePincodeLocal } from '../utils/pincodeData';

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
        const sanitized = sanitizeAddressLocation(parsed);
        if (JSON.stringify(sanitized) !== saved) {
          localStorage.setItem('asm_selected_address', JSON.stringify(sanitized));
        }
        return sanitized;
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
    const sanitized = sanitizeAddressLocation(addr);
    const formatted = {
      ...sanitized,
      fullName: sanitized.fullName || sanitized.name || '',
      name: sanitized.name || sanitized.fullName || '',
      type: sanitized.type || 'HOME'
    };
    setSelectedAddressState(formatted);
    try {
      localStorage.setItem('asm_selected_address', JSON.stringify(formatted));
    } catch (e) {}
  };

  // Automatically heal legacy or incomplete addresses using deterministic pincode resolver
  useEffect(() => {
    if (selectedAddress?.pincode) {
      const isAjeeb =
        !selectedAddress.city ||
        selectedAddress.city.startsWith('Area (') ||
        selectedAddress.city.includes('Area (') ||
        selectedAddress.city.includes('/') ||
        selectedAddress.city === 'India' ||
        selectedAddress.city === 'Pan-India';

      if (isAjeeb) {
        const local = resolvePincodeLocal(selectedAddress.pincode);
        if (local && local.city && !local.city.includes('Area (')) {
          const resolvedCity = local.city;
          const resolvedState = (local.state && local.state !== 'India') ? local.state : (selectedAddress.state || 'India');
          const resolvedStreet = (selectedAddress.street || '')
            .replace(/Area \(\d+\)/g, resolvedCity)
            .replace(/Delivery Hub, Area \(\d+\)/g, `Delivery Hub, ${resolvedCity}`) || `Delivery Hub, ${resolvedCity}`;

          selectAddress({
            ...selectedAddress,
            city: resolvedCity,
            state: resolvedState,
            street: resolvedStreet
          });
        } else {
          api.lookupPincode(selectedAddress.pincode).then((info) => {
            if (info && info.city && !info.city.includes('Area (')) {
              selectAddress({
                ...selectedAddress,
                city: info.city,
                state: info.state || selectedAddress.state || 'India',
                street: (selectedAddress.street || '')
                  .replace(/Area \(\d+\)/g, info.city)
                  .replace(/Delivery Hub, Area \(\d+\)/g, `Delivery Hub, ${info.city}`) || `Delivery Hub, ${info.city}`
              });
            }
          }).catch(() => {});
        }
      }
    }
  }, [selectedAddress?.pincode, selectedAddress?.city]);

  // Sync selectedAddress whenever user's saved addresses load or change
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const targetId = selectedAddress?._id || selectedAddress?.id;
      const matched = targetId
        ? user.addresses.find((a) => (a._id || a.id) === targetId)
        : null;
      // If user already has an address selected with complete fields, prioritize it
      if (!selectedAddress || !selectedAddress.street || selectedAddress.street.startsWith('Delivery Hub,')) {
        const rawActive = matched || user.addresses.find((a) => a.isDefault) || user.addresses[0];
        if (rawActive) {
          const active = sanitizeAddressLocation(rawActive);
          selectAddress(active);
        }
      }
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
        if (response.token && typeof window !== 'undefined') {
          localStorage.setItem('cleanora_token', response.token);
        }
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
        if (response.token && typeof window !== 'undefined') {
          localStorage.setItem('cleanora_token', response.token);
        }
        setUser(response.user);
        return response.user;
      }
    } catch (err) {
      setAuthError(err.message || 'Google authentication failed');
      throw err;
    }
  };

  const sendLoginOtp = async ({ email }) => {
    setAuthError(null);
    try {
      const response = await api.sendLoginOtp({ email });
      return response;
    } catch (err) {
      setAuthError(err.message || 'Failed to send login code');
      throw err;
    }
  };

  const verifyLoginOtp = async ({ email, otp }) => {
    setAuthError(null);
    try {
      const response = await api.verifyLoginOtp({ email, otp });
      if (response && response.user) {
        if (response.token && typeof window !== 'undefined') {
          localStorage.setItem('cleanora_token', response.token);
        }
        setUser(response.user);
        return response.user;
      }
    } catch (err) {
      setAuthError(err.message || 'Login verification failed');
      throw err;
    }
  };

  const resendLoginOtp = async (email) => {
    setAuthError(null);
    try {
      const response = await api.resendLoginOtp(email);
      return response;
    } catch (err) {
      setAuthError(err.message || 'Failed to resend login code');
      throw err;
    }
  };

  const sendSignupOtp = async ({ name, email, password, policyConsent }) => {
    setAuthError(null);
    try {
      const response = await api.sendSignupOtp({ name, email, password, policyConsent });
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
        if (response.token && typeof window !== 'undefined') {
          localStorage.setItem('cleanora_token', response.token);
        }
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

  const sendForgotPasswordOtp = async ({ email }) => {
    setAuthError(null);
    try {
      const response = await api.sendForgotPasswordOtp({ email });
      return response;
    } catch (err) {
      setAuthError(err.message || 'Failed to send password reset code');
      throw err;
    }
  };

  const verifyForgotPasswordOtp = async ({ email, otp }) => {
    setAuthError(null);
    try {
      const response = await api.verifyForgotPasswordOtp({ email, otp });
      return response;
    } catch (err) {
      setAuthError(err.message || 'Failed to verify reset code');
      throw err;
    }
  };

  const resetPassword = async ({ email, otp, resetToken, newPassword }) => {
    setAuthError(null);
    try {
      const response = await api.resetPassword({ email, otp, resetToken, newPassword });
      if (response && response.user) {
        if (response.token && typeof window !== 'undefined') {
          localStorage.setItem('cleanora_token', response.token);
        }
        setUser(response.user);
        return response.user;
      }
      return response;
    } catch (err) {
      setAuthError(err.message || 'Failed to reset password');
      throw err;
    }
  };

  const resendForgotPasswordOtp = async (email) => {
    setAuthError(null);
    try {
      const response = await api.resendForgotPasswordOtp(email);
      return response;
    } catch (err) {
      setAuthError(err.message || 'Failed to resend reset code');
      throw err;
    }
  };

  const registerDirect = async ({ name, email, password, policyConsent }) => {
    setAuthError(null);
    try {
      const response = await api.register({ name, email, password, policyConsent });
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
    // Immediately select the address locally to guarantee continuity
    selectAddress(addressData);

    try {
      const updatedAddresses = await api.addAddress(addressData);
      if (user) {
        setUser({ ...user, addresses: updatedAddresses });
      }
      const newlyAdded = Array.isArray(updatedAddresses) ? updatedAddresses[updatedAddresses.length - 1] : null;
      if (newlyAdded) {
        selectAddress(newlyAdded);
      }
      return updatedAddresses;
    } catch (err) {
      console.warn('[AuthContext] Remote address save warning:', err.message);
      return user?.addresses || [addressData];
    }
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
    sendLoginOtp,
    verifyLoginOtp,
    resendLoginOtp,
    sendSignupOtp,
    verifySignupOtp,
    resendSignupOtp,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword,
    resendForgotPasswordOtp,
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
