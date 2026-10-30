import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  CreditCard,
  Printer,
  XCircle,
  HelpCircle,
  Truck,
  Phone,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCartWishlist } from '../context/CartWishlistContext';
import '../styles/skeleton.css';
import '../styles/orderTracking.css';

/**
 * Flipkart-Tier Skeleton Loader for Order Tracking Page
 * Displays full structural skeleton with shimmer effect during loading
 */
function OrderTrackingSkeleton({ onBack, orderId }) {
  return (
    <div className="fk-tracking-canvas" aria-busy="true" aria-label="Loading order details">
      {/* Sticky Header */}
      <header className="fk-order-nav-header">
        <div className="fk-order-nav-left">
          <button type="button" className="fk-order-back-btn" onClick={onBack} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="fk-order-nav-title-group">
            <span className="fk-order-nav-title">Order Details</span>
            <span className="fk-order-nav-sub">{orderId ? `OD • ${orderId}` : 'Fetching tracking...'}</span>
          </div>
        </div>
        <div className="fk-order-nav-right">
          <div className="fk-sk-box skeleton-shimmer" style={{ width: '70px', height: '26px', borderRadius: '4px' }} />
        </div>
      </header>

      <div className="fk-tracking-inner" style={{ marginTop: '12px' }}>
        {/* Item & Delivery Shimmer Card */}
        <div className="fk-track-card fk-item-hero-card">
          <div className="fk-item-hero-img-wrap fk-sk-box skeleton-shimmer" style={{ width: '72px', height: '72px' }} />
          <div className="fk-item-hero-meta" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '45%', height: '15px' }} />
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '85%', height: '13px' }} />
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '30%', height: '12px' }} />
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '25%', height: '15px' }} />
          </div>
        </div>

        {/* Vertical Stepper Shimmer Card */}
        <div className="fk-track-card">
          <div className="fk-sk-line skeleton-shimmer" style={{ width: '130px', height: '13px', marginBottom: '16px' }} />
          <div className="fk-sk-stepper-wrap">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="fk-sk-step-row">
                <div className="fk-sk-circle skeleton-shimmer" style={{ width: '20px', height: '20px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="fk-sk-line skeleton-shimmer" style={{ width: '35%', height: '13px' }} />
                  <div className="fk-sk-line skeleton-shimmer" style={{ width: '55%', height: '11px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Details Shimmer Card */}
        <div className="fk-track-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="fk-sk-line skeleton-shimmer" style={{ width: '140px', height: '13px', marginBottom: '4px' }} />
          <div className="fk-sk-line skeleton-shimmer" style={{ width: '30%', height: '14px' }} />
          <div className="fk-sk-line skeleton-shimmer" style={{ width: '80%', height: '12px' }} />
          <div className="fk-sk-line skeleton-shimmer" style={{ width: '40%', height: '12px' }} />
        </div>

        {/* Price Details Shimmer Card */}
        <div className="fk-track-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="fk-sk-line skeleton-shimmer" style={{ width: '120px', height: '13px', marginBottom: '4px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '90px', height: '12px' }} />
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '50px', height: '12px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '80px', height: '12px' }} />
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '40px', height: '12px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px' }}>
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '100px', height: '14px' }} />
            <div className="fk-sk-line skeleton-shimmer" style={{ width: '60px', height: '14px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const OrderTrackingPage = () => {
  const { orderId: paramOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get('orderId') || searchParams.get('id');
  const activeOrderId = paramOrderId || queryOrderId || '';

  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartCount, showToast } = useCartWishlist();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchIdInput, setSearchIdInput] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);

  // Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found a better price / changed my mind');
  const [cancelCustomNote, setCancelCustomNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    if (activeOrderId) {
      loadOrder(activeOrderId);
    } else {
      setLoading(false);
    }
  }, [activeOrderId]);

  const loadOrder = async (id) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getOrderById(id);
      if (data) {
        setOrder(data);
      } else {
        setError(`No order found matching reference #${id}`);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve order details. Please verify the order ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/account');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchIdInput.trim()) return;
    navigate(`/order/${encodeURIComponent(searchIdInput.trim())}`);
  };

  const handleCopyOrderId = () => {
    const text = order?.orderId || order?.id || activeOrderId;
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(true);
    showToast('Order ID copied');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyAwb = (awb) => {
    if (!awb) return;
    navigator.clipboard?.writeText(awb);
    setCopiedAwb(true);
    showToast('Tracking number copied');
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const handleConfirmCancelOrder = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const finalReason = cancelReason === 'Other' ? (cancelCustomNote || 'Other') : cancelReason;
      const res = await api.cancelOrder(order.orderId || order.id, finalReason);
      if (res && res.success) {
        showToast('Order cancelled successfully.');
        setShowCancelModal(false);
        await loadOrder(order.orderId || order.id);
      } else {
        throw new Error(res.message || 'Cancellation could not be completed.');
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const formatINR = (amt) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  const formatDate = (d) => {
    if (!d) return '—';
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDate = (createdDate) => {
    const base = createdDate ? new Date(createdDate) : new Date();
    base.setDate(base.getDate() + 2);
    return base.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // 1. Loading State -> Clean Flipkart Skeleton
  if (loading) {
    return <OrderTrackingSkeleton onBack={handleBack} orderId={activeOrderId} />;
  }

  // 2. Search / Not Found View
  if (!activeOrderId || error || !order) {
    return (
      <div className="fk-tracking-canvas">
        <header className="fk-order-nav-header">
          <div className="fk-order-nav-left">
            <button type="button" className="fk-order-back-btn" onClick={handleBack} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <div className="fk-order-nav-title-group">
              <span className="fk-order-nav-title">Track Order</span>
              <span className="fk-order-nav-sub">ASM Shine Logistics</span>
            </div>
          </div>
          <div className="fk-order-nav-right">
            <Link to="/account" className="fk-order-header-action-btn">
              My Orders
            </Link>
          </div>
        </header>

        <div className="fk-tracking-inner" style={{ marginTop: '20px' }}>
          <div className="fk-track-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: error ? '#FEF2F2' : '#EFF6FF',
                color: error ? '#DC2626' : '#2874F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}
            >
              {error ? <AlertCircle size={28} /> : <Search size={28} />}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#212121', margin: '0 0 6px 0' }}>
              {error ? 'Order Not Found' : 'Track Your Shipment'}
            </h3>
            <p style={{ color: '#878787', fontSize: '13px', maxWidth: '420px', margin: '0 auto 20px' }}>
              {error
                ? error
                : 'Enter your genuine Order Reference ID (e.g. ASM-20261030-105912) to see real-time packaging, dispatch and courier tracking updates.'}
            </p>

            <form
              onSubmit={handleSearchSubmit}
              style={{ display: 'flex', maxWidth: '440px', margin: '0 auto', gap: '8px', flexWrap: 'wrap' }}
            >
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ASM-20261030-105912)"
                value={searchIdInput}
                onChange={(e) => setSearchIdInput(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
                required
              />
              <button
                type="submit"
                style={{
                  background: '#2874F0',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Track
              </button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F3F6' }}>
              <Link to="/account" style={{ fontSize: '13px', color: '#2874F0', fontWeight: 600, textDecoration: 'none' }}>
                ← View All Orders in My Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Order Tracking View
  const currentStatus = (order.status || 'CONFIRMED').toUpperCase();
  const isCancelled = currentStatus === 'CANCELLED';
  const isDelivered = currentStatus === 'DELIVERED';
  const isShipped = currentStatus === 'SHIPPED';
  const isProcessing = currentStatus === 'PROCESSING';

  const orderStages = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentIdx = orderStages.indexOf(currentStatus);

  const isConfirmedDone = currentIdx >= 1;
  const isProcessingDone = currentIdx >= 2;
  const isShippedDone = currentIdx >= 3;
  const isDeliveredDone = currentIdx >= 4;

  const isCancellable = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING'].includes(currentStatus);

  const shippingDetails = order.shippingDetails || {};
  const carrier = shippingDetails.carrier || 'Delhivery Express Air';
  const trackingNumber = shippingDetails.trackingNumber || '';
  const trackingUrl = shippingDetails.trackingUrl || '';

  const firstItem = order.items?.[0] || {};

  return (
    <div className="fk-tracking-canvas">
      {/* 1. Flipkart Top Navigation Bar */}
      <header className="fk-order-nav-header">
        <div className="fk-order-nav-left">
          <button type="button" className="fk-order-back-btn" onClick={handleBack} aria-label="Go Back">
            <ArrowLeft size={20} />
          </button>
          <div className="fk-order-nav-title-group">
            <span className="fk-order-nav-title">Order Details</span>
            <span className="fk-order-nav-sub">OD • {order.orderId || order.id}</span>
          </div>
        </div>

        <div className="fk-order-nav-right">
          <button
            type="button"
            className="fk-order-header-action-btn"
            onClick={() => setShowSupportModal(true)}
          >
            <HelpCircle size={14} />
            <span>Help</span>
          </button>
          <button
            type="button"
            className="fk-order-header-action-btn"
            onClick={() => navigate('/cart')}
            title="Cart"
          >
            <ShoppingBag size={14} />
            {cartCount > 0 && <span>({cartCount})</span>}
          </button>
        </div>
      </header>

      {/* Main Flipkart Content Container */}
      <div className="fk-tracking-inner">
        {/* Order ID & Status Strip */}
        <div className="fk-track-card" style={{ padding: '10px 14px' }}>
          <div className="fk-order-id-strip" style={{ margin: 0, padding: 0, border: 'none' }}>
            <div>
              <span className="fk-order-id-label">Order ID:</span>
              <span className="fk-order-id-val">{order.orderId || order.id}</span>
              <button type="button" className="fk-copy-chip" onClick={handleCopyOrderId}>
                {copiedId ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <span className={`fk-status-pill ${currentStatus}`}>
              ● {currentStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Hero Item & Expected Delivery Card */}
        <div className="fk-track-card fk-item-hero-card">
          <div className="fk-item-hero-img-wrap">
            <img
              src={firstItem.image || '/favicon.svg'}
              alt={firstItem.name || 'Product'}
              className="fk-item-hero-img"
              onError={(e) => {
                e.currentTarget.src = '/favicon.svg';
              }}
            />
          </div>

          <div className="fk-item-hero-meta">
            <div className={`fk-delivery-headline ${isCancelled ? 'cancelled' : isDelivered ? 'delivered' : ''}`}>
              <Truck size={16} />
              <span>
                {isCancelled
                  ? 'Order Cancelled'
                  : isDelivered
                  ? 'Delivered at Doorstep'
                  : `Delivery by ${getEstimatedDate(order.createdAt)}`}
              </span>
            </div>

            <h4 className="fk-item-title">{firstItem.name}</h4>
            <div className="fk-item-subline">
              {firstItem.size && <span>Size: {firstItem.size}</span>}
              <span>Qty: {firstItem.quantity || 1}</span>
            </div>
            <div className="fk-item-price-val">
              {formatINR(firstItem.totalPrice || firstItem.unitPrice || order.totalAmount)}
            </div>
          </div>
        </div>

        {/* Flipkart Authentic Vertical Stepper */}
        <div className="fk-track-card fk-timeline-section">
          <h4 className="fk-timeline-title">Fulfillment Progress</h4>

          <div className="fk-v-stepper">
            {/* Stage 1: Order Confirmed */}
            <div className={`fk-v-step-row ${isConfirmedDone ? 'completed' : 'active'}`}>
              <div className="fk-v-line" />
              <div className="fk-v-indicator">
                {isConfirmedDone ? <Check size={12} strokeWidth={3} /> : <div className="fk-v-indicator-inner-dot" />}
              </div>
              <div className="fk-v-step-content">
                <div className="fk-v-step-name">Order Confirmed</div>
                <div className="fk-v-step-date">{formatDate(order.createdAt)}</div>
                <div className="fk-v-step-note">Your order has been verified and placed.</div>
              </div>
            </div>

            {/* Stage 2: Packed & Ready */}
            <div className={`fk-v-step-row ${isProcessingDone ? 'completed' : isProcessing ? 'active' : 'pending'}`}>
              <div className="fk-v-line" />
              <div className="fk-v-indicator">
                {isProcessingDone ? <Check size={12} strokeWidth={3} /> : isProcessing ? <div className="fk-v-indicator-inner-dot" /> : null}
              </div>
              <div className="fk-v-step-content">
                <div className="fk-v-step-name">Packed &amp; Ready</div>
                <div className="fk-v-step-date">
                  {isProcessingDone || isProcessing ? 'Warehouse fulfillment line' : 'Pending packaging'}
                </div>
                {(isProcessingDone || isProcessing) && (
                  <div className="fk-v-step-note">Item has been inspected, packed and prepped for courier pickup.</div>
                )}
              </div>
            </div>

            {/* Stage 3: Shipped / In Transit */}
            <div className={`fk-v-step-row ${isShippedDone ? 'completed' : isShipped ? 'active' : 'pending'}`}>
              <div className="fk-v-line" />
              <div className="fk-v-indicator">
                {isShippedDone ? <Check size={12} strokeWidth={3} /> : isShipped ? <div className="fk-v-indicator-inner-dot" /> : null}
              </div>
              <div className="fk-v-step-content">
                <div className="fk-v-step-name">Shipped / In Transit</div>
                <div className="fk-v-step-date">
                  {trackingNumber ? `Dispatched via ${carrier}` : 'Awaiting courier handover'}
                </div>
                {trackingNumber && (
                  <div className="fk-courier-strip">
                    <div className="fk-courier-left">
                      <span>AWB: </span>
                      <strong>{trackingNumber}</strong>
                      <button
                        type="button"
                        className="fk-copy-chip"
                        onClick={() => handleCopyAwb(trackingNumber)}
                      >
                        {copiedAwb ? <Check size={10} /> : <Copy size={10} />}
                        <span>{copiedAwb ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    {trackingUrl && (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fk-courier-track-link"
                      >
                        <span>Track with {carrier.split(' ')[0]}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stage 4: Delivered (or Cancelled) */}
            {isCancelled ? (
              <div className="fk-v-step-row cancelled">
                <div className="fk-v-indicator">
                  <XCircle size={14} />
                </div>
                <div className="fk-v-step-content">
                  <div className="fk-v-step-name" style={{ color: '#DC2626' }}>Order Cancelled</div>
                  <div className="fk-v-step-date">
                    {order.cancellation?.cancelledAt ? formatDate(order.cancellation.cancelledAt) : 'Cancelled'}
                  </div>
                  <div className="fk-v-step-note" style={{ background: '#FEF2F2', color: '#991B1B' }}>
                    Reason: {order.cancellation?.reason || 'Cancelled by customer'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="fk-v-step-row delivered-step">
                <div className="fk-v-indicator">
                  {isDeliveredDone ? <Check size={12} strokeWidth={3} /> : null}
                </div>
                <div className="fk-v-step-content">
                  <div className="fk-v-step-name">Delivered</div>
                  <div className="fk-v-step-date">
                    {isDeliveredDone ? 'Handed over at doorstep' : `Expected by ${getEstimatedDate(order.createdAt)}`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Multiple Items List if more than 1 item */}
        {order.items && order.items.length > 1 && (
          <div className="fk-track-card">
            <h4 className="fk-details-header">
              <span>All Items in this Order ({order.items.length})</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {order.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: idx < order.items.length - 1 ? '1px solid #F1F3F6' : 'none' }}>
                  <img
                    src={it.image || '/favicon.svg'}
                    alt={it.name}
                    style={{ width: '48px', height: '48px', objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                    onError={(e) => { e.currentTarget.src = '/favicon.svg'; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#212121', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {it.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#878787' }}>
                      Qty: {it.quantity} {it.size ? `(${it.size})` : ''} • ₹{it.unitPrice || it.price}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#212121' }}>
                    {formatINR(it.totalPrice || ((it.unitPrice || it.price || 0) * (it.quantity || 1)))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Details Card */}
        <div className="fk-track-card">
          <h4 className="fk-details-header">
            <MapPin size={15} color="#2874F0" />
            <span>Shipping Details</span>
          </h4>
          <div className="fk-person-name">
            {order.shippingAddress?.fullName || order.shippingAddress?.name || user?.name || 'Customer'}
          </div>
          <div className="fk-address-lines">
            {order.shippingAddress?.street}
            <br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </div>
          {order.shippingAddress?.phone && (
            <div className="fk-phone-line">
              Phone number: {order.shippingAddress.phone}
            </div>
          )}
        </div>

        {/* Price Details Card */}
        <div className="fk-track-card">
          <h4 className="fk-details-header">
            <CreditCard size={15} color="#2874F0" />
            <span>Price Details</span>
          </h4>
          <div className="fk-price-table">
            <div className="fk-price-row">
              <span>List Price</span>
              <span>{formatINR(order.pricing?.totalMRP || order.totalAmount)}</span>
            </div>
            <div className="fk-price-row">
              <span>Selling Price</span>
              <span>{formatINR(order.pricing?.itemsSubtotal || order.totalAmount)}</span>
            </div>
            {order.pricing?.productDiscount > 0 && (
              <div className="fk-price-row discount">
                <span>Special Discount</span>
                <span>-{formatINR(order.pricing.productDiscount)}</span>
              </div>
            )}
            {order.pricing?.couponDiscount > 0 && (
              <div className="fk-price-row discount">
                <span>Coupon Savings</span>
                <span>-{formatINR(order.pricing.couponDiscount)}</span>
              </div>
            )}
            <div className="fk-price-row">
              <span>Delivery Charges</span>
              <span style={{ color: '#26A541', fontWeight: 700 }}>FREE</span>
            </div>
            <div className="fk-price-row total">
              <span>Total Amount</span>
              <span style={{ color: '#2874F0' }}>
                {formatINR(order.pricing?.finalAmount || order.totalAmount)}
              </span>
            </div>
          </div>
          <div className="fk-payment-mode-tag">
            Payment Mode: <strong>{(order.paymentMethod || 'COD').toUpperCase()}</strong>
          </div>
        </div>

        {/* Actions Row */}
        <div className="fk-track-actions">
          <button
            type="button"
            className="fk-action-btn-outline"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>Download Invoice</span>
          </button>

          {isCancellable && (
            <button
              type="button"
              className="fk-action-btn-outline fk-action-btn-danger"
              onClick={() => setShowCancelModal(true)}
              id="order-cancel-trigger"
            >
              <XCircle size={15} />
              <span>Cancel Order</span>
            </button>
          )}

          <button
            type="button"
            className="fk-action-btn-outline"
            onClick={() => navigate('/categories')}
          >
            <ShoppingBag size={15} />
            <span>Explore Products</span>
          </button>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="asm-modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="asm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="asm-modal-header">
              <h3 className="asm-modal-title">
                <AlertCircle size={18} color="#DC2626" />
                <span>Cancel Order #{order.orderId || order.id}</span>
              </h3>
              <button type="button" className="asm-modal-close-btn" onClick={() => setShowCancelModal(false)}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#565656', margin: '0 0 14px' }}>
              Are you sure you want to cancel this order? The product stock will be immediately restored.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#212121', marginBottom: '6px' }}>
                Reason for Cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  color: '#212121',
                  outline: 'none',
                  background: '#FFFFFF'
                }}
              >
                <option value="Found a better price / changed my mind">Found a better price / changed my mind</option>
                <option value="Ordered by mistake / duplicate order">Ordered by mistake / duplicate order</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
                <option value="Delivery is taking too long">Delivery is taking too long</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {cancelReason === 'Other' && (
              <div style={{ marginBottom: '14px' }}>
                <textarea
                  rows={2}
                  placeholder="Specify reason..."
                  value={cancelCustomNote}
                  onChange={(e) => setCancelCustomNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '12.5px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                className="fk-action-btn-outline"
                style={{ flex: 1 }}
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Don't Cancel
              </button>
              <button
                type="button"
                className="fk-action-btn-outline fk-action-btn-danger"
                style={{ flex: 1, background: '#DC2626', color: '#FFFFFF', borderColor: '#DC2626' }}
                onClick={handleConfirmCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Help Modal */}
      {showSupportModal && (
        <div className="asm-modal-backdrop" onClick={() => setShowSupportModal(false)}>
          <div className="asm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="asm-modal-header">
              <h3 className="asm-modal-title">
                <HelpCircle size={18} color="#2874F0" />
                <span>ASM Shine Customer Support</span>
              </h3>
              <button type="button" className="asm-modal-close-btn" onClick={() => setShowSupportModal(false)}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#565656', margin: '0 0 16px' }}>
              Need assistance with Order #{order.orderId || order.id}? Reach out directly to our support team:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={`https://wa.me/91958423614?text=Hi%2C%20I%20need%20help%20with%20my%20order%20%23${order.orderId || order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '13.5px'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  💬
                </div>
                <div>
                  <div>WhatsApp Priority Help</div>
                  <small style={{ fontWeight: 400, color: '#047857' }}>Instant support response</small>
                </div>
              </a>

              <a
                href="tel:+91958423614"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1E40AF',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '13.5px'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2874F0', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={14} />
                </div>
                <div>
                  <div>Call Helpline</div>
                  <small style={{ fontWeight: 400, color: '#1D4ED8' }}>+91 958423614 (9am - 8pm)</small>
                </div>
              </a>
            </div>

            <button
              type="button"
              className="fk-action-btn-outline"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={() => setShowSupportModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
