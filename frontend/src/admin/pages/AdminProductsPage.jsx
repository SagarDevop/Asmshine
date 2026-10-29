import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
  Layers
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [cat, setCat] = useState('everyday_essentials');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [costPrice, setCostPrice] = useState('0');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [size, setSize] = useState('500ml');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({
        page,
        limit: pagination.limit,
        search,
        category,
        stock: stockFilter,
        status: statusFilter
      });
      if (res.success) {
        setProducts(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to load products.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [category, stockFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setCat('everyday_essentials');
    setPrice('');
    setOriginalPrice('');
    setCostPrice('0');
    setStockQuantity('20');
    setLowStockThreshold('5');
    setSize('500ml');
    setImage('/images/products/all_shine_dishwash_gel_500ml.png');
    setDescription('');
    setBadge('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name || '');
    setSku(p.sku || '');
    setCat(p.category || 'everyday_essentials');
    setPrice(String(p.price || ''));
    setOriginalPrice(String(p.originalPrice || ''));
    setCostPrice(String(p.costPrice || '0'));
    setStockQuantity(String(p.stockQuantity || '0'));
    setLowStockThreshold(String(p.lowStockThreshold || '5'));
    setSize(p.size || '500ml');
    setImage(p.image || '');
    setDescription(p.description || '');
    setBadge(p.badge || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !cat.trim() || !price) {
      setFormError('Please fill in product name, category, and selling price.');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        category: cat.trim(),
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        costPrice: Number(costPrice) || 0,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
        size: size.trim(),
        image: image.trim(),
        description: description.trim(),
        badge: badge.trim()
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
        setNotification({ type: 'success', message: `Product '${payload.name}' updated successfully.` });
      } else {
        await adminApi.createProduct(payload);
        setNotification({ type: 'success', message: `Product '${payload.name}' created successfully.` });
      }

      setModalOpen(false);
      fetchProducts(pagination.page);
    } catch (err) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (p) => {
    try {
      const res = await adminApi.toggleProductStatus(p.id);
      setNotification({ type: 'success', message: res.message });
      fetchProducts(pagination.page);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Status update failed.' });
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete or archive product '${p.name}'?`)) {
      return;
    }

    try {
      const res = await adminApi.deleteProduct(p.id);
      setNotification({ type: 'success', message: res.message });
      fetchProducts(pagination.page);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Delete operation failed.' });
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-heading">
        <div>
          <h1 className="admin-page-title">Product Catalogue Management</h1>
          <p className="admin-page-desc">Create, edit, price, and manage stock visibility across the storefront.</p>
        </div>

        <button onClick={openCreateModal} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
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

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '12px', color: '#94A3B8' }}><Search size={15} /></span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by name, SKU, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select className="admin-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="everyday_essentials">Everyday Essentials</option>
              <option value="dishwash_solutions">Dishwash Solutions</option>
              <option value="laundry_fabrics">Laundry &amp; Fabrics</option>
              <option value="bathroom_surfaces">Bathroom &amp; Surfaces</option>
              <option value="floor_care">Floor Care</option>
              <option value="glass_care">Glass Care</option>
            </select>

            <select className="admin-select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt; 5)</option>
              <option value="low_stock">Low Stock (≤ 5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button onClick={() => fetchProducts(1)} className="admin-btn admin-btn-secondary" title="Refresh product list">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price / MRP</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    Loading product catalogue...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={p.image}
                          alt=""
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                          onError={(e) => { e.target.src = '/favicon.svg'; }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{p.size || '500ml'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '11.5px', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>
                        {p.sku || `SKU-${p.id.toUpperCase()}`}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                        {(p.category || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>₹{p.price}</div>
                      {p.originalPrice > p.price && (
                        <div style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                          ₹{p.originalPrice}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>
                        <span style={{
                          fontWeight: 800,
                          color: (p.stockQuantity || 0) <= 0 ? '#DC2626' : (p.stockQuantity || 0) <= (p.lowStockThreshold || 5) ? '#D97706' : '#059669'
                        }}>
                          {p.stockQuantity || 0} units
                        </span>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                          Threshold: {p.lowStockThreshold || 5}
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: p.status === 'active' ? '#059669' : '#DC2626'
                        }}
                        title="Click to toggle status"
                      >
                        {p.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        <span style={{ textTransform: 'capitalize' }}>{p.status || 'active'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Edit product"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="admin-btn admin-btn-sm"
                          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
                          title="Delete or archive product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="admin-pagination">
          <div>Showing {products.length} of {pagination.total} products</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => fetchProducts(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 600 }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchProducts(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                {formError && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '16px' }}>
                    {formError}
                  </div>
                )}

                <div className="admin-form-group">
                  <label className="admin-form-label">Product Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Pure Shine Dishwash Gel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">SKU (Unique Stock Keeping Unit)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. SKU-DISHWASH-500ML"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Category *</label>
                    <select
                      className="admin-select"
                      style={{ width: '100%', height: '42px' }}
                      value={cat}
                      onChange={(e) => setCat(e.target.value)}
                      required
                    >
                      <option value="everyday_essentials">Everyday Essentials</option>
                      <option value="dishwash_solutions">Dishwash Solutions</option>
                      <option value="laundry_fabrics">Laundry &amp; Fabrics</option>
                      <option value="bathroom_surfaces">Bathroom &amp; Surfaces</option>
                      <option value="floor_care">Floor Care</option>
                      <option value="glass_care">Glass Care</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      placeholder="199"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">MRP (₹) *</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      placeholder="249"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      min="0"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Cost Price (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      placeholder="110"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      placeholder="20"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      min="0"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Low-Stock Alert Level</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      placeholder="5"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      min="0"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Volume / Pack Size</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="500ml"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Primary Image URL / Path</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="/images/products/all_shine_dishwash_gel_500ml.png"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    className="admin-form-textarea"
                    placeholder="Authentic formulation specifications, usage instructions, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Promotional Badge</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. BEST SELLER, TRENDING, 20% OFF"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
