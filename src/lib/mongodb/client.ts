import { MongoClient, Db } from 'mongodb';
import dns from 'node:dns';

// Ensure reliable SRV resolution on Node.js/Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'maddala_portfolio';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

/**
 * Checks whether MongoDB Atlas connection string is provided in server environment.
 * Ensures the app never attempts to connect with empty or placeholder strings.
 */
export function isMongoConfigured(): boolean {
  if (!uri || uri.trim() === '') return false;
  if (uri.includes('<username>') || uri.includes('<password>') || uri.includes('your-mongodb-uri')) {
    return false;
  }
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}

let lastError: string | null = null;
let lastErrorTime: number = 0;
const ERROR_BACKOFF_MS = 20000; // 20-second backoff so read/tab switching is instantaneous if offline

export function getLastMongoError(): string | null {
  return lastError;
}

export function resetMongoErrorCooldown(): void {
  lastErrorTime = 0;
  lastError = null;
}

function formatMongoError(rawError: unknown): string {
  const msg = rawError instanceof Error ? rawError.message : String(rawError);
  if (
    msg.includes('bad auth') ||
    msg.includes('authentication failed') ||
    msg.includes('code: 8000') ||
    msg.includes('AuthenticationFailed')
  ) {
    return 'MongoDB Atlas Authentication Error: The database user credentials (username/password) provided in MONGODB_URI are incorrect or unauthorized. Please verify or reset the user password in MongoDB Atlas -> Security -> Database Access.';
  }
  if (msg.includes('querySrv') || msg.includes('ENOTFOUND')) {
    return 'MongoDB DNS Resolution Error: Unable to resolve MongoDB Atlas cluster host via DNS. Please check network connectivity.';
  }
  if (msg.includes('timed out') || msg.includes('Server selection timed out')) {
    return 'MongoDB Connection Timeout: Unable to reach MongoDB Atlas cluster within timeout. Please ensure your IP address is whitelisted in MongoDB Atlas -> Security -> Network Access (e.g. 0.0.0.0/0).';
  }
  return `MongoDB Atlas Connection Error: ${msg}`;
}

/**
 * Returns a cached singleton MongoClient promise suitable for Next.js serverless and development HMR.
 * Avoids opening redundant connections on every API invocation.
 */
export async function getMongoClient(options?: { force?: boolean }): Promise<MongoClient | null> {
  if (!isMongoConfigured()) {
    lastError = 'MongoDB URI not configured or using placeholder';
    return null;
  }

  // Fast Navigation Optimization:
  // If connection failed recently, fail fast for passive reads to avoid blocking tab navigation with repeated 2.5s timeouts
  if (!options?.force && lastError && (Date.now() - lastErrorTime < ERROR_BACKOFF_MS)) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise || options?.force) {
      client = new MongoClient(uri!, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 4000,
      });
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, do not use a global variable.
    if (!clientPromise || options?.force) {
      client = new MongoClient(uri!, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 4000,
      });
      clientPromise = client.connect();
    }
  }

  try {
    const connectedClient = await clientPromise;
    lastError = null;
    lastErrorTime = 0;
    return connectedClient;
  } catch (error) {
    lastError = formatMongoError(error);
    lastErrorTime = Date.now();
    console.error('MongoDB Atlas connection error:', lastError);

    // Reset promise so subsequent requests can retry cleanly
    if (process.env.NODE_ENV === 'development') {
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };
      globalWithMongo._mongoClientPromise = undefined;
    }
    clientPromise = null;
    return null;
  }
}

/**
 * Convenience helper to return the active MongoDB Database instance.
 */
export async function getDatabase(options?: { force?: boolean }): Promise<Db | null> {
  const mongoClient = await getMongoClient(options);
  if (!mongoClient) return null;
  return mongoClient.db(dbName);
}
