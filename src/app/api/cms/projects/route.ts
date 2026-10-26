import { NextRequest, NextResponse } from 'next/server';
import {
  getProjectsMongo,
  saveProjectMongo,
  deleteProjectMongo,
  toggleProjectStatusMongo
} from '@/lib/mongodb/services/mongoDataService';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const projects = await getProjectsMongo({ publishedOnly });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve projects from database' },
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
    const result = await saveProjectMongo(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }
    const result = await deleteProjectMongo(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || (status !== 'draft' && status !== 'published')) {
      return NextResponse.json({ success: false, error: 'Invalid project ID or status' }, { status: 400 });
    }
    const result = await toggleProjectStatusMongo(id, status);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
