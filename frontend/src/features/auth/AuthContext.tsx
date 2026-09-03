/**
 * OSINET Frontend — Auth Context
 * Provides authentication state, Supabase auth operations, and Demo Mode instant login.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '../../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile, OsinetRole } from '../../types';
import { mockStore } from '../../services/mockStore';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ session: Session | null; user: User | null }>;
  signInDemo: (role?: OsinetRole) => void;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_SESSION_KEY = 'osinet_demo_auth_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const fetchProfile = useCallback(async (userId: string, userMeta?: Record<string, any>) => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        setProfile({
          id: userId,
          display_name: userMeta?.display_name || userMeta?.email?.split('@')[0] || 'Investigator',
          email: userMeta?.email || '',
          role: 'INVESTIGATOR',
          created_at: new Date().toISOString(),
        });
        return;
      }

      setProfile(data as UserProfile);
    } catch {
      setProfile({
        id: userId,
        display_name: userMeta?.display_name || 'Investigator',
        email: userMeta?.email || '',
        role: 'INVESTIGATOR',
        created_at: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    // 1. Check for active Demo Session in localStorage
    try {
      const storedDemo = localStorage.getItem(DEMO_SESSION_KEY);
      if (storedDemo) {
        const parsed = JSON.parse(storedDemo);
        setUser(parsed.user);
        setSession(parsed.session);
        setProfile(parsed.profile);
        setIsDemoMode(true);
        mockStore.setDemoActive(true);
        setLoading(false);
        return;
      }
    } catch {
      // Ignored
    }

    // 2. Otherwise initialize from Supabase stored session
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id, {
          email: s.user.email,
          display_name: s.user.user_metadata?.display_name,
        }).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, s: Session | null) => {
        // If demo session is active, keep demo session intact
        if (localStorage.getItem(DEMO_SESSION_KEY)) return;

        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await fetchProfile(s.user.id, {
            email: s.user.email,
            display_name: s.user.user_metadata?.display_name,
          });
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInDemo = (role: OsinetRole = 'INVESTIGATOR') => {
    setError(null);
    const demoUser: any = {
      id: 'usr-demo-lead',
      email: 'investigator.demo@osinet.intel',
      user_metadata: {
        display_name: 'Inv. Alexander Cross',
      },
      role: 'authenticated',
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    const demoSession: any = {
      access_token: 'osinet-demo-jwt-simulated-token',
      token_type: 'bearer',
      user: demoUser,
      expires_in: 86400 * 30,
    };

    const demoProfile: UserProfile = {
      id: 'usr-demo-lead',
      display_name: 'Inv. Alexander Cross',
      email: 'investigator.demo@osinet.intel',
      role,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(
      DEMO_SESSION_KEY,
      JSON.stringify({ user: demoUser, session: demoSession, profile: demoProfile })
    );
    mockStore.setDemoActive(true);

    setUser(demoUser);
    setSession(demoSession);
    setProfile(demoProfile);
    setIsDemoMode(true);
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw new Error(signInError.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setError(null);
    setLoading(true);
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });
      if (signUpError) throw new Error(signUpError.message);
      return { session: data.session, user: data.user };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    localStorage.removeItem(DEMO_SESSION_KEY);
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        error,
        signIn,
        signUp,
        signInDemo,
        signOut,
        isAuthenticated: !!user,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
