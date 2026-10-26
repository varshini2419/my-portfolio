import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminMutation } from '@/lib/auth/serverAuth';
import { getDatabase } from '@/lib/mongodb/client';
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

    // Format human-readable size
    const sizeKb = Math.round(bytes / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, sizeKb)} KB`;

    // Generate safe filename
    const ext = path.extname(file.name) || '';
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const uniqueFilename = `${Date.now()}_${baseName}${ext || (detectedType === 'pdf' ? '.pdf' : detectedType === 'video' ? '.mp4' : '.png')}`;

    let publicUrl = `/api/uploads/${uniqueFilename}`;
    let savedToMongo = false;

    // 1. Primary Cloud Storage: Persist file binary to MongoDB Atlas
    try {
      const db = await getDatabase();
      if (db) {
        await db.collection('uploaded_files').updateOne(
          { filename: uniqueFilename },
          {
            $set: {
              id: uniqueFilename,
              filename: uniqueFilename,
              originalName: file.name,
              mimeType: mime || (detectedType === 'pdf' ? 'application/pdf' : detectedType === 'video' ? 'video/mp4' : 'image/png'),
              size: sizeStr,
              bytes,
              data: buffer,
              uploadedAt: new Date().toISOString(),
            },
          },
          { upsert: true }
        );
        savedToMongo = true;
      }
    } catch (dbErr) {
      console.warn('MongoDB file upload storage warning:', dbErr);
    }

    // 2. Secondary Local Disk: Try writing to public/uploads (local dev only, ignore EROFS in serverless/Vercel)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      await fs.promises.writeFile(path.join(uploadsDir, uniqueFilename), buffer);
    } catch (fsErr: any) {
      // Expected on Vercel / serverless environments where /var/task is read-only
      if (fsErr?.code !== 'EROFS') {
        console.warn('Local disk write skipped:', fsErr?.message);
      }
    }

    // 3. Ultra-safe Fallback: If MongoDB was not reachable AND local disk failed, generate Data URL for small files (< 4MB)
    if (!savedToMongo && bytes <= 4 * 1024 * 1024) {
      const detectedMime = mime || (detectedType === 'pdf' ? 'application/pdf' : detectedType === 'video' ? 'video/mp4' : 'image/png');
      publicUrl = `data:${detectedMime};base64,${buffer.toString('base64')}`;
    }

    // 4. Auto-register in Media Collection if requested
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
        console.warn('Could not auto-register in Mongo media collection:', e);
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
