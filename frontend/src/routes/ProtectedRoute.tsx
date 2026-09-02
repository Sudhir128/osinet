/**
 * OSINET Frontend — Protected Route Guard
 * Redirects to login if not authenticated.
 * Server-side auth is authoritative; this is a UX convenience only.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="logo-mark">OS</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            OSI<span style={{ color: 'var(--color-primary)' }}>NET</span>
          </span>
        </div>
        <div className="spinner" style={{ width: '24px', height: '24px' }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Loading secure session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
