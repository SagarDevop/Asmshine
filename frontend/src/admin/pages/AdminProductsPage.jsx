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
  Layers,
  Check
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
  const [variants, setVariants] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [specifications, setSpecifications] = useState([]);

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: '',
        sku: '',
        price: price || '99',
        originalPrice: originalPrice || '135',
        stockQuantity: '20',
        image: image || ''
      }
    ]);
  };

  const handleUpdateVariant = (idx, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleRemoveVariant = (idx) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Highlights Point-by-Point Handlers
  const handleAddHighlight = () => {
    setHighlights((prev) => [...prev, '']);
  };

  const handleUpdateHighlight = (index, value) => {
    setHighlights((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveHighlight = (index) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  // Specifications Key-Value Handlers
  const handleAddSpecification = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleUpdateSpecification = (index, field, value) => {
    setSpecifications((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveSpecification = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

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
    setVariants([]);
    setHighlights([
      '99.9% germ eradication certified laboratory formula',
      'Formulated with organic botanicals and zero toxic fumes',
      'Safe around household pets and crawling toddlers'
    ]);
    setSpecifications([
      { key: 'Form', value: 'Active Liquid Gel' },
      { key: 'Fragrance', value: 'Natural Citrus Pine' },
      { key: 'Shelf Life', value: '24 Months' },
      { key: 'Country of Origin', value: 'India' }
    ]);
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

    if (Array.isArray(p.availableSizes) && p.availableSizes.length > 0) {
      setVariants(
        p.availableSizes.map((v, i) => ({
          size: v.size || '',
          sku: v.sku || (p.sku ? `${p.sku}-${i + 1}` : ''),
          price: String(v.price || ''),
          originalPrice: String(v.originalPrice || ''),
          stockQuantity: String(v.stockQuantity !== undefined ? v.stockQuantity : p.stockQuantity || '0'),
          image: v.image || p.image || ''
        }))
      );
    } else {
      setVariants([]);
    }

    if (Array.isArray(p.highlights) && p.highlights.length > 0) {
      setHighlights([...p.highlights]);
    } else {
      setHighlights([]);
    }

    if (p.specifications && typeof p.specifications === 'object') {
      const specEntries = Object.entries(p.specifications).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setSpecifications(specEntries);
    } else {
      setSpecifications([]);
    }

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
      const cleanStock = parseInt(stockQuantity, 10) || 0;
      const cleanSku = sku.trim();
      const cleanHighlights = highlights.map((h) => h.trim()).filter(Boolean);
      const specsObject = {};
      specifications.forEach((s) => {
        const k = (s.key || '').trim();
        const v = (s.value || '').trim();
        if (k && v) {
          specsObject[k] = v;
        }
      });

      const payload = {
        name: name.trim(),
        sku: cleanSku,
        category: cat.trim(),
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        costPrice: Number(costPrice) || 0,
        stockQuantity: cleanStock,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
        size: size.trim(),
        image: image.trim(),
        description: description.trim(),
        badge: badge.trim(),
        inStock: cleanStock > 0,
        highlights: cleanHighlights,
        specifications: specsObject,
        availableSizes: variants.length > 0 ? variants.map((v, idx) => {
          const vPrice = Number(v.price || price);
          const vMRP = Number(v.originalPrice || originalPrice || vPrice);
          const vStock = parseInt(v.stockQuantity, 10) || 0;
          return {
            size: (v.size || `Size ${idx + 1}`).trim(),
            sku: (v.sku || (cleanSku ? `${cleanSku}-${idx + 1}` : `SKU-${idx + 1}`)).trim(),
            price: vPrice,
            originalPrice: vMRP,
            discount: vMRP > vPrice ? `${Math.round(((vMRP - vPrice) / vMRP) * 100)}% off` : '',
            stockQuantity: vStock,
            inStock: vStock > 0,
            image: (v.image || image).trim()
          };
        }) : []
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
                          <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '3px' }}>
                            {p.availableSizes && p.availableSizes.length > 0 ? (
                              p.availableSizes.map((s, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: (s.stockQuantity <= 0 || s.inStock === false) ? '#FEF2F2' : '#EFF6FF',
                                    color: (s.stockQuantity <= 0 || s.inStock === false) ? '#DC2626' : '#1D4ED8',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    border: `1px solid ${(s.stockQuantity <= 0 || s.inStock === false) ? '#FECACA' : '#BFDBFE'}`
                                  }}
                                >
                                  {s.size}: ₹{s.price} {(s.stockQuantity <= 0 || s.inStock === false) ? '(Out of Stock)' : `(${s.stockQuantity || 0} left)`}
                                </span>
                              ))
                            ) : (
                              <span style={{ background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                Single Product {p.size ? `• ${p.size}` : ''}
                              </span>
                            )}
                          </div>
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
                        <span
                          className={`admin-status-badge ${(p.stockQuantity || 0) <= 0 || p.inStock === false ? 'OUT_OF_STOCK' : (p.stockQuantity || 0) <= (p.lowStockThreshold || 5) ? 'LOW_STOCK' : 'IN_STOCK'}`}
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                        >
                          {(p.stockQuantity || 0) <= 0 || p.inStock === false ? 'OUT OF STOCK' : `${p.stockQuantity} in stock`}
                        </span>
                        <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '3px' }}>
                          Alert Threshold: {p.lowStockThreshold || 5}
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

                {/* Pack Sizes & Variant Inventory Section */}
                <div className="admin-variants-box">
                  <div className="admin-variant-header">
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A' }}>
                        Pack Sizes & Variants Inventory ({variants.length})
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Each variant has its own pack size, SKU, selling price, separate stock quantity, and unique variant image.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      <Plus size={13} /> Add Variant
                    </button>
                  </div>

                  {variants.length === 0 ? (
                    <div style={{ padding: '16px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '8px', textAlign: 'center', margin: '6px 0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                        Single Unique Product (No Variants)
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '10px' }}>
                        This product is sold as a standalone item using the main price, MRP, image, and stock above. Click below if you want to add size/pack variants in the future.
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                      >
                        <Plus size={13} /> Add Variant
                      </button>
                    </div>
                  ) : (
                    variants.map((v, idx) => {
                      const isOut = v.stockQuantity === 0 || v.stockQuantity === '0';
                      return (
                        <div key={idx} className="admin-variant-row">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563EB' }}>
                                Variant #{idx + 1}
                              </span>
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: isOut ? '#FEF2F2' : '#ECFDF5',
                                  color: isOut ? '#DC2626' : '#059669',
                                  border: `1px solid ${isOut ? '#FECACA' : '#A7F3D0'}`
                                }}
                              >
                                {isOut ? 'OUT OF STOCK' : `IN STOCK (${v.stockQuantity || 0} units)`}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(idx)}
                              style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '2px' }}
                              title="Remove Variant"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="admin-variant-grid">
                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-form-label" style={{ fontSize: '11px' }}>Pack Size / Volume *</label>
                              <input
                                type="text"
                                placeholder="e.g. 500 ml Bottle, 1 Liter Pack"
                                value={v.size}
                                onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '36px', fontSize: '12.5px' }}
                                required
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-form-label" style={{ fontSize: '11px' }}>Variant SKU</label>
                              <input
                                type="text"
                                placeholder="e.g. ASM-500"
                                value={v.sku}
                                onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '36px', fontSize: '12.5px' }}
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-form-label" style={{ fontSize: '11px' }}>Price (₹) *</label>
                              <input
                                type="number"
                                placeholder="189"
                                value={v.price}
                                onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '36px', fontSize: '12.5px' }}
                                min="0"
                                required
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-form-label" style={{ fontSize: '11px' }}>Stock Qty *</label>
                              <input
                                type="number"
                                placeholder="20"
                                value={v.stockQuantity}
                                onChange={(e) => handleUpdateVariant(idx, 'stockQuantity', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '36px', fontSize: '12.5px' }}
                                min="0"
                                required
                              />
                            </div>
                          </div>

                          {/* Separate Variant Image with Preview Thumbnail */}
                          <div className="admin-variant-image-row">
                            <img
                              src={v.image || '/favicon.svg'}
                              alt="Variant Preview"
                              className="admin-variant-preview-thumb"
                              onError={(e) => { e.target.src = '/favicon.svg'; }}
                            />
                            <div style={{ flex: 1 }}>
                              <label className="admin-form-label" style={{ fontSize: '11px' }}>
                                Separate Variant Image URL (Displayed when customer selects this size)
                              </label>
                              <input
                                type="text"
                                placeholder="https://... or /images/products/..."
                                value={v.image}
                                onChange={(e) => handleUpdateVariant(idx, 'image', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '36px', fontSize: '12px' }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
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

                {/* 1. Product Highlights Point-by-Point Section */}
                <div className="admin-meta-box">
                  <div className="admin-meta-header">
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A' }}>
                        Product Highlights ({highlights.length} Points)
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Key feature bullet points shown with stylish checkmarks on the product page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      <Plus size={13} /> Add Point
                    </button>
                  </div>

                  {highlights.length === 0 ? (
                    <div style={{ padding: '12px', background: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        No highlights added yet. Click "+ Add Point" above to add feature bullet points.
                      </div>
                    </div>
                  ) : (
                    highlights.map((hl, idx) => (
                      <div key={idx} className="admin-highlight-row">
                        <Check size={16} className="admin-highlight-check" />
                        <input
                          type="text"
                          className="admin-form-input"
                          style={{ height: '36px', fontSize: '12.5px', flex: 1 }}
                          placeholder={`Highlight point #${idx + 1} (e.g. 99.9% germ eradication certified formula)`}
                          value={hl}
                          onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                          title="Remove Point"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* 2. Product Specifications (Technical Key-Value Table) */}
                <div className="admin-meta-box">
                  <div className="admin-meta-header">
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A' }}>
                        Product Specifications ({specifications.length} Attributes)
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Two-column technical specification table (Attribute & Value) shown below highlights.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecification}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      <Plus size={13} /> Add Attribute
                    </button>
                  </div>

                  {specifications.length === 0 ? (
                    <div style={{ padding: '12px', background: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        No specifications added yet. Click "+ Add Attribute" above to add technical specs table rows.
                      </div>
                    </div>
                  ) : (
                    specifications.map((spec, idx) => (
                      <div key={idx} className="admin-spec-row">
                        <input
                          type="text"
                          className="admin-form-input"
                          style={{ height: '36px', fontSize: '12.5px' }}
                          placeholder="Attribute (e.g. Form, Fragrance)"
                          value={spec.key}
                          onChange={(e) => handleUpdateSpecification(idx, 'key', e.target.value)}
                        />
                        <input
                          type="text"
                          className="admin-form-input"
                          style={{ height: '36px', fontSize: '12.5px' }}
                          placeholder="Detail / Value (e.g. Thick Foaming Action Gel)"
                          value={spec.value}
                          onChange={(e) => handleUpdateSpecification(idx, 'value', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(idx)}
                          style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                          title="Remove Attribute"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
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
