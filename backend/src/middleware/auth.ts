/**
 * OSINET Backend — Authentication Middleware
 *
 * Extracts the Supabase JWT from the Authorization header,
 * verifies it against Supabase, fetches the user's OSINET role
 * from the profiles table, and attaches `req.user` for downstream use.
 *
 * Security: authorization is server-side; the frontend cannot bypass this.
 */
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { sendUnauthorized } from '../utils/response';
import type { AuthenticatedUser, OsinetRole } from '../types';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendUnauthorized(res, 'No bearer token provided');
    return;
  }

  const token = authHeader.slice(7);

  try {
    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('[Auth] Invalid or expired token', { error: error?.message });
      sendUnauthorized(res, 'Invalid or expired token');
      return;
    }

    // Attempt to fetch OSINET profile + role
    let userRole: OsinetRole = 'INVESTIGATOR';
    let profileId = user.id;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        userRole = (profile.role as OsinetRole) || 'INVESTIGATOR';
        profileId = profile.id;
      } else {
        // Attempt to auto-create profile record if table exists
        const displayName =
          user.user_metadata?.display_name ||
          user.email?.split('@')[0] ||
          'Investigator';

        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email ?? '',
            display_name: displayName,
            role: 'INVESTIGATOR',
          })
          .select('id, role')
          .maybeSingle();

        if (newProfile) {
          userRole = (newProfile.role as OsinetRole) || 'INVESTIGATOR';
          profileId = newProfile.id;
        }
      }
    } catch (profileErr) {
      logger.warn('[Auth] Profile resolution notice — using fallback INVESTIGATOR role', {
        userId: user.id,
        error: String(profileErr),
      });
    }

    req.user = {
      id: user.id,
      email: user.email ?? '',
      role: userRole,
      profileId,
    } satisfies AuthenticatedUser;

    next();
  } catch (err) {
    logger.error('[Auth] Authentication error', { error: String(err) });
    sendUnauthorized(res, 'Authentication failed');
  }
}
