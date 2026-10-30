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
  AlertCircle,
  ChevronRight,
  Headphones
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

        {/* Actions Row Skeleton: Exactly 2 Equal Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div className="fk-sk-box skeleton-shimmer" style={{ height: '42px', borderRadius: '8px' }} />
          <div className="fk-sk-box skeleton-shimmer" style={{ height: '42px', borderRadius: '8px' }} />
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
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTopic, setSupportTopic] = useState('menu'); // 'menu' | 'cancel' | 'delivery' | 'address' | 'product'
  const [cancelReason, setCancelReason] = useState('Found a better price / changed my mind');
  const [cancelCustomNote, setCancelCustomNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

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
        setShowSupportModal(false);
        setSupportTopic('menu');
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
            onClick={() => {
              setSupportTopic('menu');
              setShowSupportModal(true);
            }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`fk-status-pill ${currentStatus}`}>
                ● {currentStatus.replace('_', ' ')}
              </span>
              {isCancellable && (
                <button
                  type="button"
                  className="fk-subtle-cancel-link"
                  onClick={() => {
                    setSupportTopic('cancel');
                    setShowSupportModal(true);
                  }}
                  title="Cancel order before dispatch"
                >
                  Cancel Order
                </button>
              )}
            </div>
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

        {/* Actions Row: EXACTLY 2 BUTTONS (NEED HELP & EXPLORE PRODUCTS) */}
        <div className="fk-track-actions">
          <button
            type="button"
            className="fk-action-btn-outline fk-action-btn-help"
            onClick={() => {
              setSupportTopic('menu');
              setShowSupportModal(true);
            }}
            id="order-help-trigger"
          >
            <HelpCircle size={16} />
            <span>Need Help?</span>
          </button>

          <button
            type="button"
            className="fk-action-btn-outline fk-action-btn-explore"
            onClick={() => navigate('/categories')}
            id="order-explore-trigger"
          >
            <ShoppingBag size={16} />
            <span>Explore Products</span>
          </button>
        </div>
      </div>

      {/* Flipkart-Tier 24x7 Help Center Modal */}
      {showSupportModal && (
        <div
          className="asm-modal-backdrop"
          onClick={() => {
            setShowSupportModal(false);
            setSupportTopic('menu');
          }}
        >
          <div className="fk-help-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="fk-help-modal-header">
              <div className="fk-help-modal-header-left">
                {supportTopic !== 'menu' && (
                  <button
                    type="button"
                    className="fk-help-modal-back-btn"
                    onClick={() => setSupportTopic('menu')}
                    aria-label="Back to topics"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div>
                  <h3 className="fk-help-modal-title">
                    {supportTopic === 'cancel'
                      ? 'Cancel Order'
                      : supportTopic === 'delivery'
                      ? 'Delivery Details'
                      : supportTopic === 'address'
                      ? 'Change Address'
                      : supportTopic === 'product'
                      ? 'Quality & Issue'
                      : '24x7 Help Center'}
                  </h3>
                  <span className="fk-help-modal-sub">OD • {order.orderId || order.id}</span>
                </div>
              </div>
              <button
                type="button"
                className="fk-help-modal-close"
                onClick={() => {
                  setShowSupportModal(false);
                  setSupportTopic('menu');
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="fk-help-modal-body">
              {/* Order Item Snapshot */}
              <div className="fk-help-order-snippet">
                <img
                  src={firstItem.image || '/favicon.svg'}
                  alt={firstItem.name}
                  className="fk-help-order-thumb"
                  onError={(e) => { e.currentTarget.src = '/favicon.svg'; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fk-help-order-name">{firstItem.name}</div>
                  <div className="fk-help-order-meta">
                    <span>Status:</span>
                    <span className={`fk-help-status-tag ${currentStatus}`}>
                      {currentStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* View 1: Topics Menu */}
              {supportTopic === 'menu' && (
                <>
                  <div className="fk-help-topics-list">
                    {/* Topic 1: Cancel Order */}
                    <button
                      type="button"
                      className="fk-help-topic-item"
                      onClick={() => setSupportTopic('cancel')}
                    >
                      <div className="fk-help-topic-icon-wrap cancel">
                        <XCircle size={18} />
                      </div>
                      <div className="fk-help-topic-text">
                        <div className="fk-help-topic-title">
                          <span>I want to cancel this order</span>
                          {isCancellable ? (
                            <span className="fk-help-badge success">Eligible</span>
                          ) : isCancelled ? (
                            <span className="fk-help-badge danger">Cancelled</span>
                          ) : (
                            <span className="fk-help-badge neutral">Locked</span>
                          )}
                        </div>
                        <div className="fk-help-topic-desc">
                          {isCancellable
                            ? 'Cancel before courier dispatch to restore stock'
                            : isCancelled
                            ? 'This order has already been cancelled'
                            : 'Package is dispatched with courier (locked)'}
                        </div>
                      </div>
                      <ChevronRight size={16} color="#94A3B8" />
                    </button>

                    {/* Topic 2: Track Delivery */}
                    <button
                      type="button"
                      className="fk-help-topic-item"
                      onClick={() => setSupportTopic('delivery')}
                    >
                      <div className="fk-help-topic-icon-wrap truck">
                        <Truck size={18} />
                      </div>
                      <div className="fk-help-topic-text">
                        <div className="fk-help-topic-title">
                          <span>Where is my order / Delivery status</span>
                        </div>
                        <div className="fk-help-topic-desc">
                          Courier partner, live AWB number &amp; expected delivery date
                        </div>
                      </div>
                      <ChevronRight size={16} color="#94A3B8" />
                    </button>

                    {/* Topic 3: Address Change */}
                    <button
                      type="button"
                      className="fk-help-topic-item"
                      onClick={() => setSupportTopic('address')}
                    >
                      <div className="fk-help-topic-icon-wrap address">
                        <MapPin size={18} />
                      </div>
                      <div className="fk-help-topic-text">
                        <div className="fk-help-topic-title">
                          <span>Change delivery address or phone</span>
                        </div>
                        <div className="fk-help-topic-desc">
                          {isCancellable
                            ? 'Contact dispatch desk before parcel leaves warehouse'
                            : 'Address cannot be edited after dispatch'}
                        </div>
                      </div>
                      <ChevronRight size={16} color="#94A3B8" />
                    </button>

                    {/* Topic 4: Quality Issue */}
                    <button
                      type="button"
                      className="fk-help-topic-item"
                      onClick={() => setSupportTopic('product')}
                    >
                      <div className="fk-help-topic-icon-wrap quality">
                        <AlertCircle size={18} />
                      </div>
                      <div className="fk-help-topic-text">
                        <div className="fk-help-topic-title">
                          <span>Report item damage or leak</span>
                        </div>
                        <div className="fk-help-topic-desc">
                          Hassle-free replacement for defective or wrong formulation
                        </div>
                      </div>
                      <ChevronRight size={16} color="#94A3B8" />
                    </button>
                  </div>

                  {/* Direct Contact Channels */}
                  <div className="fk-help-contact-section">
                    <span className="fk-help-contact-title">Contact Support Executive</span>
                    <div className="fk-help-contact-grid">
                      <a
                        href={`https://wa.me/91958423614?text=Hi%20ASM%20Shine%20Support%2C%20I%20need%20assistance%20with%20Order%20%23${order.orderId || order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fk-help-contact-card whatsapp"
                      >
                        <span style={{ fontSize: '18px' }}>💬</span>
                        <div>
                          <div>WhatsApp</div>
                          <small style={{ fontWeight: 400, opacity: 0.85 }}>Instant Chat</small>
                        </div>
                      </a>

                      <a
                        href="tel:+91958423614"
                        className="fk-help-contact-card phone"
                      >
                        <Phone size={16} />
                        <div>
                          <div>Call Us</div>
                          <small style={{ fontWeight: 400, opacity: 0.85 }}>9 AM - 8 PM</small>
                        </div>
                      </a>
                    </div>
                  </div>
                </>
              )}

              {/* View 2: Cancel Topic */}
              {supportTopic === 'cancel' && (
                <div className="fk-help-subview">
                  {isCancelled ? (
                    <div className="fk-help-lock-banner">
                      <div className="fk-help-lock-icon" style={{ background: '#FEF2F2' }}>
                        <XCircle size={28} color="#DC2626" />
                      </div>
                      <h4 className="fk-help-lock-title">Order Already Cancelled</h4>
                      <p className="fk-help-lock-desc">
                        This order was cancelled on {order.cancellation?.cancelledAt ? formatDate(order.cancellation.cancelledAt) : 'recently'}.
                      </p>
                      <div className="fk-help-lock-policy-box">
                        <div>Reason: <strong>{order.cancellation?.reason || 'Cancelled by customer'}</strong></div>
                        <div style={{ color: '#16A34A', fontWeight: 600 }}>✓ Stock restored to inventory</div>
                      </div>
                      <div style={{ marginTop: '14px' }}>
                        <button
                          type="button"
                          className="fk-action-btn-outline"
                          onClick={() => setSupportTopic('menu')}
                        >
                          Back to Help Center
                        </button>
                      </div>
                    </div>
                  ) : isCancellable ? (
                    <>
                      <div className="fk-help-cancellation-notice">
                        <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Eligible for Instant Cancellation</strong>
                          <p>
                            Your package is still in <strong>{currentStatus.replace('_', ' ')}</strong> state and has not been handed over to the courier. You can cancel it directly.
                          </p>
                        </div>
                      </div>

                      <div className="fk-help-form-group">
                        <label className="fk-help-label">Select reason for cancellation:</label>
                        <select
                          className="fk-help-select"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        >
                          <option value="Found a better price / changed my mind">Found a better price / changed my mind</option>
                          <option value="Ordered by mistake / duplicate order">Ordered by mistake / duplicate order</option>
                          <option value="Need to change shipping address">Need to change shipping address</option>
                          <option value="Delivery is taking too long">Delivery is taking too long</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {cancelReason === 'Other' && (
                        <div className="fk-help-form-group">
                          <textarea
                            className="fk-help-textarea"
                            rows={2}
                            placeholder="Please tell us why you want to cancel..."
                            value={cancelCustomNote}
                            onChange={(e) => setCancelCustomNote(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="fk-help-btn-row">
                        <button
                          type="button"
                          className="fk-action-btn-outline"
                          onClick={() => setSupportTopic('menu')}
                          disabled={cancelling}
                        >
                          Don't Cancel
                        </button>
                        <button
                          type="button"
                          className="fk-btn-confirm-cancel"
                          onClick={handleConfirmCancelOrder}
                          disabled={cancelling}
                        >
                          {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Strictly blocked once SHIPPED */}
                      <div className="fk-help-lock-banner">
                        <div className="fk-help-lock-icon">
                          <XCircle size={28} color="#DC2626" />
                        </div>
                        <h4 className="fk-help-lock-title">Cancellation Locked</h4>
                        <p className="fk-help-lock-desc">
                          This order has already been dispatched with <strong>{carrier}</strong>
                          {trackingNumber ? ` (AWB: ${trackingNumber})` : ''} and is in transit.
                        </p>
                        <div className="fk-help-lock-policy-box">
                          <div className="fk-policy-point">
                            <span className="fk-point-dot">●</span>
                            <span>
                              <strong>Logistics Guideline:</strong> Packages handed over to courier cannot be stopped or cancelled mid-transit.
                            </span>
                          </div>
                          <div className="fk-policy-point">
                            <span className="fk-point-dot">●</span>
                            <span>
                              <strong>Doorstep Refusal:</strong> If you no longer want this order, simply refuse to accept delivery when the agent arrives at your address. The parcel will return to our hub automatically.
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="fk-help-btn-row" style={{ marginTop: '14px' }}>
                        <button
                          type="button"
                          className="fk-action-btn-outline"
                          onClick={() => setSupportTopic('menu')}
                        >
                          Back to Help Topics
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* View 3: Delivery Details Topic */}
              {supportTopic === 'delivery' && (
                <div className="fk-help-subview">
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>Fulfillment Status:</span>
                      <strong className={`fk-help-status-tag ${currentStatus}`}>{currentStatus.replace('_', ' ')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>Estimated Delivery:</span>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{getEstimatedDate(order.createdAt)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>Logistics Partner:</span>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{carrier}</strong>
                    </div>
                    {trackingNumber && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '12.5px', color: '#64748B' }}>AWB / Tracking ID:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '12.5px', color: '#2563EB', fontFamily: 'monospace' }}>{trackingNumber}</strong>
                          <button
                            type="button"
                            className="fk-copy-chip"
                            onClick={() => handleCopyAwb(trackingNumber)}
                          >
                            {copiedAwb ? <Check size={10} /> : <Copy size={10} />}
                            <span>{copiedAwb ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fk-action-btn-outline"
                      style={{ textDecoration: 'none', background: '#2874F0', color: '#FFFFFF', borderColor: '#2874F0' }}
                    >
                      <span>Track Live on Courier Portal</span>
                      <ExternalLink size={14} />
                    </a>
                  )}

                  <button
                    type="button"
                    className="fk-action-btn-outline"
                    onClick={() => setSupportTopic('menu')}
                  >
                    Back to Help Options
                  </button>
                </div>
              )}

              {/* View 4: Address Update Topic */}
              {supportTopic === 'address' && (
                <div className="fk-help-subview">
                  <div style={{ padding: '14px', background: isCancellable ? '#EFF6FF' : '#FFFBEB', borderRadius: '10px', border: `1px solid ${isCancellable ? '#BFDBFE' : '#FDE68A'}`, fontSize: '13px', lineHeight: '1.5', color: isCancellable ? '#1E40AF' : '#92400E' }}>
                    {isCancellable ? (
                      <div>
                        <strong>Order not yet dispatched:</strong>
                        <p style={{ margin: '6px 0 0' }}>
                          Your order is still being packaged at our warehouse. You can directly WhatsApp our dispatch team right now with your new address or phone number before the package is handed to the courier.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <strong>Address Locked for Dispatch:</strong>
                        <p style={{ margin: '6px 0 0' }}>
                          This shipment is already with <strong>{carrier}</strong>. Once dispatched, the delivery address cannot be modified online. When the courier delivery agent calls you for delivery, you can provide landmarks or nearby instructions directly to them.
                        </p>
                      </div>
                    )}
                  </div>

                  {isCancellable && (
                    <a
                      href={`https://wa.me/91958423614?text=Hi%20ASM%20Shine%2C%20I%20need%20to%20update%20my%20shipping%20address%20for%20Order%20%23${order.orderId || order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fk-action-btn-outline"
                      style={{ background: '#10B981', color: '#FFFFFF', borderColor: '#10B981', textDecoration: 'none' }}
                    >
                      <span>Message Dispatch Team on WhatsApp</span>
                    </a>
                  )}

                  <button
                    type="button"
                    className="fk-action-btn-outline"
                    onClick={() => setSupportTopic('menu')}
                  >
                    Back to Help Options
                  </button>
                </div>
              )}

              {/* View 5: Product / Quality Topic */}
              {supportTopic === 'product' && (
                <div className="fk-help-subview">
                  <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', lineHeight: '1.5', color: '#334155' }}>
                    <strong>100% Quality &amp; Leakage Guarantee</strong>
                    <p style={{ margin: '8px 0 0' }}>
                      All ASM Shine products are sealed before dispatch. In the rare case you receive a damaged package, leak, or incorrect cleaner, share a quick photo with us on WhatsApp within 48 hours for an instant free replacement.
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/91958423614?text=Hi%20ASM%20Shine%2C%20I%20have%20an%20issue%20with%20items%20in%20Order%20%23${order.orderId || order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fk-action-btn-outline"
                    style={{ background: '#10B981', color: '#FFFFFF', borderColor: '#10B981', textDecoration: 'none' }}
                  >
                    <span>Report Issue on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    className="fk-action-btn-outline"
                    onClick={() => setSupportTopic('menu')}
                  >
                    Back to Help Options
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
