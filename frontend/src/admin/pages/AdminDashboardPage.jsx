import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  AlertTriangle,
  XCircle,
  Users,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  TrendingUp,
  Layers
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminLiveOrder } from '../context/AdminLiveOrderContext';

export const AdminDashboardPage = () => {
  const { subscribeOrderEvent } = useAdminLiveOrder();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMetrics = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const res = await adminApi.getDashboard(range);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      if (!isSilent) setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [range]);

  // Live Real-Time Dashboard Sync
  useEffect(() => {
    const unsubscribe = subscribeOrderEvent((eventType) => {
      if (eventType === 'NEW_ORDER' || eventType === 'ORDER_STATUS_CHANGED') {
        fetchMetrics(true); // silent re-fetch so revenue, orders, counters update live
      }
    });

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMetrics(true);
      }
    }, 20000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [subscribeOrderEvent, range]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
        <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 500 }}>Loading real-time operational data...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const statuses = data?.orderStatuses || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockAlerts = data?.lowStockAlerts || [];

  return (
    <div>
      {/* Heading & Controls */}
      <div className="admin-page-heading">
        <div>
          <h1 className="admin-page-title">Operations &amp; Sales Overview</h1>
          <p className="admin-page-desc">Live metrics computed directly from database records.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="admin-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            onClick={() => fetchMetrics()}
            className="admin-btn admin-btn-secondary"
            title="Refresh metrics"
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* 1. KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Net Sales Revenue</span>
            <div className="admin-kpi-icon-pill emerald"><IndianRupee size={17} /></div>
          </div>
          <div className="admin-kpi-value">₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="admin-kpi-sub">Excludes cancelled &amp; refunded orders</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Total Orders</span>
            <div className="admin-kpi-icon-pill blue"><ShoppingBag size={17} /></div>
          </div>
          <div className="admin-kpi-value">{summary.totalOrders || 0}</div>
          <div className="admin-kpi-sub">{statuses.delivered || 0} successfully delivered</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Active Catalogue</span>
            <div className="admin-kpi-icon-pill emerald"><Package size={17} /></div>
          </div>
          <div className="admin-kpi-value">{summary.inStockProducts || 0}</div>
          <div className="admin-kpi-sub">In-stock products ready for sale</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Low Stock Warnings</span>
            <div className="admin-kpi-icon-pill amber"><AlertTriangle size={17} /></div>
          </div>
          <div className="admin-kpi-value">{summary.lowStockCount || 0}</div>
          <div className="admin-kpi-sub">At or below warning threshold</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Out of Stock</span>
            <div className="admin-kpi-icon-pill rose"><XCircle size={17} /></div>
          </div>
          <div className="admin-kpi-value">{summary.outOfStockProducts || 0}</div>
          <div className="admin-kpi-sub">SKUs currently unavailable</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Registered Customers</span>
            <div className="admin-kpi-icon-pill purple"><Users size={17} /></div>
          </div>
          <div className="admin-kpi-value">{summary.totalCustomers || 0}</div>
          <div className="admin-kpi-sub">Verified customer accounts</div>
        </div>
      </div>

      {/* 2. Order Fulfillment Status Pipeline */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={15} color="#2563EB" />
          <span>Order Fulfillment Pipeline</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#FFFBEB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: '10.5px', color: '#92400E', fontWeight: 700, letterSpacing: '0.04em' }}>AWAITING REVIEW</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#78350F', marginTop: '2px' }}>{statuses.pendingConfirmation || 0}</div>
          </div>
          <div style={{ background: '#ECFDF5', padding: '10px 14px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
            <div style={{ fontSize: '10.5px', color: '#065F46', fontWeight: 700, letterSpacing: '0.04em' }}>CONFIRMED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>{statuses.confirmed || 0}</div>
          </div>
          <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: '10.5px', color: '#1E40AF', fontWeight: 700, letterSpacing: '0.04em' }}>PROCESSING</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1D4ED8', marginTop: '2px' }}>{statuses.processing || 0}</div>
          </div>
          <div style={{ background: '#F5F3FF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #DDD6FE' }}>
            <div style={{ fontSize: '10.5px', color: '#5B21B6', fontWeight: 700, letterSpacing: '0.04em' }}>SHIPPED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#6D28D9', marginTop: '2px' }}>{statuses.shipped || 0}</div>
          </div>
          <div style={{ background: '#F0FDF4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '10.5px', color: '#166534', fontWeight: 700, letterSpacing: '0.04em' }}>DELIVERED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>{statuses.delivered || 0}</div>
          </div>
          <div style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FECACA' }}>
            <div style={{ fontSize: '10.5px', color: '#991B1B', fontWeight: 700, letterSpacing: '0.04em' }}>CANCELLED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#B91C1C', marginTop: '2px' }}>{statuses.cancelled || 0}</div>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Section: Recent Orders + Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Recent Orders Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr
                      key={ord.orderId}
                      onClick={() => navigate(`/admin/orders`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span style={{ fontWeight: 700, color: '#2563EB', fontFamily: 'monospace', fontSize: '12.5px' }}>
                          #{ord.orderId}
                        </span>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{ord.customerName}</div>
                      </td>
                      <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum' 1" }}>
                        ₹{(ord.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`admin-status-badge ${ord.status}`}>
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warnings Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Inventory Alerts</h2>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              <span>Inventory Control</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '36px', color: '#059669' }}>
                      <CheckCircle2 size={22} style={{ margin: '0 auto 6px auto', display: 'block', color: '#10B981' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>All products are healthy and well-stocked.</span>
                    </td>
                  </tr>
                ) : (
                  lowStockAlerts.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={prod.image}
                            alt=""
                            style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'contain', background: '#F8FAFC', border: '1px solid #E2E8F0', flexShrink: 0 }}
                            onError={(e) => { e.target.src = '/favicon.svg'; }}
                          />
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>{prod.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: prod.stockQuantity <= 0 ? '#DC2626' : '#D97706', fontFeatureSettings: "'tnum' 1" }}>
                          {prod.stockQuantity} units
                        </span>
                      </td>
                      <td style={{ color: '#64748B', fontFeatureSettings: "'tnum' 1" }}>
                        {prod.lowStockThreshold || 5} units
                      </td>
                      <td>
                        <button
                          onClick={() => navigate('/admin/inventory')}
                          className="admin-btn admin-btn-primary admin-btn-sm"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboardPage;
