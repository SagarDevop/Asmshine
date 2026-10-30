import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  AlertCircle,
  ExternalLink,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  X
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminOrdersPage = () => {
  const { isAuthorized } = useAdminAuth();
  const canManageOrders = isAuthorized('order_manager');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Selected Order for Drawer / Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Update & Fulfillment State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [carrierInput, setCarrierInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackingUrlInput, setTrackingUrlInput] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundPayment, setRefundPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Feedback Notification
  const [notice, setNotice] = useState(null);

  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getOrders({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter,
        paymentMethod
      });
      if (res.success) {
        setOrders(res.data || []);
        setPagination((prev) => ({
          ...prev,
          total: res.pagination?.total || 0,
          totalPages: res.pagination?.totalPages || 1
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, paymentMethod]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openOrderDetail = async (orderId) => {
    try {
      setLoadingDetail(true);
      const res = await adminApi.getOrder(orderId);
      if (res.success) {
        setSelectedOrder(res.data);
        setCarrierInput(res.data.shippingDetails?.carrier || '');
        setTrackingNumberInput(res.data.shippingDetails?.trackingNumber || '');
        setTrackingUrlInput(res.data.shippingDetails?.trackingUrl || '');
        setStatusNote('');
      }
    } catch (err) {
      showNotice(err.message || 'Failed to load order details', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (targetStatus) => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const res = await adminApi.updateOrderStatus(selectedOrder.orderId, {
        status: targetStatus,
        carrier: carrierInput,
        trackingNumber: trackingNumberInput,
        trackingUrl: trackingUrlInput,
        note: statusNote
      });
      if (res.success) {
        setSelectedOrder(res.data);
        showNotice(`Order #${res.data.orderId} moved to ${targetStatus}`);
        fetchOrders();
      }
    } catch (err) {
      showNotice(err.message || 'Status transition failed', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      const res = await adminApi.updateOrderStatus(orderId, { status: 'CONFIRMED' });
      if (res.success) {
        showNotice(`Order #${orderId} successfully confirmed`);
        fetchOrders();
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder(res.data);
        }
      }
    } catch (err) {
      showNotice(err.message || 'Failed to confirm order', 'error');
    }
  };

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!cancelReason.trim()) {
      showNotice('Please specify a cancellation reason.', 'error');
      return;
    }
    try {
      setCancelling(true);
      const res = await adminApi.cancelOrder(selectedOrder.orderId, {
        reason: cancelReason,
        refundPayment
      });
      if (res.success) {
        setSelectedOrder(res.data);
        setCancelModalOpen(false);
        setCancelReason('');
        showNotice(`Order #${res.data.orderId} cancelled & stock restored.`);
        fetchOrders();
      }
    } catch (err) {
      showNotice(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (st) => {
    const map = {
      PENDING_CONFIRMATION: { label: 'Pending Review', cls: 'PENDING_CONFIRMATION' },
      CONFIRMED: { label: 'Confirmed', cls: 'CONFIRMED' },
      PROCESSING: { label: 'Processing', cls: 'PROCESSING' },
      SHIPPED: { label: 'Shipped', cls: 'SHIPPED' },
      DELIVERED: { label: 'Delivered', cls: 'DELIVERED' },
      CANCELLED: { label: 'Cancelled', cls: 'CANCELLED' }
    };
    const c = map[st] || { label: st, cls: 'PENDING_CONFIRMATION' };
    return <span className={`admin-status-badge ${c.cls}`}>{c.label}</span>;
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-page-content">
      {/* Toast Notification */}
      {notice && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 120,
            background: notice.type === 'error' ? '#DC2626' : '#059669',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '13.5px'
          }}
        >
          {notice.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {notice.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Order Management & Fulfillment</h1>
          <p className="admin-page-subtitle">
            Review customer orders, transition fulfillment statuses, log courier tracking, and safely manage cancellations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchOrders} className="admin-btn admin-btn-secondary" title="Refresh list">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '16px'
        }}
      >
        {[
          { key: '', label: 'All Orders' },
          { key: 'PENDING_CONFIRMATION', label: 'Pending Review' },
          { key: 'CONFIRMED', label: 'Confirmed' },
          { key: 'PROCESSING', label: 'Processing' },
          { key: 'SHIPPED', label: 'Shipped' },
          { key: 'DELIVERED', label: 'Delivered' },
          { key: 'CANCELLED', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: statusFilter === tab.key ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
              background: statusFilter === tab.key ? '#EFF6FF' : '#FFFFFF',
              color: statusFilter === tab.key ? '#2563EB' : '#64748B',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        {/* Filters Bar */}
        <div className="admin-card-header">
          <div className="admin-filter-bar">
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Search Order ID, name, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="admin-search-input"
                style={{ width: '280px' }}
              />
            </div>

            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="admin-select"
            >
              <option value="">All Payment Types</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="online">Prepaid / Online</option>
            </select>
          </div>

          <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
            Showing {orders.length} of {pagination.total} orders
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' }} />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    <ShoppingBag size={32} style={{ margin: '0 auto 10px auto', color: '#CBD5E1' }} />
                    <p style={{ fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>No orders found</p>
                    <p style={{ fontSize: '13px', margin: 0 }}>Try clearing filters or check back later.</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.orderId || o._id}>
                    <td>
                      <button
                        onClick={() => openOrderDetail(o.orderId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontWeight: 800,
                          color: '#2563EB',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '13.5px'
                        }}
                      >
                        #{o.orderId}
                      </button>
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {formatDate(o.createdAt)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{o.customerName}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        {o.customerPhone || o.customerEmail || o.shippingCity}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{o.itemCount} item{o.itemCount !== 1 ? 's' : ''}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#0F172A' }}>
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#334155' }}>
                          {o.paymentMethod === 'cod' ? 'COD' : 'Online'}
                        </span>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            width: 'fit-content',
                            background: o.paymentStatus === 'completed' ? '#ECFDF5' : o.paymentStatus === 'refunded' ? '#FEF2F2' : '#FFFBEB',
                            color: o.paymentStatus === 'completed' ? '#065F46' : o.paymentStatus === 'refunded' ? '#991B1B' : '#92400E'
                          }}
                        >
                          {o.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td>{getStatusBadge(o.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {o.status === 'PENDING_CONFIRMATION' && canManageOrders && (
                          <button
                            onClick={() => handleConfirmOrder(o.orderId)}
                            className="admin-btn admin-btn-sm"
                            style={{ background: '#059669', color: '#FFFFFF' }}
                            title="Quick Confirm Order"
                          >
                            <CheckCircle size={13} />
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => openOrderDetail(o.orderId)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          <Eye size={13} />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px'
            }}
          >
            <span style={{ color: '#64748B' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '820px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="admin-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 className="admin-modal-title">Order #{selectedOrder.orderId}</h2>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '3px' }}>
                  Placed on {formatDate(selectedOrder.createdAt)}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Lifecycle Action Bar */}
              {canManageOrders && selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A' }}>
                      Order Lifecycle Progression
                    </div>
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="admin-btn admin-btn-danger admin-btn-sm"
                    >
                      <XCircle size={13} /> Cancel Order
                    </button>
                  </div>

                  {/* Contextual Action Step Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedOrder.status === 'PENDING_CONFIRMATION' && (
                      <button
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus('CONFIRMED')}
                        className="admin-btn admin-btn-primary"
                        style={{ background: '#059669' }}
                      >
                        <CheckCircle size={15} /> Confirm Customer Order
                      </button>
                    )}

                    {selectedOrder.status === 'CONFIRMED' && (
                      <button
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus('PROCESSING')}
                        className="admin-btn admin-btn-primary"
                      >
                        <Package size={15} /> Move to Packaging / Processing
                      </button>
                    )}

                    {selectedOrder.status === 'PROCESSING' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Courier Partner (e.g. BlueDart)"
                            value={carrierInput}
                            onChange={(e) => setCarrierInput(e.target.value)}
                            className="admin-form-input"
                            style={{ height: '36px', fontSize: '12.5px' }}
                          />
                          <input
                            type="text"
                            placeholder="Tracking / AWB Number"
                            value={trackingNumberInput}
                            onChange={(e) => setTrackingNumberInput(e.target.value)}
                            className="admin-form-input"
                            style={{ height: '36px', fontSize: '12.5px' }}
                          />
                          <input
                            type="text"
                            placeholder="Tracking URL (optional)"
                            value={trackingUrlInput}
                            onChange={(e) => setTrackingUrlInput(e.target.value)}
                            className="admin-form-input"
                            style={{ height: '36px', fontSize: '12.5px' }}
                          />
                        </div>
                        <button
                          disabled={updatingStatus}
                          onClick={() => handleUpdateStatus('SHIPPED')}
                          className="admin-btn admin-btn-primary"
                          style={{ width: 'fit-content', background: '#7C3AED' }}
                        >
                          <Truck size={15} /> Dispatch & Mark as Shipped
                        </button>
                      </div>
                    )}

                    {selectedOrder.status === 'SHIPPED' && (
                      <button
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus('DELIVERED')}
                        className="admin-btn admin-btn-primary"
                        style={{ background: '#166534' }}
                      >
                        <CheckCircle size={15} /> Confirm Delivery Completed
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Customer & Shipping Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Customer Details */}
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px', color: '#0F172A', marginBottom: '8px' }}>
                    <UserIcon size={14} color="#2563EB" /> Customer Information
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                    <div><strong>Name:</strong> {selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || 'Customer'}</div>
                    <div><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || '—'}</div>
                    <div><strong>Email:</strong> {selectedOrder.user?.email || '—'}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                      Account registered: {formatDate(selectedOrder.user?.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px', color: '#0F172A', marginBottom: '8px' }}>
                    <MapPin size={14} color="#2563EB" /> Shipping Destination
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#334155' }}>
                    <div>{selectedOrder.shippingAddress?.addressLine1}</div>
                    {selectedOrder.shippingAddress?.landmark && <div>Near {selectedOrder.shippingAddress.landmark}</div>}
                    <div>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                    </div>
                    {selectedOrder.shippingDetails?.trackingNumber && (
                      <div style={{ marginTop: '8px', padding: '6px 10px', background: '#F1F5F9', borderRadius: '6px', fontSize: '12px' }}>
                        <strong>Carrier:</strong> {selectedOrder.shippingDetails.carrier || 'Standard Courier'} | <strong>AWB:</strong> {selectedOrder.shippingDetails.trackingNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table Snapshot */}
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', marginBottom: '10px' }}>
                  Order Items Snapshot ({selectedOrder.items?.length || 0})
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price Snapshot</th>
                        <th>Qty</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={item.image || '/favicon.svg'}
                                alt={item.name}
                                style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', background: '#F8FAFC' }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
                                {item.sku && <div style={{ fontSize: '11px', color: '#64748B' }}>SKU: {item.sku}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{formatCurrency(item.unitPrice || item.price || (item.totalPrice / (item.quantity || 1)) || 0)}</td>
                          <td style={{ fontWeight: 700 }}>× {item.quantity}</td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                            {formatCurrency(item.totalPrice || ((item.unitPrice || item.price || 0) * (item.quantity || 1)))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Items Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.pricing?.itemsSubtotal || selectedOrder.itemsTotal || selectedOrder.items?.reduce((s, i) => s + (i.totalPrice || (i.unitPrice || i.price || 0) * (i.quantity || 1)), 0))}</span>
                  </div>
                  {(selectedOrder.pricing?.couponDiscount > 0 || selectedOrder.coupon?.discountAmount > 0 || selectedOrder.discountAmount > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                      <span>Coupon Discount ({selectedOrder.coupon?.code || selectedOrder.couponCode || 'APPLIED'}):</span>
                      <span>-{formatCurrency(selectedOrder.pricing?.couponDiscount || selectedOrder.coupon?.discountAmount || selectedOrder.discountAmount || 0)}</span>
                    </div>
                  )}
                  {selectedOrder.pricing?.prepaidDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284C7', fontWeight: 600 }}>
                      <span>Prepaid Discount:</span>
                      <span>-{formatCurrency(selectedOrder.pricing.prepaidDiscount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Shipping Charges:</span>
                    <span>{selectedOrder.shippingCharges ? formatCurrency(selectedOrder.shippingCharges) : 'FREE'}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 800,
                      fontSize: '16px',
                      color: '#0F172A',
                      paddingTop: '8px',
                      borderTop: '1.5px solid #E2E8F0'
                    }}
                  >
                    <span>Final Order Total:</span>
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Audit History */}
              {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', marginBottom: '12px' }}>
                    Order Timeline & Audit Trail
                  </div>
                  <div className="admin-timeline">
                    {selectedOrder.timeline.map((entry, idx) => (
                      <div key={idx} className="admin-timeline-item">
                        <div className="admin-timeline-dot" />
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          {entry.title || entry.status}
                        </div>
                        {entry.note && (
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                            {entry.note}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          {formatDate(entry.timestamp)} • by {entry.updatedBy || 'System'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <button
                onClick={() => setSelectedOrder(null)}
                className="admin-btn admin-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOpen && selectedOrder && (
        <div className="admin-modal-backdrop" style={{ zIndex: 130 }}>
          <div className="admin-modal-card" style={{ maxWidth: '460px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title" style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} /> Cancel Order #{selectedOrder.orderId}
              </h2>
              <button
                onClick={() => setCancelModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCancelOrderSubmit}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 14px 0' }}>
                  Cancelling will immediately restore all purchased items back into live available inventory. This action is recorded in the audit logs.
                </p>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Mandatory Cancellation Reason <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Customer requested cancellation, address unreachable, fraud check failed..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>

                {selectedOrder.paymentStatus === 'completed' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <input
                      type="checkbox"
                      id="refundPaymentCheckbox"
                      checked={refundPayment}
                      onChange={(e) => setRefundPayment(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <label htmlFor="refundPaymentCheckbox" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                      Mark payment status as Refunded
                    </label>
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={cancelling || !cancelReason.trim()}
                  className="admin-btn admin-btn-danger"
                >
                  {cancelling ? 'Restoring stock...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
