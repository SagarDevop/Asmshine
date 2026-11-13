import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  History,
  Edit3,
  ExternalLink,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  Save,
  X,
  AlertTriangle,
  RefreshCw,
  Layers,
  Check,
  Calendar
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Link } from 'react-router-dom';

export const AdminPoliciesPage = () => {
  const { admin, isAuthorized } = useAdminAuth();
  const isSuperAdmin = isAuthorized('superadmin');

  // Active top-level tab: 'policies' | 'consents'
  const [activeTab, setActiveTab] = useState('policies');

  // Policy Overview State
  const [overview, setOverview] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Editor Modal State
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [activePolicyType, setActivePolicyType] = useState(null);
  const [editorData, setEditorData] = useState({
    title: '',
    version: '1.1',
    content: '',
    summary: '',
    isExistingDraft: false
  });
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' | 'preview'
  const [savingDraft, setSavingDraft] = useState(false);

  // Publish Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishConsentChecked, setPublishConsentChecked] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Version History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoricalVersion, setSelectedHistoricalVersion] = useState(null);

  // Consent Audit Trail State
  const [consentRecords, setConsentRecords] = useState([]);
  const [loadingConsents, setLoadingConsents] = useState(true);
  const [consentFilterType, setConsentFilterType] = useState('');
  const [consentSearch, setConsentSearch] = useState('');
  const [consentStartDate, setConsentStartDate] = useState('');
  const [consentEndDate, setConsentEndDate] = useState('');
  const [consentPagination, setConsentPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Notification Toast
  const [notice, setNotice] = useState(null);
  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4500);
  };

  // -------------------------------------------------------------
  // Data Fetching: Policies Overview
  // -------------------------------------------------------------
  const fetchOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const res = await adminApi.getPolicyOverview();
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (err) {
      showNotice(err.message || 'Failed to fetch policy publications', 'error');
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // -------------------------------------------------------------
  // Data Fetching: Consent Audit Records
  // -------------------------------------------------------------
  const fetchConsents = useCallback(async (targetPage = consentPagination.page) => {
    try {
      setLoadingConsents(true);
      const params = {
        page: targetPage,
        limit: consentPagination.limit
      };
      if (consentFilterType) params.consentType = consentFilterType;
      if (consentSearch.trim()) params.search = consentSearch.trim();
      if (consentStartDate) params.startDate = consentStartDate;
      if (consentEndDate) params.endDate = consentEndDate;

      const res = await adminApi.getConsentRecords(params);
      if (res.success && res.data) {
        setConsentRecords(res.data);
        setConsentPagination((prev) => ({
          ...prev,
          page: res.pagination?.page || targetPage,
          total: res.pagination?.total || 0,
          totalPages: res.pagination?.totalPages || 1
        }));
      }
    } catch (err) {
      showNotice(err.message || 'Failed to fetch customer consent records', 'error');
    } finally {
      setLoadingConsents(false);
    }
  }, [consentFilterType, consentSearch, consentStartDate, consentEndDate, consentPagination.limit]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab === 'consents') {
      fetchConsents(1);
    }
  }, [activeTab, consentFilterType, fetchConsents]);

  // -------------------------------------------------------------
  // Open Editor Modal for a Policy
  // -------------------------------------------------------------
  const handleOpenEditor = (item) => {
    const baseContent = item.draft
      ? item.draft.content
      : item.currentPublished
      ? item.currentPublished.content
      : '';
    const currentVer = item.currentPublished?.version || '1.0';
    // Suggest next minor version increment if no draft
    const nextVer = item.draft
      ? item.draft.version
      : (parseFloat(currentVer) + 0.1).toFixed(1);

    setActivePolicyType(item.policyType);
    setEditorData({
      title: item.title,
      version: nextVer,
      content: baseContent,
      summary: item.draft?.summary || '',
      isExistingDraft: !!item.draft
    });
    setEditorMode('edit');
    setEditorModalOpen(true);
  };

  // -------------------------------------------------------------
  // Save Policy Draft
  // -------------------------------------------------------------
  const handleSaveDraft = async (e) => {
    if (e) e.preventDefault();
    if (!editorData.version.trim()) {
      showNotice('Version string (e.g. 1.1) is required', 'error');
      return;
    }
    if (!editorData.content.trim()) {
      showNotice('Policy body content cannot be empty', 'error');
      return;
    }

    setSavingDraft(true);
    try {
      let res;
      if (editorData.isExistingDraft) {
        res = await adminApi.updatePolicyDraft(activePolicyType, editorData.version, {
          title: editorData.title,
          content: editorData.content,
          summary: editorData.summary
        });
      } else {
        res = await adminApi.createPolicyDraft(activePolicyType, {
          version: editorData.version,
          title: editorData.title,
          content: editorData.content,
          summary: editorData.summary
        });
      }

      if (res.success) {
        showNotice(`Draft v${editorData.version} saved successfully!`);
        setEditorModalOpen(false);
        fetchOverview();
      } else {
        throw new Error(res.message || 'Failed to save draft');
      }
    } catch (err) {
      showNotice(err.message || 'Failed to save draft', 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  // -------------------------------------------------------------
  // Open Publish Confirmation Modal
  // -------------------------------------------------------------
  const handleOpenPublishModal = () => {
    setPublishConsentChecked(false);
    setPublishModalOpen(true);
  };

  // -------------------------------------------------------------
  // Publish Immutable Policy Version
  // -------------------------------------------------------------
  const handleConfirmPublish = async () => {
    if (!publishConsentChecked) {
      showNotice('You must acknowledge the legal binding confirmation checkbox.', 'error');
      return;
    }

    setPublishing(true);
    try {
      // First save current content as draft if not saved
      await adminApi.updatePolicyDraft(activePolicyType, editorData.version, {
        title: editorData.title,
        content: editorData.content,
        summary: editorData.summary
      }).catch(async () => {
        // If draft didn't exist yet, create it
        return adminApi.createPolicyDraft(activePolicyType, {
          version: editorData.version,
          title: editorData.title,
          content: editorData.content,
          summary: editorData.summary
        });
      });

      // Now publish this version
      const res = await adminApi.publishPolicyVersion(activePolicyType, editorData.version);
      if (res.success) {
        showNotice(`Version v${editorData.version} published successfully! Live immediately.`);
        setPublishModalOpen(false);
        setEditorModalOpen(false);
        fetchOverview();
      } else {
        throw new Error(res.message || 'Failed to publish policy version');
      }
    } catch (err) {
      showNotice(err.message || 'Failed to publish policy version', 'error');
    } finally {
      setPublishing(false);
    }
  };

  // -------------------------------------------------------------
  // View Version History Modal
  // -------------------------------------------------------------
  const handleOpenHistory = async (policyType) => {
    setActivePolicyType(policyType);
    setSelectedHistoricalVersion(null);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await adminApi.getPolicyVersions(policyType);
      if (res.success && res.data) {
        setVersionHistory(res.data);
      }
    } catch (err) {
      showNotice(err.message || 'Failed to load version history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  // -------------------------------------------------------------
  // Export Consent Records as CSV
  // -------------------------------------------------------------
  const handleExportConsentsCsv = () => {
    if (!consentRecords || consentRecords.length === 0) {
      showNotice('No records available to export', 'error');
      return;
    }

    const headers = ['Record ID', 'Consent Type', 'User Email', 'Order ID', 'IP Address', 'User Agent', 'Accepted Policies', 'Timestamp UTC'];
    const rows = consentRecords.map((r) => [
      `"${r._id || ''}"`,
      `"${r.consentType || ''}"`,
      `"${r.userEmail || ''}"`,
      `"${r.orderId || ''}"`,
      `"${r.ipAddress || ''}"`,
      `"${(r.userAgent || '').replace(/"/g, '""')}"`,
      `"${(r.acceptedPolicies || []).map((p) => `${p.policyType}:v${p.version}`).join('; ')}"`,
      `"${r.timestamp || r.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `consent_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('Consent audit records CSV downloaded.');
  };

  // Helpers
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

  const getPublicRouteForType = (type) => {
    if (type === 'terms_and_conditions') return '/terms-and-conditions';
    if (type === 'privacy_policy') return '/privacy-policy';
    if (type === 'refund_policy') return '/refund-policy';
    return '/';
  };

  // Word count & Char count
  const wordCount = editorData.content.trim() ? editorData.content.trim().split(/\s+/).length : 0;
  const charCount = editorData.content.length;

  return (
    <div className="admin-page-content">
      {/* Toast Notice */}
      {notice && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 150,
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

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Legal Policies &amp; Compliance Management</h1>
          <p className="admin-page-subtitle">
            Manage mandatory legal documentation, policy versioning, immutable audit trails, and customer consent records.
          </p>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'policies' ? '2px solid #2563EB' : '2px solid transparent',
            color: activeTab === 'policies' ? '#2563EB' : '#64748B',
            fontWeight: activeTab === 'policies' ? 700 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={16} />
          <span>Policy Documents &amp; Versions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('consents')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'consents' ? '2px solid #2563EB' : '2px solid transparent',
            color: activeTab === 'consents' ? '#2563EB' : '#64748B',
            fontWeight: activeTab === 'consents' ? 700 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldCheck size={16} />
          <span>Customer Consent Audit Trail</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: POLICY DOCUMENTS & VERSIONS */}
      {/* ========================================================= */}
      {activeTab === 'policies' && (
        <div>
          {loadingOverview ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
              <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
              Loading policy publication states...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {overview.map((item) => (
                <div key={item.policyType} className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="admin-card-header" style={{ padding: '18px 20px', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{item.title}</span>
                      </div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                        {item.policyType}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: '#ECFDF5',
                          color: '#047857',
                          border: '1px solid #A7F3D0',
                          display: 'inline-block'
                        }}
                      >
                        v{item.currentPublished?.version || '1.0'} PUBLISHED
                      </span>
                      {item.draft && (
                        <div style={{ marginTop: '4px' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#FEF3C7',
                              color: '#B45309'
                            }}
                          >
                            v{item.draft.version} DRAFT
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} color="#64748B" />
                      <span>
                        Published: <strong>{formatDate(item.currentPublished?.publishedAt)}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} color="#64748B" />
                      <span>
                        Publisher: <strong>{item.currentPublished?.publishedBy?.name || item.currentPublished?.publishedBy?.email || 'ASM Legal Compliance'}</strong>
                      </span>
                    </div>

                    {item.currentPublished?.summary && (
                      <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '11.5px' }}>
                        <span style={{ color: '#64748B', display: 'block', fontWeight: 600, marginBottom: '2px' }}>Changelog:</span>
                        {item.currentPublished.summary}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div
                    style={{
                      padding: '14px 20px',
                      background: '#F8FAFC',
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link
                        to={getPublicRouteForType(item.policyType)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <ExternalLink size={13} />
                        <span>Live Page</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenHistory(item.policyType)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <History size={13} />
                        <span>History</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditor(item)}
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Edit3 size={13} />
                      <span>{item.draft ? 'Resume Draft' : 'New Revision'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CUSTOMER CONSENT AUDIT TRAIL */}
      {/* ========================================================= */}
      {activeTab === 'consents' && (
        <div className="admin-card">
          <div className="admin-card-header" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="admin-card-title">Immutable Customer Consent Log</div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                Server-validated UTC records capturing policy acceptance upon Signup and Checkout.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleExportConsentsCsv}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => fetchConsents(consentPagination.page)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                <RefreshCw size={13} className={loadingConsents ? 'spin' : ''} />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ padding: '14px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 10px', minWidth: '220px', flex: '1 1 200px' }}>
              <Search size={14} color="#94A3B8" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search by customer email..."
                value={consentSearch}
                onChange={(e) => setConsentSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchConsents(1); }}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px' }}
              />
            </div>

            <select
              value={consentFilterType}
              onChange={(e) => setConsentFilterType(e.target.value)}
              className="admin-form-select"
              style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
            >
              <option value="">All Consent Types</option>
              <option value="SIGNUP">SIGNUP</option>
              <option value="CHECKOUT">CHECKOUT</option>
              <option value="POLICY_RECONSENT">POLICY_RECONSENT</option>
            </select>

            <button
              type="button"
              onClick={() => fetchConsents(1)}
              className="admin-btn admin-btn-primary admin-btn-sm"
            >
              Filter
            </button>
          </div>

          {/* Consent Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp (IST)</th>
                  <th>Consent Type</th>
                  <th>Customer Email</th>
                  <th>Accepted Policies</th>
                  <th>Associated Order</th>
                  <th>IP &amp; Device</th>
                </tr>
              </thead>
              <tbody>
                {loadingConsents && consentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                      <div style={{ width: '24px', height: '24px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' }} />
                      Loading consent audit records...
                    </td>
                  </tr>
                ) : consentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      No consent records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  consentRecords.map((record) => (
                    <tr key={record._id}>
                      <td style={{ fontSize: '12px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {formatDate(record.timestamp || record.createdAt)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '11px',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            background: record.consentType === 'SIGNUP' ? '#ECFDF5' : '#EFF6FF',
                            color: record.consentType === 'SIGNUP' ? '#047857' : '#1D4ED8',
                            border: `1px solid ${record.consentType === 'SIGNUP' ? '#A7F3D0' : '#BFDBFE'}`
                          }}
                        >
                          {record.consentType}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                          {record.userEmail || (record.user?.email) || 'Anonymous'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '280px' }}>
                          {(record.acceptedPolicies || []).map((p, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '10.5px',
                                fontFamily: 'monospace',
                                padding: '2px 5px',
                                background: '#F1F5F9',
                                color: '#334155',
                                borderRadius: '3px'
                              }}
                            >
                              {p.policyType === 'terms_and_conditions' ? 'Terms' : p.policyType === 'privacy_policy' ? 'Privacy' : 'Refund'} v{p.version}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {record.orderId ? (
                          <Link
                            to={`/admin/orders`}
                            style={{ fontSize: '12.5px', fontWeight: 600, color: '#2563EB', textDecoration: 'underline' }}
                          >
                            {record.orderId}
                          </Link>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '12px' }}>N/A (Signup)</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          <div>{record.ipAddress || '127.0.0.1'}</div>
                          <div
                            style={{
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '10.5px',
                              color: '#94A3B8'
                            }}
                            title={record.userAgent}
                          >
                            {record.userAgent || 'Web Client'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {consentPagination.totalPages > 1 && (
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
                Page {consentPagination.page} of {consentPagination.totalPages} ({consentPagination.total} total records)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={consentPagination.page <= 1}
                  onClick={() => fetchConsents(consentPagination.page - 1)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  disabled={consentPagination.page >= consentPagination.totalPages}
                  onClick={() => fetchConsents(consentPagination.page + 1)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: POLICY DRAFTING & EDITING */}
      {/* ========================================================= */}
      {editorModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '960px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                  {editorData.title} – Revision Editor
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Drafts are private until published. Published versions become legally immutable.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setEditorMode('edit')}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: '4px',
                      background: editorMode === 'edit' ? '#FFFFFF' : 'transparent',
                      color: editorMode === 'edit' ? '#0F172A' : '#64748B',
                      cursor: 'pointer',
                      boxShadow: editorMode === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Markdown Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: '4px',
                      background: editorMode === 'preview' ? '#FFFFFF' : 'transparent',
                      color: editorMode === 'preview' ? '#0F172A' : '#64748B',
                      cursor: 'pointer',
                      boxShadow: editorMode === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Live Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setEditorModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Version Identifier (Immutable on publish)</label>
                  <input
                    type="text"
                    value={editorData.version}
                    onChange={(e) => setEditorData({ ...editorData, version: e.target.value })}
                    placeholder="e.g. 1.1"
                    className="admin-form-input"
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Changelog Summary (Audited)</label>
                  <input
                    type="text"
                    value={editorData.summary}
                    onChange={(e) => setEditorData({ ...editorData, summary: e.target.value })}
                    placeholder="e.g. Updated Razorpay compliance details and delivery policies"
                    className="admin-form-input"
                  />
                </div>
              </div>

              {editorMode === 'edit' ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="admin-form-label" style={{ margin: 0 }}>
                      Policy Body Content (Markdown Supported)
                    </label>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                      {wordCount} words | {charCount} characters
                    </span>
                  </div>
                  <textarea
                    value={editorData.content}
                    onChange={(e) => setEditorData({ ...editorData, content: e.target.value })}
                    rows={16}
                    className="admin-form-input"
                    style={{
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      resize: 'vertical'
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '24px',
                    background: '#FAFAFA',
                    minHeight: '380px',
                    maxHeight: '450px',
                    overflowY: 'auto',
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: '#1E293B',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#0F172A' }}>{editorData.title}</h2>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Version Preview v{editorData.version}</span>
                  </div>
                  {editorData.content}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <button
                type="button"
                onClick={() => setEditorModalOpen(false)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className="admin-btn admin-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={15} />
                  <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPublishModal}
                  className="admin-btn admin-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={15} />
                  <span>Publish Version...</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PUBLISH CONFIRMATION & IMMUTABILITY DIALOG */}
      {/* ========================================================= */}
      {publishModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div style={{ background: '#FEF3C7', color: '#B45309', padding: '10px', borderRadius: '50%', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                  Publish Policy Version v{editorData.version}?
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                  Publishing makes this version immediately active on the live website and <strong>strictly immutable</strong>.
                  All future signups and customer checkout orders will bind to this exact version.
                </p>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '18px', fontSize: '12.5px', color: '#334155' }}>
              <div><strong>Policy:</strong> {editorData.title}</div>
              <div style={{ marginTop: '4px' }}><strong>Target Version:</strong> v{editorData.version}</div>
              <div style={{ marginTop: '4px' }}><strong>Effective Date:</strong> Immediately upon publication</div>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                marginBottom: '22px',
                fontSize: '12.5px',
                color: '#1E293B',
                lineHeight: '1.5'
              }}
            >
              <input
                type="checkbox"
                checked={publishConsentChecked}
                onChange={(e) => setPublishConsentChecked(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#2563EB', width: '16px', height: '16px' }}
              />
              <span>
                I confirm that this policy revision has been legally reviewed, fulfills payment gateway requirements, and should supersede the currently active published version.
              </span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="admin-btn admin-btn-secondary"
                disabled={publishing}
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={!publishConsentChecked || publishing}
                className="admin-btn admin-btn-primary"
                style={{
                  background: !publishConsentChecked || publishing ? '#94A3B8' : '#059669',
                  borderColor: !publishConsentChecked || publishing ? '#94A3B8' : '#059669'
                }}
              >
                {publishing ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: VERSION HISTORY AUDIT */}
      {/* ========================================================= */}
      {historyModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                  Version Audit History
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Policy: <strong>{activePolicyType}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading versions...</div>
              ) : versionHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No historical versions found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {versionHistory.map((ver) => (
                    <div
                      key={ver._id}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        background: ver.isCurrentPublished ? '#F0FDF4' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '14px', color: '#0F172A' }}>Version {ver.version}</strong>
                          {ver.isCurrentPublished && (
                            <span style={{ fontSize: '10.5px', fontWeight: 700, background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>
                              CURRENT LIVE
                            </span>
                          )}
                          <span style={{ fontSize: '10.5px', background: '#F1F5F9', color: '#64748B', padding: '2px 6px', borderRadius: '4px' }}>
                            {ver.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Published on {formatDate(ver.publishedAt || ver.createdAt)} by {ver.publishedBy?.name || ver.publishedBy?.email || 'Admin'}
                        </div>
                        {ver.summary && (
                          <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                            Summary: {ver.summary}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedHistoricalVersion(ver)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Readonly Historical Version Inspection */}
              {selectedHistoricalVersion && (
                <div style={{ marginTop: '20px', borderTop: '2px dashed #CBD5E1', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>
                      Historical Content: v{selectedHistoricalVersion.version}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setSelectedHistoricalVersion(null)}
                      style={{ fontSize: '12px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Close Preview
                    </button>
                  </div>
                  <div
                    style={{
                      padding: '16px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      color: '#334155'
                    }}
                  >
                    {selectedHistoricalVersion.content}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="admin-btn admin-btn-secondary"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

