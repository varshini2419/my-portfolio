import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('maddala_admin_session')?.value;
  const email = request.cookies.get('maddala_admin_email')?.value || process.env.ADMIN_EMAIL || 'maddalavarshini@example.com';

  if (session === 'authenticated_owner') {
    return NextResponse.json({
      authenticated: true,
      email,
      name: 'Maddala Varshini',
      role: 'owner',
    });
  }

  return NextResponse.json(
    { authenticated: false, email: null, role: null },
    { status: 401 }
  );
}
