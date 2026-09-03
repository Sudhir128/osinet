/**
 * OSINET Frontend — Application Router
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import CasesPage from './features/cases/CasesPage';
import CaseDetailPage from './features/cases/CaseDetailPage';
import CreateCasePage from './features/cases/CreateCasePage';
import ProvidersPage from './features/providers/ProvidersPage';
import NotFoundPage from './pages/NotFoundPage';
import ComingSoonPage from './pages/ComingSoonPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected — App Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/new" element={<CreateCasePage />} />
            <Route path="/cases/:id" element={<CaseDetailPage />} />

            {/* Coming soon stubs */}
            <Route path="/investigations" element={<ComingSoonPage title="Investigations" phase="Phase 2" description="Run automated OSINT enrichment pipelines against your investigation targets." />} />
            <Route path="/entities" element={<ComingSoonPage title="Entities" phase="Phase 2" description="Browse and correlate normalized entities extracted from intelligence data." />} />
            <Route path="/graph" element={<ComingSoonPage title="Investigation Graph" phase="Phase 2" description="Visualize entity relationships and investigation paths in an interactive graph." />} />
            <Route path="/timeline" element={<ComingSoonPage title="Timeline" phase="Phase 2" description="Chronological view of events, observations, and intelligence gathered." />} />
            <Route path="/evidence" element={<ComingSoonPage title="Evidence" phase="Phase 2" description="Manage evidence with full provenance, chain of custody, and integrity hashing." />} />
            <Route path="/findings" element={<ComingSoonPage title="Findings" phase="Phase 3" description="Document and structure investigation findings for reporting." />} />
            <Route path="/reports" element={<ComingSoonPage title="Reports" phase="Phase 3" description="Generate professional investigation reports with full evidence provenance." />} />
            <Route path="/admin/providers" element={<ProvidersPage />} />
            <Route path="/admin/audit" element={<ComingSoonPage title="Audit Log" phase="Phase 2" description="Full audit trail of all platform actions and administrative events." />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-strong)',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-bg-elevated)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-danger)',
              secondary: 'var(--color-bg-elevated)',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
