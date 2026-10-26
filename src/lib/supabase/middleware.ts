import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAuthorizedAdmin, sanitizeAdminRedirect } from '@/lib/auth/adminAuth';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co'
  );

  const pathname = request.nextUrl.pathname;

  // Redirect root /admin to dedicated /admin/dashboard
  if (pathname === '/admin') {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/admin/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/unauthorized';
  const isProtectedAdminRoute = pathname.startsWith('/admin') && !isAuthPage;

  // Verify standalone owner session cookie (used with MongoDB Atlas / server auth)
  const isOwnerSession = request.cookies.get('maddala_admin_session')?.value === 'authenticated_owner';

  if (isOwnerSession) {
    // If already authenticated and accessing login page, redirect to dashboard
    if (isAuthPage && pathname === '/admin/login') {
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      const safeTarget = sanitizeAdminRedirect(redirectParam);
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = safeTarget;
      dashboardUrl.searchParams.delete('redirect');
      return NextResponse.redirect(dashboardUrl);
    }
    return response;
  }

  if (!isConfigured) {
    // If Supabase is not yet configured and no session cookie is present,
    // allow initial setup in development mode
    return response;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Verify authenticated identity securely with Supabase server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated visitors cannot access protected admin pages
  if (isProtectedAdminRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    redirectUrl.searchParams.set('redirect', sanitizeAdminRedirect(pathname));
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Reject authenticated users who are not authorized administrators
  if (isProtectedAdminRoute && user) {
    const isOwner = isAuthorizedAdmin(user.email);
    if (!isOwner) {
      const unauthorizedUrl = request.nextUrl.clone();
      unauthorizedUrl.pathname = '/admin/unauthorized';
      unauthorizedUrl.searchParams.delete('redirect');
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // 3. If already signed in as authorized admin and visiting login page, redirect to dashboard
  if (isAuthPage && pathname === '/admin/login' && user) {
    const isOwner = isAuthorizedAdmin(user.email);
    if (isOwner) {
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      const safeTarget = sanitizeAdminRedirect(redirectParam);
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = safeTarget;
      dashboardUrl.searchParams.delete('redirect');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}
