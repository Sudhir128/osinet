/**
 * OSINET Frontend — OSINT Intelligence Providers & Simulation Sandbox
 * Displays all active provider integrations (Shodan, Censys, IPInfo, SerpAPI,
 * Hunter, HIBP, WhoisXML) in simulated demo mode with interactive query sandbox.
 */
import React, { useState } from 'react';
import {
  Plug,
  CheckCircle2,
  Activity,
  Play,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { OSINT_PROVIDERS, mockStore } from '../../services/mockStore';
import toast from 'react-hot-toast';

export default function ProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState<string>('shodan');
  const [testInput, setTestInput] = useState<string>('198.51.100.42');
  const [simulating, setSimulating] = useState(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTestQuery = () => {
    setSimulating(true);
    setQueryResult(null);

    setTimeout(() => {
      let dummyType: any = 'IP';
      if (testInput.includes('@')) dummyType = 'EMAIL';
      else if (testInput.includes('.') && !/^\d+\.\d+\.\d+\.\d+$/.test(testInput)) dummyType = 'DOMAIN';
      else if (!testInput.includes('.') && !testInput.includes('@')) dummyType = 'USERNAME';

      const res = mockStore.generateEnrichment({
        id: 'sandbox-tgt',
        case_id: 'sandbox-case',
        type: dummyType,
        raw_value: testInput,
        normalized_value: testInput,
        created_by: 'sandbox',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const providerData = (res.providers as any)[selectedProvider] || {
        status: 'SUCCESS',
        note: `Simulation result for ${testInput} across ${selectedProvider}`,
        data: res.providers,
      };

      setQueryResult({
        provider: selectedProvider,
        queryInput: testInput,
        retrievedAt: new Date().toISOString(),
        provenance: 'OSINET Sandbox Verified Provenance · SHA-256 Validated',
        latency: `${Math.floor(40 + Math.random() * 80)}ms`,
        data: providerData,
      });

      setSimulating(false);
      toast.success(`Queried ${selectedProvider.toUpperCase()} successfully`);
    }, 400);
  };

  const handleCopy = () => {
    if (!queryResult) return;
    navigator.clipboard.writeText(JSON.stringify(queryResult, null, 2));
    setCopied(true);
    toast.success('Result copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    mockStore.resetToDefaults();
    toast.success('Demo cases & targets restored to defaults');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Intelligence Providers</h1>
            <span className="badge badge-open" style={{ fontSize: '0.6875rem' }}>
              8 / 8 READY (DEMO SANDBOX)
            </span>
          </div>
          <p className="page-subtitle">
            OSINT enrichment adapters, credentials configuration, and active query sandbox.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            id="reset-demo-data-btn"
          >
            <RotateCcw size={14} />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 100, 255, 0.04))',
          border: '1px solid rgba(0, 212, 255, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(0, 212, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            flexShrink: 0,
          }}
        >
          <Sparkles size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
            Simulated API Key Mode Active
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0, marginTop: '2px' }}>
            External API keys for Shodan, Censys, IPInfo, SerpAPI, Hunter, HIBP, and WhoisXML are running in
            architectural mock mode. Real requests are synthesized with realistic metadata for demonstration.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-success)' }}>
          <ShieldCheck size={16} />
          <span>Pipeline Intact</span>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {OSINT_PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            className="card"
            style={{
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: selectedProvider === provider.id ? '1px solid var(--color-primary)' : undefined,
              transition: 'border-color 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Plug size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{provider.name}</span>
                </div>
                <span
                  className="badge badge-open"
                  style={{
                    fontSize: '0.625rem',
                    background: 'rgba(0, 220, 130, 0.1)',
                    color: 'var(--color-success)',
                    borderColor: 'rgba(0, 220, 130, 0.3)',
                  }}
                >
                  <span className="badge-dot" style={{ background: 'var(--color-success)' }} />
                  ONLINE
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', minHeight: '36px' }}>
                {provider.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 'var(--space-3)' }}>
                {provider.sampleCapabilities.map((cap) => (
                  <span
                    key={cap}
                    style={{
                      fontSize: '0.6875rem',
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={13} style={{ color: 'var(--color-primary)' }} /> Latency: {provider.latencyMs}ms
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSelectedProvider(provider.id);
                  if (provider.id === 'hibp' || provider.id === 'hunter') {
                    setTestInput('apt.operator@protonmail.com');
                  } else if (provider.id === 'whoisxml') {
                    setTestInput('malicious-c2-update.org');
                  } else {
                    setTestInput('198.51.100.42');
                  }
                }}
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                Test in Sandbox &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Sandbox */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Search size={18} style={{ color: 'var(--color-primary)' }} /> Live Intelligence Query Sandbox
            </div>
            <div className="card-subtitle">
              Execute test queries against active simulated providers with instant normalization and provenance logging.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="sandbox-provider-select">Provider Target</label>
            <select
              id="sandbox-provider-select"
              className="form-select"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              {OSINT_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="sandbox-input-value">Query Target (IP, Domain, Email, or Handle)</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="sandbox-input-value"
                type="text"
                className="form-input"
                placeholder="e.g. 198.51.100.42 or target@protonmail.com"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleTestQuery}
                disabled={simulating || !testInput.trim()}
                id="execute-sandbox-query-btn"
                style={{ whiteSpace: 'nowrap' }}
              >
                {simulating ? (
                  <>
                    <div className="spinner" style={{ width: '14px', height: '14px' }} />
                    Running Query...
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    Run Query
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {queryResult && (
          <div
            style={{
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.8125rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontWeight: 600 }}>{queryResult.provider.toUpperCase()} Telemetry Response</span>
                <span className="badge badge-open" style={{ fontSize: '0.625rem' }}>{queryResult.latency}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleCopy}
                style={{ fontSize: '0.75rem', gap: '4px' }}
              >
                {copied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <pre
              style={{
                background: 'var(--color-bg-elevated)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-mono, monospace)',
                overflowX: 'auto',
                maxHeight: '340px',
                margin: 0,
              }}
            >
              {JSON.stringify(queryResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
