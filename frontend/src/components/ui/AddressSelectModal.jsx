import React, { useState } from 'react';
import { MapPin, X, Check, Plus, AlertCircle, Home, Briefcase, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { api } from '../../services/api';

export const AddressSelectModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, selectedAddress, selectAddress, addAddress } = useAuth();
  const { showToast } = useCartWishlist();

  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  const [checkingPin, setCheckingPin] = useState(false);
  const [detectingFormPin, setDetectingFormPin] = useState(false);

  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    street: '',
    city: '',
    state: '',
    type: 'Home',
    isDefault: false
  });

  if (!isOpen) return null;

  const handleSelect = (addr) => {
    selectAddress(addr);
    showToast(`Delivery location set to ${addr.city || addr.state} - ${addr.pincode}`);
    if (onClose) onClose();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newAddr.fullName.trim() || !newAddr.phone.trim() || !newAddr.pincode.trim() || !newAddr.street.trim() || !newAddr.city.trim() || !newAddr.state.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!/^\d{6}$/.test(newAddr.pincode.trim())) {
      setFormError('Please enter a valid 6-digit PIN code.');
      return;
    }

    if (!/^\d{10}$/.test(newAddr.phone.trim())) {
      setFormError('Please enter a valid 10-digit phone number.');
      return;
    }

    setSubmitting(true);
    try {
      if (user) {
        await addAddress({
          fullName: newAddr.fullName.trim(),
          phone: newAddr.phone.trim(),
          pincode: newAddr.pincode.trim(),
          street: newAddr.street.trim(),
          city: newAddr.city.trim(),
          state: newAddr.state.trim(),
          type: newAddr.type,
          isDefault: newAddr.isDefault
        });
      } else {
        // Guest mode address
        selectAddress({
          fullName: newAddr.fullName.trim(),
          name: newAddr.fullName.trim(),
          phone: newAddr.phone.trim(),
          pincode: newAddr.pincode.trim(),
          street: newAddr.street.trim(),
          city: newAddr.city.trim(),
          state: newAddr.state.trim(),
          type: newAddr.type,
          isDefault: true
        });
      }

      showToast(`Address saved: ${newAddr.city} - ${newAddr.pincode}`);
      setShowAddForm(false);
      if (onClose) onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    const cleanPin = pincodeInput.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) {
      showToast('Please enter a valid 6-digit PIN code');
      return;
    }

    setCheckingPin(true);
    try {
      const info = await api.lookupPincode(cleanPin);
      const city = info?.city || 'India';
      const state = info?.state || 'India';
      const area = info?.area || city;

      selectAddress({
        fullName: user?.name || 'Guest Shopper',
        name: user?.name || 'Guest Shopper',
        phone: user?.phone || '',
        pincode: cleanPin,
        street: `Delivery Hub, ${area}`,
        city: city,
        state: state,
        type: 'HOME',
        isDefault: true
      });

      showToast(`Delivering to ${city}, ${state} - ${cleanPin}`);
      if (onClose) onClose();
    } catch (err) {
      showToast('Could not verify PIN code location');
    } finally {
      setCheckingPin(false);
    }
  };

  const handleFormPincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setNewAddr((prev) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setDetectingFormPin(true);
      try {
        const info = await api.lookupPincode(clean);
        if (info && info.city) {
          setNewAddr((prev) => ({
            ...prev,
            city: info.city,
            state: info.state
          }));
          showToast(`Location detected: ${info.city}, ${info.state}`);
        }
      } catch (err) {
        // silent fallback
      } finally {
        setDetectingFormPin(false);
      }
    }
  };

  const popularCities = [
    { city: 'New Delhi', pin: '110001', state: 'Delhi' },
    { city: 'Noida', pin: '201301', state: 'Uttar Pradesh' },
    { city: 'Gurugram', pin: '122002', state: 'Haryana' },
    { city: 'Mumbai', pin: '400001', state: 'Maharashtra' },
    { city: 'Bengaluru', pin: '560001', state: 'Karnataka' }
  ];

  const addresses = user?.addresses || [];

  return (
    <div className="addr-modal-overlay" onClick={onClose}>
      <div className="addr-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="addr-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#2874F0" />
            <h3 className="addr-modal-title">Select Delivery Location</h3>
          </div>
          <button type="button" className="addr-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="addr-modal-body">
          {/* User has saved addresses */}
          {user && addresses.length > 0 && !showAddForm && (
            <div className="addr-modal-list">
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                Your Saved Addresses
              </div>

              {addresses.map((addr) => {
                const addrId = addr._id || addr.id;
                const isSelected =
                  (selectedAddress?._id || selectedAddress?.id) === addrId ||
                  (selectedAddress?.pincode === addr.pincode && selectedAddress?.street === addr.street);

                return (
                  <div
                    key={addrId}
                    className={`addr-modal-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(addr)}
                  >
                    <div className="addr-item-radio">
                      <div className={`radio-dot ${isSelected ? 'active' : ''}`} />
                    </div>

                    <div className="addr-item-details">
                      <div className="addr-item-name-row">
                        <strong className="addr-item-name">{addr.fullName || addr.name}</strong>
                        <span className="addr-item-type">{addr.type || 'HOME'}</span>
                        {addr.isDefault && <span className="addr-item-default">DEFAULT</span>}
                      </div>

                      <p className="addr-item-line">
                        {addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <span className="addr-item-phone">Mobile: {addr.phone}</span>
                    </div>

                    {isSelected && (
                      <div className="addr-item-check-icon">
                        <Check size={18} color="#059669" />
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                className="addr-add-new-btn"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={16} />
                <span>Add a New Address</span>
              </button>
            </div>
          )}

          {/* Add Address Form inside Modal */}
          {showAddForm && (
            <div className="addr-modal-add-form">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px', color: '#0F172A' }}>New Delivery Address</strong>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ background: 'none', border: 'none', color: '#2874F0', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Back to List
                </button>
              </div>

              {formError && (
                <div className="auth-alert-error" style={{ marginBottom: '10px', padding: '8px 10px' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Full Name *"
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    required
                  />
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="10-Digit Mobile *"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="6-Digit PIN Code *"
                      value={newAddr.pincode}
                      onChange={(e) => handleFormPincodeChange(e.target.value)}
                      required
                    />
                    {detectingFormPin && (
                      <span style={{ position: 'absolute', right: '10px', top: '12px', fontSize: '11px', color: '#2874F0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Loader2 size={12} className="animate-spin" /> Detecting...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="City / District *"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    required
                  />
                </div>

                <input
                  type="text"
                  className="auth-input"
                  placeholder="House No, Building, Street, Area *"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="State *"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    required
                  />
                  <select
                    className="auth-input"
                    value={newAddr.type}
                    onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value })}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="fk-action-primary-btn"
                  disabled={submitting}
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  {submitting ? 'Saving Address...' : 'Save & Deliver Here'}
                </button>
              </form>
            </div>
          )}

          {/* Quick Pincode check / Select city for guests or any user */}
          {(!user || addresses.length === 0 || !showAddForm) && (
            <div style={{ borderTop: user && addresses.length > 0 ? '1px solid #E2E8F0' : 'none', paddingTop: user && addresses.length > 0 ? '16px' : '0', marginTop: user && addresses.length > 0 ? '16px' : '0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                Enter Delivery Pincode
              </div>

              <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter 6-digit Pincode (e.g. 110001)"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="fk-action-primary-btn"
                  disabled={checkingPin}
                  style={{ marginTop: 0, padding: '0 16px', height: '44px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {checkingPin ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    'Apply'
                  )}
                </button>
              </form>

              {/* Popular Cities Pills */}
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>
                Or select major city:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {popularCities.map((pc) => (
                  <button
                    key={pc.pin}
                    type="button"
                    className="addr-city-pill"
                    onClick={() =>
                      handleSelect({
                        fullName: user?.name || 'Guest Shopper',
                        name: user?.name || 'Guest Shopper',
                        phone: user?.phone || '9876543210',
                        pincode: pc.pin,
                        street: `Express Hub, ${pc.city}`,
                        city: pc.city,
                        state: pc.state,
                        type: 'HOME',
                        isDefault: true
                      })
                    }
                  >
                    {pc.city} ({pc.pin})
                  </button>
                ))}
              </div>

              {/* Login Prompt for Guests */}
              {!user && (
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px', color: '#1E3A8A' }}>Sign in to see saved addresses</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#475569' }}>
                      Access your delivery addresses and orders instantly
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      navigate('/login');
                    }}
                    style={{
                      backgroundColor: '#2874F0',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressSelectModal;
