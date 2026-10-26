import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomTabsMongo,
  saveCustomTabMongo,
  reorderCustomTabsMongo
} from '@/lib/mongodb/services/mongoDataService';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('archived') === 'true';
    const tabs = await getCustomTabsMongo(includeArchived);
    return NextResponse.json({ success: true, data: tabs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve custom tabs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Tab name is required' }, { status: 400 });
    }

    const result = await saveCustomTabMongo(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to create tab' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create custom tab' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!Array.isArray(body.orderedSlugs)) {
      return NextResponse.json({ success: false, error: 'orderedSlugs array is required' }, { status: 400 });
    }

    const result = await reorderCustomTabsMongo(body.orderedSlugs);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to reorder custom tabs' }, { status: 500 });
  }
}
