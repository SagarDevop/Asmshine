import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
  Lock,
  ArrowLeft,
  Gift,
  Headphones,
  CreditCard,
  Smartphone,
  Globe,
  Bell,
  FileText,
  HelpCircle,
  Edit3,
  MessageSquare,
  Store,
  Zap,
  Sparkles,
  Award,
  Copy,
  Check,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCartWishlist } from '../context/CartWishlistContext';
import { api } from '../services/api';

export const AccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, getAddresses, addAddress, deleteAddress, getOrders, selectedAddress, selectAddress } = useAuth();
  const { wishlist, toggleWishlist, addToCart, showToast } = useCartWishlist();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'profile' | 'addresses' | 'orders' | 'wishlist'
  const [modalView, setModalView] = useState(null); // 'coupons' | 'help' | 'cards' | 'language' | 'devices' | 'notifications' | 'privacy' | 'reviews' | 'qa' | 'partner' | 'faq' | null
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Fetch coupons dynamically when modalView === 'coupons'
  useEffect(() => {
    if (modalView === 'coupons') {
      setLoadingCoupons(true);
      api.getAvailableCoupons().then((list) => {
        setAvailableCoupons(list || []);
      }).catch(() => {
        setAvailableCoupons([]);
      }).finally(() => {
        setLoadingCoupons(false);
      });
    }
  }, [modalView]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

  // Addresses State
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    street: '',
    city: '',
    state: '',
    type: 'Home',
    isDefault: false
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Wishlist Products State
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Sync profile details when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      if (user.addresses) {
        setAddresses(user.addresses);
      }
    }
  }, [user]);

  // Load addresses when switching to addresses tab
  useEffect(() => {
    if (activeTab === 'addresses') {
      loadAddresses();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'wishlist') {
      loadWishlistProducts();
    }
  }, [activeTab]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await getAddresses();
      setAddresses(data || []);
    } catch (e) {
      console.warn('[Account] Failed to load addresses:', e);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (e) {
      console.warn('[Account] Failed to load orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadWishlistProducts = async () => {
    setLoadingWishlist(true);
    try {
      const allProducts = await api.getProducts();
      const ids = Array.from(wishlist || []);
      const matched = (allProducts || []).filter((p) => ids.includes(p.id || p._id));
      setWishlistProducts(matched);
    } catch (e) {
      console.warn('[Account] Failed to load wishlist products:', e);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('You have been logged out safely.');
      navigate('/login');
    } catch (e) {
      navigate('/login');
    }
  };

  // -------------------------------------------------------------
  // Profile Handlers
  // -------------------------------------------------------------
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage({ text: '', type: '' });

    if (!profileName.trim()) {
      setProfileMessage({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }

    setProfileSubmitting(true);
    try {
      await updateProfile({
        name: profileName.trim(),
        phone: profilePhone.trim()
      });
      setIsEditingProfile(false);
      setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
      showToast('Profile information saved');
    } catch (err) {
      setProfileMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setProfileSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Address Handlers
  // -------------------------------------------------------------
  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');

    if (!newAddress.fullName.trim() || !newAddress.phone.trim() || !newAddress.street.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.pincode.trim()) {
      setAddressError('Please fill in all mandatory address fields.');
      return;
    }

    if (!/^\d{6}$/.test(newAddress.pincode.trim())) {
      setAddressError('Please enter a valid 6-digit PIN code.');
      return;
    }

    if (!/^\d{10}$/.test(newAddress.phone.trim())) {
      setAddressError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setAddressSubmitting(true);
    try {
      const updated = await addAddress({
        fullName: newAddress.fullName.trim(),
        phone: newAddress.phone.trim(),
        pincode: newAddress.pincode.trim(),
        street: newAddress.street.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        type: newAddress.type,
        isDefault: newAddress.isDefault
      });
      setAddresses(updated);
      setShowAddAddressForm(false);
      setNewAddress({
        fullName: '',
        phone: '',
        pincode: '',
        street: '',
        city: '',
        state: '',
        type: 'Home',
        isDefault: false
      });
      showToast('New delivery address added');
    } catch (err) {
      setAddressError(err.message || 'Failed to save address.');
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const updated = await deleteAddress(addressId);
      setAddresses(updated);
      showToast('Address deleted');
    } catch (err) {
      showToast('Failed to delete address: ' + err.message);
    }
  };

  // -------------------------------------------------------------
  // Wishlist Handlers
  // -------------------------------------------------------------
  const handleMoveToCart = async (product) => {
    await addToCart(product.id || product._id, 1, '', product);
    toggleWishlist(product.id || product._id);
    setWishlistProducts((prev) => prev.filter((p) => (p.id || p._id) !== (product.id || product._id)));
    showToast('Item moved to Cart');
  };

  const handleRemoveFromWishlist = (product) => {
    toggleWishlist(product.id || product._id);
    setWishlistProducts((prev) => prev.filter((p) => (p.id || p._id) !== (product.id || product._id)));
  };

  const handleCopyCoupon = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      showToast(`Coupon code ${code} copied!`);
      setTimeout(() => setCopiedCoupon(''), 2500);
    } catch (e) {
      showToast(`Coupon code: ${code}`);
    }
  };

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AS';

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Recent Member';

  return (
    <div className="fk-account-page-wrapper">
      {activeTab === 'menu' ? (
        <div className="fk-account-mobile-hub">
          {/* 1. ASM Shine User Profile Card */}
          <div className="fk-hub-user-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #2874F0 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                    {user.name}
                  </h3>
                  <span
                    style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1D4ED8',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={11} color="#2563EB" /> ASM Shine Member
                  </span>
                </div>
                <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email} {user.phone ? `• +91 ${user.phone}` : ''}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
              <span>Official ASM Shine Hygiene Store</span>
              <span style={{ fontWeight: 600, color: '#0284C7' }}>Member since {memberSince}</span>
            </div>
          </div>

          {/* 2. 4-Grid Quick Action Buttons */}
          <div className="fk-hub-quick-grid">
            <button
              type="button"
              className="fk-hub-quick-btn"
              onClick={() => setActiveTab('orders')}
              id="hub-quick-orders-btn"
            >
              <Package size={22} color="#2874F0" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <span>My Orders</span>
                {orders.length > 0 && (
                  <small style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                    {orders.length} placed
                  </small>
                )}
              </div>
            </button>

            <button
              type="button"
              className="fk-hub-quick-btn"
              onClick={() => setActiveTab('wishlist')}
              id="hub-quick-wishlist-btn"
            >
              <Heart size={22} color="#2874F0" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <span>Wishlist</span>
                <small style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                  {wishlist ? wishlist.size : 0} items
                </small>
              </div>
            </button>

            <button
              type="button"
              className="fk-hub-quick-btn"
              onClick={() => setModalView('coupons')}
              id="hub-quick-coupons-btn"
            >
              <Gift size={22} color="#2874F0" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <span>Coupons</span>
                <small style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                  20% OFF Active
                </small>
              </div>
            </button>

            <button
              type="button"
              className="fk-hub-quick-btn"
              onClick={() => setModalView('help')}
              id="hub-quick-help-btn"
            >
              <Headphones size={22} color="#2874F0" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <span>Help Center</span>
                <small style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                  24x7 Support
                </small>
              </div>
            </button>
          </div>

          {/* 3. Account Settings */}
          <div className="fk-hub-section-group">
            <h3 className="fk-hub-section-title">Account Settings</h3>

            <button type="button" className="fk-hub-row-item" onClick={() => setActiveTab('profile')}>
              <div className="fk-hub-row-left">
                <User size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Profile Information</span>
                  <span className="fk-hub-row-sub">Edit name, mobile number, and contact info</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>

            <button type="button" className="fk-hub-row-item" onClick={() => setActiveTab('addresses')}>
              <div className="fk-hub-row-left">
                <MapPin size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Manage Delivery Addresses</span>
                  <span className="fk-hub-row-sub">
                    {addresses.length > 0 ? `${addresses.length} saved addresses` : 'Add your home or office address'}
                  </span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>

            <button type="button" className="fk-hub-row-item" onClick={() => setModalView('cards')}>
              <div className="fk-hub-row-left">
                <CreditCard size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Payment Preferences</span>
                  <span className="fk-hub-row-sub">UPI (GPay / PhonePe / Paytm) &amp; Cash on Delivery</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>

            <button type="button" className="fk-hub-row-item" onClick={() => setModalView('notifications')}>
              <div className="fk-hub-row-left">
                <Bell size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Notification Settings</span>
                  <span className="fk-hub-row-sub">Order dispatch, tracking SMS and delivery alerts</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>

            <button type="button" className="fk-hub-row-item" onClick={() => setModalView('language')}>
              <div className="fk-hub-row-left">
                <Globe size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Select Language</span>
                  <span className="fk-hub-row-sub">English, हिन्दी (Hindi)</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>

            <button type="button" className="fk-hub-row-item" onClick={() => setModalView('privacy')}>
              <div className="fk-hub-row-left">
                <ShieldCheck size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Privacy &amp; Security</span>
                  <span className="fk-hub-row-sub">AES-256 encrypted account credentials</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>
          </div>

          {/* 4. My Activity & Product Guides */}
          <div className="fk-hub-section-group">
            <h3 className="fk-hub-section-title">My Activity &amp; Guides</h3>

            <button type="button" className="fk-hub-row-item" onClick={() => setModalView('reviews')}>
              <div className="fk-hub-row-left">
                <Edit3 size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">My Product Reviews</span>
                  <span className="fk-hub-row-sub">Share feedback on ASM Shine cleaners</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>

            <button type="button" className="fk-hub-row-item" onClick={() => setModalView('qa')}>
              <div className="fk-hub-row-left">
                <MessageSquare size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Cleaning &amp; Dilution Guides</span>
                  <span className="fk-hub-row-sub">Usage guidelines for toilet, floor and glass care</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>
          </div>

          {/* 5. Business & Wholesale */}
          <div className="fk-hub-section-group">
            <h3 className="fk-hub-section-title">Business &amp; Wholesale</h3>

            <button type="button" className="fk-hub-row-item" onClick={() => setModalView('partner')}>
              <div className="fk-hub-row-left">
                <Store size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Wholesale &amp; Bulk Dealership</span>
                  <span className="fk-hub-row-sub">Bulk supply for hotels, offices, societies &amp; distributors</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>
          </div>

          {/* 6. Policies & Support */}
          <div className="fk-hub-section-group">
            <h3 className="fk-hub-section-title">Policies &amp; Support</h3>

            <button type="button" className="fk-hub-row-item" onClick={() => navigate('/about')}>
              <div className="fk-hub-row-left">
                <FileText size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Terms, Policies &amp; Return Policy</span>
                  <span className="fk-hub-row-sub">30-day money-back guarantee &amp; shipping standards</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>

            <button type="button" className="fk-hub-row-item" onClick={() => setModalView('faq')}>
              <div className="fk-hub-row-left">
                <HelpCircle size={20} className="fk-hub-row-icon" />
                <div className="fk-hub-row-text">
                  <span className="fk-hub-row-title">Frequently Asked Questions</span>
                  <span className="fk-hub-row-sub">Delivery times, septic safety &amp; packaging FAQs</span>
                </div>
              </div>
              <ChevronRight size={17} className="fk-hub-row-chevron" />
            </button>
          </div>

          {/* 7. Log Out Card */}
          <div className="fk-hub-logout-card" onClick={handleLogout} id="account-hub-logout-btn">
            <LogOut size={18} color="#DC2626" />
            <span>Log Out from ASM Shine</span>
          </div>
        </div>
      ) : (
        <div className="fk-subpage-container">
          <div className="fk-subpage-top-nav">
            <button
              type="button"
              className="fk-subpage-back-button"
              onClick={() => setActiveTab('menu')}
              id="account-subpage-back-btn"
              aria-label="Back to Account Hub"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="fk-subpage-main-title">
              {activeTab === 'profile' && 'Profile Information'}
              {activeTab === 'addresses' && 'Manage Delivery Addresses'}
              {activeTab === 'orders' && 'My Orders'}
              {activeTab === 'wishlist' && `My Wishlist (${wishlist ? wishlist.size : 0})`}
            </h2>
          </div>

          <div className="fk-subpage-content-wrap">
        {activeTab === 'profile' && (
          <div className="fk-dashboard-card">
            <div className="fk-card-header-row">
              <h2 className="fk-card-title">Personal Information</h2>
              {!isEditingProfile && (
                <button
                  type="button"
                  className="fk-link-btn"
                  onClick={() => setIsEditingProfile(true)}
                  id="edit-profile-button"
                >
                  Edit Information
                </button>
              )}
            </div>

            {profileMessage.text && (
              <div
                className={profileMessage.type === 'error' ? 'auth-alert-error' : 'auth-alert-notice'}
                style={
                  profileMessage.type === 'success'
                    ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' }
                    : {}
                }
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 size={16} color="#059669" />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              {/* Full Name */}
              <div className="fk-profile-field-group">
                <div className="fk-profile-field-title">Full Name</div>
                <div className="fk-profile-field-row">
                  <input
                    type="text"
                    className="fk-profile-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    disabled={!isEditingProfile || profileSubmitting}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="fk-profile-field-group">
                <div className="fk-profile-field-title">Mobile Number</div>
                <div className="fk-profile-field-row">
                  <input
                    type="tel"
                    className="fk-profile-input"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    disabled={!isEditingProfile || profileSubmitting}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              {isEditingProfile && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', marginBottom: '24px' }}>
                  <button
                    type="submit"
                    className="fk-action-primary-btn"
                    disabled={profileSubmitting}
                    id="save-profile-btn"
                  >
                    {profileSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="fk-action-primary-btn"
                    style={{ backgroundColor: '#F1F5F9', color: '#475569' }}
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileName(user.name || '');
                      setProfilePhone(user.phone || '');
                      setProfileMessage({ text: '', type: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginTop: '10px' }}>
              {/* Email Address (Read Only) */}
              <div className="fk-profile-field-group">
                <div className="fk-profile-field-title">Email Address</div>
                <div className="fk-profile-field-row">
                  <input
                    type="email"
                    className="fk-profile-input"
                    value={user.email}
                    disabled
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                    <ShieldCheck size={16} />
                    <span>Verified</span>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                  Your registered email address is securely tied to your order history and account security.
                </p>
              </div>

              {/* Security & Account Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>SIGN-IN METHOD</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                    {user.provider === 'google' ? 'Google OAuth 2.0' : 'Email & Password'}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>ASM SHINE MEMBER SINCE</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                    {memberSince}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: MANAGE ADDRESSES                                 */}
        {/* ======================================================= */}
        {activeTab === 'addresses' && (
          <div className="fk-dashboard-card">
            <div className="fk-card-header-row">
              <h2 className="fk-card-title">Manage Delivery Addresses</h2>
              {!showAddAddressForm && (
                <button
                  type="button"
                  className="fk-link-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}
                  onClick={() => setShowAddAddressForm(true)}
                  id="add-address-toggle-btn"
                >
                  <Plus size={16} />
                  <span>ADD A NEW ADDRESS</span>
                </button>
              )}
            </div>

            {/* Inline Add Address Form */}
            {showAddAddressForm && (
              <div className="fk-add-address-box">
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: '#1E3A8A' }}>
                  Add a New Address
                </h3>

                {addressError && (
                  <div className="auth-alert-error" role="alert">
                    <AlertCircle size={16} />
                    <span>{addressError}</span>
                  </div>
                )}

                <form onSubmit={handleAddAddressSubmit}>
                  <div className="fk-address-form-grid">
                    <div>
                      <label className="auth-label">Full Name *</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Recipient Name"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        required
                        disabled={addressSubmitting}
                      />
                    </div>

                    <div>
                      <label className="auth-label">10-Digit Mobile Number *</label>
                      <input
                        type="tel"
                        className="auth-input"
                        placeholder="e.g. 9876543210"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                          })
                        }
                        required
                        disabled={addressSubmitting}
                      />
                    </div>

                    <div>
                      <label className="auth-label">Pincode *</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="6 Digits [0-9]"
                        value={newAddress.pincode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            pincode: e.target.value.replace(/\D/g, '').slice(0, 6)
                          })
                        }
                        required
                        disabled={addressSubmitting}
                      />
                    </div>

                    <div>
                      <label className="auth-label">City / District *</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                        disabled={addressSubmitting}
                      />
                    </div>

                    <div className="fk-form-full">
                      <label className="auth-label">Address (House No, Building, Street, Area) *</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Detailed Street Address"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        required
                        disabled={addressSubmitting}
                      />
                    </div>

                    <div>
                      <label className="auth-label">State *</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        required
                        disabled={addressSubmitting}
                      />
                    </div>

                    <div>
                      <label className="auth-label">Address Type</label>
                      <div className="fk-radio-group">
                        <label className="fk-radio-label">
                          <input
                            type="radio"
                            name="addressType"
                            checked={newAddress.type === 'Home'}
                            onChange={() => setNewAddress({ ...newAddress, type: 'Home' })}
                          />
                          Home
                        </label>
                        <label className="fk-radio-label">
                          <input
                            type="radio"
                            name="addressType"
                            checked={newAddress.type === 'Work'}
                            onChange={() => setNewAddress({ ...newAddress, type: 'Work' })}
                          />
                          Work
                        </label>
                      </div>
                    </div>

                    <div className="fk-form-full" style={{ marginTop: '4px' }}>
                      <label className="fk-radio-label">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        />
                        <span>Make this my default delivery address</span>
                      </label>
                    </div>
                  </div>

                  <div className="fk-address-form-actions">
                    <button
                      type="submit"
                      className="fk-action-primary-btn"
                      disabled={addressSubmitting}
                      id="save-new-address-btn"
                    >
                      {addressSubmitting ? 'Saving Address...' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      className="fk-action-primary-btn"
                      style={{ backgroundColor: '#F1F5F9', color: '#475569' }}
                      onClick={() => setShowAddAddressForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Address List */}
            {loadingAddresses ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2].map((n) => (
                  <div key={n} className="fk-order-card-skeleton" aria-hidden="true">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div className="fk-sk-box skeleton-shimmer" style={{ width: '60px', height: '20px', borderRadius: '4px' }} />
                      <div className="fk-sk-circle skeleton-shimmer" style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div className="fk-sk-line skeleton-shimmer" style={{ width: '120px', height: '14px' }} />
                    <div className="fk-sk-line skeleton-shimmer" style={{ width: '80%', height: '12px' }} />
                    <div className="fk-sk-line skeleton-shimmer" style={{ width: '45%', height: '12px' }} />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="fk-empty-card-state">
                <div className="fk-empty-state-icon">
                  <MapPin size={32} />
                </div>
                <h3 className="fk-empty-state-title">No Addresses Found</h3>
                <p className="fk-empty-state-desc">
                  Please add your delivery address so we can ship your home hygiene orders directly to your doorstep.
                </p>
                {!showAddAddressForm && (
                  <button
                    type="button"
                    className="fk-action-primary-btn"
                    onClick={() => setShowAddAddressForm(true)}
                  >
                    + Add New Address
                  </button>
                )}
              </div>
            ) : (
              <div className="fk-address-list">
                {addresses.map((addr) => (
                  <div
                    key={addr._id || addr.id}
                    className={`fk-address-card ${addr.isDefault ? 'is-default' : ''}`}
                  >
                    <div className="fk-addr-badge-row">
                      <span className="fk-addr-type-tag">{addr.type || 'HOME'}</span>
                      {addr.isDefault && <span className="fk-addr-default-tag">DEFAULT</span>}
                      {selectedAddress && (selectedAddress._id === addr._id || selectedAddress.id === addr.id) && (
                        <span className="fk-addr-default-tag" style={{ backgroundColor: '#0284C7', color: '#FFFFFF' }}>
                          SELECTED FOR DELIVERY
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="fk-addr-name">{addr.fullName}</span>
                      <span className="fk-addr-phone">{addr.phone}</span>
                    </div>

                    <div className="fk-addr-lines">
                      {addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {(!selectedAddress || (selectedAddress._id !== addr._id && selectedAddress.id !== addr.id)) ? (
                        <button
                          type="button"
                          className="cart-change-addr-btn"
                          style={{ padding: '3px 10px', fontSize: '12px', border: '1px solid #0284C7' }}
                          onClick={() => {
                            selectAddress(addr);
                            showToast(`Delivery location set to ${addr.city} (${addr.pincode})`);
                          }}
                        >
                          Deliver to this address
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#0284C7', fontWeight: 700 }}>
                          ✓ Active Delivery Address
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="fk-addr-delete-btn"
                      onClick={() => handleDeleteAddress(addr._id || addr.id)}
                      title="Delete this address"
                      aria-label="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: MY ORDERS                                        */}
        {/* ======================================================= */}
        {activeTab === 'orders' && (
          <div className="fk-dashboard-card">
            <div className="fk-card-header-row">
              <h2 className="fk-card-title">My Orders</h2>
            </div>

            {loadingOrders ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="fk-order-card-skeleton" aria-hidden="true">
                    <div className="fk-order-card-sk-top">
                      <div className="fk-sk-line skeleton-shimmer" style={{ width: '130px', height: '14px' }} />
                      <div className="fk-sk-box skeleton-shimmer" style={{ width: '80px', height: '22px', borderRadius: '12px' }} />
                    </div>
                    <div className="fk-order-card-sk-item">
                      <div className="fk-sk-box skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: '6px' }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="fk-sk-line skeleton-shimmer" style={{ width: '65%', height: '13px' }} />
                        <div className="fk-sk-line skeleton-shimmer" style={{ width: '35%', height: '11px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                      <div className="fk-sk-line skeleton-shimmer" style={{ width: '140px', height: '12px' }} />
                      <div className="fk-sk-box skeleton-shimmer" style={{ width: '96px', height: '30px', borderRadius: '6px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="fk-empty-card-state">
                <div className="fk-empty-state-icon">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="fk-empty-state-title">You have no orders yet</h3>
                <p className="fk-empty-state-desc">
                  Explore our high-performance home, kitchen and toilet hygiene cleaners to place your first order.
                </p>
                <button
                  type="button"
                  className="fk-action-primary-btn"
                  onClick={() => navigate('/categories')}
                  id="orders-start-shopping-btn"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {orders.map((order) => (
                  <div
                    key={order.id || order._id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '16px',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        borderBottom: '1px solid #F1F5F9',
                        paddingBottom: '8px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Order ID: </span>
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>{order.id || order._id}</strong>
                      </div>
                      <span
                        style={{
                          backgroundColor:
                            order.status === 'DELIVERED'
                              ? '#ECFDF5'
                              : order.status === 'SHIPPED'
                              ? '#EDE9FE'
                              : order.status === 'CANCELLED'
                              ? '#FEF2F2'
                              : order.status === 'PROCESSING'
                              ? '#FEF3C7'
                              : '#EFF6FF',
                          color:
                            order.status === 'DELIVERED'
                              ? '#047857'
                              : order.status === 'SHIPPED'
                              ? '#6D28D9'
                              : order.status === 'CANCELLED'
                              ? '#B91C1C'
                              : order.status === 'PROCESSING'
                              ? '#B45309'
                              : '#1D4ED8',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ● {(order.status || 'CONFIRMED').replace('_', ' ')}
                      </span>
                    </div>

                    {/* Order Items Snapshot */}
                    {order.items && order.items.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '12px 0' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}
                                onError={(e) => { e.currentTarget.src = '/favicon.svg'; }}
                              />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                Qty: {item.quantity} {item.size ? `(${item.size})` : ''} • ₹{item.unitPrice || item.price || 0} each
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '10px',
                        paddingTop: '10px',
                        borderTop: '1px solid #F1F5F9',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        <div>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'Recently Placed'}
                          {order.paymentMethod ? ` • ${order.paymentMethod.toUpperCase()}` : ''}
                        </div>
                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                          Total: ₹{order.totalAmount}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="fk-action-primary-btn"
                          style={{
                            padding: '7px 14px',
                            fontSize: '12.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            borderRadius: '8px'
                          }}
                          onClick={() => navigate(`/order/${order.orderId || order.id || order._id}`)}
                        >
                          <Package size={14} />
                          <span>Track Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: MY WISHLIST                                      */}
        {/* ======================================================= */}
        {activeTab === 'wishlist' && (
          <div className="fk-dashboard-card">
            <div className="fk-card-header-row">
              <h2 className="fk-card-title">
                My Wishlist ({wishlistProducts.length})
              </h2>
            </div>

            {loadingWishlist ? (
              <div className="fk-wishlist-grid" aria-hidden="true">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="fk-wishlist-card fk-order-card-skeleton" style={{ padding: '14px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                    <div className="fk-wishlist-info-wrap" style={{ display: 'flex', gap: '14px' }}>
                      <div className="fk-sk-box skeleton-shimmer" style={{ width: '80px', height: '80px', borderRadius: '8px', flexShrink: 0 }} />
                      <div className="fk-wishlist-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="fk-sk-line skeleton-shimmer" style={{ width: '75%', height: '15px' }} />
                        <div className="fk-sk-line skeleton-shimmer" style={{ width: '35%', height: '14px' }} />
                        <div className="fk-sk-line skeleton-shimmer" style={{ width: '50%', height: '12px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : wishlistProducts.length === 0 ? (
              <div className="fk-empty-card-state">
                <div className="fk-empty-state-icon">
                  <Heart size={32} />
                </div>
                <h3 className="fk-empty-state-title">Empty Wishlist</h3>
                <p className="fk-empty-state-desc">
                  You have no items in your wishlist. Start adding items you love to keep track of them!
                </p>
                <button
                  type="button"
                  className="fk-action-primary-btn"
                  onClick={() => navigate('/categories')}
                  id="wishlist-explore-btn"
                >
                  Explore Cleaners
                </button>
              </div>
            ) : (
              <div className="fk-wishlist-grid">
                {wishlistProducts.map((p) => {
                  const pid = p.id || p._id;
                  const originalPrice = p.originalPrice || p.price;
                  return (
                    <div key={pid} className="fk-wishlist-card">
                      <div className="fk-wishlist-info-wrap">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="fk-wishlist-thumb"
                          onClick={() => navigate(`/product/${pid}`)}
                          style={{ cursor: 'pointer' }}
                        />
                        <div className="fk-wishlist-details">
                          <h4
                            className="fk-wishlist-title"
                            onClick={() => navigate(`/product/${pid}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            {p.name}
                          </h4>
                          <div className="fk-wishlist-pricing">
                            <span className="fk-wishlist-price">₹{p.price}</span>
                            {originalPrice > p.price && (
                              <span className="fk-wishlist-mrp">₹{originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="fk-wishlist-actions">
                        <button
                          type="button"
                          className="fk-move-cart-btn"
                          onClick={() => handleMoveToCart(p)}
                          id={`move-to-cart-${pid}`}
                        >
                          Move to Cart
                        </button>
                        <button
                          type="button"
                          className="fk-wishlist-remove-btn"
                          onClick={() => handleRemoveFromWishlist(p)}
                          title="Remove from wishlist"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Authentic ASM Shine Modals & Info Drawers                          */}
      {/* ------------------------------------------------------------------ */}
      {modalView && (
        <div className="addr-modal-overlay" onClick={() => setModalView(null)}>
          <div className="addr-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="addr-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="addr-modal-title">
                  {modalView === 'coupons' && 'Available ASM Shine Coupons'}
                  {modalView === 'help' && '24x7 Customer Support & Help'}
                  {modalView === 'cards' && 'Payment Preferences (UPI & COD)'}
                  {modalView === 'language' && 'Select App Language'}
                  {modalView === 'devices' && 'Active Login Sessions'}
                  {modalView === 'notifications' && 'Notification Preferences'}
                  {modalView === 'privacy' && 'Privacy & Account Security'}
                  {modalView === 'reviews' && 'My Product Reviews'}
                  {modalView === 'qa' && 'Cleaning & Dilution Guide'}
                  {modalView === 'partner' && 'Wholesale & Bulk Dealership'}
                  {modalView === 'faq' && 'Frequently Asked Questions'}
                </span>
              </div>
              <button
                type="button"
                className="addr-modal-close"
                onClick={() => setModalView(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="addr-modal-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 1. Dynamic Coupons Modal (Backed by MongoDB & Controlled via Admin Panel) */}
              {modalView === 'coupons' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {loadingCoupons ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      Loading available coupons...
                    </div>
                  ) : availableCoupons.length > 0 ? (
                    availableCoupons.map((c) => (
                      <div
                        key={c._id || c.code}
                        style={{
                          border: '1px dashed #2874F0',
                          borderRadius: '8px',
                          padding: '14px',
                          backgroundColor: '#F0F7FF',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '15px', color: '#1E3A8A', letterSpacing: '0.5px' }}>{c.code}</strong>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#475569' }}>
                            {c.description || (c.discountType === 'percentage' ? `Flat ${c.discountValue}% OFF` : `Flat ₹${c.discountValue} OFF`)}
                            {c.minOrderValue > 0 ? ` (Min Order ₹${c.minOrderValue})` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="fk-hub-email-btn"
                          onClick={() => handleCopyCoupon(c.code)}
                        >
                          {copiedCoupon === c.code ? 'COPIED!' : 'COPY'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      No active coupons available right now. Check back soon!
                    </div>
                  )}
                </div>
              )}

              {/* 2. HELP CENTER MODAL */}
              {modalView === 'help' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                    Our dedicated ASM Shine support team is available to assist you with order status, tracking, bulk inquiries, and product dilution advice.
                  </p>
                  
                  <a
                    href="tel:9876543210"
                    style={{ textDecoration: 'none', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                  >
                    <Phone size={20} color="#2874F0" />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>Call Support Helpline</strong>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>1800-ASM-SHINE / +91 98765 43210</span>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/919876543210?text=Hi%20ASM%20Shine%20Support%2C%20I%20need%20help%20with%20my%20order"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', border: '1px solid #BBF7D0', borderRadius: '8px', backgroundColor: '#F0FDF4' }}
                  >
                    <MessageSquare size={20} color="#16A34A" />
                    <div>
                      <strong style={{ fontSize: '14px', color: '#166534', display: 'block' }}>WhatsApp Support</strong>
                      <span style={{ fontSize: '12px', color: '#15803D' }}>Chat directly with our hygiene team</span>
                    </div>
                  </a>

                  <a
                    href="mailto:support@asmshine.com"
                    style={{ textDecoration: 'none', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                  >
                    <Mail size={20} color="#2874F0" />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>Email Support</strong>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>support@asmshine.com</span>
                    </div>
                  </a>
                </div>
              )}

              {/* 3. PAYMENT PREFERENCES MODAL */}
              {modalView === 'cards' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CreditCard size={20} color="#2874F0" />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>UPI Quick Pay</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>Google Pay, PhonePe, Paytm, BHIM UPI</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>Active</span>
                  </div>

                  <div style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShoppingBag size={20} color="#2874F0" />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>Cash on Delivery (COD)</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>Pay cash or UPI upon delivery at doorstep</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>Available</span>
                  </div>

                  <div style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldCheck size={20} color="#16A34A" />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>Cards &amp; Net Banking</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>100% secure payment gateway with SSL encryption</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>Secure</span>
                  </div>
                </div>
              )}

              {/* 4. LANGUAGE MODAL */}
              {modalView === 'language' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { code: 'en', name: 'English', native: 'English' },
                    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
                    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
                    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
                    { code: 'ta', name: 'Tamil', native: 'தமிழ்' }
                  ].map((lang) => (
                    <div
                      key={lang.code}
                      onClick={() => {
                        showToast(`App language set to ${lang.name} (${lang.native})`);
                        setModalView(null);
                      }}
                      style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: lang.code === 'en' ? '#EFF6FF' : '#FFFFFF' }}
                    >
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0F172A' }}>{lang.name}</strong>
                        <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '8px' }}>({lang.native})</span>
                      </div>
                      {lang.code === 'en' && <Check size={18} color="#2874F0" />}
                    </div>
                  ))}
                </div>
              )}

              {/* 5. MANAGE DEVICES MODAL */}
              {modalView === 'devices' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px 14px', border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Smartphone size={22} color="#16A34A" />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '14px', color: '#166534', display: 'block' }}>Current Browser Session</strong>
                      <span style={{ fontSize: '12px', color: '#15803D' }}>India • Active Now</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534' }}>THIS DEVICE</span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                    Your session is protected with secure HTTP-only cookies and token expiry.
                  </p>

                  <button
                    type="button"
                    className="fk-hub-logout-card"
                    style={{ padding: '10px' }}
                    onClick={() => {
                      showToast('Signed out of all other devices successfully.');
                      setModalView(null);
                    }}
                  >
                    <span>Sign Out from Other Devices</span>
                  </button>
                </div>
              )}

              {/* 6. PARTNER / WHOLESALE MODAL */}
              {modalView === 'partner' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Wholesale Dealership &amp; Bulk Supply</strong>
                    <p style={{ fontSize: '12.5px', color: '#475569', margin: '6px 0 0 0', lineHeight: '1.5' }}>
                      ASM Shine supplies directly to supermarkets, distributors, hotels, hospitals, offices, and housing societies at factory-direct wholesale rates in 500ml, 1L, and 5L commercial carboys.
                    </p>
                  </div>

                  <a
                    href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20interested%20in%20becoming%20an%20ASM%20Shine%20distributor%20or%20bulk%20buyer."
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none', color: '#FFFFFF', backgroundColor: '#16A34A', padding: '12px', borderRadius: '6px', textAlign: 'center', fontWeight: 700, fontSize: '14px', display: 'block' }}
                  >
                    Connect on WhatsApp for Wholesale Rates
                  </a>
                </div>
              )}

              {/* 7. CLEANING & DILUTION GUIDE MODAL */}
              {modalView === 'qa' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
                  <div style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                    <strong style={{ fontSize: '13.5px', color: '#1E3A8A', display: 'block', marginBottom: '4px' }}>🚽 ASM Shine Power Toilet Cleaner</strong>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Apply undiluted directly under the toilet rim. Allow thick formula to coat for 15-20 minutes to dissolve tough yellow lime scale and kill 99.9% germs. Scrub lightly with toilet brush and flush.
                    </p>
                  </div>

                  <div style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                    <strong style={{ fontSize: '13.5px', color: '#1E3A8A', display: 'block', marginBottom: '4px' }}>✨ Surface &amp; Floor Disinfectant</strong>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Dilute 1 cap (20ml) into half bucket of water (approx. 4 Litres). Mop gently over tiles, marble, and granite. No need to rinse. Dries fast without slippery residue.
                    </p>
                  </div>

                  <div style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                    <strong style={{ fontSize: '13.5px', color: '#1E3A8A', display: 'block', marginBottom: '4px' }}>🪞 Crystal Glass &amp; Mirror Cleaner</strong>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Turn spray nozzle to ON. Spray mist directly from 15-20 cm distance. Wipe immediately with clean dry microfiber cloth for streak-free sparkling shine.
                    </p>
                  </div>

                  <div style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                    <strong style={{ fontSize: '13.5px', color: '#1E3A8A', display: 'block', marginBottom: '4px' }}>🍽️ Concentrated Dishwash Gel</strong>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Mix 1 teaspoon (4ml) in a small bowl of water (approx. 40ml). Dip sponge and clean utensils to dissolve oil, curry stains, and food odors easily.
                    </p>
                  </div>
                </div>
              )}

              {/* 8. FAQ MODAL */}
              {modalView === 'faq' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
                  <div style={{ padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>How long does delivery take?</strong>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '3px' }}>
                      Orders are dispatched within 24 hours. Delivery takes 1-2 days in Delhi-NCR and 3-5 business days across Pan-India.
                    </span>
                  </div>

                  <div style={{ padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Are ASM Shine products safe for septic tanks?</strong>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '3px' }}>
                      Yes, all our formulas are non-corrosive, plumbing-safe, and compatible with domestic septic systems.
                    </span>
                  </div>

                  <div style={{ padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>What is the 30-Day Return &amp; Refund Policy?</strong>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '3px' }}>
                      If any bottle arrives leaking, broken, or not to your satisfaction, contact us for an instant free replacement or 100% refund.
                    </span>
                  </div>

                  <div style={{ padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Is Cash on Delivery available?</strong>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '3px' }}>
                      Yes, Cash on Delivery is available for all serviceable pin codes across India.
                    </span>
                  </div>
                </div>
              )}

              {/* 9. REVIEWS / NOTIFICATIONS / PRIVACY */}
              {['reviews', 'notifications', 'privacy'].includes(modalView) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    {modalView === 'reviews' && 'You haven’t submitted any product reviews yet. Once your order arrives, share your honest feedback to help fellow homemakers choose the best cleaners!'}
                    {modalView === 'notifications' && 'You will receive real-time order confirmation, dispatch alerts, and tracking links directly via Email and SMS.'}
                    {modalView === 'privacy' && 'Your account data, delivery addresses, and payment details are encrypted using industry-standard SSL/TLS protocols. We never share your information with third parties.'}
                  </p>
                  <button
                    type="button"
                    className="fk-hub-email-btn"
                    onClick={() => setModalView(null)}
                    style={{ alignSelf: 'flex-end', padding: '8px 20px' }}
                  >
                    Got It
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
