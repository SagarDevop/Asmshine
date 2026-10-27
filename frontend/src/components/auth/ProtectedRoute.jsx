import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute:
 * Route guard that requires active authentication.
 * Redirects unauthenticated visitors to /login preserving the requested path.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        <div
          className="skeleton-shimmer"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%'
          }}
        />
        <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
          Verifying security credentials...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
