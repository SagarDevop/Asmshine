import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  Lock,
  RotateCcw,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Mail,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import { DEFAULT_POLICIES } from '../data/defaultPolicies';

const policyIcons = {
  terms_and_conditions: FileText,
  privacy_policy: Lock,
  refund_policy: RotateCcw
};

const policyRoutes = [
  { id: 'terms_and_conditions', label: 'Terms & Conditions', path: '/terms-and-conditions' },
  { id: 'privacy_policy', label: 'Privacy Policy', path: '/privacy-policy' },
  { id: 'refund_policy', label: 'Refund & Return Policy', path: '/refund-policy' }
];

export const LegalPolicyPage = ({ policyType, fallbackTitle }) => {
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const IconComponent = policyIcons[policyType] || Shield;

  useEffect(() => {
    let isMounted = true;
    const fetchPolicy = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getPublicPolicy(policyType);
        if (isMounted && res.success && res.data) {
          setPolicy(res.data);
        }
      } catch (err) {
        console.warn(`[LegalPolicy] Live fetch failed for ${policyType}, using approved offline draft:`, err.message);
        if (isMounted) {
          // Use approved default fallback policy so page never fails to display
          setPolicy({
            policyType,
            title: DEFAULT_POLICIES[policyType]?.title || fallbackTitle,
            version: DEFAULT_POLICIES[policyType]?.version || '1.0',
            content: DEFAULT_POLICIES[policyType]?.content || '',
            publishedAt: new Date(),
            effectiveDate: new Date()
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPolicy();
    return () => {
      isMounted = false;
    };
  }, [policyType, fallbackTitle]);

  const activePolicy = policy || {
    title: fallbackTitle,
    version: '1.0',
    content: DEFAULT_POLICIES[policyType]?.content || ''
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'January 1, 2026';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="legal-policy-page-wrap" style={{ minHeight: '80vh', backgroundColor: '#F8FAFC', padding: '24px 16px 60px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <Link to="/" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <ChevronRight size={13} color="#94A3B8" />
            <span>Legal</span>
            <ChevronRight size={13} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 700 }}>{activePolicy.title}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Print Policy"
            >
              <Printer size={14} />
              <span>Print Policy</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Policy Tab Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {policyRoutes.map((tab) => {
            const isActive = tab.id === policyType;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  border: isActive ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                  background: isActive ? '#EFF6FF' : '#FFFFFF',
                  color: isActive ? '#1D4ED8' : '#64748B',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Main Document Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
            overflow: 'hidden'
          }}
        >
          {/* Document Header Banner */}
          <div
            style={{
              padding: '28px 32px',
              borderBottom: '1px solid #E2E8F0',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB'
                }}
              >
                <IconComponent size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  {activePolicy.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '12px' }}>
                    <CheckCircle2 size={12} />
                    <span>Official Verified Policy</span>
                  </span>
                  <span>Version <strong>{activePolicy.version || '1.0'}</strong></span>
                  <span>•</span>
                  <span>Effective Date: <strong>{formatDate(activePolicy.effectiveDate || activePolicy.publishedAt)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Content Body */}
          <div style={{ padding: '36px 32px' }}>
            {loading && !policy ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
                <p style={{ color: '#64748B', fontSize: '13px' }}>Loading official policy publication...</p>
              </div>
            ) : (
              <div
                className="legal-content-prose"
                style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#334155'
                }}
              >
                {/* Clean formatted text rendering */}
                {activePolicy.content.split('\n\n').map((paragraph, idx) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  // Heading Level 1
                  if (trimmed.startsWith('# ')) {
                    return null; // Already rendered in top card banner
                  }

                  // Heading Level 3 / 4
                  if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
                    const headingText = trimmed.replace(/^###* /, '');
                    return (
                      <h2
                        key={idx}
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#0F172A',
                          marginTop: '28px',
                          marginBottom: '10px',
                          letterSpacing: '-0.01em',
                          borderBottom: '1px solid #F1F5F9',
                          paddingBottom: '6px'
                        }}
                      >
                        {headingText}
                      </h2>
                    );
                  }

                  // Horizontal separator
                  if (trimmed === '---') {
                    return <hr key={idx} style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '24px 0' }} />;
                  }

                  // Bullet lists
                  if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
                    const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- '));
                    return (
                      <ul key={idx} style={{ paddingLeft: '22px', margin: '8px 0 16px 0' }}>
                        {items.map((it, i) => (
                          <li key={i} style={{ marginBottom: '6px' }}>
                            {it.replace(/^- /, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  // Standard Paragraph
                  return (
                    <p key={idx} style={{ margin: '0 0 14px 0' }}>
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          {/* Document Footer Note */}
          <div
            style={{
              padding: '18px 32px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12.5px',
              color: '#64748B'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="#2563EB" />
              <span>ASM Shine Legal Operations &amp; Consumer Protection Compliance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} />
              <span>Questions? Email: <strong>support@asmshine.com</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LegalPolicyPage;

