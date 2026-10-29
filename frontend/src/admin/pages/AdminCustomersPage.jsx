import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Eye,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Selected customer for detail drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getCustomers({
        page: pagination.page,
        limit: pagination.limit,
        search
      });
      if (res.success) {
        setCustomers(res.data || []);
        setPagination((prev) => ({
          ...prev,
          total: res.pagination?.total || 0,
          totalPages: res.pagination?.totalPages || 1
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCustomerDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await adminApi.getCustomer(id);
      if (res.success) {
        setSelectedCustomer(res.data);
        setCustomerOrders(res.data.orders || []);
      }
    } catch (err) {
      alert(err.message || 'Failed to load customer details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="admin-page-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Management</h1>
          <p className="admin-page-subtitle">
            Directory of registered shoppers with real calculated order counts, spend metrics, and purchase history.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchCustomers} className="admin-btn admin-btn-secondary">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        {/* Search & Stats Header */}
        <div className="admin-card-header">
          <div className="admin-filter-bar">
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="admin-search-input"
                style={{ width: '300px' }}
              />
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
            Total Customers: {pagination.total}
          </div>
        </div>

        {/* Customers Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Total Orders</th>
                <th>Lifetime Spend</th>
                <th>Last Order</th>
                <th>Registered</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' }} />
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    <Users size={32} style={{ margin: '0 auto 10px auto', color: '#CBD5E1' }} />
                    <p style={{ fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>No customers found</p>
                    <p style={{ fontSize: '13px', margin: 0 }}>Try clearing your search query.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id || c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '14px'
                          }}
                        >
                          {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{c.name || 'Unnamed Customer'}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                            Auth: {c.provider || 'local'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#0F172A' }}>{c.email || '—'}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{c.phone || 'No phone recorded'}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '13px',
                          color: c.totalOrders > 0 ? '#0F172A' : '#94A3B8'
                        }}
                      >
                        {c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: c.totalSpend > 0 ? '#059669' : '#64748B' }}>
                      {formatCurrency(c.totalSpend)}
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#64748B' }}>
                      {c.lastOrderDate ? formatDate(c.lastOrderDate) : 'Never'}
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#64748B' }}>
                      {formatDate(c.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openCustomerDetail(c.id || c._id)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                      >
                        <Eye size={13} /> View Profile
                      </button>
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

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '780px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">{selectedCustomer.customer?.name}</h2>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                  Customer ID: {selectedCustomer.customer?._id}
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Profile Card & KPI Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Completed Spend</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {formatCurrency(selectedCustomer.stats?.totalSpend)}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Orders Placed</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                    {selectedCustomer.stats?.orderCount || 0}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Registered Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
                    {formatDate(selectedCustomer.customer?.createdAt)}
                  </div>
                </div>
              </div>

              {/* Contact Information & Addresses */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A', marginBottom: '10px' }}>
                  Contact Information & Addresses
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                  <div>
                    <div><strong>Email:</strong> {selectedCustomer.customer?.email || '—'}</div>
                    <div style={{ marginTop: '4px' }}><strong>Phone:</strong> {selectedCustomer.customer?.phone || '—'}</div>
                    <div style={{ marginTop: '4px' }}><strong>Auth Provider:</strong> {selectedCustomer.customer?.provider || 'local'}</div>
                  </div>
                  <div>
                    <strong>Saved Addresses ({selectedCustomer.customer?.addresses?.length || 0}):</strong>
                    {selectedCustomer.customer?.addresses?.length > 0 ? (
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                        {selectedCustomer.customer.addresses.map((addr, idx) => (
                          <div key={idx} style={{ marginBottom: '6px', padding: '6px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <div>{addr.street || addr.addressLine1}</div>
                            <div>{addr.city}, {addr.state} - {addr.pincode}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>No saved addresses.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', marginBottom: '10px' }}>
                  Order History ({customerOrders.length})
                </div>
                {customerOrders.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '8px' }}>
                    No orders placed yet.
                  </div>
                ) : (
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerOrders.map((o) => (
                          <tr key={o.orderId || o._id}>
                            <td style={{ fontWeight: 800, color: '#2563EB' }}>#{o.orderId}</td>
                            <td style={{ fontSize: '12px', color: '#64748B' }}>{formatDate(o.createdAt)}</td>
                            <td>{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                            <td style={{ fontWeight: 800, color: '#0F172A' }}>{formatCurrency(o.totalAmount)}</td>
                            <td>
                              <span className={`admin-status-badge ${o.status}`}>{o.status}</span>
                            </td>
                            <td style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>
                              {o.paymentMethod} ({o.paymentStatus})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button onClick={() => setSelectedCustomer(null)} className="admin-btn admin-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
