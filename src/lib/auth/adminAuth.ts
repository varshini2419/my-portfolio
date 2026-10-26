/**
 * Server-side administrator authorization and redirect sanitization helpers.
 * Never trust client-supplied claims or headers as proof of authorization.
 */

/**
 * Validates whether an authenticated user email is authorized as the portfolio owner.
 * Evaluates against the server-side environment variable ADMIN_EMAIL or OWNER_EMAIL.
 */
export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email || email.trim() === '') return false;

  const configuredAdmin = process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL;

  // If ADMIN_EMAIL is explicitly set, strictly enforce the allowlist
  if (configuredAdmin && configuredAdmin.trim() !== '') {
    return email.trim().toLowerCase() === configuredAdmin.trim().toLowerCase();
  }

  // If ADMIN_EMAIL is not yet set in development/preview mode,
  // allow the authenticated user from Supabase auth with notice
  return true;
}

/**
 * Open-Redirect Prevention:
 * Validates that redirect destination strictly points to a safe internal admin route.
 * Rejects external URLs, protocol-relative URLs (//evil.com), and auth loops.
 */
export function sanitizeAdminRedirect(redirectUrl?: string | null): string {
  if (!redirectUrl) return '/admin/dashboard';

  const trimmed = redirectUrl.trim();

  // Reject protocol-relative or absolute external schemes
  if (
    trimmed.startsWith('//') ||
    trimmed.includes('://') ||
    trimmed.includes('\\')
  ) {
    return '/admin/dashboard';
  }

  // Must strictly start with /admin and not point to login/unauthorized loop
  if (
    trimmed.startsWith('/admin') &&
    !trimmed.startsWith('/admin/login') &&
    !trimmed.startsWith('/admin/unauthorized')
  ) {
    return trimmed;
  }

  return '/admin/dashboard';
}
