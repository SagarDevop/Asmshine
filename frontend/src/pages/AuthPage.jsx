import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

/**
 * Sanitizes redirect destination to prevent open-redirect vulnerabilities
 */
const sanitizeRedirect = (target) => {
  if (!target || typeof target !== 'string') return '/account';
  const trimmed = target.trim();
  // Must start with a single slash and not double slashes or protocol
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('://')) {
    return trimmed;
  }
  return '/account';
};

export const AuthPage = ({ initialTab = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, register } = useAuth();

  const [activeTab, setActiveTab] = useState(
    location.pathname === '/signup' ? 'signup' : initialTab
  );

  // Form inputs (persisted across tab switches)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Target destination
  const from = sanitizeRedirect(location.state?.from?.pathname || location.state?.from || '/account');

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname === '/signup') {
      setActiveTab('signup');
    } else if (location.pathname === '/login') {
      setActiveTab('login');
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessNotice('');
  };

  // -------------------------------------------------------------
  // Login Submit Handler
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Direct Signup Submit Handler (No OTP Verification Barrier)
  // -------------------------------------------------------------
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Google Auth Handler
  // -------------------------------------------------------------
  const handleGoogleSuccess = async (credential) => {
    setErrorMessage('');
    setSubmitting(true);
    try {
      await loginWithGoogle(credential);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = (msg) => {
    setErrorMessage(msg);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="fk-auth-card">
        {/* 1. Flipkart-Style Left Brand Banner */}
        <div className="fk-auth-left-banner">
          <div>
            <div className="fk-auth-banner-brand">
              <img src="/favicon.svg" alt="ASM SHINE Logo" className="fk-auth-banner-logo" />
              <div>
                <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.5px' }}>
                  ASM SHINE
                </span>
                <span style={{ display: 'block', fontSize: '10px', color: '#BAE6FD', fontWeight: 700 }}>
                  HYGIENE &amp; CLEANING
                </span>
              </div>
            </div>

            <h2 className="fk-auth-banner-title">
              {activeTab === 'login' ? 'Login' : "Looks like you're new here!"}
            </h2>
            <p className="fk-auth-banner-desc">
              {activeTab === 'login'
                ? 'Get access to your Orders, Wishlist and Clean Home Hygiene Rituals.'
                : 'Sign up with your email to start shopping for authentic home hygiene essentials.'}
            </p>
          </div>

          <div className="fk-auth-banner-art">
            <div className="fk-auth-trust-pill">
              <ShieldCheck size={14} color="#67E8F9" />
              <span>100% Authentic Formulations</span>
            </div>
            <div className="fk-auth-trust-pill">
              <Sparkles size={14} color="#FDE047" />
              <span>Clean Home Rewards Circle</span>
            </div>
          </div>
        </div>

        {/* 2. Right Form Container */}
        <div className="fk-auth-right-panel">
          {/* Back Link */}
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '16px',
              padding: 0
            }}
            aria-label="Back to store"
          >
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </button>

          {/* Mode Switch Tabs */}
          <div className="fk-auth-tabs">
            <button
              type="button"
              className={`fk-auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => handleTabChange('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`fk-auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => handleTabChange('signup')}
            >
              Create Account
            </button>
          </div>

          {/* Server Error Alert */}
          {errorMessage && (
            <div className="auth-alert-error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div
              className="auth-alert-notice"
              style={{
                backgroundColor: '#ECFDF5',
                borderColor: '#A7F3D0',
                color: '#065F46',
                marginBottom: '14px'
              }}
              role="status"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>{successNotice}</span>
              </div>
            </div>
          )}


          {/* ========================================================= */}
          {/* VIEW A: LOGIN                                             */}
          {/* ========================================================= */}
          {activeTab === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-login-email">
                    Email Address
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-login-email"
                      type="email"
                      className="auth-input"
                      placeholder="Enter Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-login-password">
                    Password
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input has-toggle"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={submitting}
                  id="login-submit-button"
                >
                  {submitting ? 'Signing in...' : 'Sign In'}
                </button>

                {/* Quick Auto-Fill Demo Credentials Helper */}
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px dashed #93C5FD',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#1E40AF', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: 700 }}>Demo Test Account:</span>
                    <div><code>demo@asmshine.com</code> | <code>asmshine123</code></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('demo@asmshine.com');
                      setPassword('asmshine123');
                    }}
                    style={{
                      background: '#2874F0',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Auto-Fill
                  </button>
                </div>
              </form>

              <div className="auth-divider">
                <span>or continue with</span>
              </div>

              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={submitting}
              />

              <p style={{ fontSize: '11.5px', color: '#64748B', textAlign: 'center', marginTop: '18px' }}>
                By continuing, you agree to ASM Shine's{' '}
                <span style={{ color: '#2874F0', cursor: 'pointer' }} onClick={() => navigate('/about')}>
                  Terms of Use
                </span>{' '}
                and Privacy Policy.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW B: SIGNUP (Direct Email & Password Registration)     */}
          {/* ========================================================= */}
          {activeTab === 'signup' && (
            <div>
              <form onSubmit={handleSignupSubmit} className="auth-form" noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-signup-name">
                    Full Name
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-signup-name"
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-signup-email">
                    Email Address
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-signup-email"
                      type="email"
                      className="auth-input"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-signup-password">
                    Set Password
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-signup-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input has-toggle"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-signup-confirm">
                    Confirm Password
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-signup-confirm"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input has-toggle"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={submitting}
                  id="signup-submit-button"
                >
                  {submitting ? 'Creating Account...' : 'Create Account & Sign In'}
                </button>

                <div className="auth-divider">
                  <span>or register with</span>
                </div>

                <GoogleAuthButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={submitting}
                />

                <p style={{ fontSize: '11.5px', color: '#64748B', textAlign: 'center', marginTop: '18px' }}>
                  By creating an account, you agree to ASM Shine's{' '}
                  <span style={{ color: '#2874F0', cursor: 'pointer' }} onClick={() => navigate('/about')}>
                    Terms of Use
                  </span>{' '}
                  and Privacy Policy.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
