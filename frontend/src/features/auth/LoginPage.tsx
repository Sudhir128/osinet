/**
 * OSINET Frontend — Authentication (Sign In & Investigator Registration)
 */
import React, { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Shield, Eye, EyeOff, AlertCircle, UserPlus, CheckCircle2, User, KeyRound, Sparkles, Zap } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp, signInDemo, isAuthenticated, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isAuthenticated && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (isSignUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        const result = await signUp(email.trim(), password, displayName.trim());
        if (!result.session) {
          // Email confirmation is required by Supabase auth configuration
          setSuccessMessage(
            'Investigator registered! Please check your email for a confirmation link, or sign in if confirmation is not required.'
          );
          setIsSignUp(false);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
    }}>
      {/* Tactical background grid */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        animation: 'slideUp 0.3s ease',
        zIndex: 1,
      }}>
        {/* Logo Banner */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}>
            <div className="logo-mark" style={{ width: '48px', height: '48px', fontSize: '1.125rem' }}>OS</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
                OSI<span style={{ color: 'var(--color-primary)' }}>NET</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Investigation Intelligence Network
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
            Authorized access only. All actions are logged and audited.
          </p>
        </div>

        {/* Authentication Card */}
        <div className="card" style={{ padding: 'var(--space-6) var(--space-8)' }}>
          {/* Quick Demo Access Mode */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 150, 255, 0.03))',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Instant Demo Mode
              </span>
              <span className="badge badge-open" style={{ fontSize: '0.625rem', letterSpacing: '0.05em' }}>APIS SIMULATED</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Explore cases, targets, and simulated OSINT intelligence feeds (Shodan, Censys, IPInfo, WhoisXML, HIBP) without needing live API keys.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: '4px' }}>
              <button
                type="button"
                id="demo-login-investigator-btn"
                onClick={() => signInDemo('INVESTIGATOR')}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  fontSize: '0.8125rem',
                  padding: 'var(--space-2) var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Zap size={14} />
                Demo Investigator
              </button>
              <button
                type="button"
                id="demo-login-admin-btn"
                onClick={() => signInDemo('SYSTEM_ADMIN')}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8125rem',
                  padding: 'var(--space-2) var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Admin
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: 'var(--space-5)',
            color: 'var(--color-text-muted)',
            fontSize: '0.6875rem',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            <span style={{ padding: '0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or sign in with credentials</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>

          {/* Mode Switch Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 'var(--space-5)',
            gap: 'var(--space-4)',
          }}>
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); setSuccessMessage(null); }}
              style={{
                background: 'none',
                border: 'none',
                padding: 'var(--space-2) 0',
                fontSize: '0.9375rem',
                fontWeight: !isSignUp ? 600 : 400,
                color: !isSignUp ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: !isSignUp ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <KeyRound size={15} />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(null); setSuccessMessage(null); }}
              style={{
                background: 'none',
                border: 'none',
                padding: 'var(--space-2) 0',
                fontSize: '0.9375rem',
                fontWeight: isSignUp ? 600 : 400,
                color: isSignUp ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: isSignUp ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <UserPlus size={15} />
              Register Investigator
            </button>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {isSignUp ? <UserPlus size={18} style={{ color: 'var(--color-primary)' }} /> : <Shield size={18} style={{ color: 'var(--color-primary)' }} />}
              {isSignUp ? 'Register Investigator Account' : 'Secure Sign In'}
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {isSignUp
                ? 'Create credentials to access cases and start intake workflows'
                : 'Enter your credentials to access the investigation platform'}
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} id="auth-form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {isSignUp && (
                <div className="form-group">
                  <label className="form-label" htmlFor="register-name">Investigator Name / Call-sign</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="register-name"
                      type="text"
                      className="form-input"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Inv. J. Miller"
                      disabled={submitting}
                      style={{ paddingLeft: '36px' }}
                    />
                    <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label required" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@agency.gov"
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label required" htmlFor="login-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    disabled={submitting}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="form-group">
                  <label className="form-label required" htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    required
                    disabled={submitting}
                  />
                </div>
              )}

              {isSignUp && (
                <div style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Default Role:</span>
                  <span className="badge badge-open" style={{ fontSize: '0.6875rem' }}>INVESTIGATOR</span>
                </div>
              )}

              <button
                type="submit"
                id="auth-submit-btn"
                className="btn btn-primary w-full"
                disabled={submitting || loading}
                style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', fontSize: '0.9375rem' }}
              >
                {submitting ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px' }} />
                    {isSignUp ? 'Creating Account...' : 'Authenticating...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? <UserPlus size={16} /> : <Shield size={16} />}
                    {isSignUp ? 'Register & Initialize Session' : 'Sign In Securely'}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toggle link */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isSignUp
                ? 'Already have an investigator account? Sign In'
                : 'Need access? Register an Investigator account'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
          OSINET v0.1 · Restricted Access · All sessions monitored
        </p>
      </div>
    </div>
  );
}
