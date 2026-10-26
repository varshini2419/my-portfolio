import { NextRequest, NextResponse } from 'next/server';
import { saveActivityLogMongo } from '@/lib/mongodb/services/mongoDataService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const currentEmail = request.cookies.get('maddala_admin_email')?.value || 'Owner';

  try {
    await saveActivityLogMongo({
      action: 'Admin Sign Out',
      category: 'auth',
      description: `Owner ${currentEmail} signed out of Admin Portal.`,
      actor: currentEmail,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
      user_agent: request.headers.get('user-agent') || 'Browser',
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Ignore logging failures during logout
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear session cookies
  response.cookies.set({
    name: 'maddala_admin_session',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: 'maddala_admin_email',
    value: '',
    path: '/',
    maxAge: 0,
  });

  return response;
}
