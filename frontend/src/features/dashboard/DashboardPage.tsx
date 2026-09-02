/**
 * OSINET Frontend — Dashboard Page
 * Displays real statistics from Supabase via backend API.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Activity,
  PauseCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../auth/AuthContext';
import type { DashboardStats, Case, AuditLog } from '../../types';
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

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [statsRes, casesRes] = await Promise.allSettled([
          api.get('/cases/stats/dashboard'),
          api.get('/cases?limit=5&page=1'),
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data.data);
        }
        if (casesRes.status === 'fulfilled') {
          setRecentCases(casesRes.value.data.data ?? []);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const timeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            {timeGreeting()}, {profile?.display_name?.split(' ')[0] ?? 'Investigator'}
          </h1>
          <p className="page-subtitle">
            OSINET Investigation Intelligence Network · {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <Link to="/cases/new" className="btn btn-primary" id="dashboard-new-case-btn">
          <FolderOpen size={16} />
          New Case
        </Link>
      </div>

      {error && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-5)' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Cases"
          value={loading ? '—' : String(stats?.total ?? 0)}
          icon={<FolderOpen size={20} />}
          iconClass="primary"
          trend="All investigations"
        />
        <StatCard
          label="Open"
          value={loading ? '—' : String(stats?.open ?? 0)}
          icon={<TrendingUp size={20} />}
          iconClass="success"
          trend="Active cases"
        />
        <StatCard
          label="In Progress"
          value={loading ? '—' : String(stats?.in_progress ?? 0)}
          icon={<Activity size={20} />}
          iconClass="info"
          trend="Under investigation"
        />
        <StatCard
          label="On Hold"
          value={loading ? '—' : String(stats?.on_hold ?? 0)}
          icon={<PauseCircle size={20} />}
          iconClass="warning"
          trend="Pending action"
        />
        <StatCard
          label="Closed"
          value={loading ? '—' : String(stats?.closed ?? 0)}
          icon={<CheckCircle size={20} />}
          iconClass="danger"
          trend="Completed"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Cases */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Cases</div>
              <div className="card-subtitle">Latest investigation activity</div>
            </div>
            <Link to="/cases" className="btn btn-ghost btn-sm">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          ) : recentCases.length === 0 ? (
            <div className="empty-state">
              <FolderOpen className="empty-state-icon" />
              <p className="empty-state-title">No cases yet</p>
              <p className="empty-state-text">
                Create your first investigation case to get started.
              </p>
              <Link to="/cases/new" className="btn btn-primary btn-sm">
                Create Case
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentCases.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.title}</div>
                        {c.client_ref && (
                          <div className="text-xs text-muted">{c.client_ref}</div>
                        )}
                      </td>
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
                      <td className="text-xs text-muted">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </td>
                      <td>
                        <Link
                          to={`/cases/${c.id}`}
                          className="btn btn-ghost btn-sm"
                          id={`case-link-${c.id}`}
                        >
                          Open <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Activity</div>
              <div className="card-subtitle">Recent audit events</div>
            </div>
          </div>

          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <Clock className="empty-state-icon" />
              <p className="empty-state-title">No activity yet</p>
              <p className="empty-state-text">
                Activity will appear here as you use the platform.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {auditLogs.slice(0, 10).map((log) => (
                <ActivityItem key={log.id} log={log} />
              ))}
            </div>
          )}

          {/* Coming soon modules */}
          <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="coming-soon-banner">
              <span className="icon">⚡</span>
              <span><strong>Graph View</strong> — Visual entity correlation is coming in Phase 2</span>
            </div>
            <div className="coming-soon-banner">
              <span className="icon">🔍</span>
              <span><strong>Provider Intelligence</strong> — OSINT enrichment adapters coming in Phase 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  trend?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-card-icon ${iconClass}`}>{icon}</div>
      </div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {trend && <div className="stat-card-trend">{trend}</div>}
    </div>
  );
}

function ActivityItem({ log }: { log: AuditLog }) {
  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-3)',
      padding: 'var(--space-2) 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        width: '6px', height: '6px',
        background: 'var(--color-primary)',
        borderRadius: '50%',
        marginTop: '6px',
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
          {log.action.replace(/_/g, ' ')}
        </div>
        <div className="text-xs text-muted">
          {log.entity_type} · {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
