import { MongoClient, type MongoClientOptions, type Db, type MongoClient as MongoClientType } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClientType> | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://meetpatel:meetpatel@elevenlabs-data.rb5uivt.mongodb.net/elevenlabs?retryWrites=true&w=majority';
const MONGODB_DB = process.env.MONGODB_DB || 'elevenlabs';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let client: MongoClientType;
let clientPromise: Promise<MongoClientType>;

const options: MongoClientOptions = {
  // Add any additional options here
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 30000, // 30 seconds
  serverSelectionTimeoutMS: 10000, // 10 seconds
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority',
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();
}

/**
 * Get a MongoDB client instance
 */
export async function getMongoClient(): Promise<MongoClientType> {
  if (!clientPromise) {
    throw new Error('MongoDB client is not initialized');
  }
  try {
    return await clientPromise;
  } catch (error) {
    console.error('Failed to get MongoDB client:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

/**
 * Connect to the MongoDB database
 */
export async function connectToDatabase(): Promise<{ client: MongoClientType; db: Db }> {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DB);
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export { MongoClientType };
export default connectToDatabase;
