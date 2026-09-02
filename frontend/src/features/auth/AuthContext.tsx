/**
 * OSINET Frontend — Auth Context
 * Provides authentication state and Supabase auth operations.
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
import type { UserProfile } from '../../types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ session: Session | null; user: User | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string, userMeta?: Record<string, any>) => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('[Auth] Profile query notice:', profileError.message);
        // Fallback profile so investigator can access UI even before migration is applied
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
    } catch (err) {
      console.warn('[Auth] Profile fetch error:', err);
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
    // Initialize from stored session
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
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, s: Session | null) => {
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

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
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
    await supabase.auth.signOut();
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
        signOut,
        isAuthenticated: !!user,
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
