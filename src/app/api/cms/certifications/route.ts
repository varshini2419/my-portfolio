import { NextRequest, NextResponse } from 'next/server';
import {
  getCertificationsMongo,
  saveCertificationMongo,
  deleteCertificationMongo
} from '@/lib/mongodb/services/mongoDataService';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await getCertificationsMongo();
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch certifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await saveCertificationMongo(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save certification' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const result = await deleteCertificationMongo(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete certification' }, { status: 500 });
  }
}
