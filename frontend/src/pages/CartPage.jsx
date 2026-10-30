import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Tag,
  CheckCircle2,
  ShoppingBag,
  MapPin,
  ChevronRight,
  Sparkles,
  Zap,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../context/CartWishlistContext';
import { useAuth } from '../context/AuthContext';
import { AddressSelectModal } from '../components/ui/AddressSelectModal';
import { api } from '../services/api';
import '../styles/skeleton.css';

/**
 * Flipkart-Tier Skeleton Loader for Cart Page
 * Displays full structural shimmer cards while cart data hydrates
 */
function CartSkeletonLoader({ onBack }) {
  return (
    <div className="cart-page-view cart-skeleton-page" aria-busy="true" aria-label="Loading your cart">
      {/* 1. Flipkart-style Top Bar */}
      <header className="page-top-header">
        <button type="button" className="page-back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div className="page-header-title-box">
          <span className="page-header-title">My Cart</span>
          <span className="page-header-subtitle">Updating cart...</span>
        </div>
      </header>

      {/* 2. Address Banner Skeleton */}
      <div className="cart-skeleton-addr-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div className="skeleton-circle skeleton-shimmer" style={{ width: '22px', height: '22px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <div className="skeleton-text skeleton-shimmer" style={{ width: '55%', height: '13px' }} />
            <div className="skeleton-text skeleton-shimmer" style={{ width: '35%', height: '11px' }} />
          </div>
        </div>
        <div className="skeleton-box skeleton-shimmer" style={{ width: '60px', height: '26px', borderRadius: '4px' }} />
      </div>

      {/* 3. Main Cart Grid Skeleton */}
      <div className="cart-skeleton-container">
        {/* Items Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2].map((n) => (
            <div key={n} className="cart-skeleton-card">
              <div className="cart-skeleton-item-top">
                <div className="cart-skeleton-thumb skeleton-shimmer" />
                <div className="cart-skeleton-item-details">
                  <div className="skeleton-box skeleton-shimmer" style={{ width: '70px', height: '14px', borderRadius: '3px' }} />
                  <div className="skeleton-text skeleton-shimmer" style={{ width: '85%', height: '14px' }} />
                  <div className="skeleton-text skeleton-shimmer" style={{ width: '50%', height: '12px' }} />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <div className="skeleton-box skeleton-shimmer" style={{ width: '65px', height: '18px', borderRadius: '4px' }} />
                    <div className="skeleton-box skeleton-shimmer" style={{ width: '45px', height: '14px', borderRadius: '4px' }} />
                    <div className="skeleton-box skeleton-shimmer" style={{ width: '55px', height: '14px', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
              <div className="cart-skeleton-actions-row">
                <div className="skeleton-box skeleton-shimmer" style={{ width: '90px', height: '32px', borderRadius: '6px' }} />
                <div className="skeleton-box skeleton-shimmer" style={{ width: '75px', height: '16px', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary Column */}
        <div className="cart-skeleton-price-card">
          <div className="skeleton-text skeleton-shimmer" style={{ width: '120px', height: '14px', marginBottom: '6px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton-text skeleton-shimmer" style={{ width: '90px', height: '12px' }} />
            <div className="skeleton-text skeleton-shimmer" style={{ width: '50px', height: '12px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton-text skeleton-shimmer" style={{ width: '100px', height: '12px' }} />
            <div className="skeleton-text skeleton-shimmer" style={{ width: '60px', height: '12px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton-text skeleton-shimmer" style={{ width: '80px', height: '12px' }} />
            <div className="skeleton-text skeleton-shimmer" style={{ width: '40px', height: '12px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed #E2E8F0' }}>
            <div className="skeleton-text skeleton-shimmer" style={{ width: '110px', height: '16px' }} />
            <div className="skeleton-text skeleton-shimmer" style={{ width: '70px', height: '16px' }} />
          </div>
          <div className="skeleton-box skeleton-shimmer" style={{ height: '44px', borderRadius: '6px', marginTop: '10px' }} />
        </div>
      </div>
    </div>
  );
}

export const CartPage = ({
  onBack,
  onSelectProduct,
  onExploreCatalog
}) => {
  const navigate = useNavigate();
  const {
    cartData,
    isCartLoading,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    showToast,
    refreshCart
  } = useCartWishlist();
  const { user, selectedAddress } = useAuth();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleSelectProduct = (product) => {
    if (onSelectProduct) onSelectProduct(product);
    else navigate(`/product/${product.id}`);
  };

  const handleExplore = () => {
    if (onExploreCatalog) onExploreCatalog();
    else navigate('/');
  };

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponApplying, setCouponApplying] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Safe fallback properties ensuring zero crashes even during asynchronous hydration
  const cartItems = Array.isArray(cartData?.items) ? cartData.items : [];
  const totalCount = typeof cartData?.totalCount === 'number' ? cartData.totalCount : cartItems.length;
  const totalMRP = cartData?.totalMRP || 0;
  const totalPrice = cartData?.totalPrice || 0;
  const totalDiscount = cartData?.totalDiscount || 0;

  const [deliverySettings, setDeliverySettings] = useState({
    freeShippingThreshold: 499,
    standardDeliveryFee: 49
  });

  // Fetch active coupons & delivery rules from backend on mount
  useEffect(() => {
    let isMounted = true;
    api.getAvailableCoupons().then((list) => {
      if (isMounted) setAvailableCoupons(list || []);
    }).catch(() => {});

    api.getDeliverySettings().then((s) => {
      if (isMounted && s) setDeliverySettings(s);
    }).catch(() => {});

    // Live sync when products are updated or deleted in admin
    const handleSync = (e) => {
      if (e.data?.type === 'PRODUCTS_UPDATED') {
        refreshCart();
      }
    };

    let channel = null;
    try {
      channel = new BroadcastChannel('asm_admin_sync');
      channel.addEventListener('message', handleSync);
    } catch {}

    const handleFocus = () => {
      refreshCart();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      if (channel) channel.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    setCouponApplying(true);
    try {
      const res = await api.validateCoupon(code, totalPrice);
      if (res && res.valid) {
        setAppliedCoupon({
          code: res.coupon.code,
          percent: res.coupon.discountValue,
          discount: res.discountAmount,
          description: res.coupon.description,
          discountType: res.coupon.discountType
        });
        showToast(res.message || `Coupon ${res.coupon.code} applied!`);
        setCouponInput('');
      }
    } catch (err) {
      showToast(err.message || 'Invalid coupon code');
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  // Recalculate applied coupon discount if cart total changes
  useEffect(() => {
    if (appliedCoupon?.code && totalPrice > 0) {
      api.validateCoupon(appliedCoupon.code, totalPrice).then((res) => {
        if (res && res.valid) {
          setAppliedCoupon((prev) => ({
            ...prev,
            discount: res.discountAmount
          }));
        } else {
          setAppliedCoupon(null);
          showToast('Coupon removed: Order subtotal no longer qualifies.');
        }
      }).catch(() => {
        setAppliedCoupon(null);
      });
    }
  }, [totalPrice]);

  const couponDiscount = appliedCoupon?.discount || 0;
  const netSubtotal = Math.max(0, totalPrice - couponDiscount);
  const threshold = Number(deliverySettings?.freeShippingThreshold) || 499;
  const standardDeliveryFee = Number(deliverySettings?.standardDeliveryFee) || 49;
  const isFreeDelivery = cartItems.length === 0 || netSubtotal >= threshold;
  const deliveryFee = isFreeDelivery ? 0 : standardDeliveryFee;
  const amountNeededForFree = Math.max(0, threshold - netSubtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((netSubtotal / threshold) * 100));

  const finalPrice = Math.max(netSubtotal + deliveryFee, 0);
  const totalSavings = totalDiscount + couponDiscount + (isFreeDelivery && cartItems.length > 0 ? standardDeliveryFee : 0);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout', { state: { appliedCoupon, deliveryFee, isFreeDelivery } });
  };

  useEffect(() => {
    // Silent background refresh on mount to ensure freshness
    if (user && refreshCart) {
      refreshCart(false);
    }
  }, [user]);

  // If user is logged in and cart is actively hydrating with zero items in memory, show skeleton loader
  if (user && isCartLoading && cartItems.length === 0) {
    return <CartSkeletonLoader onBack={handleBack} />;
  }

  return (
    <div className="cart-page-view">
      {/* 1. Flipkart-style Top Bar */}
      <header className="page-top-header">
        <button
          type="button"
          className="page-back-btn"
          onClick={handleBack}
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="page-header-title-box">
          <span className="page-header-title">My Cart</span>
          <span className="page-header-subtitle">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </header>

      {/* 2. Delivery Address Banner (Authenticated Users) */}
      {user && (
        <div className="cart-address-banner">
          <div className="cart-address-left">
            <MapPin size={16} className="cart-pin-icon" />
            <div className="cart-address-text">
              {selectedAddress ? (
                <>
                  <span>
                    Deliver to:{' '}
                    <strong>
                      {selectedAddress.fullName || selectedAddress.name || 'Your Location'}, {selectedAddress.city} - {selectedAddress.pincode}
                    </strong>
                  </span>
                  <small>{selectedAddress.street ? `${selectedAddress.street} • ` : ''}Free Express Delivery</small>
                </>
              ) : (
                <>
                  <span>
                    <strong>Select Delivery Location</strong>
                  </span>
                  <small>Enter PIN code to check delivery speed & availability</small>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            className="cart-change-addr-btn"
            onClick={() => setIsAddressModalOpen(true)}
          >
            Change
          </button>
        </div>
      )}

      {/* 3. Empty State, Login Required, or Cart Items */}
      {!user ? (
        <div className="cart-empty-view">
          <div className="cart-empty-icon-box">
            <ShoppingBag size={56} color="#0284C7" />
          </div>
          <h2 className="cart-empty-title">Please Log In</h2>
          <p className="cart-empty-subtitle">
            Log in to your ASM Shine account to view your cart items, track orders, and checkout seamlessly.
          </p>
          <button
            type="button"
            className="cart-shop-now-btn"
            onClick={() => navigate('/login', { state: { from: '/cart' } })}
          >
            Login to Continue
          </button>
        </div>
      ) : cartItems.length === 0 && !orderSuccess ? (
        <div className="cart-empty-view">
          <div className="cart-empty-icon-box">
            <ShoppingBag size={56} color="#9E887B" />
          </div>
          <h2 className="cart-empty-title">Your Cart is Empty</h2>
          <p className="cart-empty-subtitle">
            Looks like you haven't added any cleaning products yet. Explore the ASM Shine collection!
          </p>
          <button
            type="button"
            className="cart-shop-now-btn"
            onClick={handleExplore}
          >
            Explore Cleaning Collection
          </button>
        </div>
      ) : orderSuccess ? (
        <div className="cart-order-success-card">
          <div className="order-success-icon-box">
            <CheckCircle2 size={54} color="#0284C7" />
          </div>
          <h2 className="order-success-title">Order Placed Successfully</h2>
          <div className="order-id-badge">Order ID: #{orderId}</div>
          <p className="order-success-note">
            Thank you for choosing ASM Shine. Your hygiene essentials order is being packed with utmost care!
          </p>
          <div className="order-summary-box">
            <div className="order-summary-row">
              <span>Delivery by:</span>
              <strong>Tomorrow by 5:00 PM (Express)</strong>
            </div>
            <div className="order-summary-row">
              <span>Delivery Address:</span>
              <span>
                {selectedAddress
                  ? `${selectedAddress.street ? `${selectedAddress.street}, ` : ''}${selectedAddress.city} - ${selectedAddress.pincode}`
                  : 'Select Delivery Location'}
              </span>
            </div>
            <div className="order-summary-row">
              <span>Payment Mode:</span>
              <strong style={{ color: '#0284C7' }}>Cash on Delivery (COD) / UPI</strong>
            </div>
          </div>
          <button
            type="button"
            className="cart-shop-now-btn"
            onClick={() => {
              setOrderSuccess(false);
              handleExplore();
            }}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content-container">
          {/* Dynamic Free Delivery Goal Tracker (Flipkart Exact) */}
          {cartItems.length > 0 && (
            isFreeDelivery ? (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Truck size={17} color="#059669" />
                <span style={{ color: '#065F46', fontSize: '13px', fontWeight: 600 }}>
                  🎉 Congratulations! You have unlocked <strong>FREE Express Delivery</strong> on this order.
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: '#1E40AF', fontWeight: 600 }}>
                    Add <strong>₹{amountNeededForFree}</strong> more to unlock <strong style={{ color: '#059669' }}>FREE Delivery!</strong>
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>{freeDeliveryProgress}%</span>
                </div>
                <div style={{ height: '6px', background: '#DBEAFE', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${freeDeliveryProgress}%`,
                      height: '100%',
                      background: '#2563EB',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            )
          )}

          {/* Cart Item Cards List */}
          <div className="cart-items-list">
            {cartItems.map(({ productId, product, quantity, itemTotal, itemMRP, itemSavings }) => (
              <div key={productId} className="cart-item-card">
                <div className="cart-item-top-row">
                  <div
                    className="cart-item-img-wrap"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <img src={product.image} alt={product.name} className="cart-item-img" />
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-brand-row">
                      <span className="cart-item-brand">ASM SHINE</span>
                      <span className="cart-assured-pill">
                        <Zap size={10} fill="#0284C7" color="#0284C7" />
                        <span>Certified</span>
                      </span>
                    </div>

                    <h3
                      className="cart-item-name"
                      onClick={() => handleSelectProduct(product)}
                    >
                      {product.name}
                    </h3>

                    {product.size && (
                      <div className="cart-item-variant">Size: {product.size}</div>
                    )}

                    <div className="cart-item-price-row">
                      <span className="cart-item-price">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="cart-item-mrp">₹{product.originalPrice}</span>
                      )}
                      {product.discountPercent && (
                        <span className="cart-item-discount">{product.discountPercent}% off</span>
                      )}
                    </div>

                    <div className="cart-delivery-tag">
                      <Truck size={13} color="#059669" />
                      <span>Free Delivery by Tomorrow</span>
                    </div>
                  </div>
                </div>

                {/* Stepper & Actions */}
                <div className="cart-item-actions-row">
                  <div className="cart-stepper">
                    <button
                      type="button"
                      className="cart-stepper-btn"
                      onClick={() => updateCartQuantity(productId, quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="cart-stepper-qty">{quantity}</span>
                    <button
                      type="button"
                      className="cart-stepper-btn"
                      onClick={() => updateCartQuantity(productId, quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(productId)}
                  >
                    <Trash2 size={15} />
                    <span>REMOVE</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div className="cart-section-card cart-coupon-card">
            <div className="cart-coupon-header">
              <Tag size={17} color="#7C3AED" />
              <span>Apply Coupons & Promo Codes</span>
            </div>

            {appliedCoupon ? (
              <div className="cart-coupon-applied">
                <div className="coupon-applied-text">
                  <strong>{appliedCoupon.code}</strong> applied: Saved ₹{appliedCoupon.discount}!
                </div>
                <button
                  type="button"
                  className="coupon-remove-btn"
                  onClick={handleRemoveCoupon}
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <>
                <div className="cart-coupon-input-box">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="coupon-text-input"
                    disabled={couponApplying}
                  />
                  <button
                    type="button"
                    className="coupon-apply-btn"
                    onClick={() => handleApplyCoupon()}
                    disabled={couponApplying}
                  >
                    {couponApplying ? '...' : 'APPLY'}
                  </button>
                </div>

                {availableCoupons.length > 0 && (
                  <div className="available-coupons-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {availableCoupons.map((c) => (
                      <div
                        key={c._id || c.code}
                        className="featured-coupon-chip"
                        onClick={() => handleApplyCoupon(c.code)}
                        style={{ cursor: 'pointer' }}
                        title="Click to apply"
                      >
                        <div className="feat-coupon-left">
                          <span className="feat-code">{c.code}</span>
                          <span className="feat-desc">{c.description}</span>
                        </div>
                        <span className="feat-tap-apply">TAP TO APPLY</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Price Details Breakdown Card (Flipkart Exact) */}
          <div className="cart-section-card cart-price-details-card">
            <h3 className="cart-price-heading">
              PRICE DETAILS ({totalCount} {totalCount === 1 ? 'Item' : 'Items'})
            </h3>

            <div className="cart-breakdown-row">
              <span>Total MRP</span>
              <span>₹{totalMRP}</span>
            </div>

            <div className="cart-breakdown-row discount">
              <span>Discount on MRP</span>
              <span className="green-text">- ₹{totalDiscount}</span>
            </div>

            {appliedCoupon && (
              <div className="cart-breakdown-row discount">
                <span>Coupon ({appliedCoupon.code})</span>
                <span className="green-text">- ₹{appliedCoupon.discount}</span>
              </div>
            )}

            <div className="cart-breakdown-row">
              <span>Delivery Charges</span>
              {isFreeDelivery ? (
                <span className="green-text">
                  <del style={{ color: '#94A3B8', marginRight: '4px' }}>₹{standardDeliveryFee}</del> FREE
                </span>
              ) : (
                <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{standardDeliveryFee}</span>
              )}
            </div>

            <div className="cart-total-amount-row">
              <span>Total Amount</span>
              <span className="cart-final-total-price">₹{finalPrice}</span>
            </div>

            <div className="cart-savings-note">
              You will save ₹{totalSavings} on this order
            </div>
          </div>

          {/* Trust & Assurance Strip */}
          <div className="cart-trust-banner">
            <ShieldCheck size={20} color="#0D9488" />
            <span>Safe and Secure Payments • 100% Authentic Products</span>
          </div>
        </div>
      )}

      {/* 4. Flipkart Sticky Bottom Checkout Bar */}
      {cartItems.length > 0 && !orderSuccess && (
        <div className="cart-bottom-checkout-bar">
          <div className="checkout-bar-price-col">
            <span className="checkout-bar-price">₹{finalPrice}</span>
            <span className="checkout-bar-link">Total Amount</span>
          </div>

          <button
            type="button"
            className="cart-place-order-btn"
            onClick={handlePlaceOrder}
          >
            <span>PLACE ORDER</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Dynamic Delivery Address Selection Modal */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </div>
  );
};
