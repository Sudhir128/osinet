/**
 * OSINET Frontend — Target OSINT Intelligence Enrichment Modal
 * Displays simulated intelligence feeds from Shodan, Censys, IPInfo, WhoisXML, HIBP, Hunter, and SerpAPI.
 */
import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Shield,
  Server,
  Globe,
  AlertTriangle,
  Mail,
  Key,
  Database,
  Search,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import type { Target } from '../../types';
import { mockStore, type IntelligenceEnrichment } from '../../services/mockStore';
import toast from 'react-hot-toast';

interface EnrichmentModalProps {
  target: Target;
  onClose: () => void;
}

export default function EnrichmentModal({ target, onClose }: EnrichmentModalProps) {
  const [copied, setCopied] = useState(false);
  const enrichment: IntelligenceEnrichment = mockStore.generateEnrichment(target);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(enrichment, null, 2));
    setCopied(true);
    toast.success('OSINT Telemetry copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const { shodan, censys, ipinfo, whois, hibp, hunter, serpapi } = enrichment.providers;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(9, 13, 20, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-bg-elevated)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="target-type-chip">{target.type}</span>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                {target.normalized_value}
              </h2>
              <span className="badge badge-open" style={{ fontSize: '0.625rem' }}>
                <Sparkles size={11} style={{ marginRight: '3px' }} />
                OSINT ENRICHED
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
              Simulated Intelligence Sandbox · Provenance SHA-256 Validated
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleCopy}
              style={{ fontSize: '0.75rem' }}
            >
              {copied ? <Check size={13} style={{ color: 'var(--color-success)' }} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Export JSON'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {/* Shodan & Censys Network Intelligence */}
          {shodan && (
            <div
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Server size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Shodan Port & Service Intelligence</span>
                </div>
                <span className="badge badge-open" style={{ fontSize: '0.625rem' }}>ONLINE FEED</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Detected Open Ports</span>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {shodan.ports.map((p) => (
                      <span key={p} className="badge badge-high" style={{ fontSize: '0.6875rem', fontFamily: 'monospace' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>ISP / Hosting Provider</span>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '2px' }}>{shodan.isp}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Autonomous System</span>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '2px' }}>{shodan.asn}</div>
                </div>
              </div>

              {shodan.vulns && shodan.vulns.length > 0 && (
                <div style={{ background: 'rgba(255, 71, 87, 0.08)', border: '1px solid rgba(255, 71, 87, 0.2)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <AlertTriangle size={15} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>
                    Correlated Vulnerabilities: {shodan.vulns.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* IPInfo Geolocation */}
          {ipinfo && (
            <div
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Globe size={16} style={{ color: 'var(--color-success)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>IPInfo Telemetry & Routing</span>
                </div>
                <span className="badge badge-open" style={{ fontSize: '0.625rem' }}>GEOLOCATED</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Location</span>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '2px' }}>
                    {ipinfo.city}, {ipinfo.region} ({ipinfo.country})
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Coordinates</span>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '2px', fontFamily: 'monospace' }}>
                    {ipinfo.loc}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Privacy / Threat Flags</span>
                  <div style={{ fontSize: '0.8125rem', marginTop: '2px', display: 'flex', gap: '4px' }}>
                    <span className={`badge ${ipinfo.privacy.hosting ? 'badge-medium' : 'badge-open'}`} style={{ fontSize: '0.625rem' }}>
                      {ipinfo.privacy.hosting ? 'DATACENTER' : 'RESIDENTIAL'}
                    </span>
                    <span className={`badge ${ipinfo.privacy.proxy ? 'badge-high' : 'badge-open'}`} style={{ fontSize: '0.625rem' }}>
                      {ipinfo.privacy.proxy ? 'PROXY: YES' : 'DIRECT'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Censys & WHOIS Domain Registry */}
          {whois && (
            <div
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Database size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>WhoisXML Domain & DNS Telemetry</span>
                </div>
                <span className="badge badge-open" style={{ fontSize: '0.625rem' }}>REGISTRAR DATA</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Registrar</span>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '2px' }}>{whois.registrar}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Registration Date</span>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '2px' }}>
                    {new Date(whois.createdDate).toLocaleDateString()} ({whois.domainAgeDays} days old)
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>DNSSEC & Nameservers</span>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '2px' }}>
                    {whois.dnssec ? 'Enabled' : 'Disabled'} · {whois.nameServers.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HIBP Breach Intelligence */}
          {hibp && (
            <div
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Key size={16} style={{ color: 'var(--color-danger)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Have I Been Pwned Compromised Identity</span>
                </div>
                <span className="badge badge-critical" style={{ fontSize: '0.625rem' }}>
                  {hibp.pwnedCount} BREACHES DETECTED
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {hibp.breaches.map((b) => (
                  <div
                    key={b.title}
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{b.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Breach Date: {b.breachDate}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {b.dataClasses.map((dc) => (
                        <span key={dc} className="badge badge-medium" style={{ fontSize: '0.6875rem' }}>
                          {dc}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hunter.io Email Directory */}
          {hunter && (
            <div
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Mail size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Hunter.io Domain Directory</span>
                </div>
                <span className="badge badge-open" style={{ fontSize: '0.625rem' }}>
                  {hunter.deliverabilityScore}% DELIVERABILITY
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Detected Pattern</span>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '2px', fontFamily: 'monospace' }}>
                    {hunter.pattern}@{hunter.domain}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Related Discovered Addresses</span>
                  <div style={{ fontSize: '0.75rem', marginTop: '2px', color: 'var(--color-text-secondary)' }}>
                    {hunter.associatedEmails.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SerpAPI Open Web Footprint */}
          {serpapi && (
            <div
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Search size={16} style={{ color: 'var(--color-info)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>SerpAPI Web Dorks & Leaks Footprint</span>
                </div>
                <span className="badge badge-open" style={{ fontSize: '0.625rem' }}>
                  {serpapi.dorksFound} CORRELATIONS
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {serpapi.findings.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{f.source}</span>
                      <span className={`badge ${f.confidence === 'HIGH' ? 'badge-high' : 'badge-medium'}`} style={{ fontSize: '0.625rem' }}>
                        {f.confidence} CONFIDENCE
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, marginTop: '4px' }}>
                      {f.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-bg-elevated)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>Provenance: {enrichment.provenance}</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
