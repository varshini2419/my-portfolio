import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';
import { saveMediaAssetMongo } from '@/lib/mongodb/services/mongoDataService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = await verifyAdminMutation(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason || 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const autoRegister = formData.get('autoRegister') !== 'false';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file provided in form data' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bytes = buffer.length;

    // Detect type
    const mime = file.type || '';
    let detectedType: 'image' | 'pdf' | 'video' = 'image';
    if (mime.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
      detectedType = 'pdf';
    } else if (mime.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(file.name)) {
      detectedType = 'video';
    } else {
      detectedType = 'image';
    }

    // Format size
    const sizeKb = Math.round(bytes / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, sizeKb)} KB`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate safe filename
    const ext = path.extname(file.name) || '';
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const uniqueFilename = `${Date.now()}_${baseName}${ext || '.png'}`;
    const destinationPath = path.join(uploadsDir, uniqueFilename);

    await fs.promises.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    // Auto-register in MongoDB if requested
    let mediaRecord = null;
    if (autoRegister) {
      try {
        const mongoRes = await saveMediaAssetMongo({
          name: file.name,
          url: publicUrl,
          type: detectedType,
          size: sizeStr,
        });
        if (mongoRes.success && mongoRes.data) {
          mediaRecord = mongoRes.data;
        }
      } catch (e) {
        console.warn('Could not auto-register in Mongo:', e);
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: file.name,
      filename: uniqueFilename,
      type: detectedType,
      size: sizeStr,
      mediaRecord,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
