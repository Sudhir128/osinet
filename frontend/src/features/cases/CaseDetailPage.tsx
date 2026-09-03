/**
 * OSINET Frontend — Case Detail Page
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderOpen,
  Target,
  Plus,
  AlertCircle,
  ChevronRight,
  Edit3,
  Archive,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import type { Case, Target as TargetType } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import AddTargetModal from '../targets/AddTargetModal';
import EnrichmentModal from '../targets/EnrichmentModal';
import toast from 'react-hot-toast';

const STATUS_BADGE_CLASS: Record<string, string> = {
  OPEN: 'badge-open',
  IN_PROGRESS: 'badge-in-progress',
  ON_HOLD: 'badge-on-hold',
  CLOSED: 'badge-closed',
  ARCHIVED: 'badge-archived',
};

const PRIORITY_BADGE_CLASS: Record<string, string> = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
};

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [targets, setTargets] = useState<TargetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedTargetForEnrichment, setSelectedTargetForEnrichment] = useState<TargetType | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchCase();
    fetchTargets();
  }, [id]);

  const fetchCase = async () => {
    try {
      setError(null);
      const { data } = await api.get(`/cases/${id}`);
      setCaseData(data.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) setError('Case not found or you do not have access to it.');
      else setError('Failed to load case details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      setTargetsLoading(true);
      const { data } = await api.get(`/cases/${id}/targets`);
      setTargets(data.data ?? []);
    } catch {
      // Non-fatal
    } finally {
      setTargetsLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!caseData) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/cases/${id}`, { status });
      setCaseData((prev) => prev ? { ...prev, status: status as Case['status'] } : prev);
      toast.success(`Case status updated to ${status.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update case status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTargetAdded = () => {
    setShowAddTarget(false);
    toast.success('Target added successfully');
    fetchTargets();
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div>
        <Link to="/cases" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={14} /> Back to Cases
        </Link>
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error ?? 'Case not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', fontSize: '0.8125rem' }}>
        <Link to="/cases" className="btn btn-ghost btn-sm" id="back-to-cases">
          <ArrowLeft size={14} /> Cases
        </Link>
        <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
        <span style={{ color: 'var(--color-text-muted)' }} className="truncate">{caseData.title}</span>
      </div>

      {/* Case Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <FolderOpen size={20} style={{ color: 'var(--color-primary)' }} />
            <h1 className="page-title" style={{ marginBottom: 0 }}>{caseData.title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span className={`badge ${STATUS_BADGE_CLASS[caseData.status]}`}>
              <span className="badge-dot" />
              {caseData.status.replace('_', ' ')}
            </span>
            <span className={`badge ${PRIORITY_BADGE_CLASS[caseData.priority]}`}>
              {caseData.priority}
            </span>
            {caseData.jurisdiction && (
              <span className="badge" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                {caseData.jurisdiction}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {caseData.status !== 'CLOSED' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleStatusChange('CLOSED')}
              disabled={updatingStatus}
              id="close-case-btn"
            >
              <CheckSquare size={14} />
              Close
            </button>
          )}
          {caseData.status !== 'ARCHIVED' && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleStatusChange('ARCHIVED')}
              disabled={updatingStatus}
              id="archive-case-btn"
            >
              <Archive size={14} />
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Case Metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>Case Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <MetaRow label="Case ID" value={<span className="mono-value">{caseData.id}</span>} />
            {caseData.client_ref && <MetaRow label="Client Ref" value={caseData.client_ref} />}
            <MetaRow label="Owner" value={caseData.owner_id.slice(0, 8) + '…'} />
            <MetaRow label="Created" value={format(new Date(caseData.created_at), 'PPP')} />
            <MetaRow label="Updated" value={formatDistanceToNow(new Date(caseData.updated_at), { addSuffix: true })} />
            {caseData.retention_at && (
              <MetaRow label="Retention" value={format(new Date(caseData.retention_at), 'PPP')} />
            )}
          </div>
        </div>

        {caseData.description && (
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-title" style={{ marginBottom: 'var(--space-3)', fontSize: '0.875rem' }}>Description</div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              {caseData.description}
            </p>
          </div>
        )}
      </div>

      {/* Targets Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Investigation Targets</div>
            <div className="card-subtitle">
              {targets.length} target{targets.length !== 1 ? 's' : ''} · Click to view details
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddTarget(true)}
            id="add-target-btn"
          >
            <Plus size={14} />
            Add Target
          </button>
        </div>

        {targetsLoading ? (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        ) : targets.length === 0 ? (
          <div className="empty-state">
            <Target className="empty-state-icon" />
            <p className="empty-state-title">No targets yet</p>
            <p className="empty-state-text">
              Add investigation targets — persons, emails, domains, IPs, and more.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddTarget(true)}>
              <Plus size={14} /> Add First Target
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Raw Value</th>
                  <th>Normalized Value</th>
                  <th>Notes</th>
                  <th>Added</th>
                  <th>Intelligence</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="target-type-chip">{t.type}</span>
                    </td>
                    <td>
                      <span className="mono-value">{t.raw_value}</span>
                    </td>
                    <td>
                      <span className="mono-value" style={{ color: 'var(--color-primary)' }}>
                        {t.normalized_value}
                      </span>
                    </td>
                    <td className="text-sm text-muted">{t.notes ?? '—'}</td>
                    <td className="text-xs text-muted">
                      {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedTargetForEnrichment(t)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          borderColor: 'var(--color-primary)',
                          color: 'var(--color-primary)',
                        }}
                        title="View simulated intelligence from Shodan, Censys, IPInfo, WhoisXML, HIBP"
                      >
                        <Sparkles size={12} />
                        Enrich (OSINT)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OSINT Enrichment Telemetry Modal */}
      {selectedTargetForEnrichment && (
        <EnrichmentModal
          target={selectedTargetForEnrichment}
          onClose={() => setSelectedTargetForEnrichment(null)}
        />
      )}

      {/* Add Target Modal */}
      {showAddTarget && (
        <AddTargetModal
          caseId={id!}
          onSuccess={handleTargetAdded}
          onCancel={() => setShowAddTarget(false)}
        />
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
