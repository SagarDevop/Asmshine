import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  X
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const AdminInventoryPage = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movements'
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('RESTOCK'); // 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE' | 'LOSS'
  const [mode, setMode] = useState('delta'); // 'delta' | 'exact'
  const [changeQty, setChangeQty] = useState('');
  const [exactQty, setExactQty] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getInventory({ search, filter });
      if (res.success) {
        setInventory(res.data);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to load inventory.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMovements({ limit: 50 });
      if (res.success) {
        setMovements(res.data);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to load stock movements.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchInventory();
    } else {
      fetchMovements();
    }
  }, [activeTab, filter]);

  const openAdjustModal = (item) => {
    setSelectedProduct(item);
    setAdjustType('RESTOCK');
    setMode('delta');
    setChangeQty('');
    setExactQty(String(item.onHand || 0));
    setReason('');
    setModalError('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!reason.trim()) {
      setModalError('A mandatory reason is required to adjust inventory.');
      return;
    }

    let payload = {
      productId: selectedProduct.id,
      type: adjustType,
      reason: reason.trim()
    };

    if (mode === 'exact') {
      const val = parseInt(exactQty, 10);
      if (isNaN(val) || val < 0) {
        setModalError('Please enter a valid non-negative stock quantity.');
        return;
      }
      payload.newQuantity = val;
    } else {
      const val = parseInt(changeQty, 10);
      if (isNaN(val) || val === 0) {
        setModalError('Please enter a non-zero adjustment quantity.');
        return;
      }
      payload.changeQuantity = adjustType === 'DAMAGE' || adjustType === 'LOSS' ? -Math.abs(val) : val;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.adjustStock(payload);
      setNotification({ type: 'success', message: res.message });
      setAdjustModalOpen(false);
      fetchInventory();
    } catch (err) {
      setModalError(err.message || 'Inventory adjustment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-heading">
        <div>
          <h1 className="admin-page-title">Inventory &amp; Stock Management</h1>
          <p className="admin-page-desc">Automatic deductions, concurrency protection, low-stock alerts, and audit trail.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('stock')}
            className={`admin-btn ${activeTab === 'stock' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          >
            <Layers size={15} />
            <span>Stock Levels</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`admin-btn ${activeTab === 'movements' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          >
            <History size={15} />
            <span>Movement Audit Log</span>
          </button>
        </div>
      </div>

      {notification.message && (
        <div style={{
          backgroundColor: notification.type === 'error' ? '#FEF2F2' : '#ECFDF5',
          border: `1px solid ${notification.type === 'error' ? '#FECACA' : '#A7F3D0'}`,
          color: notification.type === 'error' ? '#991B1B' : '#065F46',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ type: '', message: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* TAB 1: STOCK LEVELS */}
      {activeTab === 'stock' && (
        <div className="admin-card">
          <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <form onSubmit={(e) => { e.preventDefault(); fetchInventory(); }} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: '#94A3B8' }}><Search size={15} /></span>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search SKU, product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <div style={{ display: 'flex', gap: '10px' }}>
              <select className="admin-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">All Inventory Statuses</option>
                <option value="in">In Stock (Healthy)</option>
                <option value="low">Low Stock Alerts (≤ Threshold)</option>
                <option value="out">Out of Stock (0 units)</option>
              </select>

              <button onClick={fetchInventory} className="admin-btn admin-btn-secondary" title="Refresh inventory">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product &amp; SKU</th>
                  <th>Category</th>
                  <th>On-Hand</th>
                  <th>Reserved</th>
                  <th>Available to Sell</th>
                  <th>Threshold</th>
                  <th>Stock Health</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                      Checking real-time stock levels...
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                      No inventory records found.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={item.image}
                            alt=""
                            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                            onError={(e) => { e.target.src = '/favicon.svg'; }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
                            <code style={{ fontSize: '11px', color: '#64748B' }}>{item.sku}</code>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                          {(item.category || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{item.onHand}</td>
                      <td style={{ color: '#64748B' }}>{item.reserved}</td>
                      <td>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '14px',
                          color: item.available <= 0 ? '#DC2626' : item.available <= item.threshold ? '#D97706' : '#059669'
                        }}>
                          {item.available} units
                        </span>
                      </td>
                      <td style={{ color: '#64748B' }}>{item.threshold}</td>
                      <td>
                        <span className={`admin-status-badge ${item.stockStatus}`}>
                          {item.stockStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => openAdjustModal(item)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          <span>Adjust Stock</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOG MOVEMENTS */}
      {activeTab === 'movements' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Immutable Stock Movement Audit Trail</h2>
            <button onClick={fetchMovements} className="admin-btn admin-btn-secondary admin-btn-sm">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Movements</span>
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Previous</th>
                  <th>Change</th>
                  <th>New Stock</th>
                  <th>Mandatory Reason / Reference</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                      Retrieving audit log...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m._id}>
                      <td style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.productName}</td>
                      <td><code>{m.sku || 'N/A'}</code></td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor:
                            m.type === 'SALE' ? '#EFF6FF' :
                            m.type === 'RESTOCK' ? '#ECFDF5' :
                            m.type === 'CANCELLATION' ? '#FAF5FF' :
                            m.type === 'DAMAGE' || m.type === 'LOSS' ? '#FEF2F2' : '#F1F5F9',
                          color:
                            m.type === 'SALE' ? '#1D4ED8' :
                            m.type === 'RESTOCK' ? '#047857' :
                            m.type === 'CANCELLATION' ? '#7E22CE' :
                            m.type === 'DAMAGE' || m.type === 'LOSS' ? '#B91C1C' : '#334155'
                        }}>
                          {m.type}
                        </span>
                      </td>
                      <td>{m.previousQuantity}</td>
                      <td style={{
                        fontWeight: 800,
                        color: m.changeQuantity > 0 ? '#059669' : '#DC2626'
                      }}>
                        {m.changeQuantity > 0 ? `+${m.changeQuantity}` : m.changeQuantity}
                      </td>
                      <td style={{ fontWeight: 700 }}>{m.newQuantity}</td>
                      <td style={{ fontSize: '12.5px', maxWidth: '240px' }}>
                        {m.reason}
                        {m.referenceOrder && (
                          <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>
                            Ref: {m.referenceOrder}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748B' }}>{m.performedByName || 'System'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {adjustModalOpen && selectedProduct && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Adjust Inventory: {selectedProduct.name}</h2>
              <button
                onClick={() => setAdjustModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit}>
              <div className="admin-modal-body">
                {modalError && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '16px' }}>
                    {modalError}
                  </div>
                )}

                <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Current On-Hand:</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{selectedProduct.onHand} units</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>SKU Code:</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>{selectedProduct.sku}</div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Adjustment Type *</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%', height: '42px' }}
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                  >
                    <option value="RESTOCK">Restock (Received Shipment)</option>
                    <option value="ADJUSTMENT">General Adjustment (Count Correction)</option>
                    <option value="DAMAGE">Damaged / Expired Inventory (-)</option>
                    <option value="LOSS">Lost in Transit / Warehouse (-)</option>
                    <option value="RETURN">Customer Return Restock (+)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Adjustment Mode</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="adjustMode"
                        checked={mode === 'delta'}
                        onChange={() => setMode('delta')}
                      />
                      <span>Add / Remove Units (+ / -)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="adjustMode"
                        checked={mode === 'exact'}
                        onChange={() => setMode('exact')}
                      />
                      <span>Set Exact New Total</span>
                    </label>
                  </div>
                </div>

                {mode === 'delta' ? (
                  <div className="admin-form-group">
                    <label className="admin-form-label">Quantity to Add/Deduct *</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      placeholder="e.g. 50 (or -5 for deduction)"
                      value={changeQty}
                      onChange={(e) => setChangeQty(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="admin-form-group">
                    <label className="admin-form-label">Exact Final Stock Quantity *</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      placeholder="e.g. 100"
                      value={exactQty}
                      onChange={(e) => setExactQty(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                )}

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Mandatory Reason (Audited) *
                  </label>
                  <textarea
                    className="admin-form-textarea"
                    placeholder="e.g. Supplier PO-8891 received 50 units at Delhi depot"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Every inventory modification is logged with your authenticated administrator identity.
                  </span>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Applying Adjustment...' : 'Commit Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
