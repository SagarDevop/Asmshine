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
  Image as ImageIcon,
  Tag,
  Flame,
  Sliders,
  ListChecks,
  CheckCircle2,
  Sparkles,
  Percent,
  HelpCircle
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import {
  OFFICIAL_CATEGORIES,
  LEGACY_CATEGORY_MAP,
  isLegacyCategory,
  getCategoryDisplayName
} from '../../config/categories';

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
  const [cat, setCat] = useState('everyday_essentials');
  const [costPrice, setCostPrice] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [isFestiveDeal, setIsFestiveDeal] = useState(false);
  const [festiveBadge, setFestiveBadge] = useState('');
  const [variants, setVariants] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'specs'

  // Marketplace Link States
  const [flipkartUrl, setFlipkartUrl] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [meeshoUrl, setMeeshoUrl] = useState('');

  // Variant Image Uploading & Drag/Drop States ({ varIdx, slotIdx })
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);

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

  // Variant Slot Image Upload Handlers (Supports up to 3 images per variant)
  const handleVariantSlotUpload = (varIdx, slotIdx, file) => {
    if (!file) return;
    setUploadingSlot({ varIdx, slotIdx });
    setFormError('');
    handleFileUpload(file, (url) => {
      setVariants((prev) => {
        const copy = [...prev];
        const target = { ...copy[varIdx] };
        const imgs = [...(target.images || ['', '', ''])];
        while (imgs.length < 3) imgs.push('');
        imgs[slotIdx] = url;
        target.images = imgs;
        target.image = imgs[0] || url;
        copy[varIdx] = target;
        return copy;
      });
      setUploadingSlot(null);
    });
  };

  const handleVariantSlotUrlChange = (varIdx, slotIdx, val) => {
    setVariants((prev) => {
      const copy = [...prev];
      const target = { ...copy[varIdx] };
      const imgs = [...(target.images || ['', '', ''])];
      while (imgs.length < 3) imgs.push('');
      imgs[slotIdx] = val;
      target.images = imgs;
      target.image = imgs[0] || val;
      copy[varIdx] = target;
      return copy;
    });
  };

  const handleRemoveVariantSlotImage = (varIdx, slotIdx) => {
    setVariants((prev) => {
      const copy = [...prev];
      const target = { ...copy[varIdx] };
      const imgs = [...(target.images || ['', '', ''])];
      while (imgs.length < 3) imgs.push('');
      imgs[slotIdx] = '';
      target.images = imgs;
      target.image = imgs[0] || '';
      copy[varIdx] = target;
      return copy;
    });
  };

  // Synchronized Variant Handlers
  const handleAddVariant = (presetSize = '') => {
    const mainVar = variants[0];
    const defaultMrp = mainVar?.originalPrice || '299';
    const defaultDisc = mainVar?.discountPercent || '10';
    const mrpNum = Number(defaultMrp);
    const discNum = Number(defaultDisc);
    const calcPrice = discNum > 0 ? String(Math.round(mrpNum * (1 - discNum / 100))) : defaultMrp;

    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}-${Math.random()}`,
        size: typeof presetSize === 'string' ? presetSize : '',
        stockQuantity: mainVar?.stockQuantity || '20',
        originalPrice: defaultMrp,
        discountPercent: defaultDisc,
        price: calcPrice,
        images: ['', '', ''],
        image: ''
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
    if (idx === 0) return; // Cannot delete main variant
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
    setCat('toilet-cleaner');
    setDescription('');
    setBadge('BEST SELLER');
    setIsFestiveDeal(false);
    setFestiveBadge('');
    setFlipkartUrl('');
    setAmazonUrl('');
    setMeeshoUrl('');
    setCostPrice('0');
    setLowStockThreshold('5');

    const defaultImg = '/images/products/all_shine_dishwash_gel_500ml.png';
    setVariants([
      {
        id: 'var-1',
        size: '500ml',
        stockQuantity: '20',
        originalPrice: '400',
        discountPercent: '10',
        price: '360',
        images: [defaultImg, '', ''],
        image: defaultImg
      }
    ]);

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
    setActiveTab('general');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name || '');
    setCat(p.category || 'toilet-cleaner');
    setDescription(p.description || '');
    setBadge(p.badge || '');
    setIsFestiveDeal(Boolean(p.isFestiveDeal));
    setFestiveBadge(p.festiveBadge || '');
    setFlipkartUrl(p.marketplaceLinks?.flipkart || '');
    setAmazonUrl(p.marketplaceLinks?.amazon || '');
    setMeeshoUrl(p.marketplaceLinks?.meesho || '');
    setCostPrice(String(p.costPrice || '0'));
    setLowStockThreshold(String(p.lowStockThreshold || '5'));

    if (Array.isArray(p.availableSizes) && p.availableSizes.length > 0) {
      setVariants(
        p.availableSizes.map((v, i) => {
          const vPrice = Number(v.price || 0);
          const vMrp = Number(v.originalPrice || vPrice || 0);
          const vDisc = vMrp > vPrice && vMrp > 0
            ? Math.round(((vMrp - vPrice) / vMrp) * 100)
            : (v.discount ? parseInt(v.discount, 10) || 0 : 0);

          let varImgs = [];
          if (Array.isArray(v.images) && v.images.length > 0) {
            varImgs = [...v.images];
          } else if (v.image) {
            varImgs = [v.image];
          } else if (i === 0 && Array.isArray(p.images) && p.images.length > 0) {
            varImgs = [...p.images];
          } else if (i === 0 && p.image) {
            varImgs = [p.image];
          }
          while (varImgs.length < 3) varImgs.push('');
          const threeImgs = varImgs.slice(0, 3);

          return {
            id: `var-${i + 1}-${Date.now()}`,
            size: v.size || (i === 0 ? p.size || '500ml' : `Size ${i + 1}`),
            stockQuantity: String(v.stockQuantity !== undefined ? v.stockQuantity : (i === 0 ? p.stockQuantity || '0' : '0')),
            originalPrice: String(vMrp || ''),
            discountPercent: String(vDisc || '0'),
            price: String(vPrice || ''),
            images: threeImgs,
            image: threeImgs[0] || v.image || ''
          };
        })
      );
    } else {
      // Backward compatibility: synthesize Main Variant from product level
      const pPrice = Number(p.price || 0);
      const pMrp = Number(p.originalPrice || pPrice || 0);
      const pDisc = p.discountPercent !== undefined && p.discountPercent !== null
        ? p.discountPercent
        : (pMrp > pPrice && pMrp > 0 ? Math.round(((pMrp - pPrice) / pMrp) * 100) : 0);

      let pImgs = [];
      if (Array.isArray(p.images) && p.images.length > 0) {
        pImgs = [...p.images];
      } else if (p.image) {
        pImgs = [p.image];
      }
      while (pImgs.length < 3) pImgs.push('');
      const threeImgs = pImgs.slice(0, 3);

      setVariants([
        {
          id: `var-1-${Date.now()}`,
          size: p.size || '500ml',
          stockQuantity: String(p.stockQuantity || '0'),
          originalPrice: String(pMrp || ''),
          discountPercent: String(pDisc || '0'),
          price: String(pPrice || ''),
          images: threeImgs,
          image: threeImgs[0] || p.image || ''
        }
      ]);
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

    setActiveTab('general');
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter the Product Name.');
      return;
    }
    if (!cat.trim()) {
      setFormError('Please select a Category.');
      return;
    }
    if (!variants || variants.length === 0) {
      setFormError('Every product must have at least one variant (the Main Variant).');
      return;
    }

    const mainVar = variants[0];
    if (!mainVar.size || !mainVar.size.trim()) {
      setFormError('Please enter the Pack Size / Variant Name for Variant #1 (Main Variant).');
      return;
    }
    if (!mainVar.price || Number(mainVar.price) < 0) {
      setFormError('Please enter a valid Selling Price for Variant #1 (Main Variant).');
      return;
    }
    const mainCleanImgs = (mainVar.images || []).map((img) => (img || '').trim()).filter(Boolean);
    if (mainCleanImgs.length === 0 && !mainVar.image) {
      setFormError('Variant #1 (Main Variant) requires at least Image Slot 1.');
      return;
    }

    // Validate additional variants
    for (let i = 1; i < variants.length; i++) {
      const v = variants[i];
      if (!v.size || !v.size.trim()) {
        setFormError(`Please enter a Pack Size / Variant Name for Variant #${i + 1}.`);
        return;
      }
      if (!v.price || Number(v.price) < 0) {
        setFormError(`Please enter a valid Selling Price for Variant #${i + 1}.`);
        return;
      }
    }

    setFormSubmitting(true);
    try {
      const cleanHighlights = highlights.map((h) => h.trim()).filter(Boolean);
      const specsObject = {};
      specifications.forEach((s) => {
        const k = (s.key || '').trim();
        const v = (s.value || '').trim();
        if (k && v) {
          specsObject[k] = v;
        }
      });

      const primaryImg = mainCleanImgs[0] || mainVar.image;
      const parentMRP = Number(mainVar.originalPrice || mainVar.price);
      const parentPrice = Number(mainVar.price);
      const parentDisc = parentMRP > parentPrice
        ? Math.round(((parentMRP - parentPrice) / parentMRP) * 100)
        : (Number(mainVar.discountPercent) || 0);
      const parentStock = variants.reduce((sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0), 0);

      const availableSizesPayload = variants.map((v, idx) => {
        const vMRP = Number(v.originalPrice || v.price);
        const vPrice = Number(v.price);
        const vStock = parseInt(v.stockQuantity, 10) || 0;
        const vDiscPercent = vMRP > vPrice ? Math.round(((vMRP - vPrice) / vMRP) * 100) : (Number(v.discountPercent) || 0);
        const vImgs = (v.images || []).map((img) => (img || '').trim()).filter(Boolean).slice(0, 3);
        const vPrimary = vImgs[0] || v.image || primaryImg;
        return {
          size: v.size.trim(),
          price: vPrice,
          originalPrice: vMRP,
          discount: vDiscPercent > 0 ? `${vDiscPercent}% off` : '',
          stockQuantity: vStock,
          inStock: vStock > 0,
          image: vPrimary,
          images: vImgs.length > 0 ? vImgs : [vPrimary]
        };
      });

      const payload = {
        name: name.trim(),
        category: cat.trim(),
        price: parentPrice,
        originalPrice: parentMRP,
        discountPercent: parentDisc,
        costPrice: Number(costPrice) || 0,
        stockQuantity: parentStock,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
        size: mainVar.size.trim(),
        image: primaryImg,
        images: mainCleanImgs.length > 0 ? mainCleanImgs : [primaryImg],
        marketplaceLinks: {
          flipkart: flipkartUrl.trim(),
          amazon: amazonUrl.trim(),
          meesho: meeshoUrl.trim()
        },
        description: description.trim(),
        badge: badge.trim(),
        isFestiveDeal: Boolean(isFestiveDeal),
        festiveBadge: festiveBadge.trim(),
        inStock: parentStock > 0,
        highlights: cleanHighlights,
        specifications: specsObject,
        availableSizes: availableSizesPayload
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
              {OFFICIAL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <optgroup label="Legacy Categories (Need Update)">
                {Object.entries(LEGACY_CATEGORY_MAP).map(([slug, name]) => (
                  <option key={slug} value={slug}>
                    {name} (Legacy)
                  </option>
                ))}
              </optgroup>
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
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '4px',
                                border: '1px solid #FCD34D',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <Flame size={11} style={{ color: '#D97706' }} />
                                <span>FESTIVE DEAL</span>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B' }}>
                          {getCategoryDisplayName(p.category)}
                        </span>
                        {isLegacyCategory(p.category) && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: '#FEE2E2',
                              color: '#DC2626',
                              padding: '1px 5px',
                              borderRadius: '3px'
                            }}
                            title="Legacy category - please edit product to recategorize"
                          >
                            Legacy
                          </span>
                        )}
                      </div>
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
          <div className="admin-modal-card admin-modal-card-lg">
            <div className="admin-modal-header" style={{ padding: '18px 24px' }}>
              <div>
                <h2 className="admin-modal-title" style={{ fontSize: '16.5px', fontWeight: 700, color: '#0F172A' }}>
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  Configure catalog details, pricing rules, inventory variants, and specifications.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px', borderRadius: '6px' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Flipkart / Shopify Style Navigation Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 24px',
              borderBottom: '1px solid #E2E8F0',
              background: '#F8FAFC'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'general' ? '2.5px solid #2563EB' : '2.5px solid transparent',
                  color: activeTab === 'general' ? '#1D4ED8' : '#64748B',
                  fontWeight: activeTab === 'general' ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Package size={15} />
                <span>General &amp; Pricing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'specs' ? '2.5px solid #2563EB' : '2.5px solid transparent',
                  color: activeTab === 'specs' ? '#1D4ED8' : '#64748B',
                  fontWeight: activeTab === 'specs' ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <ListChecks size={15} />
                <span>Highlights &amp; Specifications</span>
                {(highlights.length > 0 || specifications.length > 0) && (
                  <span style={{
                    background: activeTab === 'specs' ? '#DBEAFE' : '#E2E8F0',
                    color: activeTab === 'specs' ? '#1D4ED8' : '#475569',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {highlights.length + specifications.length}
                  </span>
                )}
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body" style={{ padding: '22px 24px' }}>
                {formError && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '16px' }}>
                    {formError}
                  </div>
                )}

                {activeTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Step 1: Basic Common Product Information */}
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={17} color="#2563EB" />
                        <span>Step 1: Basic Product Information</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-form-label">Product Name *</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            placeholder="e.g. Pure Shield Liquid Handwash"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-form-label">Category *</label>
                          <select
                            className="admin-select"
                            style={{ width: '100%', height: '42px' }}
                            value={cat}
                            onChange={(e) => setCat(e.target.value)}
                            required
                          >
                            {isLegacyCategory(cat) && (
                              <option value={cat} style={{ color: '#DC2626', fontWeight: 700 }}>
                                ⚠️ Current: {getCategoryDisplayName(cat)} (Legacy - Please Update)
                              </option>
                            )}
                            {OFFICIAL_CATEGORIES.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {isLegacyCategory(cat) && (
                            <div
                              style={{
                                marginTop: '6px',
                                padding: '8px 12px',
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#991B1B',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <AlertCircle size={14} color="#DC2626" />
                              <span>
                                This product is currently in a <strong>Legacy Category ({getCategoryDisplayName(cat)})</strong>. Please select one of the 8 official categories above to update it.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-form-label">Common Product Description</label>
                        <textarea
                          className="admin-form-textarea"
                          rows={3}
                          placeholder="Authentic formulation specifications, skin-friendly benefits, active ingredients, etc."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-form-label">Promotional Storefront Badge</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            placeholder="e.g. BEST SELLER, TRENDING, 20% OFF"
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                          />
                        </div>

                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
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
                      </div>
                    </div>

                    {/* Step 2 & 3: Flipkart-Style Variant Management */}
                    <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={18} color="#2563EB" />
                            <span>Step 2 &amp; 3: Product Variants &amp; Pack Sizes ({variants.length})</span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                            Variant #1 is the default storefront variant. Add multiple pack sizes (e.g., 200 ML, 500 ML, 1 Litre, 5 Litre) with independent pricing, stock, and up to 3 images.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddVariant('')}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                        >
                          <Plus size={14} />
                          <span>+ Add Another Variant</span>
                        </button>
                      </div>

                      {/* Quick 1-Click Preset Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Quick Add Presets:</span>
                        {['200 ML', '500 ML', '1 Litre', '2 Litre', '5 Litre'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddVariant(preset)}
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 9px',
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

                      {/* Variant Cards */}
                      {variants.map((v, vIdx) => {
                        const isMain = vIdx === 0;
                        const isOut = v.stockQuantity === 0 || v.stockQuantity === '0';
                        const mrp = Number(v.originalPrice || 0);
                        const selling = Number(v.price || 0);
                        const discount = Number(v.discountPercent || 0);
                        const savings = mrp > selling ? mrp - selling : 0;

                        return (
                          <div
                            key={v.id || vIdx}
                            style={{
                              background: '#FFFFFF',
                              border: `1.5px solid ${isMain ? '#2563EB' : '#CBD5E1'}`,
                              borderRadius: '12px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              boxShadow: isMain ? '0 2px 8px rgba(37,99,235,0.08)' : '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                          >
                            {/* Card Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: isMain ? '#1D4ED8' : '#0F172A' }}>
                                  {isMain ? 'Variant #1 (Main / Default Variant)' : `Variant #${vIdx + 1}`}
                                </span>
                                {isMain && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px' }}>
                                    DEFAULT STOREFRONT DISPLAY
                                  </span>
                                )}
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

                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(vIdx)}
                                  style={{
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#DC2626',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Delete this variant"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete Variant</span>
                                </button>
                              )}
                            </div>

                            {/* Row 1: Size & Stock Quantity */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                                  Variant Name / Pack Size *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 200 ML, 500 ML, 1 Litre, 5 Litre"
                                  value={v.size}
                                  onChange={(e) => handleUpdateVariant(vIdx, 'size', e.target.value)}
                                  className="admin-form-input"
                                  style={{ height: '38px', fontSize: '13px' }}
                                  required
                                />
                              </div>

                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                                  Stock Quantity *
                                </label>
                                <input
                                  type="number"
                                  placeholder="20"
                                  value={v.stockQuantity}
                                  onChange={(e) => handleUpdateVariant(vIdx, 'stockQuantity', e.target.value)}
                                  className="admin-form-input"
                                  style={{ height: '38px', fontSize: '13px' }}
                                  min="0"
                                  required
                                />
                              </div>
                            </div>

                            {/* Row 2: Pricing (MRP, Discount %, Selling Price) with Auto-Calculator */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 1.3fr',
                              gap: '12px',
                              background: '#F8FAFC',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0'
                            }}>
                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                                  MRP (Original ₹) *
                                </label>
                                <input
                                  type="number"
                                  placeholder="400"
                                  value={v.originalPrice}
                                  onChange={(e) => handleUpdateVariant(vIdx, 'originalPrice', e.target.value)}
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
                                  onChange={(e) => handleUpdateVariant(vIdx, 'discountPercent', e.target.value)}
                                  className="admin-form-input"
                                  style={{ height: '36px', fontSize: '12.5px' }}
                                  min="0"
                                  max="100"
                                />
                              </div>

                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-form-label" style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>
                                  Selling Price (Customer Pays ₹) *
                                </label>
                                <input
                                  type="number"
                                  placeholder="360"
                                  value={v.price}
                                  onChange={(e) => handleUpdateVariant(vIdx, 'price', e.target.value)}
                                  className="admin-form-input"
                                  style={{ height: '36px', fontSize: '13px', fontWeight: 800, borderColor: '#10B981', background: '#F0FDF4' }}
                                  min="0"
                                  required
                                />
                              </div>
                            </div>

                            {/* Live Customer Preview Strip */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 12px',
                              background: '#F0FDF4',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              border: '1px solid #BBF7D0'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 800, color: '#166534' }}>Customer Sees:</span>
                                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>₹{selling || 0}</span>
                                {mrp > selling && (
                                  <span style={{ color: '#94A3B8', textDecoration: 'line-through' }}>₹{mrp}</span>
                                )}
                                {discount > 0 && (
                                  <span style={{ fontWeight: 800, color: '#16A34A' }}>{discount}% off</span>
                                )}
                              </div>
                              {savings > 0 && (
                                <span style={{ fontWeight: 700, color: '#15803D' }}>
                                  Customer saves ₹{savings}
                                </span>
                              )}
                            </div>

                            {/* Row 3: Product Images for this variant (Max 3 Images: Slot 1 Required, 2 & 3 Optional) */}
                            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label className="admin-form-label" style={{ fontSize: '11.5px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                                  Images for {v.size || `Variant #${vIdx + 1}`} (Up to 3 Images)
                                </label>
                                <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                                  Slot 1 is required • Slots 2 &amp; 3 optional
                                </span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                {[0, 1, 2].map((slotIdx) => {
                                  const isSlotReq = slotIdx === 0;
                                  const imgVal = (v.images && v.images[slotIdx]) || '';
                                  const isUploading = uploadingSlot?.varIdx === vIdx && uploadingSlot?.slotIdx === slotIdx;
                                  const isDragging = dragOverSlot?.varIdx === vIdx && dragOverSlot?.slotIdx === slotIdx;
                                  const slotLabel = isSlotReq ? 'Slot 1: Main (Required)' : `Slot ${slotIdx + 1} (Optional)`;

                                  return (
                                    <div
                                      key={slotIdx}
                                      style={{
                                        border: `1.5px solid ${isSlotReq ? (imgVal ? '#2563EB' : '#EF4444') : (imgVal ? '#10B981' : '#CBD5E1')}`,
                                        borderRadius: '8px',
                                        background: isDragging ? '#EFF6FF' : '#FFFFFF',
                                        padding: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                      }}
                                      onDragOver={(e) => { e.preventDefault(); setDragOverSlot({ varIdx: vIdx, slotIdx }); }}
                                      onDragLeave={() => setDragOverSlot(null)}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOverSlot(null);
                                        const file = e.dataTransfer?.files?.[0];
                                        if (file) handleVariantSlotUpload(vIdx, slotIdx, file);
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{
                                          fontSize: '10px',
                                          fontWeight: 800,
                                          padding: '1px 5px',
                                          borderRadius: '3px',
                                          background: isSlotReq ? '#DBEAFE' : '#F1F5F9',
                                          color: isSlotReq ? '#1D4ED8' : '#475569'
                                        }}>
                                          {slotLabel}
                                        </span>
                                        {imgVal && (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveVariantSlotImage(vIdx, slotIdx)}
                                            style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', padding: '1px 3px' }}
                                          >
                                            Clear
                                          </button>
                                        )}
                                      </div>

                                      <div
                                        onClick={() => document.getElementById(`var-${vIdx}-slot-${slotIdx}`)?.click()}
                                        style={{
                                          height: '95px',
                                          borderRadius: '6px',
                                          border: `1px dashed ${isDragging ? '#2563EB' : '#CBD5E1'}`,
                                          background: imgVal ? '#FFFFFF' : '#F8FAFC',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          overflow: 'hidden',
                                          position: 'relative'
                                        }}
                                      >
                                        {isUploading ? (
                                          <div style={{ textAlign: 'center', padding: '6px' }}>
                                            <RefreshCw size={18} className="animate-spin" color="#2563EB" />
                                            <div style={{ fontSize: '10px', color: '#2563EB', fontWeight: 700, marginTop: '2px' }}>Uploading...</div>
                                          </div>
                                        ) : imgVal ? (
                                          <img
                                            src={imgVal}
                                            alt={`Variant ${vIdx + 1} Slot ${slotIdx + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            onError={(e) => { e.target.src = '/favicon.svg'; }}
                                          />
                                        ) : (
                                          <div style={{ textAlign: 'center', padding: '6px' }}>
                                            <Upload size={18} color="#94A3B8" />
                                            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>Upload / Drop</div>
                                          </div>
                                        )}
                                        <input
                                          id={`var-${vIdx}-slot-${slotIdx}`}
                                          type="file"
                                          accept="image/*"
                                          style={{ display: 'none' }}
                                          disabled={isUploading}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleVariantSlotUpload(vIdx, slotIdx, file);
                                          }}
                                        />
                                      </div>

                                      <input
                                        type="text"
                                        className="admin-form-input"
                                        style={{ height: '26px', fontSize: '10.5px', padding: '2px 6px' }}
                                        placeholder={isSlotReq ? "Image URL (Required)" : "Image URL (Optional)"}
                                        value={imgVal}
                                        onChange={(e) => handleVariantSlotUrlChange(vIdx, slotIdx, e.target.value)}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* External Marketplace Purchase Links (Flipkart, Amazon, Meesho) */}
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ExternalLink size={16} color="#2563EB" />
                          <span>External Marketplace Purchase Links (Optional)</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                          Configure official product URLs for external marketplaces. When set, official &ldquo;Buy on Flipkart/Amazon/Meesho&rdquo; buttons appear on the customer product page. Leave blank to hide.
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                        <div>
                          <label className="admin-form-label" style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#1C8E8F', fontWeight: 800 }}>Flipkart</span> Product URL
                          </label>
                          <input
                            type="url"
                            className="admin-form-input"
                            placeholder="https://www.flipkart.com/..."
                            value={flipkartUrl}
                            onChange={(e) => setFlipkartUrl(e.target.value)}
                            style={{ height: '34px', fontSize: '12px' }}
                          />
                        </div>

                        <div>
                          <label className="admin-form-label" style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#D97706', fontWeight: 800 }}>Amazon</span> Product URL
                          </label>
                          <input
                            type="url"
                            className="admin-form-input"
                            placeholder="https://www.amazon.in/..."
                            value={amazonUrl}
                            onChange={(e) => setAmazonUrl(e.target.value)}
                            style={{ height: '34px', fontSize: '12px' }}
                          />
                        </div>

                        <div>
                          <label className="admin-form-label" style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#9A1672', fontWeight: 800 }}>Meesho</span> Product URL
                          </label>
                          <input
                            type="url"
                            className="admin-form-input"
                            placeholder="https://www.meesho.com/..."
                            value={meeshoUrl}
                            onChange={(e) => setMeeshoUrl(e.target.value)}
                            style={{ height: '34px', fontSize: '12px' }}
                          />
                        </div>
                      </div>
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

                {/* Promotional & Festive Banner Placement */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: isFestiveDeal ? '#FFFBEB' : '#F8FAFC',
                  border: `1px solid ${isFestiveDeal ? '#FCD34D' : '#E2E8F0'}`,
                  transition: 'all 0.2s ease'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>
                    <input
                      type="checkbox"
                      checked={isFestiveDeal}
                      onChange={(e) => setIsFestiveDeal(e.target.checked)}
                      style={{ width: '17px', height: '17px', accentColor: '#D97706', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Flame size={16} style={{ color: '#D97706' }} />
                      <span>Promotional &amp; Festive Banner Placement</span>
                    </div>
                  </label>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 0 27px' }}>
                    When checked, this product will appear inside promotional sale cards and festive deal sections on the storefront.
                  </p>
                  {isFestiveDeal && (
                    <div style={{ marginLeft: '27px', marginTop: '10px' }}>
                      <label className="admin-form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>
                        Festive Offer Tag (e.g. &ldquo;FESTIVE ₹69&rdquo;, &ldquo;5L VALUE PACK&rdquo;, &ldquo;SPECIAL DEAL&rdquo;)
                      </label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. FESTIVE ₹69"
                        value={festiveBadge}
                        onChange={(e) => setFestiveBadge(e.target.value)}
                        style={{ height: '36px', fontSize: '12px', maxWidth: '340px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Quick navigation hint to Tab 2 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#F1F5F9',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Want to add bullet points or technical specs for this product?
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('specs')}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <span>Open Highlights &amp; Specs Tab</span>
                    <ListChecks size={13} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Top Info Banner */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <ListChecks size={20} style={{ color: '#2563EB', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#1E40AF' }}>
                      Product Detail Page (PDP) Content
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#3B82F6', marginTop: '1px' }}>
                      Bullet points appear under the product title on storefront. Technical specs display in the specification table.
                    </div>
                  </div>
                </div>

                {/* 1. Product Highlights Point-by-Point Section */}
                <div className="admin-meta-box">
                  <div className="admin-meta-header">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                        <span>Product Highlights ({highlights.length} Points)</span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Key feature bullet points shown with stylish checkmarks on the product page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ gap: '5px' }}
                    >
                      <Plus size={13} />
                      <span>Add Point</span>
                    </button>
                  </div>

                  {highlights.length === 0 ? (
                    <div style={{
                      padding: '24px 16px',
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 8px 0' }}>
                        No highlights added yet. Click &ldquo;+ Add Point&rdquo; to add feature bullet points.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ margin: '0 auto', gap: '5px' }}
                      >
                        <Plus size={13} /> Add First Point
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {highlights.map((hl, idx) => (
                        <div key={idx} className="admin-highlight-row">
                          <span className="admin-highlight-badge">{idx + 1}</span>
                          <input
                            type="text"
                            className="admin-form-input"
                            style={{ height: '36px', fontSize: '12.5px', flex: 1, border: 'none', background: 'transparent', boxShadow: 'none', padding: '0 4px' }}
                            placeholder={`Highlight point #${idx + 1} (e.g. 99.9% germ kill verified formula)`}
                            value={hl}
                            onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(idx)}
                            className="admin-icon-btn-danger"
                            title="Remove point"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Product Specifications (Technical Key-Value Table) */}
                <div className="admin-meta-box">
                  <div className="admin-meta-header">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sliders size={16} style={{ color: '#2563EB' }} />
                        <span>Technical Specifications ({specifications.length} Attributes)</span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Two-column technical specification table (Attribute &amp; Value).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecification}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ gap: '5px' }}
                    >
                      <Plus size={13} />
                      <span>Add Attribute</span>
                    </button>
                  </div>

                  {specifications.length === 0 ? (
                    <div style={{
                      padding: '24px 16px',
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 8px 0' }}>
                        No specifications added yet. Click &ldquo;+ Add Attribute&rdquo; to add technical specs.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddSpecification}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ margin: '0 auto', gap: '5px' }}
                      >
                        <Plus size={13} /> Add First Attribute
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {specifications.map((spec, idx) => (
                        <div key={idx} className="admin-spec-row">
                          <input
                            type="text"
                            className="admin-form-input"
                            style={{ height: '36px', fontSize: '12.5px', background: '#FFFFFF' }}
                            placeholder="Attribute (e.g. Form, Fragrance, Shelf Life)"
                            value={spec.key}
                            onChange={(e) => handleUpdateSpecification(idx, 'key', e.target.value)}
                          />
                          <input
                            type="text"
                            className="admin-form-input"
                            style={{ height: '36px', fontSize: '12.5px', background: '#FFFFFF' }}
                            placeholder="Detail / Value (e.g. Active Liquid Gel, 24 Months)"
                            value={spec.value}
                            onChange={(e) => handleUpdateSpecification(idx, 'value', e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecification(idx)}
                            className="admin-icon-btn-danger"
                            title="Remove attribute"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="admin-modal-footer">
            <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                {activeTab === 'general' ? 'Tab 1: General & Pricing' : 'Tab 2: Highlights & Specifications'}
              </span>
            </div>
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
