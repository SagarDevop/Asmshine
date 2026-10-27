import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

export const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/account';

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

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
        email: email.trim(),
        password
      });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.');
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
      setErrorMessage(err.message || 'Google registration failed. Please try again.');
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
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Join ASM Shine for member hygiene offers &amp; rewards</p>
        </div>

        {/* Server Error Alert */}
        {errorMessage && (
          <div className="auth-alert-error" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google One-Click Registration */}
        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          disabled={submitting}
        />

        <div className="auth-divider">
          <span>or register with email</span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleFormSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-name">
              Full Name
            </label>
            <div className="auth-input-wrapper">
              <input
                id="signup-name"
                type="text"
                className="auth-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-email">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <input
                id="signup-email"
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
            <label className="auth-label" htmlFor="signup-password">
              Password
            </label>
            <div className="auth-input-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input has-toggle"
                placeholder="Minimum 6 characters"
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
            <label className="auth-label" htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <div className="auth-input-wrapper">
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input has-toggle"
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
            className="auth-submit-btn"
            disabled={submitting}
            id="signup-submit-button"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch-prompt">
          <span>Already have an account?</span>
          <Link to="/login" state={{ from: location.state?.from }} className="auth-switch-link">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
