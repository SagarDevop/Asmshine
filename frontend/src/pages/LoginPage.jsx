import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Target destination after successful login
  const from = location.state?.from?.pathname || '/account';

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
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

  const handleGoogleSuccess = async (credential) => {
    setErrorMessage('');
    setSubmitting(true);
    try {
      await loginWithGoogle(credential);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = (msg) => {
    setErrorMessage(msg);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
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

        {/* Brand Header */}
        <div className="auth-brand-header">
          <img
            src="/favicon.svg"
            alt="ASM SHINE"
            className="auth-brand-logo"
          />
          <h1 className="auth-title">Welcome to ASM Shine</h1>
          <p className="auth-subtitle">Log in to manage your clean home hygiene account</p>
        </div>

        {/* Server Error Alert */}
        {errorMessage && (
          <div className="auth-alert-error" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google One-Click Auth */}
        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          disabled={submitting}
        />

        <div className="auth-divider">
          <span>or sign in with email</span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleFormSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <input
                id="login-email"
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
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <div className="auth-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input has-toggle"
                placeholder="Enter your password"
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
        </form>

        <div className="auth-switch-prompt">
          <span>New to ASM Shine?</span>
          <Link to="/signup" state={{ from: location.state?.from }} className="auth-switch-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
