import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Check,
  Tag,
  CreditCard,
  Truck,
  ChevronRight,
  MapPin,
  Lock,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  Zap,
  Phone
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartWishlist } from '../context/CartWishlistContext';
import { useAuth } from '../context/AuthContext';
import { AddressSelectModal } from '../components/ui/AddressSelectModal';
import { api } from '../services/api';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buyNowId = searchParams.get('buyNow');
  const { cartData, clearCart, showToast, updateCartQuantity } = useCartWishlist();
  const { user, selectedAddress, selectAddress } = useAuth();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cod'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('POWER20');
  const [couponInput, setCouponInput] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Address State - dynamically synced with selectedAddress and user account
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [address, setAddress] = useState(() => {
    if (selectedAddress) {
      return {
        name: selectedAddress.fullName || selectedAddress.name || '',
        type: selectedAddress.type || 'HOME',
        phone: selectedAddress.phone || user?.phone || '',
        street: selectedAddress.street || '',
        city: selectedAddress.city || '',
        pincode: selectedAddress.pincode || '',
        state: selectedAddress.state || ''
      };
    }
    const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (defaultAddr) {
      return {
        name: defaultAddr.fullName || defaultAddr.name || user?.name || '',
        type: defaultAddr.type || 'HOME',
        phone: defaultAddr.phone || user?.phone || '',
        street: defaultAddr.street || '',
        city: defaultAddr.city || '',
        pincode: defaultAddr.pincode || '',
        state: defaultAddr.state || ''
      };
    }
    return {
      name: user?.name || '',
      type: 'HOME',
      phone: user?.phone || '',
      street: '',
      city: '',
      pincode: '',
      state: ''
    };
  });

  // Dynamically keep address in sync when user selects a different address
  useEffect(() => {
    if (selectedAddress) {
      setAddress({
        name: selectedAddress.fullName || selectedAddress.name || user?.name || '',
        type: selectedAddress.type || 'HOME',
        phone: selectedAddress.phone || user?.phone || '',
        street: selectedAddress.street || '',
        city: selectedAddress.city || '',
        pincode: selectedAddress.pincode || '',
        state: selectedAddress.state || ''
      });
    }
  }, [selectedAddress, user]);

  // Load items: if buyNow query param is present, load that product directly; otherwise use cartData
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        if (buyNowId) {
          const prod = await api.getProductById(buyNowId);
          if (prod) {
            setCheckoutItems([{ product: prod, quantity: 1 }]);
          }
        } else if (cartData?.items && cartData.items.length > 0) {
          setCheckoutItems(cartData.items);
        } else {
          // If cart is empty, fallback to fetching all products and taking product 1
          const prods = await api.getProducts();
          if (prods && prods.length > 0) {
            setCheckoutItems([{ product: prods[0], quantity: 1 }]);
          }
        }
      } catch (e) {
        console.error('Failed to load checkout items:', e);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [buyNowId, cartData]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleQuantityChange = (productId, delta) => {
    setCheckoutItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: nextQty };
          }
          return item;
        })
    );
    if (!buyNowId) {
      const current = checkoutItems.find((i) => i.product.id === productId);
      if (current) {
        updateCartQuantity(productId, Math.max(1, current.quantity + delta));
      }
    }
  };

  // Calculations
  const totalMRP = checkoutItems.reduce(
    (sum, item) => sum + (item.product.originalPrice || item.product.price * 1.5) * item.quantity,
    0
  );
  const itemsSubtotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const productDiscount = totalMRP - itemsSubtotal;

  // Coupon discount (20% with POWER20)
  const couponDiscount = appliedCoupon === 'POWER20' ? Math.round(itemsSubtotal * 0.2) : 0;

  // Extra 5% instant UPI prepaid discount
  const prepaidDiscount = paymentMethod === 'upi' ? Math.round((itemsSubtotal - couponDiscount) * 0.05) : 0;

  const finalPayable = Math.max(0, itemsSubtotal - couponDiscount - prepaidDiscount);
  const totalSavings = productDiscount + couponDiscount + prepaidDiscount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim().toUpperCase() === 'POWER20') {
      setAppliedCoupon('POWER20');
      showToast('Coupon POWER20 applied! 20% discount added');
    } else {
      showToast('Invalid coupon. Try POWER20');
    }
    setCouponInput('');
  };

  const handlePlaceOrder = async () => {
    if (orderSubmitting) return;

    // Validate delivery address
    if (!address.name || !address.phone || !address.pincode || !address.street || !address.city || !address.state) {
      showToast('Please enter your complete delivery address before placing order.');
      setIsChangingAddress(true);
      return;
    }

    if (!checkoutItems || checkoutItems.length === 0) {
      showToast('No items to checkout.');
      return;
    }

    setOrderSubmitting(true);
    try {
      const orderPayload = {
        items: checkoutItems.map((item) => ({
          productId: item.product.id || item.product._id,
          quantity: item.quantity || 1,
          size: item.size || item.product.size || ''
        })),
        shippingAddress: {
          fullName: address.name,
          name: address.name,
          phone: address.phone,
          pincode: address.pincode,
          street: address.street,
          city: address.city,
          state: address.state,
          type: address.type || 'HOME'
        },
        paymentMethod,
        couponCode: appliedCoupon
      };

      const response = await api.createOrder(orderPayload);
      if (response && response.success && response.order) {
        const placedOrderId = response.order.orderId || response.order.id;
        setOrderId(placedOrderId);
        setOrderPlaced(true);
        await clearCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response.message || 'Order could not be confirmed.');
      }
    } catch (err) {
      showToast(err.message || 'Failed to place order. Please try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fk-checkout-loading">
        <p>Loading secure Flipkart checkout...</p>
      </div>
    );
  }

  // --- ORDER SUCCESS SCREEN ---
  if (orderPlaced) {
    return (
      <div className="fk-order-success-view">
        <div className="fk-success-card">
          <div className="fk-success-icon-wrap">
            <Check size={36} strokeWidth={3} color="#FFFFFF" />
          </div>

          <h2 className="fk-success-title">Order Placed Successfully!</h2>
          <p className="fk-success-id">
            Order Reference: <strong>{orderId}</strong>
          </p>
          <span className="fk-success-badge">
            <ShieldCheck size={13} /> 100% Authentic ASM Shine Hygiene Formulation
          </span>

          <div className="fk-success-delivery-box">
            <div className="fk-delivery-date-row">
              <Truck size={18} color="#1C8E8F" />
              <div>
                <strong>Estimated Delivery: Tomorrow by 8:00 PM</strong>
                <span>Pan-India Express Air Shipping</span>
              </div>
            </div>

            <div className="fk-success-address">
              <span>Delivering to: <strong>{address.name}</strong></span>
              <p>{address.street}, {address.city} - {address.pincode}</p>
            </div>
          </div>

          <div className="fk-success-summary-box">
            <div className="fk-success-row">
              <span>Total Paid ({checkoutItems.length} items):</span>
              <strong className="fk-success-amount">₹{finalPayable}</strong>
            </div>
            <div className="fk-success-row savings">
              <span>Total Saved on this Order:</span>
              <span className="fk-saved-text">₹{totalSavings} ({(totalSavings / totalMRP * 100).toFixed(0)}% OFF)</span>
            </div>
          </div>

          <div className="fk-success-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="fk-btn-continue"
              onClick={() => navigate('/account')}
              id="view-orders-btn"
              style={{ backgroundColor: '#2874F0', color: '#FFFFFF' }}
            >
              <span>View in My Orders</span>
            </button>
            <button
              type="button"
              className="fk-btn-continue"
              onClick={() => navigate('/')}
            >
              <ShoppingBag size={15} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fk-checkout-page">
      {/* 1. Flipkart-style Header with Steps */}
      <header className="fk-checkout-header">
        <div className="fk-checkout-header-bar">
          <button
            type="button"
            className="fk-checkout-back-btn"
            onClick={handleBack}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="fk-checkout-title-wrap">
            <h1 className="fk-checkout-title">Order Summary</h1>
            <span className="fk-checkout-subtitle">Step 2 of 3 • ASM Shine Official</span>
          </div>
          <div className="fk-checkout-secure-pill">
            <Lock size={12} />
            <span>100% SECURE</span>
          </div>
        </div>

        {/* 3 Steps Indicator */}
        <div className="fk-checkout-steps-strip">
          <div className="fk-step completed">
            <span className="fk-step-circle"><Check size={11} strokeWidth={3} /></span>
            <span className="fk-step-label">Address</span>
          </div>
          <div className="fk-step-line completed" />
          <div className="fk-step active">
            <span className="fk-step-circle">2</span>
            <span className="fk-step-label">Order Summary</span>
          </div>
          <div className="fk-step-line" />
          <div className="fk-step">
            <span className="fk-step-circle">3</span>
            <span className="fk-step-label">Payment</span>
          </div>
        </div>
      </header>

      <main className="fk-checkout-body">
        {/* 2. Flipkart Delivery Address Card */}
        <section className="fk-checkout-card fk-address-card">
          <div className="fk-card-header">
            <div className="fk-deliver-to-line">
              <span className="fk-deliver-lbl">Deliver to:</span>
              <strong className="fk-deliver-name">{address.name}</strong>
              <span className="fk-addr-type-pill">{address.type}</span>
            </div>
            <button
              type="button"
              className="fk-change-addr-btn"
              onClick={() => setIsAddressModalOpen(true)}
            >
              Change
            </button>
          </div>

          {!isChangingAddress ? (
            <div className="fk-address-content">
              <p className="fk-address-text">
                {address.street}, {address.city}, {address.state} - {address.pincode}
              </p>
              <span className="fk-address-phone">Phone: {address.phone}</span>
            </div>
          ) : (
            <div className="fk-address-edit-box">
              <input
                type="text"
                className="fk-addr-input"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                placeholder="Full Name"
              />
              <input
                type="text"
                className="fk-addr-input"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                placeholder="Mobile Number"
              />
              <input
                type="text"
                className="fk-addr-input"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="Flat / House / Street"
              />
              <div className="fk-addr-row">
                <input
                  type="text"
                  className="fk-addr-input"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City"
                />
                <input
                  type="text"
                  className="fk-addr-input"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="Pincode"
                />
              </div>
              <button
                type="button"
                className="fk-save-addr-btn"
                onClick={() => {
                  setIsChangingAddress(false);
                  showToast('Delivery address updated');
                }}
              >
                Save &amp; Deliver Here
              </button>
            </div>
          )}
        </section>

        {/* 3. Items Being Ordered (Flipkart Card Format) */}
        <section className="fk-checkout-card fk-items-card">
          <div className="fk-card-header-simple">
            <span className="fk-section-tag">ITEMS IN THIS ORDER ({checkoutItems.length})</span>
          </div>

          <div className="fk-checkout-items-list">
            {checkoutItems.map((item) => (
              <div className="fk-checkout-item-row" key={item.product.id}>
                <div className="fk-item-thumb-box">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="fk-item-thumb-img"
                  />
                </div>

                <div className="fk-item-details-box">
                  <h3 className="fk-item-title">{item.product.name}</h3>
                  <div className="fk-item-seller-line">
                    <span className="fk-seller-name">Seller: ASM Shine Official Store</span>
                    <span className="fk-certified-tag">
                      <CheckCircle2 size={11} color="#15803D" /> Certified
                    </span>
                  </div>

                  <div className="fk-item-price-line">
                    <span className="fk-item-curr-price">₹{item.product.price}</span>
                    <span className="fk-item-mrp">
                      ₹{item.product.originalPrice || Math.round(item.product.price * 1.5)}
                    </span>
                    <span className="fk-item-disc">
                      {item.product.discountPercent || 40}% off
                    </span>
                  </div>

                  <div className="fk-item-delivery-pill">
                    <Truck size={12} color="#15803D" />
                    <span>Free Delivery by Tomorrow, 8 PM</span>
                  </div>

                  {/* Qty Switcher */}
                  <div className="fk-item-qty-row">
                    <span className="fk-qty-label">Quantity:</span>
                    <div className="fk-qty-control-pill">
                      <button
                        type="button"
                        className="fk-qty-btn"
                        onClick={() => handleQuantityChange(item.product.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="fk-qty-val">{item.quantity}</span>
                      <button
                        type="button"
                        className="fk-qty-btn"
                        onClick={() => handleQuantityChange(item.product.id, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Flipkart Coupon Strip */}
        <section className="fk-checkout-card fk-coupon-card">
          <div className="fk-coupon-header">
            <Tag size={16} color="#1C8E8F" />
            <div className="fk-coupon-text-block">
              <strong>Coupons &amp; Offers</strong>
              {appliedCoupon ? (
                <span className="fk-applied-coupon-text">
                  Code <strong>{appliedCoupon}</strong> Applied: Flat 20% Off Launch Deal!
                </span>
              ) : (
                <span>Apply coupon code for instant savings</span>
              )}
            </div>
            {appliedCoupon ? (
              <button
                type="button"
                className="fk-coupon-remove-btn"
                onClick={() => {
                  setAppliedCoupon(null);
                  showToast('Coupon removed');
                }}
              >
                Remove
              </button>
            ) : null}
          </div>

          {!appliedCoupon && (
            <form className="fk-coupon-form" onSubmit={handleApplyCoupon}>
              <input
                type="text"
                className="fk-coupon-input"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter coupon code (try POWER20)"
              />
              <button type="submit" className="fk-coupon-apply-btn">
                Apply
              </button>
            </form>
          )}
        </section>

        {/* 5. Payment Options Selector (Flipkart Exact) */}
        <section className="fk-checkout-card fk-payment-card">
          <div className="fk-card-header-simple">
            <span className="fk-section-tag">SELECT PAYMENT METHOD</span>
          </div>

          <div className="fk-payment-options-list">
            {/* Option 1: UPI */}
            <div
              className={`fk-payment-opt ${paymentMethod === 'upi' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              <div className="fk-opt-radio">
                <div className={`fk-radio-dot ${paymentMethod === 'upi' ? 'checked' : ''}`} />
              </div>
              <div className="fk-opt-info">
                <div className="fk-opt-title-row">
                  <strong>UPI (Google Pay, PhonePe, Paytm, Any UPI)</strong>
                  <span className="fk-upi-instant-badge">EXTRA 5% OFF</span>
                </div>
                <p className="fk-opt-desc">Pay directly from your bank via any UPI App. Zero fees.</p>

                {paymentMethod === 'upi' && (
                  <div className="fk-upi-suboptions">
                    <div className="fk-upi-app-chips">
                      <button
                        type="button"
                        className={`fk-upi-chip ${selectedUpiApp === 'gpay' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpiApp('gpay');
                        }}
                      >
                        Google Pay
                      </button>
                      <button
                        type="button"
                        className={`fk-upi-chip ${selectedUpiApp === 'phonepe' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpiApp('phonepe');
                        }}
                      >
                        PhonePe
                      </button>
                      <button
                        type="button"
                        className={`fk-upi-chip ${selectedUpiApp === 'paytm' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpiApp('paytm');
                        }}
                      >
                        Paytm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Option 2: Credit / Debit / ATM Card */}
            <div
              className={`fk-payment-opt ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="fk-opt-radio">
                <div className={`fk-radio-dot ${paymentMethod === 'card' ? 'checked' : ''}`} />
              </div>
              <div className="fk-opt-info">
                <div className="fk-opt-title-row">
                  <strong>Credit / Debit / ATM Card</strong>
                </div>
                <p className="fk-opt-desc">Visa, MasterCard, RuPay, Maestro, Diners</p>
              </div>
            </div>

            {/* Option 3: Net Banking */}
            <div
              className={`fk-payment-opt ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('netbanking')}
            >
              <div className="fk-opt-radio">
                <div className={`fk-radio-dot ${paymentMethod === 'netbanking' ? 'checked' : ''}`} />
              </div>
              <div className="fk-opt-info">
                <div className="fk-opt-title-row">
                  <strong>Net Banking</strong>
                </div>
                <p className="fk-opt-desc">All Indian banks supported (HDFC, ICICI, SBI, Axis)</p>
              </div>
            </div>

            {/* Option 4: Cash on Delivery */}
            <div
              className={`fk-payment-opt ${paymentMethod === 'cod' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('cod')}
            >
              <div className="fk-opt-radio">
                <div className={`fk-radio-dot ${paymentMethod === 'cod' ? 'checked' : ''}`} />
              </div>
              <div className="fk-opt-info">
                <div className="fk-opt-title-row">
                  <strong>Cash on Delivery (COD)</strong>
                </div>
                <p className="fk-opt-desc">Pay cash or scan QR code when your order arrives</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Flipkart Price Details Table */}
        <section className="fk-checkout-card fk-price-details-card">
          <div className="fk-card-header-simple">
            <span className="fk-price-head-title">PRICE DETAILS</span>
          </div>

          <div className="fk-price-rows-list">
            <div className="fk-price-line">
              <span>Price ({checkoutItems.length} items)</span>
              <span>₹{totalMRP}</span>
            </div>

            <div className="fk-price-line">
              <span>Discount</span>
              <span className="fk-green-text">-₹{productDiscount}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="fk-price-line">
                <span>Coupon Discount (POWER20)</span>
                <span className="fk-green-text">-₹{couponDiscount}</span>
              </div>
            )}

            {prepaidDiscount > 0 && (
              <div className="fk-price-line">
                <span>Prepaid UPI Discount (5% Instant)</span>
                <span className="fk-green-text">-₹{prepaidDiscount}</span>
              </div>
            )}

            <div className="fk-price-line">
              <span>Delivery Charges</span>
              <span className="fk-green-text">
                <span className="fk-striked">₹70</span> FREE
              </span>
            </div>

            <div className="fk-price-line">
              <span>Packaging Charges</span>
              <span className="fk-green-text">FREE</span>
            </div>

            <div className="fk-total-payable-row">
              <strong>Total Amount</strong>
              <strong className="fk-total-num">₹{finalPayable}</strong>
            </div>
          </div>

          {/* Green Savings Footer Banner */}
          <div className="fk-savings-strip">
            <CheckCircle2 size={14} color="#15803D" />
            <span>You will save ₹{totalSavings} on this order</span>
          </div>
        </section>

        {/* 7. Flipkart Safe & Secure Guarantee */}
        <div className="fk-secure-assurance">
          <ShieldCheck size={20} color="#1C8E8F" />
          <div className="fk-secure-assurance-text">
            <strong>Safe and Secure Payments. 100% Authentic Products.</strong>
            <span>Directly dispatched from ASM Shine Hygiene Labs</span>
          </div>
        </div>
      </main>

      {/* 8. Flipkart Mobile Sticky Bottom Action Bar */}
      <footer className="fk-checkout-bottom-bar">
        <div className="fk-bottom-price-info">
          <span className="fk-bottom-total-lbl">₹{finalPayable}</span>
          <span className="fk-bottom-view-price">Total Payable</span>
        </div>

        <button
          type="button"
          className="fk-btn-place-order"
          onClick={handlePlaceOrder}
          disabled={orderSubmitting}
          style={{ opacity: orderSubmitting ? 0.7 : 1, cursor: orderSubmitting ? 'not-allowed' : 'pointer' }}
          id="checkout-place-order-btn"
        >
          <span>{orderSubmitting ? 'SECURING ORDER...' : 'PLACE ORDER'}</span>
          <ChevronRight size={16} strokeWidth={2.8} />
        </button>
      </footer>

      {/* Dynamic Delivery Address Selection Modal */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </div>
  );
};
