import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import { saveActivityLogMongo } from '@/lib/mongodb/services/mongoDataService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const configuredEmail = (process.env.ADMIN_EMAIL || 'maddalavarshini@example.com').trim().toLowerCase();
    const serverSecretKey = process.env.ADMIN_SECRET_KEY || 'maddala_varshini_secret_admin_key_2026_secured';

    // Verify authorized owner email
    const isEmailValid = isAuthorizedAdmin(trimmedEmail) || trimmedEmail === configuredEmail;

    // Verify password against server secret key or credentials
    const isPasswordValid =
      String(password).trim() === serverSecretKey.trim() ||
      String(password).trim() === 'varshi123'; // Support user Atlas password

    if (!isEmailValid || !isPasswordValid) {
      // Log failed attempt for security audit
      await saveActivityLogMongo({
        action: 'Failed Login Attempt',
        category: 'auth',
        description: `Unsuccessful sign-in attempt for email: ${trimmedEmail}`,
        actor: trimmedEmail,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
        user_agent: request.headers.get('user-agent') || 'Browser',
        status: 'warning',
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed. Please verify your owner email and password.',
        },
        { status: 401 }
      );
    }

    // Log successful sign-in
    await saveActivityLogMongo({
      action: 'Admin Sign In',
      category: 'auth',
      description: `Authorized owner ${trimmedEmail} signed in to Admin Portal.`,
      actor: trimmedEmail,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
      user_agent: request.headers.get('user-agent') || 'Browser',
      status: 'success',
      timestamp: new Date().toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        email: trimmedEmail,
        name: 'Maddala Varshini',
        role: 'owner',
      },
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: 'maddala_admin_session',
      value: 'authenticated_owner',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set({
      name: 'maddala_admin_email',
      value: trimmedEmail,
      httpOnly: false, // Accessible to client header display
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal authentication error.' },
      { status: 500 }
    );
  }
}
