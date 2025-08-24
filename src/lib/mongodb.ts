import mongoose from 'mongoose';
import type { ConnectOptions, Mongoose } from 'mongoose';

type CachedConnection = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('MONGODB_URI not defined, history functionality will not work properly');
}

// Initialize the cached connection
const cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

const mongooseOptions: ConnectOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 50,
  minPoolSize: 5,
  retryWrites: true,
  w: 'majority' as const,
  retryReads: true,
  heartbeatFrequencyMS: 10000, // 10 seconds
  waitQueueTimeoutMS: 10000, // 10 seconds
  compressors: ['zstd', 'snappy', 'zlib'] as const,
  zlibCompressionLevel: 6,
};

/**
 * Connect to MongoDB using Mongoose
 */
async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      ...mongooseOptions,
      bufferCommands: false, // Disable mongoose buffering
    };

  // MONGODB_URI is validated at runtime above; assert non-null for TypeScript here
  cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export const getMongoClient = async () => {
  const conn = await connectToDatabase();
  return conn.connection.getClient();
};

export { connectToDatabase };
export default connectToDatabase;
