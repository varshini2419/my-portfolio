import { NextRequest, NextResponse } from 'next/server';
import {
  getContentBlocksMongo,
  saveContentBlockMongo,
  deleteContentBlockMongo
} from '@/lib/mongodb/services/mongoDataService';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await getContentBlocksMongo();
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch content blocks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await saveContentBlockMongo(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save content block' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    }
    const result = await deleteContentBlockMongo(key);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete block' }, { status: 500 });
  }
}
