import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, Mail, Lock, User } from 'lucide-react';
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
  const { login, loginWithGoogle, sendSignupOtp, verifySignupOtp, resendSignupOtp } = useAuth();

  const [activeTab, setActiveTab] = useState(
    location.pathname === '/signup' ? 'signup' : initialTab
  );

  // Form inputs (persisted across tab switches)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Signup state
  const [signupStep, setSignupStep] = useState('FORM'); // 'FORM' | 'OTP'
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

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

  // 60-second OTP cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessNotice('');
    if (tab === 'login') {
      setSignupStep('FORM');
      setOtp('');
    }
  };

  // -------------------------------------------------------------
  // Login Submit Handler (Email & Password)
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
  // Step 1: Send Registration OTP Handler
  // -------------------------------------------------------------
  const handleSendOtpSubmit = async (e) => {
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
      const res = await sendSignupOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });
      setSignupStep('OTP');
      setCooldown(60);
      if (res && res.devOtp) {
        setSuccessNotice(`Verification code sent! (Dev OTP: ${res.devOtp})`);
      } else {
        setSuccessNotice(res?.message || `A 6-digit verification code has been sent to ${email.trim()}`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Step 2: Verify Registration OTP Handler
  // -------------------------------------------------------------
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    try {
      await verifySignupOtp({
        email: email.trim().toLowerCase(),
        otp: cleanOtp
      });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code. Please request a new code.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Resend OTP Code
  // -------------------------------------------------------------
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setErrorMessage('');
    setSuccessNotice('');
    setSubmitting(true);
    try {
      const res = await resendSignupOtp(email.trim().toLowerCase());
      setCooldown(60);
      if (res && res.devOtp) {
        setSuccessNotice(`Fresh verification code sent! (Dev OTP: ${res.devOtp})`);
      } else {
        setSuccessNotice(res?.message || 'A fresh verification code has been sent to your email.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again.');
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
    <div className="minimal-auth-page">
      <div className="minimal-auth-glow-top" />

      <div className="minimal-auth-container">
        {/* Top Navigation */}
        <div className="minimal-auth-top-nav">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="minimal-auth-back-btn"
            aria-label="Back to store"
          >
            <ArrowLeft size={15} />
            <span>Back to Store</span>
          </button>
          <div className="minimal-auth-brand-pill">
            <Sparkles size={13} />
            <span>Pure Home Hygiene</span>
          </div>
        </div>

        {/* Floating Card */}
        <div className="minimal-auth-card">
          {/* Header */}
          <div className="minimal-auth-header">
            <div className="minimal-auth-logo-badge">
              <img src="/favicon.svg" alt="ASM Shine" className="minimal-auth-logo-img" />
            </div>
            <h1 className="minimal-auth-title">
              {activeTab === 'login'
                ? 'Welcome back'
                : signupStep === 'OTP'
                ? 'Verify your email'
                : 'Create an account'}
            </h1>
            <p className="minimal-auth-subtitle">
              {activeTab === 'login'
                ? 'Sign in to access your orders, wishlist, and rewards.'
                : signupStep === 'OTP'
                ? `Enter the 6-digit verification code sent to ${email}`
                : 'Enter your details to get started with ASM Shine.'}
            </p>
          </div>

          {/* Mode Switch Tabs (Hidden on OTP screen) */}
          {signupStep !== 'OTP' && (
            <div className="minimal-auth-tabs">
              <button
                type="button"
                className={`minimal-auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => handleTabChange('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`minimal-auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => handleTabChange('signup')}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="minimal-auth-alert error" role="alert">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="minimal-auth-alert success" role="status">
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{successNotice}</span>
            </div>
          )}

          {/* VIEW A: LOGIN */}
          {activeTab === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="minimal-form" noValidate>
                <div className="minimal-field">
                  <label className="minimal-label" htmlFor="auth-login-email">
                    Email Address
                  </label>
                  <div className="minimal-input-wrap">
                    <span className="minimal-input-icon">
                      <Mail size={16} />
                    </span>
                    <input
                      id="auth-login-email"
                      type="email"
                      className="minimal-input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="minimal-field">
                  <label className="minimal-label" htmlFor="auth-login-password">
                    Password
                  </label>
                  <div className="minimal-input-wrap">
                    <span className="minimal-input-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      id="auth-login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="minimal-input has-toggle"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="minimal-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="minimal-submit-btn"
                  disabled={submitting}
                  id="login-submit-button"
                >
                  {submitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="minimal-divider">
                <span>or continue with</span>
              </div>

              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={submitting}
              />
            </div>
          )}

          {/* VIEW B: SIGNUP (Form Step 1) */}
          {activeTab === 'signup' && signupStep === 'FORM' && (
            <div>
              <form onSubmit={handleSendOtpSubmit} className="minimal-form" noValidate>
                <div className="minimal-field">
                  <label className="minimal-label" htmlFor="auth-signup-name">
                    Full Name
                  </label>
                  <div className="minimal-input-wrap">
                    <span className="minimal-input-icon">
                      <User size={16} />
                    </span>
                    <input
                      id="auth-signup-name"
                      type="text"
                      className="minimal-input"
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="minimal-field">
                  <label className="minimal-label" htmlFor="auth-signup-email">
                    Email Address
                  </label>
                  <div className="minimal-input-wrap">
                    <span className="minimal-input-icon">
                      <Mail size={16} />
                    </span>
                    <input
                      id="auth-signup-email"
                      type="email"
                      className="minimal-input"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="minimal-field">
                  <label className="minimal-label" htmlFor="auth-signup-password">
                    Set Password
                  </label>
                  <div className="minimal-input-wrap">
                    <span className="minimal-input-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      id="auth-signup-password"
                      type={showPassword ? 'text' : 'password'}
                      className="minimal-input has-toggle"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="minimal-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="minimal-field">
                  <label className="minimal-label" htmlFor="auth-signup-confirm">
                    Confirm Password
                  </label>
                  <div className="minimal-input-wrap">
                    <span className="minimal-input-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      id="auth-signup-confirm"
                      type={showPassword ? 'text' : 'password'}
                      className="minimal-input has-toggle"
                      placeholder="Re-enter your password"
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
                  className="minimal-submit-btn"
                  disabled={submitting}
                  id="signup-send-otp-button"
                >
                  {submitting ? 'Sending Verification Code...' : 'Send Verification Code'}
                </button>
              </form>

              <div className="minimal-divider">
                <span>or register with</span>
              </div>

              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={submitting}
              />
            </div>
          )}

          {/* VIEW C: SIGNUP (OTP Step 2) */}
          {activeTab === 'signup' && signupStep === 'OTP' && (
            <div className="minimal-otp-panel">
              <div className="minimal-otp-card-header">
                <div className="minimal-otp-badge">
                  <Mail size={22} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSignupStep('FORM');
                      setOtp('');
                      setErrorMessage('');
                    }}
                    className="minimal-otp-edit-email"
                  >
                    Change
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="minimal-form" noValidate>
                <div className="minimal-field">
                  <label className="minimal-label" htmlFor="auth-otp-input" style={{ textAlign: 'center' }}>
                    Enter 6-Digit Code
                  </label>
                  <input
                    id="auth-otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="minimal-otp-input"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="minimal-otp-row">
                  <span>Didn't receive code?</span>
                  {cooldown > 0 ? (
                    <span style={{ color: '#94A3B8', fontWeight: 600 }}>Resend in {cooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      className="minimal-otp-resend"
                      onClick={handleResendOtp}
                      disabled={submitting}
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="minimal-submit-btn"
                  disabled={submitting || otp.trim().length !== 6}
                  id="signup-verify-otp-button"
                >
                  {submitting ? 'Verifying & Creating Account...' : 'Verify & Create Account'}
                </button>
              </form>
            </div>
          )}

          {/* Footer & Trust Badges */}
          <div className="minimal-auth-footer">
            <div className="minimal-auth-trust">
              <ShieldCheck size={14} color="#059669" />
              <span>256-Bit SSL Secured • 100% Authentic Home Hygiene</span>
            </div>
            <p className="minimal-auth-terms">
              By continuing, you agree to ASM Shine's{' '}
              <button type="button" onClick={() => navigate('/about')} className="minimal-link">
                Terms of Use
              </button>{' '}
              &amp;{' '}
              <button type="button" onClick={() => navigate('/about')} className="minimal-link">
                Privacy Policy
              </button>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
