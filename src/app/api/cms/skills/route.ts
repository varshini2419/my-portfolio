import { NextRequest, NextResponse } from 'next/server';
import {
  getSkillsMongo,
  saveSkillCategoryMongo,
  addSkillMongo,
  deleteSkillMongo
} from '@/lib/mongodb/services/mongoDataService';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await getSkillsMongo();
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, categoryName, skill, category } = body;

    if (action === 'save_category' && category) {
      const result = await saveSkillCategoryMongo(category);
      return NextResponse.json(result);
    }

    if (action === 'add_skill' && categoryName && skill) {
      const result = await addSkillMongo(categoryName, skill);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Invalid skill action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update skills' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('categoryName');
    const skillName = searchParams.get('skillName');

    if (!categoryName || !skillName) {
      return NextResponse.json({ success: false, error: 'Category and skill name are required' }, { status: 400 });
    }

    const result = await deleteSkillMongo(categoryName, skillName);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete skill' }, { status: 500 });
  }
}
