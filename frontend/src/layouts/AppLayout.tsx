/**
 * OSINET Frontend — App Layout (Sidebar + Header Shell)
 */
import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  Search,
  Network,
  GitBranch,
  Clock,
  Package,
  FileText,
  BarChart3,
  Plug,
  ScrollText,
  LogOut,
  ChevronRight,
  Bell,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavItemDef {
  path?: string;
  label: string;
  icon: React.ReactNode;
  implemented: boolean;
  badge?: string;
}

const mainNavItems: NavItemDef[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, implemented: true },
  { path: '/cases', label: 'Cases', icon: <FolderOpen size={18} />, implemented: true },
  { path: '/investigations', label: 'Investigations', icon: <Search size={18} />, implemented: false, badge: 'Soon' },
  { path: '/entities', label: 'Entities', icon: <Network size={18} />, implemented: false, badge: 'Soon' },
  { path: '/graph', label: 'Graph', icon: <GitBranch size={18} />, implemented: false, badge: 'Soon' },
  { path: '/timeline', label: 'Timeline', icon: <Clock size={18} />, implemented: false, badge: 'Soon' },
  { path: '/evidence', label: 'Evidence', icon: <Package size={18} />, implemented: false, badge: 'Soon' },
  { path: '/findings', label: 'Findings', icon: <FileText size={18} />, implemented: false, badge: 'Soon' },
  { path: '/reports', label: 'Reports', icon: <BarChart3 size={18} />, implemented: false, badge: 'Soon' },
];

const adminNavItems: NavItemDef[] = [
  { path: '/admin/providers', label: 'Providers', icon: <Plug size={18} />, implemented: true, badge: 'Live' },
  { path: '/admin/audit', label: 'Audit Log', icon: <ScrollText size={18} />, implemented: false, badge: 'Soon' },
];

export default function AppLayout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userInitials = profile?.display_name
    ? profile.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'US';

  const roleBadgeColor: Record<string, string> = {
    SYSTEM_ADMIN: 'var(--color-danger)',
    CASE_ADMIN: 'var(--color-accent)',
    SUPERVISOR: 'var(--color-info)',
    INVESTIGATOR: 'var(--color-success)',
    AUDITOR: 'var(--color-text-muted)',
  };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(9,13,20,0.7)',
            zIndex: 99, display: 'none',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-mark">OS</div>
            <div>
              <div className="logo-text">OSI<span>NET</span></div>
              <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
                INTEL NETWORK
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">Investigation</div>
            {mainNavItems.map((item) => (
              item.implemented ? (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ) : (
                <div key={item.label} className="nav-item disabled">
                  <span className="nav-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </div>
              )
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-label">Administration</div>
            {adminNavItems.map((item) => (
              item.implemented ? (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ) : (
                <div key={item.label} className="nav-item disabled">
                  <span className="nav-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </div>
              )
            ))}
          </div>
        </nav>

        {/* Sidebar Footer — User */}
        <div className="sidebar-footer">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}>
            <div className="avatar">{userInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600 }} className="truncate">
                {profile?.display_name ?? user?.email?.split('@')[0]}
              </div>
              <div style={{
                fontSize: '0.6875rem',
                color: roleBadgeColor[profile?.role ?? 'INVESTIGATOR'] ?? 'var(--color-text-muted)',
                fontWeight: 600,
              }}>
                {profile?.role ?? 'INVESTIGATOR'}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8125rem' }}
            id="signout-btn"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="top-header">
          <button
            className="btn btn-ghost btn-icon"
            style={{ display: 'none' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            id="sidebar-toggle"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Platform
            </span>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link
              to="/admin/providers"
              className="badge badge-open"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              title="Click to view simulated OSINT provider status and live sandbox"
            >
              <span className="badge-dot" style={{ background: 'var(--color-success)' }} />
              <Sparkles size={12} />
              <span>Demo Mode: 8 APIs Ready</span>
            </Link>
            <button className="btn btn-ghost btn-icon" aria-label="Notifications" id="notifications-btn">
              <Bell size={16} />
            </button>
            <div className="avatar" style={{ fontSize: '0.6875rem' }}>{userInitials}</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 'var(--space-6)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
