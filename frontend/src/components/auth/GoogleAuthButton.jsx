import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

// Vector Google "G" Logo
const GoogleLogoSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.9 0 12s.45 3.86 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

/**
 * GoogleAuthButton:
 * Renders official Google Identity Services sign-in.
 * If VITE_GOOGLE_CLIENT_ID is not configured, displays an informative prompt without faking authentication.
 */
export const GoogleAuthButton = ({ onSuccess, onError, disabled = false }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [configNotice, setConfigNotice] = useState(false);

  const handleMissingConfigClick = () => {
    setConfigNotice(true);
  };

  if (!clientId || clientId.trim() === '' || clientId.includes('your_google_client_id_here')) {
    return (
      <div style={{ width: '100%' }}>
        <button
          type="button"
          className="google-signin-btn"
          onClick={handleMissingConfigClick}
          disabled={disabled}
          title="Continue with Google"
        >
          <GoogleLogoSvg />
          <span>Continue with Google</span>
        </button>

        {configNotice && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 14px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#1E40AF',
              lineHeight: '1.4',
              textAlign: 'center'
            }}
          >
            Google Sign-In is currently being set up. Please use <strong>Email &amp; Password</strong> or <strong>Create Account with Email OTP</strong> to continue!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="google-oauth-rendered-wrap">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse && credentialResponse.credential) {
            onSuccess(credentialResponse.credential);
          } else {
            onError('Google did not return a valid credential token.');
          }
        }}
        onError={() => {
          onError('Google Sign-In was cancelled or encountered an error.');
        }}
        useOneTap={false}
        shape="rectangular"
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
      />
    </div>
  );
};
