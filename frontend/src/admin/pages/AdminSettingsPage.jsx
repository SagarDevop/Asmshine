import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Shield,
  Download,
  Save,
  RefreshCw,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminSettingsPage = () => {
  const { admin, isAuthorized } = useAdminAuth();
  const isSuperAdmin = isAuthorized('superadmin');

  // Settings State
  const [settings, setSettings] = useState({
    storeName: '',
    tagline: '',
    supportEmail: '',
    supportPhone: '',
    freeShippingThreshold: 500,
    standardDeliveryFee: 50,
    defaultLowStockThreshold: 5,
    businessAddress: { street: '', city: '', state: '', pincode: '', country: 'India' },
    enableEmailNotifications: true
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // CSV Export State
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState('');

  // Notification Toast
  const [notice, setNotice] = useState(null);
  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await adminApi.getSettings();
      if (res.success && res.data) {
        setSettings({
          storeName: res.data.storeName || '',
          tagline: res.data.tagline || '',
          supportEmail: res.data.supportEmail || '',
          supportPhone: res.data.supportPhone || '',
          freeShippingThreshold: res.data.freeShippingThreshold || 0,
          standardDeliveryFee: res.data.standardDeliveryFee || 0,
          defaultLowStockThreshold: res.data.defaultLowStockThreshold || 5,
          businessAddress: res.data.businessAddress || { street: '', city: '', state: '', pincode: '', country: 'India' },
          enableEmailNotifications: res.data.enableEmailNotifications !== false
        });
      }
    } catch (err) {
      showNotice(err.message || 'Failed to load settings', 'error');
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const res = await adminApi.getAuditLogs({
        page: logsPagination.page,
        limit: logsPagination.limit,
        action: actionFilter
      });
      if (res.success) {
        setAuditLogs(res.data || []);
        setLogsPagination((prev) => ({
          ...prev,
          total: res.pagination?.total || 0,
          totalPages: res.pagination?.totalPages || 1
        }));
      }
    } catch (err) {
      console.error('Audit logs error:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [logsPagination.page, logsPagination.limit, actionFilter]);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showNotice('Only Super Administrators can modify store configuration.', 'error');
      return;
    }
    try {
      setSavingSettings(true);
      const res = await adminApi.updateSettings(settings);
      if (res.success) {
        showNotice('Store settings successfully updated.');
        fetchAuditLogs();
      }
    } catch (err) {
      showNotice(err.message || 'Failed to update settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem('asm_admin_token');
    const params = new URLSearchParams();
    if (exportStartDate) params.append('startDate', exportStartDate);
    if (exportEndDate) params.append('endDate', exportEndDate);
    if (token) params.append('token', token);

    const exportUrl = adminApi.exportOrdersCsvUrl(Object.fromEntries(params.entries()));
    // Download via direct navigation/anchor
    const a = document.createElement('a');
    a.href = exportUrl;
    a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotice('Orders CSV generation initiated.');
  };

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
          <h1 className="admin-page-title">Store Settings & Operations Logs</h1>
          <p className="admin-page-subtitle">
            Configure business contact details, shipping parameters, CSV exports, and review immutable audit records.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Section 1: Store Configuration Form */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Business & Logistics Configuration</div>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Governs shipping charges, free shipping rules, and contact information shown on invoices.
              </p>
            </div>
            {!isSuperAdmin && (
              <span style={{ fontSize: '12px', color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={13} /> Read-only (Super Admin role required to edit)
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Store Brand Name</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Brand Tagline</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Customer Support Email</label>
                <input
                  type="email"
                  disabled={!isSuperAdmin}
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Customer Support Phone</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Free Shipping Minimum Threshold (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={!isSuperAdmin}
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={!isSuperAdmin}
                  value={settings.standardDeliveryFee}
                  onChange={(e) => setSettings({ ...settings, standardDeliveryFee: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Global Low-Stock Alert Threshold (Units)</label>
                <input
                  type="number"
                  min="1"
                  disabled={!isSuperAdmin}
                  value={settings.defaultLowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, defaultLowStockThreshold: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Registered Warehouse Street Address</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={settings.businessAddress?.street || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      businessAddress: { ...settings.businessAddress, street: e.target.value }
                    })
                  }
                  className="admin-form-input"
                />
              </div>
            </div>

            {isSuperAdmin && (
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="admin-btn admin-btn-primary"
                >
                  <Save size={15} />
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Section 2: CSV Export Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Export Orders & Revenue Data</div>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Download comprehensive order details, customer addresses, payment statuses, and line items in CSV format.
              </p>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Start Date:</label>
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="admin-form-input"
                style={{ width: '160px', height: '38px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>End Date:</label>
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="admin-form-input"
                style={{ width: '160px', height: '38px' }}
              />
            </div>

            <button onClick={handleExportCsv} className="admin-btn admin-btn-primary">
              <Download size={15} /> Download CSV Spreadsheet
            </button>
          </div>
        </div>

        {/* Section 3: Administrative Audit Logs */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#2563EB" />
              <div>
                <div className="admin-card-title">Administrative Audit Trail</div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                  Immutable log of all operational mutations performed by administrators
                </div>
              </div>
            </div>

            <div className="admin-filter-bar">
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setLogsPagination((p) => ({ ...p, page: 1 }));
                }}
                className="admin-select"
              >
                <option value="">All Actions</option>
                <option value="STOCK_ADJUSTMENT">Stock Adjustment</option>
                <option value="ORDER_STATUS_UPDATE">Order Status Update</option>
                <option value="ORDER_CANCEL">Order Cancellation</option>
                <option value="PRODUCT_CREATE">Product Created</option>
                <option value="PRODUCT_UPDATE">Product Updated</option>
                <option value="COUPON_CREATE">Coupon Created</option>
                <option value="SETTINGS_UPDATE">Settings Updated</option>
              </select>

              <button onClick={fetchAuditLogs} className="admin-btn admin-btn-secondary admin-btn-sm">
                <RefreshCw size={13} className={loadingLogs ? 'spin' : ''} />
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Admin Actor</th>
                  <th>Target Resource</th>
                  <th>Mutation Details</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs && auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                      <div style={{ width: '24px', height: '24px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' }} />
                      Loading audit logs...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      No audit records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {formatDate(log.createdAt)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            background: '#F1F5F9',
                            color: '#0F172A'
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0F172A' }}>
                          {log.actor?.name || 'Admin'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          Role: {log.actor?.role || 'admin'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                          {log.resourceType}: <strong style={{ color: '#0F172A' }}>{log.resourceId}</strong>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            fontSize: '11.5px',
                            color: '#475569',
                            maxWidth: '380px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={JSON.stringify(log.details)}
                        >
                          {JSON.stringify(log.details)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logsPagination.totalPages > 1 && (
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
                Page {logsPagination.page} of {logsPagination.totalPages}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={logsPagination.page <= 1}
                  onClick={() => setLogsPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  disabled={logsPagination.page >= logsPagination.totalPages}
                  onClick={() => setLogsPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
