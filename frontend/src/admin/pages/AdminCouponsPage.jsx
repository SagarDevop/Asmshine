import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Calendar,
  X
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminCouponsPage = () => {
  const { isAuthorized } = useAdminAuth();
  const canManageCoupons = isAuthorized('admin');

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  // Notification Toast
  const [notice, setNotice] = useState(null);
  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getCoupons();
      if (res.success) {
        setCoupons(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: 0,
      maxDiscountAmount: 0,
      usageLimit: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      usageLimit: coupon.usageLimit || 0,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      isActive: coupon.isActive !== false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      showNotice('Coupon code is required.', 'error');
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      showNotice('Discount value must be greater than zero.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCoupon) {
        const res = await adminApi.updateCoupon(editingCoupon._id, form);
        if (res.success) {
          showNotice(`Coupon '${form.code.toUpperCase()}' updated.`);
          setModalOpen(false);
          fetchCoupons();
        }
      } else {
        const res = await adminApi.createCoupon(form);
        if (res.success) {
          showNotice(`Coupon '${form.code.toUpperCase()}' created.`);
          setModalOpen(false);
          fetchCoupons();
        }
      }
    } catch (err) {
      showNotice(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${coupon.code}'?`)) return;
    try {
      const res = await adminApi.deleteCoupon(coupon._id);
      if (res.success) {
        showNotice(`Coupon '${coupon.code}' deleted.`);
        fetchCoupons();
      }
    } catch (err) {
      showNotice(err.message || 'Failed to delete coupon', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    showNotice(`Code '${text}' copied to clipboard!`);
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="admin-page-content">
      {/* Toast Notice */}
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
          <h1 className="admin-page-title">Coupons & Promotional Offers</h1>
          <p className="admin-page-subtitle">
            Configure percentage and fixed discounts, minimum cart thresholds, expiry windows, and global usage limits.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchCoupons} className="admin-btn admin-btn-secondary">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          {canManageCoupons && (
            <button onClick={openCreateModal} className="admin-btn admin-btn-primary">
              <Plus size={16} /> Create Coupon
            </button>
          )}
        </div>
      </div>

      {/* Coupons Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">Active & Scheduled Promotions ({coupons.length})</div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount Benefit</th>
                <th>Min Spend</th>
                <th>Usage Limit</th>
                <th>Validity Window</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' }} />
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    <Tag size={32} style={{ margin: '0 auto 10px auto', color: '#CBD5E1' }} />
                    <p style={{ fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>No coupons created yet</p>
                    <p style={{ fontSize: '13px', margin: 0 }}>Click "Create Coupon" to launch your first promotional discount.</p>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #BFDBFE'
                          }}
                        >
                          {c.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(c.code)}
                          title="Copy Code"
                          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                      {c.description && (
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: '14px' }}>
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`}
                      </div>
                      {c.discountType === 'percentage' && c.maxDiscountAmount > 0 && (
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          Max cap: {formatCurrency(c.maxDiscountAmount)}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {c.minOrderValue > 0 ? formatCurrency(c.minOrderValue) : 'No Minimum'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>
                        {c.usageCount || 0} used
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {c.usageLimit > 0 ? `Limit: ${c.usageLimit}` : 'Unlimited'}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      <div>From: {formatDate(c.validFrom)}</div>
                      <div>Until: {c.validUntil ? formatDate(c.validUntil) : 'No Expiry'}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: c.isActive ? '#ECFDF5' : '#F1F5F9',
                          color: c.isActive ? '#065F46' : '#64748B'
                        }}
                      >
                        {c.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {canManageCoupons && (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(c)}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            title="Edit Coupon"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            style={{ color: '#DC2626' }}
                            title="Delete Coupon"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Coupon Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Promotional Coupon'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Coupon Code <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POWER20, SHINE25"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    className="admin-form-input"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description / Offer Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% off on all heavy duty washing powders"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="admin-form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Discount Type</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                      className="admin-select"
                      style={{ width: '100%', height: '42px' }}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed INR (₹)</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Discount Value <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={form.discountType === 'percentage' ? 100 : 100000}
                      placeholder={form.discountType === 'percentage' ? '20' : '200'}
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Min Cart Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 for none"
                      value={form.minOrderValue}
                      onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                      className="admin-form-input"
                    />
                  </div>

                  {form.discountType === 'percentage' && (
                    <div className="admin-form-group">
                      <label className="admin-form-label">Max Cap Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0 for unlimited"
                        value={form.maxDiscountAmount}
                        onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                        className="admin-form-input"
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Total Usage Limit</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 for unlimited"
                      value={form.usageLimit}
                      onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Valid Until</label>
                    <input
                      type="date"
                      value={form.validUntil}
                      onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    id="couponActiveCheckbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="couponActiveCheckbox" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    Coupon is Active and Available for Customers at Checkout
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary"
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
