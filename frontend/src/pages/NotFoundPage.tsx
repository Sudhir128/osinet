/**
 * OSINET Frontend — 404 Not Found Page
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      textAlign: 'center',
      padding: 'var(--space-6)',
    }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-text-muted)', opacity: 0.4, lineHeight: 1 }}>
        404
      </div>
      <Search size={40} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '360px' }}>
          The resource you are looking for does not exist or you do not have access to it.
        </p>
      </div>
      <Link to="/dashboard" className="btn btn-primary">
        <ArrowLeft size={16} />
        Return to Dashboard
      </Link>
    </div>
  );
}
