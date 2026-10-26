import { NextRequest, NextResponse } from 'next/server';
import {
  getActivityLogsMongo,
  saveActivityLogMongo,
  clearActivityLogsMongo,
} from '@/lib/mongodb/services/mongoDataService';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

  const activities = await getActivityLogsMongo(limit);
  return NextResponse.json({
    success: true,
    data: activities,
    total: activities.length,
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason || 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.action || !body.description) {
    return NextResponse.json({ success: false, error: 'Action and description are required.' }, { status: 400 });
  }

  const result = await saveActivityLogMongo({
    action: body.action,
    category: body.category || 'system',
    description: body.description,
    actor: body.actor || 'Owner',
    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
    user_agent: request.headers.get('user-agent') || 'Browser',
    status: body.status || 'success',
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason || 'Unauthorized' }, { status: 401 });
  }

  const result = await clearActivityLogsMongo();
  return NextResponse.json(result);
}
