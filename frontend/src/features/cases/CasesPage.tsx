/**
 * OSINET Frontend — Cases List Page
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import type { Case, CaseStatus, CasePriority } from '../../types';
import { formatDistanceToNow } from 'date-fns';

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

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | ''>('');
  const [page] = useState(1);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);

      const { data } = await api.get(`/cases?${params.toString()}`);
      setCases(data.data ?? []);
      setTotal(data.meta?.total ?? 0);
    } catch (err) {
      setError('Failed to load cases. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, page]);

  useEffect(() => {
    const timer = setTimeout(fetchCases, 300);
    return () => clearTimeout(timer);
  }, [fetchCases]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Investigation Cases</h1>
          <p className="page-subtitle">
            {total > 0 ? `${total} case${total !== 1 ? 's' : ''} found` : 'Manage your investigations'}
          </p>
        </div>
        <Link to="/cases/new" className="btn btn-primary" id="create-case-btn">
          <Plus size={16} />
          New Case
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            id="cases-search"
            className="form-input search-input"
            placeholder="Search cases by title or ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
          <select
            id="cases-status-filter"
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            id="cases-priority-filter"
            className="form-select"
            style={{ width: 'auto' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as CasePriority | '')}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <button
          onClick={fetchCases}
          className="btn btn-ghost btn-icon"
          title="Refresh"
          id="refresh-cases-btn"
          aria-label="Refresh cases"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Cases Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        ) : cases.length === 0 ? (
          <div className="empty-state">
            <FolderOpen className="empty-state-icon" />
            <p className="empty-state-title">
              {search || statusFilter || priorityFilter ? 'No cases match your filters' : 'No cases yet'}
            </p>
            <p className="empty-state-text">
              {search || statusFilter || priorityFilter
                ? 'Try adjusting your search or filters'
                : 'Create your first investigation case to get started.'}
            </p>
            {!search && !statusFilter && !priorityFilter && (
              <Link to="/cases/new" className="btn btn-primary btn-sm">
                <Plus size={14} />
                Create First Case
              </Link>
            )}
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case Title</th>
                  <th>Client Ref</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Jurisdiction</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/cases/${c.id}`)}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div className="text-xs font-mono text-muted" style={{ marginTop: '2px' }}>
                        {c.id.slice(0, 8)}…
                      </div>
                    </td>
                    <td className="text-sm text-muted">{c.client_ref ?? '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE_CLASS[c.status]}`}>
                        <span className="badge-dot" />
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${PRIORITY_BADGE_CLASS[c.priority]}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="text-sm text-muted">{c.jurisdiction ?? '—'}</td>
                    <td className="text-xs text-muted">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/cases/${c.id}`}
                        className="btn btn-ghost btn-sm"
                        id={`case-row-${c.id}`}
                      >
                        View <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
