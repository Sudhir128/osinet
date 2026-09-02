/**
 * OSINET Frontend — Coming Soon Page
 */
import React from 'react';
import { Construction } from 'lucide-react';

interface Props {
  title: string;
  phase?: string;
  description?: string;
}

export default function ComingSoonPage({ title, phase = 'Phase 2', description }: Props) {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{title}</h1>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
        <Construction size={48} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-4)', opacity: 0.7 }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          Coming in {phase}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto var(--space-5)' }}>
          {description ?? `The ${title} module is planned for ${phase} of OSINET development. The architecture is designed to support it without major rewrites.`}
        </p>
        <div className="coming-soon-banner" style={{ display: 'inline-flex', justifyContent: 'center' }}>
          <span className="icon">🔧</span>
          <span>Foundation architecture ready · Implementation pending</span>
        </div>
      </div>
    </div>
  );
}
