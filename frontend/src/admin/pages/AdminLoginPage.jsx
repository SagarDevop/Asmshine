import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../styles/admin.css';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  if (isAuthenticated) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your administrator email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials. Access restricted to authorized personnel.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#FFFFFF', borderRadius: '20px', padding: '36px 32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', color: '#2563EB' }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.4px' }}>
            SM Shine Admin Console
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Restricted access portal for authorized operations &amp; inventory staff.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '18px', lineHeight: '1.4' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form-group" style={{ margin: 0 }}>
          <div style={{ marginBottom: '14px' }}>
            <label className="admin-form-label" htmlFor="admin-email">Administrator Email</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: '#94A3B8' }}><Mail size={16} /></span>
              <input
                id="admin-email"
                type="email"
                className="admin-form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="admin@asmshine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="admin-form-label" htmlFor="admin-password">Secure Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: '#94A3B8' }}><Lock size={16} /></span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', height: '46px', justifyContent: 'center', fontSize: '14px', borderRadius: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Verifying Security Clearance...' : 'Sign In to Operations Console'}
          </button>
        </form>

        <div style={{ marginTop: '22px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '12.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
          >
            <ArrowLeft size={14} />
            <span>Return to Customer Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
