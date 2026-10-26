import { NextRequest, NextResponse } from 'next/server';
import { seedInitialMongoData } from '@/lib/mongodb/services/mongoDataService';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const result = await seedInitialMongoData(force);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database seeding failed' }, { status: 500 });
  }
}
