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
  TrendingUp,
  Clock,
  CheckCircle2
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
        fetchMetrics(true); // silent re-fetch so charts, revenue, counters update live
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
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
        <p style={{ color: '#64748B', fontSize: '13.5px' }}>Loading real-time operational data...</p>
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
          <p className="admin-page-desc">Live metrics calculated directly from database records.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            onClick={fetchMetrics}
            className="admin-btn admin-btn-secondary"
            title="Refresh metrics"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* 1. KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Eligible Net Revenue</span>
            <div className="admin-kpi-icon-pill emerald"><IndianRupee size={18} /></div>
          </div>
          <div className="admin-kpi-value">₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="admin-kpi-sub">Excludes cancelled orders</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Total Orders</span>
            <div className="admin-kpi-icon-pill blue"><ShoppingBag size={18} /></div>
          </div>
          <div className="admin-kpi-value">{summary.totalOrders || 0}</div>
          <div className="admin-kpi-sub">{statuses.delivered || 0} delivered safely</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">In-Stock Products</span>
            <div className="admin-kpi-icon-pill emerald"><Package size={18} /></div>
          </div>
          <div className="admin-kpi-value">{summary.inStockProducts || 0}</div>
          <div className="admin-kpi-sub">Active catalogue items</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Low Stock Warnings</span>
            <div className="admin-kpi-icon-pill amber"><AlertTriangle size={18} /></div>
          </div>
          <div className="admin-kpi-value">{summary.lowStockCount || 0}</div>
          <div className="admin-kpi-sub">At or below threshold</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Out of Stock</span>
            <div className="admin-kpi-icon-pill rose"><XCircle size={18} /></div>
          </div>
          <div className="admin-kpi-value">{summary.outOfStockProducts || 0}</div>
          <div className="admin-kpi-sub">Unavailable for sale</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Registered Customers</span>
            <div className="admin-kpi-icon-pill purple"><Users size={18} /></div>
          </div>
          <div className="admin-kpi-value">{summary.totalCustomers || 0}</div>
          <div className="admin-kpi-sub">Active retail accounts</div>
        </div>
      </div>

      {/* 2. Order Status Breakdown Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} color="#2563EB" />
          <span>Order Fulfillment Pipeline Status</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#FFFBEB', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 700 }}>AWAITING REVIEW</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#78350F' }}>{statuses.pendingConfirmation || 0}</div>
          </div>
          <div style={{ background: '#ECFDF5', padding: '10px 14px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
            <div style={{ fontSize: '11px', color: '#065F46', fontWeight: 700 }}>CONFIRMED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857' }}>{statuses.confirmed || 0}</div>
          </div>
          <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 700 }}>PROCESSING</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1D4ED8' }}>{statuses.processing || 0}</div>
          </div>
          <div style={{ background: '#F5F3FF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
            <div style={{ fontSize: '11px', color: '#5B21B6', fontWeight: 700 }}>SHIPPED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#6D28D9' }}>{statuses.shipped || 0}</div>
          </div>
          <div style={{ background: '#F0FDF4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>DELIVERED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D' }}>{statuses.delivered || 0}</div>
          </div>
          <div style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FECACA' }}>
            <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 700 }}>CANCELLED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#B91C1C' }}>{statuses.cancelled || 0}</div>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Layout: Recent Orders + Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
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
                        <span style={{ fontWeight: 700, color: '#2563EB' }}>{ord.orderId}</span>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>{ord.customerName}</td>
                      <td style={{ fontWeight: 700 }}>₹{ord.totalAmount}</td>
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

        {/* Low Stock Warnings */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Low Stock Alerts</h2>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              <span>Manage Inventory</span>
              <ArrowRight size={14} />
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
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#059669' }}>
                      <CheckCircle2 size={24} style={{ margin: '0 auto 6px auto', display: 'block' }} />
                      All products are currently well-stocked.
                    </td>
                  </tr>
                ) : (
                  lowStockAlerts.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={prod.image}
                            alt=""
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', background: '#F8FAFC' }}
                            onError={(e) => { e.target.src = '/favicon.svg'; }}
                          />
                          <span style={{ fontWeight: 600 }}>{prod.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: prod.stockQuantity <= 0 ? '#DC2626' : '#D97706' }}>
                          {prod.stockQuantity} units
                        </span>
                      </td>
                      <td style={{ color: '#64748B' }}>{prod.lowStockThreshold || 5} units</td>
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
