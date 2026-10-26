import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlugMongo } from '@/lib/mongodb/services/mongoDataService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') !== 'false';

    const project = await getProjectBySlugMongo(slug, { publishedOnly });
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to query project by slug' },
      { status: 500 }
    );
  }
}
