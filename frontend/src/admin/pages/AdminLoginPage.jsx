import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
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
    return <Navigate to="/admin" replace />;
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090D16', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#FFFFFF', borderRadius: '16px', padding: '36px 32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', color: '#2563EB' }}>
            <Shield size={24} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.025em' }}>
            ASM Shine Operations
          </h1>
          <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
            Restricted access portal for authorized personnel.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '18px', lineHeight: '1.4' }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form-group" style={{ margin: 0 }}>
          <div style={{ marginBottom: '14px' }}>
            <label className="admin-form-label" htmlFor="admin-email">Administrator Email</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: '#94A3B8' }}><Mail size={15} /></span>
              <input
                id="admin-email"
                type="email"
                className="admin-form-input"
                style={{ paddingLeft: '36px' }}
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
              <span style={{ position: 'absolute', left: '12px', color: '#94A3B8' }}><Lock size={15} /></span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-form-input"
                style={{ paddingLeft: '36px', paddingRight: '38px' }}
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
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', height: '42px', justifyContent: 'center', fontSize: '13px', borderRadius: '8px' }}
            disabled={submitting}
          >
            {submitting ? 'Verifying Credentials...' : 'Sign In to Admin Console'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
          >
            <ArrowLeft size={13} />
            <span>Return to Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminLoginPage;
