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
  Check,
  Upload,
  Image as ImageIcon
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
  const [discountPercent, setDiscountPercent] = useState('10');
  const [costPrice, setCostPrice] = useState('0');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [size, setSize] = useState('500ml');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [isFestiveDeal, setIsFestiveDeal] = useState(false);
  const [festiveBadge, setFestiveBadge] = useState('');
  const [variants, setVariants] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Image Uploading & Drag/Drop States
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [variantUploadingIdx, setVariantUploadingIdx] = useState(null);
  const [dragOverMain, setDragOverMain] = useState(false);

  const handleFileUpload = (file, onUploaded) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        const res = await adminApi.uploadProductImage(base64, 'asm-shine/products');
        if (res.success && res.data?.url) {
          onUploaded(res.data.url);
        } else {
          throw new Error(res.message || 'Cloudinary upload failed.');
        }
      } catch (err) {
        setFormError(err.message || 'Image upload to Cloudinary failed.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMainImageDrop = async (e) => {
    e.preventDefault();
    setDragOverMain(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setMainImageUploading(true);
      setFormError('');
      try {
        handleFileUpload(file, (url) => {
          setImage(url);
          setMainImageUploading(false);
        });
      } catch {
        setMainImageUploading(false);
      }
    }
  };

  const handleMainImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageUploading(true);
      setFormError('');
      try {
        handleFileUpload(file, (url) => {
          setImage(url);
          setMainImageUploading(false);
        });
      } catch {
        setMainImageUploading(false);
      }
    }
  };

  const handleVariantImageSelect = (idx, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVariantUploadingIdx(idx);
      setFormError('');
      try {
        handleFileUpload(file, (url) => {
          handleUpdateVariant(idx, 'image', url);
          setVariantUploadingIdx(null);
        });
      } catch {
        setVariantUploadingIdx(null);
      }
    }
  };

  const handleVariantImageDrop = (idx, e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setVariantUploadingIdx(idx);
      setFormError('');
      try {
        handleFileUpload(file, (url) => {
          handleUpdateVariant(idx, 'image', url);
          setVariantUploadingIdx(null);
        });
      } catch {
        setVariantUploadingIdx(null);
      }
    }
  };

  // Synchronized Pricing Handlers for Main Product
  const handleMrpChange = (val) => {
    setOriginalPrice(val);
    const mrp = Number(val);
    const disc = Number(discountPercent || 0);
    if (mrp > 0 && disc >= 0) {
      setPrice(String(Math.round(mrp * (1 - disc / 100))));
    } else if (mrp > 0 && price) {
      const p = Number(price);
      if (mrp > p) {
        setDiscountPercent(String(Math.round(((mrp - p) / mrp) * 100)));
      }
    }
  };

  const handleDiscountChange = (val) => {
    setDiscountPercent(val);
    const disc = Number(val);
    const mrp = Number(originalPrice || 0);
    if (mrp > 0) {
      setPrice(String(Math.max(0, Math.round(mrp * (1 - disc / 100)))));
    }
  };

  const handlePriceChange = (val) => {
    setPrice(val);
    const p = Number(val);
    const mrp = Number(originalPrice || 0);
    if (mrp > 0 && mrp > p) {
      setDiscountPercent(String(Math.round(((mrp - p) / mrp) * 100)));
    } else if (mrp > 0 && mrp <= p) {
      setDiscountPercent('0');
    }
  };

  // Synchronized Variant Handlers
  const handleAddVariant = (presetSize = '') => {
    const defaultMrp = originalPrice ? String(originalPrice) : '299';
    const defaultDisc = discountPercent ? String(discountPercent) : '10';
    const mrpNum = Number(defaultMrp);
    const discNum = Number(defaultDisc);
    const calcPrice = discNum > 0 ? String(Math.round(mrpNum * (1 - discNum / 100))) : defaultMrp;

    const nextIdx = variants.length + 1;
    const cleanSize = typeof presetSize === 'string' && presetSize ? presetSize : '';
    const autoSku = cleanSize
      ? `${sku || 'SKU'}-${cleanSize.toUpperCase().replace(/\s+/g, '')}`
      : (sku ? `${sku}-${nextIdx}` : `SKU-V${nextIdx}`);

    setVariants((prev) => [
      ...prev,
      {
        size: cleanSize,
        sku: autoSku,
        originalPrice: defaultMrp,
        discountPercent: defaultDisc,
        price: calcPrice,
        stockQuantity: stockQuantity || '20',
        image: image || ''
      }
    ]);
  };

  const handleUpdateVariant = (idx, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      const target = { ...copy[idx], [field]: value };

      if (field === 'originalPrice') {
        const mrp = Number(value);
        const disc = Number(target.discountPercent || 0);
        if (mrp > 0 && disc >= 0) {
          target.price = String(Math.round(mrp * (1 - disc / 100)));
        } else if (mrp > 0 && target.price) {
          const p = Number(target.price);
          target.discountPercent = mrp > p ? String(Math.round(((mrp - p) / mrp) * 100)) : '0';
        }
      } else if (field === 'discountPercent') {
        const disc = Number(value);
        const mrp = Number(target.originalPrice || 0);
        if (mrp > 0) {
          target.price = String(Math.max(0, Math.round(mrp * (1 - disc / 100))));
        }
      } else if (field === 'price') {
        const p = Number(value);
        const mrp = Number(target.originalPrice || 0);
        if (mrp > 0 && mrp > p) {
          target.discountPercent = String(Math.round(((mrp - p) / mrp) * 100));
        } else if (mrp > 0 && mrp <= p) {
          target.discountPercent = '0';
        }
      }

      copy[idx] = target;
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
    setOriginalPrice('400');
    setDiscountPercent('10');
    setPrice('360');
    setCostPrice('180');
    setStockQuantity('20');
    setLowStockThreshold('5');
    setSize('500ml');
    setImage('/images/products/all_shine_dishwash_gel_500ml.png');
    setDescription('');
    setBadge('BEST SELLER');
    setIsFestiveDeal(false);
    setFestiveBadge('');
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
    setShowAdvanced(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name || '');
    setSku(p.sku || '');
    setCat(p.category || 'everyday_essentials');

    const pPrice = Number(p.price || 0);
    const pMrp = Number(p.originalPrice || pPrice || 0);
    const pDisc = p.discountPercent !== undefined && p.discountPercent !== null
      ? p.discountPercent
      : (pMrp > pPrice && pMrp > 0 ? Math.round(((pMrp - pPrice) / pMrp) * 100) : 0);

    setPrice(String(pPrice || ''));
    setOriginalPrice(String(pMrp || ''));
    setDiscountPercent(String(pDisc || '0'));
    setCostPrice(String(p.costPrice || '0'));
    setStockQuantity(String(p.stockQuantity || '0'));
    setLowStockThreshold(String(p.lowStockThreshold || '5'));
    setSize(p.size || '500ml');
    setImage(p.image || '');
    setDescription(p.description || '');
    setBadge(p.badge || '');
    setIsFestiveDeal(Boolean(p.isFestiveDeal));
    setFestiveBadge(p.festiveBadge || '');

    if (Array.isArray(p.availableSizes) && p.availableSizes.length > 0) {
      setVariants(
        p.availableSizes.map((v, i) => {
          const vPrice = Number(v.price || 0);
          const vMrp = Number(v.originalPrice || vPrice || 0);
          const vDisc = vMrp > vPrice && vMrp > 0
            ? Math.round(((vMrp - vPrice) / vMrp) * 100)
            : (v.discount ? parseInt(v.discount, 10) || 0 : 0);
          return {
            size: v.size || '',
            sku: v.sku || (p.sku ? `${p.sku}-${i + 1}` : ''),
            originalPrice: String(vMrp || ''),
            discountPercent: String(vDisc || '0'),
            price: String(vPrice || ''),
            stockQuantity: String(v.stockQuantity !== undefined ? v.stockQuantity : p.stockQuantity || '0'),
            image: v.image || p.image || ''
          };
        })
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

    setShowAdvanced(false);
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
        discountPercent: Number(discountPercent) || (Number(originalPrice) > Number(price) ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100) : 0),
        costPrice: Number(costPrice) || 0,
        stockQuantity: cleanStock,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
        size: size.trim(),
        image: image.trim(),
        description: description.trim(),
        badge: badge.trim(),
        isFestiveDeal: Boolean(isFestiveDeal),
        festiveBadge: festiveBadge.trim(),
        inStock: cleanStock > 0,
        highlights: cleanHighlights,
        specifications: specsObject,
        availableSizes: variants.length > 0 ? variants.map((v, idx) => {
          const vMRP = Number(v.originalPrice || v.price || price);
          const vPrice = Number(v.price || (v.originalPrice ? Math.round(vMRP * (1 - (Number(v.discountPercent) || 0) / 100)) : price));
          const vStock = parseInt(v.stockQuantity, 10) || 0;
          const vDiscPercent = vMRP > vPrice ? Math.round(((vMRP - vPrice) / vMRP) * 100) : (Number(v.discountPercent) || 0);
          return {
            size: (v.size || `Size ${idx + 1}`).trim(),
            sku: (v.sku || (cleanSku ? `${cleanSku}-${idx + 1}` : `SKU-${idx + 1}`)).trim(),
            price: vPrice,
            originalPrice: vMRP,
            discount: vDiscPercent > 0 ? `${vDiscPercent}% off` : '',
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

      // Broadcast instant cross-tab sync to all storefronts
      try {
        const bc = new BroadcastChannel('asm_admin_sync');
        bc.postMessage({ type: 'PRODUCTS_UPDATED' });
        bc.close();
      } catch {}

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
      try {
        const bc = new BroadcastChannel('asm_admin_sync');
        bc.postMessage({ type: 'PRODUCTS_UPDATED' });
        bc.close();
      } catch {}
      fetchProducts(pagination.page);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Status update failed.' });
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to permanently delete product '${p.name}' from the store? It will be removed from all customer categories, banners and deals immediately.`)) {
      return;
    }

    try {
      const res = await adminApi.deleteProduct(p.id);
      setNotification({ type: 'success', message: res.message });
      try {
        const bc = new BroadcastChannel('asm_admin_sync');
        bc.postMessage({ type: 'PRODUCTS_UPDATED' });
        bc.close();
      } catch {}
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
                          <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{p.name}</span>
                            {p.isFestiveDeal && (
                              <span style={{
                                background: '#FEF3C7',
                                color: '#92400E',
                                fontSize: '9.5px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid #FCD34D'
                              }}>
                                🪔 DIWALI BANNER
                              </span>
                            )}
                          </div>
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
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>₹{p.price}</div>
                      {p.originalPrice > p.price && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{p.originalPrice}
                          </span>
                          {(p.discountPercent > 0 || Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) > 0) && (
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '1px 5px', borderRadius: '3px' }}>
                              {p.discountPercent || Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                            </span>
                          )}
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

                {/* 2. Smart Pricing & Flipkart Discount Calculator */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏷️ Smart Pricing &amp; Flipkart Discount Calculator</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      Auto-computes selling price &amp; customer discount
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr', gap: '12px' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-form-label" style={{ fontWeight: 700 }}>
                        MRP (Original ₹) *
                      </label>
                      <input
                        type="number"
                        className="admin-form-input"
                        placeholder="e.g. 400"
                        value={originalPrice}
                        onChange={(e) => handleMrpChange(e.target.value)}
                        min="0"
                        required
                      />
                      <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                        Cut price: ~~₹{originalPrice || 0}~~
                      </span>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-form-label" style={{ fontWeight: 700 }}>
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        className="admin-form-input"
                        placeholder="e.g. 10"
                        value={discountPercent}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                        min="0"
                        max="100"
                      />
                      <span style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                        e.g. 5%, 10% OFF
                      </span>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-form-label" style={{ fontWeight: 800, color: '#0F172A' }}>
                        Final Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        className="admin-form-input"
                        style={{ fontWeight: 800, borderColor: '#10B981', background: '#F0FDF4' }}
                        placeholder="e.g. 360"
                        value={price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        min="0"
                        required
                      />
                      <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                        Amount customer pays
                      </span>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-form-label">Cost Price (₹)</label>
                      <input
                        type="number"
                        className="admin-form-input"
                        placeholder="110"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        min="0"
                      />
                      <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                        Internal cost
                      </span>
                    </div>
                  </div>

                  {/* Flipkart Live Preview Banner */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#15803D',
                        background: '#DCFCE7',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.03em'
                      }}>
                        FLIPKART-STYLE LIVE PREVIEW
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                        ₹{price || 0}
                      </span>
                      {Number(originalPrice) > Number(price) && (
                        <span style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'line-through' }}>
                          ₹{originalPrice}
                        </span>
                      )}
                      {Number(discountPercent) > 0 && (
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A' }}>
                          {discountPercent}% off
                        </span>
                      )}
                    </div>
                    {Number(originalPrice) > Number(price) ? (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                        🎉 Customer saves ₹{Number(originalPrice) - Number(price)} ({discountPercent}% OFF)!
                      </span>
                    ) : (
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        Sold at full MRP (No discount)
                      </span>
                    )}
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
                    <label className="admin-form-label">Volume / Base Pack Size</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="500ml"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                  </div>
                </div>

                {/* Primary Image Upload & Gallery Drag-Drop Zone */}
                <div className="admin-form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="admin-form-label" style={{ fontWeight: 700, margin: 0 }}>
                      Primary Product Image *
                    </label>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      Drag &amp; drop from computer or pick from gallery (Cloudinary Upload)
                    </span>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOverMain(true); }}
                    onDragLeave={() => setDragOverMain(false)}
                    onDrop={handleMainImageDrop}
                    style={{
                      border: `2px dashed ${dragOverMain ? '#2563EB' : image ? '#10B981' : '#CBD5E1'}`,
                      borderRadius: '10px',
                      background: dragOverMain ? '#EFF6FF' : '#F8FAFC',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onClick={() => document.getElementById('main-product-file-input')?.click()}
                  >
                    <input
                      id="main-product-file-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleMainImageSelect}
                    />

                    {/* Image Preview Box */}
                    <div style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {mainImageUploading ? (
                        <RefreshCw size={24} className="animate-spin" color="#2563EB" />
                      ) : image ? (
                        <img
                          src={image}
                          alt="Main Product"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.target.src = '/favicon.svg'; }}
                        />
                      ) : (
                        <ImageIcon size={30} color="#94A3B8" />
                      )}
                    </div>

                    {/* Upload Text & Actions */}
                    <div style={{ flex: 1 }}>
                      {mainImageUploading ? (
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <RefreshCw size={14} className="animate-spin" />
                            Uploading directly to Cloudinary...
                          </div>
                          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                            Optimizing image format and generating high-speed CDN URL...
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Upload size={15} color="#2563EB" />
                            <span>Drag &amp; Drop Image from PC, or <span style={{ color: '#2563EB', textDecoration: 'underline' }}>Browse Local Files / Gallery</span></span>
                          </div>
                          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                            Supports PNG, JPG, WEBP • Automatically stored in Cloudinary
                          </p>
                          {image && (
                            <div style={{ marginTop: '5px', fontSize: '11px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={12} />
                              <span>Image Connected ({image.startsWith('http') ? 'Cloudinary CDN' : 'Local File'})</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual URL input fallback */}
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap' }}>Or Image Path / URL:</span>
                    <input
                      type="text"
                      className="admin-form-input"
                      style={{ height: '32px', fontSize: '12px', flex: 1 }}
                      placeholder="https://res.cloudinary.com/... or /images/products/..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>
                </div>

                {/* Pack Sizes & Variant Inventory Section */}
                <div className="admin-variants-box">
                  <div className="admin-variant-header">
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A' }}>
                        Pack Sizes &amp; Variants Inventory ({variants.length})
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Add variants like 250ml, 500ml, 1L, 5L with their own MRP, discount, and stock.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddVariant('')}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      <Plus size={13} /> Add Variant
                    </button>
                  </div>

                  {/* 1-Click Quick Add Preset Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Quick 1-Click Presets:</span>
                    {['250ml', '500ml', '1 Liter', '2 Liter', '5 Liter Can'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddVariant(preset)}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          cursor: 'pointer'
                        }}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  {variants.length === 0 ? (
                    <div style={{ padding: '16px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '8px', textAlign: 'center', margin: '6px 0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                        Single Unique Product (No Variants)
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '10px' }}>
                        This product is sold as a standalone item using the main price, MRP, and stock above. Click any preset above or &ldquo;Add Variant&rdquo; to add size options.
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddVariant('1 Liter')}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                      >
                        <Plus size={13} /> Add 1 Liter Variant
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

                          {/* Row 1: Size, SKU, Stock */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '10px' }}>
                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-form-label" style={{ fontSize: '11px' }}>Pack Size / Volume *</label>
                              <input
                                type="text"
                                placeholder="e.g. 500ml Bottle, 1 Liter Pack"
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
                                placeholder="e.g. ASM-500ML"
                                value={v.sku}
                                onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '36px', fontSize: '12.5px' }}
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

                          {/* Row 2: MRP (₹), Discount (%), Selling Price (₹) with auto-calculation */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1.2fr',
                            gap: '10px',
                            background: '#F8FAFC',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0'
                          }}>
                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                                MRP (₹) *
                              </label>
                              <input
                                type="number"
                                placeholder="200"
                                value={v.originalPrice}
                                onChange={(e) => handleUpdateVariant(idx, 'originalPrice', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '36px', fontSize: '12.5px' }}
                                min="0"
                                required
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                                Discount (%)
                              </label>
                              <input
                                type="number"
                                placeholder="10"
                                value={v.discountPercent}
                                onChange={(e) => handleUpdateVariant(idx, 'discountPercent', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '36px', fontSize: '12.5px' }}
                                min="0"
                                max="100"
                              />
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                              <label className="admin-form-label" style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>
                                Selling Price (Customer Pays) *
                              </label>
                              <input
                                type="number"
                                placeholder="180"
                                value={v.price}
                                onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '36px', fontSize: '12.5px', fontWeight: 800, borderColor: '#10B981', background: '#F0FDF4' }}
                                min="0"
                                required
                              />
                            </div>
                          </div>

                          {/* Variant Customer View Mini Pill */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: '#F0FDF4',
                            borderRadius: '6px',
                            fontSize: '11px',
                            border: '1px solid #BBF7D0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 800, color: '#166534' }}>Customer View:</span>
                              <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{v.price || 0}</span>
                              {Number(v.originalPrice) > Number(v.price) && (
                                <span style={{ color: '#94A3B8', textDecoration: 'line-through' }}>₹{v.originalPrice}</span>
                              )}
                              {Number(v.discountPercent) > 0 && (
                                <span style={{ fontWeight: 800, color: '#16A34A' }}>{v.discountPercent}% off</span>
                              )}
                            </div>
                            {Number(v.originalPrice) > Number(v.price) && (
                              <span style={{ fontWeight: 700, color: '#15803D' }}>
                                Saves ₹{Number(v.originalPrice) - Number(v.price)}
                              </span>
                            )}
                          </div>

                          {/* Separate Variant Image with Drag-Drop & Cloudinary Upload */}
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleVariantImageDrop(idx, e)}
                            style={{
                              background: '#F8FAFC',
                              border: '1px dashed #CBD5E1',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginTop: '2px'
                            }}
                          >
                            <img
                              src={v.image || image || '/favicon.svg'}
                              alt="Variant Preview"
                              className="admin-variant-preview-thumb"
                              onError={(e) => { e.target.src = '/favicon.svg'; }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <label className="admin-form-label" style={{ fontSize: '11px', margin: 0, fontWeight: 700 }}>
                                  Variant Specific Image (Optional)
                                </label>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {variantUploadingIdx === idx ? (
                                    <>
                                      <RefreshCw size={11} className="animate-spin" />
                                      <span>Uploading to Cloudinary...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={11} />
                                      <span>Upload from Gallery / PC</span>
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    disabled={variantUploadingIdx === idx}
                                    onChange={(e) => handleVariantImageSelect(idx, e)}
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                placeholder="Drag &amp; drop image here or paste URL /images/products/..."
                                value={v.image}
                                onChange={(e) => handleUpdateVariant(idx, 'image', e.target.value)}
                                className="admin-form-input"
                                style={{ height: '32px', fontSize: '11.5px' }}
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

                {/* Diwali / Festive Sale Banner Placement */}
                <div style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: isFestiveDeal ? '#FFFBEB' : '#F8FAFC',
                  border: `1.5px solid ${isFestiveDeal ? '#F59E0B' : '#E2E8F0'}`,
                  marginBottom: '16px'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>
                    <input
                      type="checkbox"
                      checked={isFestiveDeal}
                      onChange={(e) => setIsFestiveDeal(e.target.checked)}
                      style={{ width: '17px', height: '17px', accentColor: '#D97706', cursor: 'pointer' }}
                    />
                    <span>🪔 Feature in Diwali Sale / Festive Banner Cards</span>
                  </label>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 8px 25px' }}>
                    When checked, this product will appear inside the Diwali Deep Cleaning Mega Sale poster cards on the storefront.
                  </p>
                  {isFestiveDeal && (
                    <div style={{ marginLeft: '25px', marginTop: '6px' }}>
                      <label className="admin-form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>
                        Festive Offer Tag (e.g. &ldquo;FESTIVE ₹69&rdquo;, &ldquo;5L VALUE PACK&rdquo;, &ldquo;DIWALI SPECIAL&rdquo;)
                      </label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. FESTIVE ₹69"
                        value={festiveBadge}
                        onChange={(e) => setFestiveBadge(e.target.value)}
                        style={{ height: '36px', fontSize: '12px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Collapsible Advanced Details: Highlights & Specifications */}
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="admin-btn admin-btn-secondary"
                    style={{
                      width: '100%',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '8px'
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#334155' }}>
                      ✨ Optional Details: Product Highlights &amp; Technical Specifications ({highlights.length} points, {specifications.length} specs)
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>
                      {showAdvanced ? '▲ Collapse' : '▼ Click to Expand'}
                    </span>
                  </button>

                  {showAdvanced && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                              No highlights added yet. Click &ldquo;+ Add Point&rdquo; above to add feature bullet points.
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
                                placeholder={`Highlight point #${idx + 1}`}
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
                              Two-column technical specification table (Attribute &amp; Value).
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
                              No specifications added yet. Click &ldquo;+ Add Attribute&rdquo; above to add technical specs table rows.
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
