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
  const {
    login,
    loginWithGoogle,
    sendLoginOtp,
    verifyLoginOtp,
    resendLoginOtp,
    sendSignupOtp,
    verifySignupOtp,
    resendSignupOtp,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword,
    resendForgotPasswordOtp
  } = useAuth();

  const [activeTab, setActiveTab] = useState(
    location.pathname === '/signup'
      ? 'signup'
      : location.pathname === '/forgot-password'
      ? 'forgot'
      : initialTab
  );

  // Form inputs (persisted across tab switches)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login flow state ('OTP' vs 'PASSWORD')
  const [loginMethod, setLoginMethod] = useState('OTP'); // 'OTP' | 'PASSWORD'
  const [loginStep, setLoginStep] = useState('FORM'); // 'FORM' | 'OTP'
  const [loginOtp, setLoginOtp] = useState('');
  const [loginCooldown, setLoginCooldown] = useState(0);

  // Signup flow state
  const [signupStep, setSignupStep] = useState('FORM'); // 'FORM' | 'OTP'
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Forgot Password flow state
  const [forgotStep, setForgotStep] = useState('EMAIL'); // 'EMAIL' | 'RESET'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);

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
    } else if (location.pathname === '/forgot-password') {
      setActiveTab('forgot');
    }
  }, [location.pathname]);

  // Signup OTP cooldown ticker (60s)
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Login OTP cooldown ticker (60s)
  useEffect(() => {
    if (loginCooldown <= 0) return;
    const interval = setInterval(() => {
      setLoginCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [loginCooldown]);

  // Forgot Password cooldown ticker (60s)
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const interval = setInterval(() => {
      setForgotCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [forgotCooldown]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessNotice('');
    setLoginStep('FORM');
    setSignupStep('FORM');
    setForgotStep('EMAIL');
    setOtp('');
    setLoginOtp('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // -------------------------------------------------------------
  // Login: Password Submit Handler
  // -------------------------------------------------------------
  const handlePasswordLoginSubmit = async (e) => {
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
  // Login: Send Email OTP Handler
  // -------------------------------------------------------------
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendLoginOtp({ email: email.trim().toLowerCase() });
      setLoginStep('OTP');
      setLoginCooldown(60);
      if (res && res.devOtp) {
        setSuccessNotice(`Login code sent! (Dev Code: ${res.devOtp})`);
      } else {
        setSuccessNotice(res?.message || `A 6-digit login code has been sent to ${email.trim()}`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send login code. Please check your email or click Create Account.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Login: Verify Email OTP Handler
  // -------------------------------------------------------------
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanOtp = loginOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyLoginOtp({
        email: email.trim().toLowerCase(),
        otp: cleanOtp
      });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Login: Resend Email OTP Handler
  // -------------------------------------------------------------
  const handleResendLoginOtp = async () => {
    if (loginCooldown > 0) return;
    setErrorMessage('');
    setSuccessNotice('');
    setSubmitting(true);
    try {
      const res = await resendLoginOtp(email.trim().toLowerCase());
      setLoginCooldown(60);
      if (res && res.devOtp) {
        setSuccessNotice(`Fresh login code sent! (Dev Code: ${res.devOtp})`);
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
  // Forgot Password: Send Reset Code Handler
  // -------------------------------------------------------------
  const handleSendForgotPasswordOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const targetEmail = (forgotEmail || email).trim().toLowerCase();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendForgotPasswordOtp({ email: targetEmail });
      setForgotEmail(targetEmail);
      setForgotStep('RESET');
      setForgotCooldown(60);
      if (res && res.devOtp) {
        setSuccessNotice(`Password reset code sent! (Dev Code: ${res.devOtp})`);
      } else {
        setSuccessNotice(res?.message || `A 6-digit reset code has been sent to ${targetEmail}`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'No registered account found with this email.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Forgot Password: Submit New Password Handler
  // -------------------------------------------------------------
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanOtp = forgotOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match. Please verify both fields.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        otp: cleanOtp,
        newPassword
      });
      // User is now logged in! Navigate to destination
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password. Please check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Forgot Password: Resend Code Handler
  // -------------------------------------------------------------
  const handleResendForgotPasswordOtp = async () => {
    if (forgotCooldown > 0) return;
    setErrorMessage('');
    setSuccessNotice('');
    setSubmitting(true);
    try {
      const res = await resendForgotPasswordOtp(forgotEmail.trim().toLowerCase());
      setForgotCooldown(60);
      if (res && res.devOtp) {
        setSuccessNotice(`Fresh reset code sent! (Dev Code: ${res.devOtp})`);
      } else {
        setSuccessNotice(res?.message || 'A fresh reset code has been sent to your email.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend reset code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Signup: Step 1 Send Registration OTP Handler
  // -------------------------------------------------------------
  const handleSendSignupOtp = async (e) => {
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
        setSuccessNotice(`Verification code sent! (Dev Code: ${res.devOtp})`);
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
  // Signup: Step 2 Verify Registration OTP Handler
  // -------------------------------------------------------------
  const handleVerifySignupOtp = async (e) => {
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
  // Signup: Resend Registration OTP
  // -------------------------------------------------------------
  const handleResendSignupOtp = async () => {
    if (cooldown > 0) return;
    setErrorMessage('');
    setSuccessNotice('');
    setSubmitting(true);
    try {
      const res = await resendSignupOtp(email.trim().toLowerCase());
      setCooldown(60);
      if (res && res.devOtp) {
        setSuccessNotice(`Fresh verification code sent! (Dev Code: ${res.devOtp})`);
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

  const isOtpScreen = (activeTab === 'login' && loginStep === 'OTP') || (activeTab === 'signup' && signupStep === 'OTP') || activeTab === 'forgot';

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
              {activeTab === 'forgot'
                ? forgotStep === 'RESET'
                  ? 'Set New Password'
                  : 'Reset Password'
                : activeTab === 'login'
                ? loginStep === 'OTP'
                  ? 'Verify your email'
                  : 'Welcome back'
                : signupStep === 'OTP'
                ? 'Verify your email'
                : 'Create an account'}
            </h1>
            <p className="minimal-auth-subtitle">
              {activeTab === 'forgot'
                ? forgotStep === 'RESET'
                  ? `Enter the 6-digit reset code sent to ${forgotEmail} and choose a new password.`
                  : 'Enter your email to receive a secure 6-digit password reset code.'
                : activeTab === 'login'
                ? loginStep === 'OTP'
                  ? `Enter the 6-digit login verification code sent to ${email}`
                  : loginMethod === 'OTP'
                  ? 'Sign in instantly with a 6-digit verification code.'
                  : 'Sign in to access your orders, wishlist, and rewards.'
                : signupStep === 'OTP'
                ? `Enter the 6-digit registration code sent to ${email}`
                : 'Enter your details to get started with ASM Shine.'}
            </p>
          </div>

          {/* Mode Switch Tabs (Hidden on OTP verification screen and Forgot Password view) */}
          {activeTab === 'forgot' ? (
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#1C8E8F',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          ) : !isOtpScreen ? (
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
          ) : null}

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

          {/* ========================================================= */}
          {/* VIEW A: LOGIN (Step 1: FORM) */}
          {/* ========================================================= */}
          {activeTab === 'login' && loginStep === 'FORM' && (
            <div>
              {/* Method Switch: Email OTP vs Password */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('OTP'); setErrorMessage(''); }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    fontWeight: loginMethod === 'OTP' ? 700 : 500,
                    color: loginMethod === 'OTP' ? '#1E293B' : '#64748B',
                    background: loginMethod === 'OTP' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    boxShadow: loginMethod === 'OTP' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Mail size={14} />
                    <span>Email OTP</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('PASSWORD'); setErrorMessage(''); }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    fontWeight: loginMethod === 'PASSWORD' ? 700 : 500,
                    color: loginMethod === 'PASSWORD' ? '#1E293B' : '#64748B',
                    background: loginMethod === 'PASSWORD' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    boxShadow: loginMethod === 'PASSWORD' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Lock size={14} />
                    <span>Password</span>
                  </span>
                </button>
              </div>

              {/* Login Method: Email OTP */}
              {loginMethod === 'OTP' ? (
                <form onSubmit={handleSendLoginOtp} className="minimal-form" noValidate>
                  <div className="minimal-field">
                    <label className="minimal-label" htmlFor="auth-login-otp-email">
                      Email Address
                    </label>
                    <div className="minimal-input-wrap">
                      <span className="minimal-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        id="auth-login-otp-email"
                        type="email"
                        className="minimal-input"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="minimal-submit-btn"
                    disabled={submitting || !email.trim()}
                    id="login-send-otp-button"
                  >
                    {submitting ? 'Sending Verification Code...' : 'Send Verification Code'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setActiveTab('forgot');
                        setForgotStep('EMAIL');
                        setErrorMessage('');
                        setSuccessNotice('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Forgot your password? <strong style={{ color: '#1C8E8F' }}>Reset Password</strong>
                    </button>
                  </div>
                </form>
              ) : (
                /* Login Method: Password */
                <form onSubmit={handlePasswordLoginSubmit} className="minimal-form" noValidate>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="minimal-label" htmlFor="auth-login-password">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setActiveTab('forgot');
                          setForgotStep('EMAIL');
                          setErrorMessage('');
                          setSuccessNotice('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1C8E8F',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
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
              )}

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

          {/* ========================================================= */}
          {/* VIEW B: LOGIN (Step 2: OTP Verification) */}
          {/* ========================================================= */}
          {activeTab === 'login' && loginStep === 'OTP' && (
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
                      setLoginStep('FORM');
                      setLoginOtp('');
                      setErrorMessage('');
                    }}
                    className="minimal-otp-edit-email"
                  >
                    Change
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerifyLoginOtp} className="minimal-form" noValidate>
                <div className="minimal-field">
                  <label className="minimal-label" htmlFor="auth-login-otp-input" style={{ textAlign: 'center' }}>
                    Enter 6-Digit Login Code
                  </label>
                  <input
                    id="auth-login-otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="minimal-otp-input"
                    placeholder="••••••"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="minimal-otp-row">
                  <span>Didn't receive code?</span>
                  {loginCooldown > 0 ? (
                    <span style={{ color: '#94A3B8', fontWeight: 600 }}>Resend in {loginCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      className="minimal-otp-resend"
                      onClick={handleResendLoginOtp}
                      disabled={submitting}
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="minimal-submit-btn"
                  disabled={submitting || loginOtp.trim().length !== 6}
                  id="login-verify-otp-button"
                >
                  {submitting ? 'Verifying & Signing In...' : 'Verify & Sign In'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('FORM');
                      setLoginMethod('PASSWORD');
                      setErrorMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Sign in with password instead
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW C: SIGNUP (Step 1: FORM) */}
          {/* ========================================================= */}
          {activeTab === 'signup' && signupStep === 'FORM' && (
            <div>
              <form onSubmit={handleSendSignupOtp} className="minimal-form" noValidate>
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

          {/* ========================================================= */}
          {/* VIEW D: SIGNUP (Step 2: OTP Verification) */}
          {/* ========================================================= */}
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

              <form onSubmit={handleVerifySignupOtp} className="minimal-form" noValidate>
                <div className="minimal-field">
                  <label className="minimal-label" htmlFor="auth-otp-input" style={{ textAlign: 'center' }}>
                    Enter 6-Digit Registration Code
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
                      onClick={handleResendSignupOtp}
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

          {/* ========================================================= */}
          {/* VIEW E: FORGOT PASSWORD */}
          {/* ========================================================= */}
          {activeTab === 'forgot' && (
            <div>
              {forgotStep === 'EMAIL' ? (
                /* Step 1: Enter Email */
                <form onSubmit={handleSendForgotPasswordOtp} className="minimal-form" noValidate>
                  <div className="minimal-field">
                    <label className="minimal-label" htmlFor="auth-forgot-email">
                      Registered Email Address
                    </label>
                    <div className="minimal-input-wrap">
                      <span className="minimal-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        id="auth-forgot-email"
                        type="email"
                        className="minimal-input"
                        placeholder="Enter your registered email address"
                        value={forgotEmail || email}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setEmail(e.target.value);
                        }}
                        autoComplete="email"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="minimal-submit-btn"
                    disabled={submitting || !(forgotEmail || email).trim()}
                    id="forgot-send-otp-button"
                  >
                    {submitting ? 'Sending Reset Code...' : 'Send Reset Code'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => handleTabChange('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      Remember your password? <strong style={{ color: '#1C8E8F' }}>Sign In</strong>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Enter 6-digit Code & New Password */
                <div className="minimal-otp-panel">
                  <div className="minimal-otp-card-header">
                    <div className="minimal-otp-badge">
                      <Mail size={22} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>{forgotEmail}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep('EMAIL');
                          setForgotOtp('');
                          setErrorMessage('');
                        }}
                        className="minimal-otp-edit-email"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleResetPasswordSubmit} className="minimal-form" noValidate>
                    <div className="minimal-field">
                      <label className="minimal-label" htmlFor="auth-forgot-otp-input" style={{ textAlign: 'center' }}>
                        Enter 6-Digit Password Reset Code
                      </label>
                      <input
                        id="auth-forgot-otp-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        className="minimal-otp-input"
                        placeholder="••••••"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        autoFocus
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="minimal-otp-row">
                      <span>Didn't receive code?</span>
                      {forgotCooldown > 0 ? (
                        <span style={{ color: '#94A3B8', fontWeight: 600 }}>Resend in {forgotCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          className="minimal-otp-resend"
                          onClick={handleResendForgotPasswordOtp}
                          disabled={submitting}
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <div className="minimal-field" style={{ marginTop: '14px' }}>
                      <label className="minimal-label" htmlFor="auth-forgot-new-password">
                        New Password
                      </label>
                      <div className="minimal-input-wrap">
                        <span className="minimal-input-icon">
                          <Lock size={16} />
                        </span>
                        <input
                          id="auth-forgot-new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          className="minimal-input has-toggle"
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                          disabled={submitting}
                        />
                        <button
                          type="button"
                          className="minimal-toggle-btn"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="minimal-field">
                      <label className="minimal-label" htmlFor="auth-forgot-confirm-password">
                        Confirm New Password
                      </label>
                      <div className="minimal-input-wrap">
                        <span className="minimal-input-icon">
                          <Lock size={16} />
                        </span>
                        <input
                          id="auth-forgot-confirm-password"
                          type={showNewPassword ? 'text' : 'password'}
                          className="minimal-input has-toggle"
                          placeholder="Re-enter new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="minimal-submit-btn"
                      disabled={submitting || forgotOtp.trim().length !== 6 || !newPassword || !confirmNewPassword}
                      id="forgot-reset-submit-button"
                    >
                      {submitting ? 'Resetting Password...' : 'Reset Password & Sign In'}
                    </button>
                  </form>
                </div>
              )}
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
