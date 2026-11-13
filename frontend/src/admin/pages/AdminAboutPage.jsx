import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Save,
  Send,
  Eye,
  CheckCircle,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Check,
  HelpCircle,
  Globe,
  Layers,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Link } from 'react-router-dom';

export const AdminAboutPage = () => {
  const { admin, isAuthorized } = useAdminAuth();
  const isSuperAdmin = isAuthorized('superadmin');

  // Active editor tab
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'story' | 'mission' | 'pillars' | 'comparison' | 'contact' | 'seo' | 'preview'

  // CMS State
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [publishedVersion, setPublishedVersion] = useState(1);
  const [publishedAt, setPublishedAt] = useState(null);

  // Notification Toast
  const [notice, setNotice] = useState(null);
  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4500);
  };

  // Fetch CMS Content from Backend
  const fetchCMSContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAboutContent();
      if (res.success && res.data) {
        setContent(res.data.draft);
        setPublishedVersion(res.data.publishedVersion || 1);
        setPublishedAt(res.data.publishedAt);
      }
    } catch (err) {
      showNotice(err.message || 'Failed to load About Us CMS content', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCMSContent();
  }, [fetchCMSContent]);

  // Handle Save Draft
  const handleSaveDraft = async () => {
    if (!content) return;
    setSavingDraft(true);
    try {
      const res = await adminApi.saveAboutDraft(content);
      if (res.success) {
        showNotice('Draft saved successfully! (Not yet published to live site)');
        if (res.data) setContent(res.data);
      } else {
        throw new Error(res.message || 'Failed to save draft');
      }
    } catch (err) {
      showNotice(err.message || 'Error saving draft', 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  // Handle Publish to Live
  const handlePublish = async () => {
    if (!content) return;
    if (!window.confirm('Are you sure you want to publish these changes to the live About Us page?')) {
      return;
    }

    setPublishing(true);
    try {
      const res = await adminApi.publishAboutContent(content);
      if (res.success) {
        showNotice(`Published successfully to live site! Version ${res.data?.version || publishedVersion + 1}`);
        setPublishedVersion(res.data?.version || publishedVersion + 1);
        setPublishedAt(res.data?.publishedAt || new Date());
      } else {
        throw new Error(res.message || 'Failed to publish content');
      }
    } catch (err) {
      showNotice(err.message || 'Error publishing content', 'error');
    } finally {
      setPublishing(false);
    }
  };

  // Cloudinary Image Upload Handler
  const handleImageFileUpload = async (e, sectionPath) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotice('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotice('Image file size must be under 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        try {
          const res = await adminApi.uploadAboutImage({
            imageBase64: base64Data,
            folder: 'asm-shine/about'
          });

          if (res.success && res.data?.secureUrl) {
            const uploadedUrl = res.data.secureUrl;
            // Update state based on sectionPath
            if (sectionPath === 'hero.image') {
              setContent((prev) => ({
                ...prev,
                hero: { ...prev.hero, image: uploadedUrl }
              }));
            } else if (sectionPath === 'mission.image') {
              setContent((prev) => ({
                ...prev,
                mission: { ...prev.mission, image: uploadedUrl }
              }));
            } else if (sectionPath === 'vision.image') {
              setContent((prev) => ({
                ...prev,
                vision: { ...prev.vision, image: uploadedUrl }
              }));
            } else if (sectionPath === 'seo.ogImage') {
              setContent((prev) => ({
                ...prev,
                seo: { ...prev.seo, ogImage: uploadedUrl }
              }));
            }
            showNotice('Image uploaded to Cloudinary successfully!');
          } else {
            throw new Error(res.message || 'Cloudinary upload failed');
          }
        } catch (uploadErr) {
          showNotice(uploadErr.message || 'Upload failed', 'error');
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showNotice(err.message || 'File read error', 'error');
      setUploadingImage(false);
    }
  };

  // Pillar Item Helpers
  const handleAddPillar = () => {
    const newPillar = {
      step: (content.pillars?.length || 0) + 1,
      title: 'New Formulation Feature',
      description: 'Describe how this formulation benefit protects surfaces and eliminates germs.',
      icon: 'ShieldCheck',
      isEnabled: true
    };
    setContent((prev) => ({
      ...prev,
      pillars: [...(prev.pillars || []), newPillar]
    }));
  };

  const handleUpdatePillar = (index, field, value) => {
    const updated = [...(content.pillars || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent((prev) => ({ ...prev, pillars: updated }));
  };

  const handleDeletePillar = (index) => {
    const updated = content.pillars.filter((_, i) => i !== index);
    setContent((prev) => ({ ...prev, pillars: updated }));
  };

  // Comparison Item Helpers
  const handleAddCompareItem = () => {
    const newItem = {
      feature: 'New Feature Parameter',
      asmShine: 'Superior Result',
      ordinaryCleaners: 'Inferior Standard'
    };
    setContent((prev) => ({
      ...prev,
      comparison: {
        ...prev.comparison,
        items: [...(prev.comparison?.items || []), newItem]
      }
    }));
  };

  const handleUpdateCompareItem = (index, field, value) => {
    const updated = [...(content.comparison?.items || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent((prev) => ({
      ...prev,
      comparison: { ...prev.comparison, items: updated }
    }));
  };

  const handleDeleteCompareItem = (index) => {
    const updated = content.comparison.items.filter((_, i) => i !== index);
    setContent((prev) => ({
      ...prev,
      comparison: { ...prev.comparison, items: updated }
    }));
  };

  if (loading || !content) {
    return (
      <div className="admin-page-content" style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px auto' }} />
        <span>Loading About Us CMS configuration...</span>
      </div>
    );
  }

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
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-page-title">About Us — Dynamic Content Management</h1>
          <p className="admin-page-subtitle">
            Manage public brand story, mission, vision, scientific pillars, comparison tables, and SEO metadata without touching code.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ExternalLink size={14} />
            <span>View Live Page</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={savingDraft || publishing}
            className="admin-btn admin-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={14} />
            <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || savingDraft}
            className="admin-btn admin-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#059669', borderColor: '#059669' }}
          >
            <Send size={14} />
            <span>{publishing ? 'Publishing...' : 'Publish to Live'}</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: '12px', fontSize: '11.5px' }}>
            <CheckCircle size={13} />
            <span>LIVE: v{publishedVersion}</span>
          </span>
          <span style={{ color: '#64748B' }}>
            Last published: <strong>{publishedAt ? new Date(publishedAt).toLocaleString('en-IN') : 'Recently'}</strong>
          </span>
        </div>
        <span style={{ color: '#475569', fontSize: '12px' }}>
          💡 <em>Changes saved in draft are private until you click "Publish to Live".</em>
        </span>
      </div>

      {/* CMS Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'hero', label: 'Hero & Identity', icon: Sparkles },
          { id: 'story', label: 'Story & Manifesto', icon: FileText },
          { id: 'mission', label: 'Mission & Vision', icon: Layers },
          { id: 'pillars', label: '3 Pillars (Why Us)', icon: ShieldCheck },
          { id: 'comparison', label: 'Comparison Table', icon: Check },
          { id: 'contact', label: 'Showcase & Support', icon: Phone },
          { id: 'seo', label: 'SEO & Social Tags', icon: Globe }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                color: isActive ? '#2563EB' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: HERO & IDENTITY */}
      {/* ========================================================= */}
      {activeTab === 'hero' && (
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              Hero Section &amp; Brand Introduction
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={content.hero?.isVisible !== false}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, isVisible: e.target.checked } })}
                style={{ accentColor: '#2563EB', width: '16px', height: '16px' }}
              />
              <span>Section Visible on Website</span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Brand Name</label>
              <input
                type="text"
                value={content.hero?.brandName || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, brandName: e.target.value } })}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Badge Label</label>
              <input
                type="text"
                value={content.hero?.badge || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="admin-form-label">Main Heading (H1)</label>
              <input
                type="text"
                value={content.hero?.heading || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, heading: e.target.value } })}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="admin-form-label">Sub-Tagline</label>
              <input
                type="text"
                value={content.hero?.tagline || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })}
                className="admin-form-input"
              />
            </div>

            {/* Proof Chips */}
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="admin-form-label">Meta Proof Chips (Comma separated)</label>
              <input
                type="text"
                value={(content.hero?.metaChips || []).join(', ')}
                onChange={(e) => {
                  const chips = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setContent({ ...content, hero: { ...content.hero, metaChips: chips } });
                }}
                placeholder="e.g. 99.9% Certified Germ Kill, 10X Limescale Cutter, Zero Harsh Acid Fumes"
                className="admin-form-input"
              />
            </div>

            {/* Hero Image Management */}
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="admin-form-label">Hero Banner Image (Cloudinary or Local URL)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={content.hero?.image || ''}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, image: e.target.value } })}
                  placeholder="/images/banners/hero_banner_photo.png or https://res.cloudinary.com/..."
                  className="admin-form-input"
                  style={{ flex: 1 }}
                />

                <label
                  className="admin-btn admin-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <Upload size={14} />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, 'hero.image')}
                    style={{ display: 'none' }}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {content.hero?.image && (
                <div style={{ marginTop: '12px', maxWidth: '300px', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={content.hero.image} alt="Hero Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: STORY & MANIFESTO */}
      {/* ========================================================= */}
      {activeTab === 'story' && (
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              The Genesis Story &amp; Brand Purpose
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={content.story?.isVisible !== false}
                onChange={(e) => setContent({ ...content, story: { ...content.story, isVisible: e.target.checked } })}
                style={{ accentColor: '#2563EB', width: '16px', height: '16px' }}
              />
              <span>Section Visible</span>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Category / Purpose Tag</label>
              <input
                type="text"
                value={content.story?.tag || ''}
                onChange={(e) => setContent({ ...content, story: { ...content.story, tag: e.target.value } })}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Story Heading</label>
              <input
                type="text"
                value={content.story?.title || ''}
                onChange={(e) => setContent({ ...content, story: { ...content.story, title: e.target.value } })}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Story Description / Formulation Purpose</label>
              <textarea
                rows={5}
                value={content.story?.description || ''}
                onChange={(e) => setContent({ ...content, story: { ...content.story, description: e.target.value } })}
                className="admin-form-input"
                style={{ lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MISSION & VISION */}
      {/* ========================================================= */}
      {activeTab === 'mission' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Mission Card */}
          <div className="admin-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Mission</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px' }}>
                <input
                  type="checkbox"
                  checked={content.mission?.isVisible !== false}
                  onChange={(e) => setContent({ ...content, mission: { ...content.mission, isVisible: e.target.checked } })}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>Visible</span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Mission Title</label>
                <input
                  type="text"
                  value={content.mission?.title || ''}
                  onChange={(e) => setContent({ ...content, mission: { ...content.mission, title: e.target.value } })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Mission Description</label>
                <textarea
                  rows={4}
                  value={content.mission?.description || ''}
                  onChange={(e) => setContent({ ...content, mission: { ...content.mission, description: e.target.value } })}
                  className="admin-form-input"
                />
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="admin-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Vision</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px' }}>
                <input
                  type="checkbox"
                  checked={content.vision?.isVisible !== false}
                  onChange={(e) => setContent({ ...content, vision: { ...content.vision, isVisible: e.target.checked } })}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>Visible</span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Vision Title</label>
                <input
                  type="text"
                  value={content.vision?.title || ''}
                  onChange={(e) => setContent({ ...content, vision: { ...content.vision, title: e.target.value } })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Vision Description</label>
                <textarea
                  rows={4}
                  value={content.vision?.description || ''}
                  onChange={(e) => setContent({ ...content, vision: { ...content.vision, description: e.target.value } })}
                  className="admin-form-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PILLARS (WHY CHOOSE ASM SHINE) */}
      {/* ========================================================= */}
      {activeTab === 'pillars' && (
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Scientific Pillars &amp; Reasons to Choose ASM Shine
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
                Dynamic formulation pillars explaining active descaling, streak-free polish, and germ kill.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddPillar}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Add Pillar</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(content.pillars || []).map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
                    Pillar #{idx + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={pillar.isEnabled !== false}
                        onChange={(e) => handleUpdatePillar(idx, 'isEnabled', e.target.checked)}
                        style={{ accentColor: '#2563EB' }}
                      />
                      <span>Active</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeletePillar(idx)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '2px' }}
                      title="Delete Pillar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Pillar Title</label>
                    <input
                      type="text"
                      value={pillar.title || ''}
                      onChange={(e) => handleUpdatePillar(idx, 'title', e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Icon Name</label>
                    <select
                      value={pillar.icon || 'ShieldCheck'}
                      onChange={(e) => handleUpdatePillar(idx, 'icon', e.target.value)}
                      className="admin-form-select"
                    >
                      <option value="ShieldCheck">ShieldCheck (Disinfection)</option>
                      <option value="SprayCan">SprayCan (Glass Colin Spray)</option>
                      <option value="Sparkles">Sparkles (Mirror Polish)</option>
                      <option value="Bath">Bath (Tiles &amp; Tubs)</option>
                      <option value="Brush">Brush (Floors)</option>
                      <option value="Utensils">Utensils (Dishwash)</option>
                      <option value="CookingPot">CookingPot (Degreaser)</option>
                      <option value="Award">Award (Certifications)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Pillar Description</label>
                  <textarea
                    rows={2}
                    value={pillar.description || ''}
                    onChange={(e) => handleUpdatePillar(idx, 'description', e.target.value)}
                    className="admin-form-input"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: COMPARISON TABLE */}
      {/* ========================================================= */}
      {activeTab === 'comparison' && (
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                The Verdict — Comparison Table
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
                Side-by-side scientific comparison highlighting ASM Shine performance vs ordinary cleaners.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddCompareItem}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Add Parameter</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(content.comparison?.items || []).map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 2fr auto',
                  gap: '12px',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <label className="admin-form-label" style={{ fontSize: '11px' }}>Feature / Standard</label>
                  <input
                    type="text"
                    value={item.feature || ''}
                    onChange={(e) => handleUpdateCompareItem(idx, 'feature', e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <div>
                  <label className="admin-form-label" style={{ fontSize: '11px', color: '#166534' }}>ASM SHINE Advantage</label>
                  <input
                    type="text"
                    value={item.asmShine || ''}
                    onChange={(e) => handleUpdateCompareItem(idx, 'asmShine', e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <div>
                  <label className="admin-form-label" style={{ fontSize: '11px', color: '#991B1B' }}>Ordinary Cleaners</label>
                  <input
                    type="text"
                    value={item.ordinaryCleaners || ''}
                    onChange={(e) => handleUpdateCompareItem(idx, 'ordinaryCleaners', e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCompareItem(idx)}
                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', marginTop: '16px' }}
                  title="Remove Parameter"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: SHOWCASE & SUPPORT */}
      {/* ========================================================= */}
      {activeTab === 'contact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Products Section Config */}
          <div className="admin-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              Products Showcase Header
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Showcase Heading</label>
                <input
                  type="text"
                  value={content.productShowcase?.heading || ''}
                  onChange={(e) => setContent({ ...content, productShowcase: { ...content.productShowcase, heading: e.target.value } })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Showcase Subtitle Description</label>
                <input
                  type="text"
                  value={content.productShowcase?.description || ''}
                  onChange={(e) => setContent({ ...content, productShowcase: { ...content.productShowcase, description: e.target.value } })}
                  className="admin-form-input"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="admin-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              Customer Concierge &amp; Laboratory Support
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Customer Helpline Phone</label>
                <input
                  type="text"
                  value={content.contact?.helpline || ''}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, helpline: e.target.value } })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Official Support Email</label>
                <input
                  type="email"
                  value={content.contact?.email || ''}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="admin-form-label">Registered Office &amp; Laboratory Address</label>
                <input
                  type="text"
                  value={content.contact?.address || ''}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="admin-form-label">Operating Hours</label>
                <input
                  type="text"
                  value={content.contact?.operatingHours || ''}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, operatingHours: e.target.value } })}
                  className="admin-form-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: SEO & SOCIAL METADATA */}
      {/* ========================================================= */}
      {activeTab === 'seo' && (
        <div className="admin-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
            Search Engine Optimization (SEO) &amp; Open Graph Tags
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '12.5px', color: '#64748B' }}>
            Configures organic Google search results, browser tab title, and WhatsApp/social sharing cards.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">SEO Meta Title (Browser &amp; SERP)</label>
              <input
                type="text"
                value={content.seo?.metaTitle || ''}
                onChange={(e) => setContent({ ...content, seo: { ...content.seo, metaTitle: e.target.value } })}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">SEO Meta Description</label>
              <textarea
                rows={3}
                value={content.seo?.metaDescription || ''}
                onChange={(e) => setContent({ ...content, seo: { ...content.seo, metaDescription: e.target.value } })}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Canonical URL</label>
              <input
                type="text"
                value={content.seo?.canonicalUrl || ''}
                onChange={(e) => setContent({ ...content, seo: { ...content.seo, canonicalUrl: e.target.value } })}
                className="admin-form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Open Graph Title (Facebook / WhatsApp)</label>
                <input
                  type="text"
                  value={content.seo?.ogTitle || ''}
                  onChange={(e) => setContent({ ...content, seo: { ...content.seo, ogTitle: e.target.value } })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Social Share Image URL</label>
                <input
                  type="text"
                  value={content.seo?.ogImage || ''}
                  onChange={(e) => setContent({ ...content, seo: { ...content.seo, ogImage: e.target.value } })}
                  className="admin-form-input"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Keywords (Comma separated)</label>
              <input
                type="text"
                value={(content.seo?.keywords || []).join(', ')}
                onChange={(e) => {
                  const kw = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setContent({ ...content, seo: { ...content.seo, keywords: kw } });
                }}
                className="admin-form-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAboutPage;

