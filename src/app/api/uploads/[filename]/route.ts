import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb/client';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.csv': 'text/csv',
  '.json': 'application/json',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params?.filename;
    if (!filename) {
      return new NextResponse('Filename missing', { status: 400 });
    }

    const ext = path.extname(filename).toLowerCase();
    const fallbackMime = MIME_MAP[ext] || 'application/octet-stream';

    // 1. Try serving from MongoDB Atlas database
    try {
      const db = await getDatabase();
      if (db) {
        const fileDoc = await db.collection('uploaded_files').findOne({ filename });
        if (fileDoc && fileDoc.data) {
          let buffer: Buffer;
          if (Buffer.isBuffer(fileDoc.data)) {
            buffer = fileDoc.data;
          } else if (fileDoc.data.buffer) {
            buffer = Buffer.from(fileDoc.data.buffer);
          } else if (typeof fileDoc.data === 'string') {
            buffer = Buffer.from(fileDoc.data, 'base64');
          } else {
            buffer = Buffer.from(fileDoc.data);
          }

          const mimeType = fileDoc.mimeType || fallbackMime;

          return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
              'Content-Type': mimeType,
              'Content-Length': buffer.length.toString(),
              'Cache-Control': 'public, max-age=31536000, immutable',
              ...(mimeType === 'application/pdf' ? { 'Content-Disposition': 'inline' } : {}),
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB upload lookup failed, falling back to disk:', dbErr);
    }

    // 2. Fallback to local public/uploads directory if present (e.g. local dev)
    try {
      const localPath = path.join(process.cwd(), 'public', 'uploads', filename);
      if (fs.existsSync(localPath)) {
        const fileBuffer = await fs.promises.readFile(localPath);
        return new NextResponse(new Uint8Array(fileBuffer), {
          status: 200,
          headers: {
            'Content-Type': fallbackMime,
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            ...(fallbackMime === 'application/pdf' ? { 'Content-Disposition': 'inline' } : {}),
          },
        });
      }
    } catch {
      // Local file read failed
    }

    return new NextResponse('File not found', { status: 404 });
  } catch (error: any) {
    console.error('Error in /api/uploads/[filename]:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
