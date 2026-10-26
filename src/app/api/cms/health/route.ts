import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, isMongoConfigured, getLastMongoError, resetMongoErrorCooldown } from '@/lib/mongodb/client';
import { COLLECTIONS } from '@/lib/mongodb/collections';

export const dynamic = 'force-dynamic';

let cachedHealth: { data: any; status: number; timestamp: number } | null = null;
const HEALTH_CACHE_TTL = 15000; // 15 seconds cache

export async function GET(request: NextRequest) {
  const force = request.nextUrl.searchParams.get('force') === 'true';

  if (!force && cachedHealth && Date.now() - cachedHealth.timestamp < HEALTH_CACHE_TTL) {
    return NextResponse.json(cachedHealth.data, { status: cachedHealth.status });
  }

  if (force) {
    resetMongoErrorCooldown();
  }

  const configured = isMongoConfigured();
  if (!configured) {
    return NextResponse.json({
      success: true,
      status: 'pending_configuration',
      message: 'MongoDB Atlas URI is not yet configured in server environment (MONGODB_URI). Using local fallback store.',
      database: null,
      collections: {}
    });
  }

  const startTime = Date.now();
  const db = await getDatabase({ force });

  if (!db) {
    const errorDetail = getLastMongoError();
    const result = {
      success: false,
      status: 'connection_failed',
      message: errorDetail 
        ? `MongoDB Atlas error: ${errorDetail}` 
        : 'Could not establish connection to MongoDB Atlas. Please verify user credentials and IP access in Atlas.',
      error: errorDetail,
      latencyMs: Date.now() - startTime
    };
    cachedHealth = { data: result, status: 503, timestamp: Date.now() };
    return NextResponse.json(result, { status: 503 });
  }

  try {
    // Run admin ping command
    await db.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    // Collect document counts across collections
    const [
      projects,
      profiles,
      education,
      skills,
      certifications,
      experience,
      vlogs,
      media,
      contentBlocks,
      siteSettings
    ] = await Promise.all([
      db.collection(COLLECTIONS.PROJECTS).countDocuments(),
      db.collection(COLLECTIONS.PROFILES).countDocuments(),
      db.collection(COLLECTIONS.EDUCATION).countDocuments(),
      db.collection(COLLECTIONS.SKILLS).countDocuments(),
      db.collection(COLLECTIONS.CERTIFICATIONS).countDocuments(),
      db.collection(COLLECTIONS.EXPERIENCE).countDocuments(),
      db.collection(COLLECTIONS.VLOGS).countDocuments(),
      db.collection(COLLECTIONS.MEDIA).countDocuments(),
      db.collection(COLLECTIONS.CONTENT_BLOCKS).countDocuments(),
      db.collection(COLLECTIONS.SITE_SETTINGS).countDocuments()
    ]);

    const responsePayload = {
      success: true,
      status: 'connected',
      engine: 'MongoDB Atlas',
      database: db.databaseName,
      latencyMs,
      collections: {
        projects,
        profiles,
        education,
        skills,
        certifications,
        experience,
        vlogs,
        media,
        contentBlocks,
        siteSettings
      }
    };
    cachedHealth = { data: responsePayload, status: 200, timestamp: Date.now() };
    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Database ping failed',
        latencyMs: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}
