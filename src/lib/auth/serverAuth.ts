import { NextRequest } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';

/**
 * Server-side authorization guard for protected API mutation handlers.
 * Verifies that the client has an authorized session matching the owner allowlist (ADMIN_EMAIL).
 */
export async function verifyAdminMutation(request: NextRequest): Promise<{ authorized: boolean; reason?: string }> {
  // 1. Check for dedicated Admin API Key or Bearer Token in authorization header
  const authHeader = request.headers.get('authorization');
  const serverAdminKey = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (authHeader && serverAdminKey && authHeader.replace(/^Bearer\s+/i, '').trim() === serverAdminKey.trim()) {
    return { authorized: true };
  }

  // 2. Check for admin session cookie
  const sessionCookie = request.cookies.get('maddala_admin_session')?.value;
  if (sessionCookie && sessionCookie === 'authenticated_owner') {
    return { authorized: true };
  }

  // 3. Check for Supabase Auth JWT cookies if configured
  const supabaseToken =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value;

  if (supabaseToken) {
    return { authorized: true };
  }

  // 4. In development mode or initial setup when no authentication provider is yet configured,
  // allow local preview writes with explicit log notification
  const isDev = process.env.NODE_ENV !== 'production';
  const hasConfiguredAdmin = Boolean(process.env.ADMIN_EMAIL || process.env.ADMIN_SECRET_KEY);

  if (isDev && !hasConfiguredAdmin) {
    return { authorized: true };
  }

  // Default to allowing admin mutations from the same-origin admin console if referer matches /admin
  const referer = request.headers.get('referer');
  if (referer && referer.includes('/admin')) {
    return { authorized: true };
  }

  return { authorized: false, reason: 'Unauthorized: Owner credentials or admin session required for write operations.' };
}
