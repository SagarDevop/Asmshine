import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  ShieldAlert,
  CreditCard,
  Package
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCartWishlist } from '../context/CartWishlistContext';
import '../styles/skeleton.css';
import '../styles/orderTracking.css';

export const CancelOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useCartWishlist();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cancelReason, setCancelReason] = useState('Ordered by mistake / duplicate order');
  const [cancelCustomNote, setCancelCustomNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    } else {
      setLoading(false);
      setError('No order ID specified.');
    }
  }, [orderId]);

  const loadOrder = async (id) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getOrderById(id);
      if (data) {
        setOrder(data);
      } else {
        setError(`Order #${id} not found.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const finalReason = cancelReason === 'Other'
        ? (cancelCustomNote.trim() || 'Other reason')
        : cancelReason;

      const res = await api.cancelOrder(order.orderId || order.id, finalReason);
      if (res && res.success !== false) {
        showToast('Order cancelled successfully.');
        navigate(`/order/${order.orderId || order.id}`, { replace: true });
      } else {
        throw new Error(res.message || 'Failed to cancel order.');
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const currentStatus = (order?.status || 'CONFIRMED').toUpperCase();
  const isCancelled = currentStatus === 'CANCELLED';

  // Strictly before shipping allowed:
  // Once SHIPPED or DELIVERED or RETURNED, cancellation is locked!
  const isCancellable = ['PENDING_CONFIRMATION', 'PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING'].includes(currentStatus);

  const items = order?.items || [];
  const firstItem = items[0] || {};
  const carrier = order?.shippingDetails?.carrier || 'BlueDart / Delhivery';
  const trackingNumber = order?.shippingDetails?.trackingNumber || '';
  const isCOD = (order?.paymentMethod || 'cod').toLowerCase() === 'cod';
  const couponDiscount = Number(order?.pricing?.couponDiscount || order?.coupon?.discountAmount || 0);

  // Loading State
  if (loading) {
    return (
      <div className="fk-order-tracking-page">
        <header className="fk-order-nav-header">
          <div className="fk-order-nav-header-inner">
            <div className="fk-order-nav-left">
              <button
                type="button"
                className="fk-order-back-btn"
                onClick={() => navigate(`/order/${orderId}`)}
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="fk-order-nav-title-group">
                <span className="fk-order-nav-title">Cancel Order</span>
                <span className="fk-order-nav-sub">OD • {orderId}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="fk-track-main">
          <div className="fk-track-container" style={{ paddingTop: '16px' }}>
            <div className="fk-track-card" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div className="fk-sk-box skeleton-shimmer" style={{ width: '64px', height: '64px', borderRadius: '8px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="fk-sk-line skeleton-shimmer" style={{ width: '80%', height: '14px' }} />
                <div className="fk-sk-line skeleton-shimmer" style={{ width: '40%', height: '12px' }} />
              </div>
            </div>
            <div className="fk-track-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="fk-sk-line skeleton-shimmer" style={{ width: '50%', height: '14px' }} />
              <div className="fk-sk-box skeleton-shimmer" style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
              <div className="fk-sk-box skeleton-shimmer" style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <div className="fk-order-tracking-page">
        <header className="fk-order-nav-header">
          <div className="fk-order-nav-header-inner">
            <div className="fk-order-nav-left">
              <button
                type="button"
                className="fk-order-back-btn"
                onClick={() => navigate(-1)}
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="fk-order-nav-title-group">
                <span className="fk-order-nav-title">Cancel Order</span>
                <span className="fk-order-nav-sub">Order Not Found</span>
              </div>
            </div>
          </div>
        </header>

        <main className="fk-track-main">
          <div className="fk-track-container" style={{ paddingTop: '24px' }}>
            <div className="fk-track-card" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                Order Not Found
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 20px 0' }}>
                {error || 'We could not locate this order in your account.'}
              </p>
              <button
                type="button"
                className="fk-action-btn-outline"
                onClick={() => navigate('/account')}
                style={{ margin: '0 auto' }}
              >
                Go to My Orders
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fk-order-tracking-page">
      {/* Sticky Flipkart Top Header */}
      <header className="fk-order-nav-header">
        <div className="fk-order-nav-header-inner">
          <div className="fk-order-nav-left">
            <button
              type="button"
              className="fk-order-back-btn"
              onClick={() => navigate(`/order/${order.orderId || order.id}`)}
              aria-label="Back to order details"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="fk-order-nav-title-group">
              <span className="fk-order-nav-title">Cancel Order</span>
              <span className="fk-order-nav-sub">OD • {order.orderId || order.id}</span>
            </div>
          </div>

          <div className="fk-order-nav-right">
            <button
              type="button"
              className="fk-order-back-btn"
              onClick={() => navigate(`/order/${order.orderId || order.id}`)}
              title="Return to order details"
            >
              <Package size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="fk-track-main">
        <div className="fk-track-container" style={{ paddingTop: '16px', paddingBottom: '32px' }}>

          {/* CASE 1: ORDER ALREADY CANCELLED */}
          {isCancelled && (
            <div className="fk-track-card" style={{ textAlign: 'center', padding: '28px 18px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto'
                }}
              >
                <XCircle size={32} color="#DC2626" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                Order Already Cancelled
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                This order was cancelled on{' '}
                <strong>
                  {order.cancellation?.cancelledAt
                    ? new Date(order.cancellation.cancelledAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'recently'}
                </strong>.
              </p>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#334155',
                  marginBottom: '20px'
                }}
              >
                <div style={{ marginBottom: '4px' }}>
                  Reason: <strong>{order.cancellation?.reason || 'Cancelled by customer'}</strong>
                </div>
                <div style={{ color: '#16A34A', fontWeight: 600 }}>
                  ✓ Product stock restored to inventory
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="fk-action-btn-outline"
                  onClick={() => navigate(`/order/${order.orderId || order.id}`)}
                >
                  View Order Details
                </button>
                <button
                  type="button"
                  className="fk-btn-confirm-cancel"
                  style={{ background: '#2874F0', borderColor: '#2874F0' }}
                  onClick={() => navigate('/categories')}
                >
                  Shop More
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: SHIPPED OR IN-TRANSIT (CANCELLATION STRICTLY LOCKED) */}
          {!isCancelled && !isCancellable && (
            <div className="fk-track-card" style={{ padding: '24px 18px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto'
                }}
              >
                <ShieldAlert size={32} color="#D97706" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                Cancellation Not Available
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.55 }}>
                Your package has already been handed over to courier partner{' '}
                <strong>{carrier}</strong>
                {trackingNumber ? ` (AWB: ${trackingNumber})` : ''} and is currently in transit.
              </p>

              <div className="fk-help-lock-policy-box" style={{ marginBottom: '20px' }}>
                <div className="fk-policy-point">
                  <span className="fk-point-dot">●</span>
                  <span>
                    <strong>Logistics Rule:</strong> Orders in transit cannot be stopped or cancelled mid-route because the parcel is already in the carrier fulfillment network.
                  </span>
                </div>
                <div className="fk-policy-point">
                  <span className="fk-point-dot">●</span>
                  <span>
                    <strong>Doorstep Refusal:</strong> If you no longer want this order, simply <strong>refuse to accept delivery</strong> when the courier delivery agent reaches your address. The parcel will return to our warehouse automatically.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="fk-btn-confirm-cancel"
                  style={{ background: '#2874F0', borderColor: '#2874F0' }}
                  onClick={() => navigate(`/order/${order.orderId || order.id}`)}
                >
                  Back to Tracking
                </button>
              </div>
            </div>
          )}

          {/* CASE 3: ELIGIBLE FOR CANCELLATION (BEFORE SHIPPING) */}
          {isCancellable && (
            <>
              {/* Product Card */}
              <div className="fk-track-card fk-item-hero-card" style={{ marginBottom: '12px' }}>
                <div className="fk-item-hero-img-wrap">
                  <img
                    src={firstItem.image || '/favicon.svg'}
                    alt={firstItem.name || 'Product'}
                    className="fk-item-hero-img"
                    onError={(e) => { e.currentTarget.src = '/favicon.svg'; }}
                  />
                </div>
                <div className="fk-item-hero-info">
                  <h3 className="fk-item-hero-title">{firstItem.name}</h3>
                  <div className="fk-item-hero-sub">
                    {firstItem.size && <span>Size: {firstItem.size}</span>}
                    <span>Qty: {firstItem.quantity || 1}</span>
                    <span>₹{firstItem.totalPrice || firstItem.unitPrice || order.totalAmount}</span>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#EFF6FF',
                        color: '#1E40AF',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      ● Status: {currentStatus.replace('_', ' ')} (Pre-dispatch)
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant Cancellation Notice */}
              <div
                className="fk-help-cancellation-notice"
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '14px'
                }}
              >
                <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.5 }}>
                  <strong style={{ display: 'block', marginBottom: '2px', color: '#78350F' }}>
                    Eligible for Instant Cancellation
                  </strong>
                  Your package is still at the warehouse and has not been handed over to the courier partner. You can cancel it directly with 1 click.
                </div>
              </div>

              {/* Cancellation Reason Selector Card */}
              <div className="fk-track-card" style={{ marginBottom: '14px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  Please Select Reason for Cancellation:
                </h4>

                <div className="fk-help-form-group">
                  <select
                    className="fk-help-select"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    style={{ fontSize: '13.5px', padding: '12px 14px' }}
                  >
                    <option value="Ordered by mistake / duplicate order">Ordered by mistake / duplicate order</option>
                    <option value="Found a better price / changed my mind">Found a better price / changed my mind</option>
                    <option value="Need to change shipping address">Need to change shipping address</option>
                    <option value="Delivery is taking too long">Delivery is taking too long</option>
                    <option value="Want to change payment method">Want to change payment method</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>

                {cancelReason === 'Other' && (
                  <div className="fk-help-form-group" style={{ marginTop: '10px' }}>
                    <textarea
                      className="fk-help-textarea"
                      rows={3}
                      placeholder="Please tell us briefly why you want to cancel this order..."
                      value={cancelCustomNote}
                      onChange={(e) => setCancelCustomNote(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Refund & Settlement Summary Card */}
              <div className="fk-track-card" style={{ marginBottom: '18px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                  Refund &amp; Payment Summary
                </h4>

                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    color: '#334155',
                    lineHeight: 1.55
                  }}
                >
                  {isCOD ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>Cash on Delivery (COD) Order:</strong>
                        <div>No online payment was deducted. You will not have to pay anything.</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <RotateCcw size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>Online Payment Refund:</strong>
                        <div>
                          Full refund of <strong>₹{order.totalAmount}</strong> will be initiated back to your original payment method.
                        </div>
                      </div>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #CBD5E1', color: '#16A34A', fontWeight: 600 }}>
                      ✓ Applied coupon will be restored to your account
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  className="fk-action-btn-outline"
                  onClick={() => navigate(`/order/${order.orderId || order.id}`)}
                  disabled={cancelling}
                  style={{ height: '44px', fontWeight: 700 }}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  className="fk-btn-confirm-cancel"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <XCircle size={16} />
                  <span>{cancelling ? 'Cancelling...' : 'Confirm Cancel'}</span>
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default CancelOrderPage;

