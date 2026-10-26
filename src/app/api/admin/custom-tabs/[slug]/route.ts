import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomTabBySlugMongo,
  saveCustomTabMongo,
  deleteCustomTabMongo
} from '@/lib/mongodb/services/mongoDataService';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const tab = await getCustomTabBySlugMongo(slug);
    if (!tab) {
      return NextResponse.json({ success: false, error: 'Custom tab not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tab });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve custom tab' }, { status: 500 });
  }
}

export async function PUT(
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
    const result = await saveCustomTabMongo({ ...body, slug });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update custom tab' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update custom tab' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const { slug } = await params;
    const result = await deleteCustomTabMongo(slug);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete custom tab' }, { status: 500 });
  }
}
