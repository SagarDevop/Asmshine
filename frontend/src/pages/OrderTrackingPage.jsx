import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Printer,
  XCircle,
  Copy,
  Check,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  Phone,
  Search,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCartWishlist } from '../context/CartWishlistContext';
import '../styles/orderTracking.css';

export const OrderTrackingPage = () => {
  const { orderId: paramOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get('orderId') || searchParams.get('id');
  const activeOrderId = paramOrderId || queryOrderId || '';

  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useCartWishlist();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchIdInput, setSearchIdInput] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found a better price / changed my mind');
  const [cancelCustomNote, setCancelCustomNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Support Modal State
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchIdInput.trim()) return;
    navigate(`/order/${encodeURIComponent(searchIdInput.trim())}`);
  };

  const handleCopyOrderId = () => {
    if (!order?.orderId && !order?.id) return;
    const text = order.orderId || order.id;
    navigator.clipboard?.writeText(text);
    setCopiedId(true);
    showToast('Order ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyAwb = (awb) => {
    if (!awb) return;
    navigator.clipboard?.writeText(awb);
    setCopiedAwb(true);
    showToast('AWB / Tracking number copied');
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleConfirmCancelOrder = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const finalReason = cancelReason === 'Other' ? (cancelCustomNote || 'Other') : cancelReason;
      const res = await api.cancelOrder(order.orderId || order.id, finalReason);
      if (res && res.success) {
        showToast('Order cancelled successfully. Stock restored.');
        setShowCancelModal(false);
        // Refresh order view
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

  // Determine Stepper States
  const getStepperStatus = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'CANCELLED') return 'cancelled';

    const orderStages = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIdx = orderStages.indexOf(s);

    return {
      confirmed: currentIdx >= 1 ? 'completed' : currentIdx === 0 ? 'active' : '',
      processing: currentIdx >= 2 ? 'completed' : currentIdx === 1 ? 'active' : '',
      shipped: currentIdx >= 3 ? 'completed' : currentIdx === 2 ? 'active' : '',
      delivered: currentIdx >= 4 ? 'completed' : currentIdx === 3 ? 'active' : ''
    };
  };

  const isCancellable = order && ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING'].includes((order.status || '').toUpperCase());

  // Format currency
  const formatINR = (amt) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  // Format date helper
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Estimate arrival date (approx 2 business days from order createdAt)
  const getEstimatedDate = (createdDate) => {
    const base = createdDate ? new Date(createdDate) : new Date();
    base.setDate(base.getDate() + 2);
    return base.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="asm-tracking-page">
        <div className="asm-tracking-container" style={{ textAlign: 'center', padding: '60px 16px' }}>
          <div className="asm-track-pulse-badge" style={{ margin: '0 auto 16px', background: '#2563EB' }}>
            <span className="asm-pulse-dot" style={{ background: '#93C5FD' }} />
            <span>Fetching Live Tracking Details...</span>
          </div>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Connecting to ASM Shine logistics hub...</p>
        </div>
      </div>
    );
  }

  // 2. Lookup / Search Form (If no active orderId or Error)
  if (!activeOrderId || error) {
    return (
      <div className="asm-tracking-page">
        <div className="asm-tracking-container">
          <div className="asm-tracking-header">
            <button type="button" className="asm-tracking-nav-btn" onClick={() => navigate(-1)}>
              <ChevronLeft size={16} /> Back
            </button>
            <Link to="/account" className="asm-tracking-nav-btn">
              <ShoppingBag size={15} /> My Orders
            </Link>
          </div>

          <div className="asm-tracking-hero" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: error ? '#FEF2F2' : '#EFF6FF',
                color: error ? '#DC2626' : '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              {error ? <AlertCircle size={32} /> : <Search size={32} />}
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              {error ? 'Order Not Found' : 'Track Your ASM Shine Order'}
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '440px', margin: '0 auto 24px' }}>
              {error
                ? error
                : 'Enter your genuine Order Reference ID (e.g. ASM-20261030-105912) to see real-time packaging, dispatch and courier tracking updates.'}
            </p>

            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                maxWidth: '460px',
                margin: '0 auto',
                gap: '8px',
                flexWrap: 'wrap'
              }}
            >
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ASM-20261030-105912)"
                value={searchIdInput}
                onChange={(e) => setSearchIdInput(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              />
              <button type="submit" className="asm-btn-primary" style={{ padding: '12px 22px' }}>
                <Search size={16} /> Track Order
              </button>
            </form>

            {user && (
              <div style={{ marginTop: '28px', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>
                  Looking for your past purchases?{' '}
                </span>
                <Link
                  to="/account"
                  style={{ fontSize: '13px', color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}
                >
                  View All Orders in Account →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Main Order Tracking Display
  const currentStatus = (order.status || 'CONFIRMED').toUpperCase();
  const stepperStates = getStepperStatus(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  // Calculate percentage for progress bar line
  let fillPercent = '0%';
  if (!isCancelled) {
    if (currentStatus === 'CONFIRMED') fillPercent = '15%';
    else if (currentStatus === 'PROCESSING') fillPercent = '45%';
    else if (currentStatus === 'SHIPPED') fillPercent = '75%';
    else if (currentStatus === 'DELIVERED') fillPercent = '100%';
  }

  const shippingDetails = order.shippingDetails || {};
  const carrier = shippingDetails.carrier || 'ASM Express Logistics';
  const trackingNumber = shippingDetails.trackingNumber || '';
  const trackingUrl = shippingDetails.trackingUrl || '';

  return (
    <div className="asm-tracking-page">
      <div className="asm-tracking-container asm-print-area">
        {/* Navigation Bar */}
        <div className="asm-tracking-header no-print">
          <button type="button" className="asm-tracking-nav-btn" onClick={() => navigate('/account')}>
            <ChevronLeft size={16} /> Back to My Orders
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="asm-tracking-nav-btn" onClick={handlePrintReceipt}>
              <Printer size={15} /> Print Invoice
            </button>
            <button
              type="button"
              className="asm-tracking-nav-btn"
              onClick={() => setShowSupportModal(true)}
            >
              <HelpCircle size={15} /> Need Help?
            </button>
          </div>
        </div>

        {/* Hero Card: Order Overview & Real-Time Stepper */}
        <div className="asm-tracking-hero">
          <div className="asm-hero-top">
            <div className="asm-hero-id-col">
              <h2>
                <span>Order #{order.orderId || order.id}</span>
                <button
                  type="button"
                  className="asm-order-pill-copy"
                  style={{ color: '#2563EB', background: '#EFF6FF' }}
                  onClick={handleCopyOrderId}
                  title="Copy Order ID"
                >
                  {copiedId ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  <span>{copiedId ? 'Copied' : 'Copy'}</span>
                </button>
              </h2>
              <p>
                Placed on {formatDate(order.createdAt)} • {order.items?.length || 0} item
                {(order.items?.length || 0) > 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`asm-status-badge ${currentStatus}`}>
                {isCancelled ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                <span>{currentStatus.replace('_', ' ')}</span>
              </span>
            </div>
          </div>

          {/* Cancelled Banner if applicable */}
          {isCancelled ? (
            <div
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                margin: '16px 0'
              }}
            >
              <XCircle size={28} color="#DC2626" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#991B1B', fontSize: '15px' }}>This Order was Cancelled</strong>
                <p style={{ margin: '3px 0 0', color: '#B91C1C', fontSize: '13px' }}>
                  Reason: {order.cancellation?.reason || 'Cancelled by customer'}
                  {order.cancellation?.cancelledAt && (
                    <span> • {formatDate(order.cancellation.cancelledAt)}</span>
                  )}
                </p>
                <small style={{ color: '#7F1D1D', fontSize: '12px' }}>
                  Restocked to inventory. Any prepaid amount will be refunded to your original payment method.
                </small>
              </div>
            </div>
          ) : (
            /* Estimated Delivery Banner */
            <div className="asm-delivery-estimate-card">
              <div className="asm-estimate-left">
                <div className="asm-estimate-icon">
                  <Truck size={22} />
                </div>
                <div className="asm-estimate-text">
                  <h4>
                    {currentStatus === 'DELIVERED'
                      ? 'Package Delivered Successfully!'
                      : `Estimated Delivery by ${getEstimatedDate(order.createdAt)}`}
                  </h4>
                  <p>
                    {currentStatus === 'DELIVERED'
                      ? 'Handed over directly to customer at doorstep.'
                      : 'Standard Express Surface & Air Freight Shipping'}
                  </p>
                </div>
              </div>

              <div className="asm-track-pulse-badge">
                <span className="asm-pulse-dot" />
                <span>
                  {currentStatus === 'SHIPPED'
                    ? 'In Transit'
                    : currentStatus === 'DELIVERED'
                    ? 'Delivered'
                    : 'Active Dispatch'}
                </span>
              </div>
            </div>
          )}

          {/* Stepper Timeline (Amazon/Flipkart Style) */}
          {!isCancelled && (
            <div className="asm-stepper-wrap">
              <div className="asm-stepper">
                <div className="asm-stepper-line">
                  <div className="asm-stepper-line-fill" style={{ width: fillPercent }} />
                </div>

                {/* Step 1: Confirmed */}
                <div className={`asm-stepper-step ${stepperStates.confirmed}`}>
                  <div className="asm-step-circle">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <div className="asm-step-title">Order Confirmed</div>
                  <div className="asm-step-subtitle">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Verified'}
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className={`asm-stepper-step ${stepperStates.processing}`}>
                  <div className="asm-step-circle">
                    <Package size={18} />
                  </div>
                  <div className="asm-step-title">Packed & Ready</div>
                  <div className="asm-step-subtitle">Warehouse Dispatch</div>
                </div>

                {/* Step 3: Shipped */}
                <div className={`asm-stepper-step ${stepperStates.shipped}`}>
                  <div className="asm-step-circle">
                    <Truck size={18} />
                  </div>
                  <div className="asm-step-title">Shipped / In Transit</div>
                  <div className="asm-step-subtitle">
                    {trackingNumber ? `AWB: ${trackingNumber.slice(0, 8)}...` : carrier}
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className={`asm-stepper-step ${stepperStates.delivered}`}>
                  <div className="asm-step-circle">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="asm-step-title">Delivered</div>
                  <div className="asm-step-subtitle">Doorstep Handover</div>
                </div>
              </div>
            </div>
          )}

          {/* Courier Details Card if dispatched */}
          {trackingNumber && !isCancelled && (
            <div className="asm-courier-card">
              <div className="asm-courier-meta">
                <div className="asm-courier-icon">
                  <Truck size={20} />
                </div>
                <div>
                  <div className="asm-courier-name">
                    Carrier Partner: <strong>{carrier}</strong>
                  </div>
                  <div className="asm-courier-awb">
                    <span>Tracking Number / AWB: </span>
                    <strong style={{ color: '#0F172A' }}>{trackingNumber}</strong>
                    <button
                      type="button"
                      className="asm-awb-copy-btn"
                      onClick={() => handleCopyAwb(trackingNumber)}
                    >
                      {copiedAwb ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedAwb ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="asm-courier-link"
                >
                  <span>Track on Courier Site</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Two-Column Grid: Delivery Address & Payment Summary */}
        <div className="asm-two-col-grid">
          {/* 1. Delivery Destination */}
          <div className="asm-info-block">
            <h4 className="asm-info-title">
              <MapPin size={15} color="#2563EB" />
              <span>Delivery Destination</span>
            </h4>
            <div className="asm-info-name">
              {order.shippingAddress?.fullName || order.shippingAddress?.name || user?.name || 'Customer'}
            </div>
            <p className="asm-info-text">
              {order.shippingAddress?.street}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
              <strong>{order.shippingAddress?.pincode}</strong>
            </p>
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={13} color="#64748B" />
              <span>Contact: {order.shippingAddress?.phone || user?.phone || '—'}</span>
            </div>
          </div>

          {/* 2. Payment & Billing Details */}
          <div className="asm-info-block">
            <h4 className="asm-info-title">
              <CreditCard size={15} color="#2563EB" />
              <span>Payment &amp; Billing</span>
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                Payment Method:
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  background: '#F1F5F9',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  color: '#334155'
                }}
              >
                {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'COD'}
              </span>
            </div>

            <div className="asm-price-breakdown">
              <div className="asm-price-row">
                <span>Items Subtotal:</span>
                <span>{formatINR(order.pricing?.itemsSubtotal || order.totalAmount)}</span>
              </div>
              {order.pricing?.productDiscount > 0 && (
                <div className="asm-price-row discount">
                  <span>Product Discount:</span>
                  <span>-{formatINR(order.pricing.productDiscount)}</span>
                </div>
              )}
              {order.pricing?.couponDiscount > 0 && (
                <div className="asm-price-row discount">
                  <span>Coupon Discount:</span>
                  <span>-{formatINR(order.pricing.couponDiscount)}</span>
                </div>
              )}
              {order.pricing?.prepaidDiscount > 0 && (
                <div className="asm-price-row discount">
                  <span>Prepaid 5% Discount:</span>
                  <span>-{formatINR(order.pricing.prepaidDiscount)}</span>
                </div>
              )}
              <div className="asm-price-row">
                <span>Delivery Charges:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
              </div>
              <div className="asm-price-row total">
                <span>Total Paid:</span>
                <span style={{ color: '#2563EB' }}>
                  {formatINR(order.pricing?.finalAmount || order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items List Card */}
        <div className="asm-section-box">
          <div className="asm-section-header">
            <h3 className="asm-section-title">
              <Package size={17} color="#2563EB" />
              <span>Items in this Shipment ({order.items?.length || 0})</span>
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              100% Genuine ASM Shine Hygiene Products
            </span>
          </div>

          <div className="asm-ordered-items-list">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="asm-order-item-card">
                <img
                  src={item.image || '/favicon.svg'}
                  alt={item.name}
                  className="asm-item-thumb"
                  onError={(e) => {
                    e.currentTarget.src = '/favicon.svg';
                  }}
                />

                <div className="asm-item-meta">
                  <h4 className="asm-item-name">{item.name}</h4>
                  <div className="asm-item-sub">
                    {item.size && <span className="asm-item-tag">{item.size}</span>}
                    <span>Qty: <strong>{item.quantity}</strong></span>
                    <span>•</span>
                    <span>₹{item.unitPrice || item.price || 0} / unit</span>
                  </div>
                </div>

                <div className="asm-item-price-col">
                  <div className="asm-item-price-current">
                    {formatINR(item.totalPrice || ((item.unitPrice || item.price || 0) * (item.quantity || 1)))}
                  </div>
                  {item.totalMRP > (item.totalPrice || item.unitPrice * item.quantity) && (
                    <div className="asm-item-price-original">
                      {formatINR(item.totalMRP)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Timeline Events (Audit Trail) */}
        {order.timeline && order.timeline.length > 0 && (
          <div className="asm-section-box">
            <div className="asm-section-header">
              <h3 className="asm-section-title">
                <Clock size={17} color="#2563EB" />
                <span>Tracking History &amp; Activity Log</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              {order.timeline.map((event, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    fontSize: '13px'
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: idx === order.timeline.length - 1 ? '#2563EB' : '#10B981',
                      marginTop: '4px',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>
                      {event.title || event.status}
                    </div>
                    {event.note && (
                      <div style={{ color: '#475569', fontSize: '12.5px', marginTop: '2px' }}>
                        {event.note}
                      </div>
                    )}
                    <div style={{ color: '#94A3B8', fontSize: '11.5px', marginTop: '2px' }}>
                      {formatDate(event.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="asm-actions-bar no-print">
          <button
            type="button"
            className="asm-btn-secondary"
            onClick={() => navigate('/categories')}
          >
            <ShoppingBag size={16} /> Continue Shopping
          </button>

          {isCancellable && (
            <button
              type="button"
              className="asm-btn-danger-outline"
              onClick={() => setShowCancelModal(true)}
              id="cancel-order-trigger-btn"
            >
              <XCircle size={16} /> Cancel Order
            </button>
          )}

          <button
            type="button"
            className="asm-btn-primary"
            onClick={handlePrintReceipt}
          >
            <Printer size={16} /> Print Tax Receipt
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CANCELLATION MODAL                                            */}
      {/* ------------------------------------------------------------- */}
      {showCancelModal && (
        <div className="asm-modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="asm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="asm-modal-header">
              <h3 className="asm-modal-title">
                <AlertCircle size={20} color="#DC2626" />
                <span>Cancel Order #{order.orderId || order.id}</span>
              </h3>
              <button
                type="button"
                className="asm-modal-close-btn"
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px' }}>
              Are you sure you want to cancel this order? Once cancelled, the products will be released and returned to inventory.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Please select a cancellation reason:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="Found a better price / changed my mind">Found a better price / changed my mind</option>
                <option value="Ordered by mistake / duplicate order">Ordered by mistake / duplicate order</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
                <option value="Delivery is taking too long">Delivery is taking too long</option>
                <option value="Other">Other (specify below)</option>
              </select>
            </div>

            {cancelReason === 'Other' && (
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  rows={3}
                  placeholder="Tell us why you are cancelling..."
                  value={cancelCustomNote}
                  onChange={(e) => setCancelCustomNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="asm-btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                type="button"
                className="asm-btn-danger-outline"
                style={{ flex: 1, backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#DC2626' }}
                onClick={handleConfirmCancelOrder}
                disabled={cancelling}
                id="confirm-cancel-order-btn"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUPPORT HELP MODAL                                            */}
      {/* ------------------------------------------------------------- */}
      {showSupportModal && (
        <div className="asm-modal-backdrop" onClick={() => setShowSupportModal(false)}>
          <div className="asm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="asm-modal-header">
              <h3 className="asm-modal-title">
                <HelpCircle size={20} color="#2563EB" />
                <span>ASM Shine 24x7 Customer Care</span>
              </h3>
              <button
                type="button"
                className="asm-modal-close-btn"
                onClick={() => setShowSupportModal(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px' }}>
              We are here to assist with any questions regarding order #{order.orderId || order.id}, delivery schedules, or invoice requests.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={`https://wa.me/91958423614?text=Hi%2C%20I%20need%20help%20with%20my%20order%20%23${order.orderId || order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  💬
                </div>
                <div>
                  <div>Chat on WhatsApp</div>
                  <small style={{ fontWeight: 400, color: '#047857' }}>Instant support response</small>
                </div>
              </a>

              <a
                href="tel:+91958423614"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1E40AF',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={16} />
                </div>
                <div>
                  <div>Call Priority Support</div>
                  <small style={{ fontWeight: 400, color: '#1D4ED8' }}>+91 958423614 (9am - 8pm)</small>
                </div>
              </a>
            </div>

            <button
              type="button"
              className="asm-btn-secondary"
              style={{ width: '100%', marginTop: '20px' }}
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
