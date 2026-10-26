import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomRecordsMongo,
  saveCustomRecordMongo
} from '@/lib/mongodb/services/mongoDataService';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const records = await getCustomRecordsMongo(slug);
    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve custom records' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    const result = await saveCustomRecordMongo(slug, body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to save record' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save custom record' }, { status: 500 });
  }
}
