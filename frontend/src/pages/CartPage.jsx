import React, { useState } from 'react';
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

export const CartPage = ({
  onBack,
  onSelectProduct,
  onExploreCatalog
}) => {
  const navigate = useNavigate();
  const {
    cartData,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    showToast
  } = useCartWishlist();
  const { selectedAddress } = useAuth();
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
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Safe fallback properties ensuring zero crashes even during asynchronous hydration
  const cartItems = Array.isArray(cartData?.items) ? cartData.items : [];
  const totalCount = typeof cartData?.totalCount === 'number' ? cartData.totalCount : cartItems.length;
  const totalMRP = cartData?.totalMRP || 0;
  const totalPrice = cartData?.totalPrice || 0;
  const totalDiscount = cartData?.totalDiscount || 0;

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    if (code === 'POWER20') {
      setAppliedCoupon({
        code: 'POWER20',
        percent: 20,
        discount: Math.round(totalPrice * 0.2)
      });
      showToast('Coupon POWER20 applied! 20% discount activated');
    } else {
      showToast('Invalid coupon code. Try POWER20');
    }
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const couponDiscount = appliedCoupon?.discount || 0;
  const finalPrice = Math.max(totalPrice - couponDiscount, 0);
  const totalSavings = totalDiscount + couponDiscount;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

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

      {/* 2. Delivery Address Banner */}
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

      {/* 3. Empty State or Cart Items */}
      {cartItems.length === 0 && !orderSuccess ? (
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
                    placeholder="Enter Coupon Code (e.g. CLEAN30)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="coupon-text-input"
                  />
                  <button
                    type="button"
                    className="coupon-apply-btn"
                    onClick={() => handleApplyCoupon()}
                  >
                    APPLY
                  </button>
                </div>

                <div className="featured-coupon-chip" onClick={() => handleApplyCoupon('CLEAN30')}>
                  <div className="feat-coupon-left">
                    <span className="feat-code">CLEAN30</span>
                    <span className="feat-desc">Get flat 30% OFF on all essentials</span>
                  </div>
                  <span className="feat-tap-apply">TAP TO APPLY</span>
                </div>
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
              <span className="green-text">
                <del style={{ color: '#94A3B8', marginRight: '4px' }}>₹40</del> FREE
              </span>
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
