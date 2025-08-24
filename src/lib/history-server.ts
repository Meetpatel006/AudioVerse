import type { ServiceType } from "~/types/services";
import { getMongoClient } from "./mongodb";
import { blobServiceClient } from "./azure-storage";
import { ObjectId, type WithId, type MongoClient } from 'mongodb';

// Base interface for the document in MongoDB
export interface HistoryItem {
  _id: ObjectId;
  title: string;
  voice: string | null;
  audioUrl: string | null;
  time: string;
  date: string;
  service: ServiceType;
  userId: string;
  blobName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Type for creating a new history item (without _id, createdAt, updatedAt)
type NewHistoryItem = Omit<HistoryItem, '_id' | 'createdAt' | 'updatedAt'> & {
  _id?: never; // Ensure _id is not provided
  createdAt?: never; // Ensure createdAt is not provided
  updatedAt?: never; // Ensure updatedAt is not provided
};

// Type for the client-side representation
export type ClientHistoryItem = Omit<HistoryItem, '_id' | 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt: string;
  updatedAt: string;
  _id?: never; // Ensure _id is not present in the client-side type
};

const HISTORY_COLLECTION = 'audio_history';
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME || 'works';

/**
 * Get history items for a specific user and service
 */
export async function getHistoryItems(userId: string, service: ServiceType): Promise<ClientHistoryItem[]> {
  console.log(`[getHistoryItems] Starting to fetch history for userId: ${userId}, service: ${service}`);
  let client: MongoClient | undefined;
  
  try {
    console.log('[getHistoryItems] Getting MongoDB client...');
    client = await getMongoClient();
    if (!client) {
      console.error('[getHistoryItems] Failed to get MongoDB client');
      throw new Error('Failed to connect to MongoDB');
    }
    
    const dbName = process.env.MONGODB_DB_NAME || 'elevenlabs';
    console.log(`[getHistoryItems] Using database: ${dbName}`);
    
    const db = client.db(dbName);
    const collection = db.collection<HistoryItem>(HISTORY_COLLECTION);
    
    console.log(`[getHistoryItems] Querying collection: ${HISTORY_COLLECTION}`);
    
    const query = { userId, service };
    console.log(`[getHistoryItems] Query:`, JSON.stringify(query, null, 2));
    
    const items = await collection
      .find(query)
      .sort({ createdAt: -1, updatedAt: -1 } as const)
      .toArray();
    
    console.log(`[getHistoryItems] Found ${items.length} items`);
    
    const mappedItems = items.map((item: WithId<HistoryItem>) => {
      const { _id, createdAt, updatedAt, ...rest } = item;
      return {
        ...rest,
        id: _id.toHexString(),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      };
    }).filter((item): item is ClientHistoryItem => item !== null);
    
    console.log(`[getHistoryItems] Mapped ${mappedItems.length} items`);
    return mappedItems;
  } catch (error) {
    console.error('Error in getHistoryItems:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Add a new history item
 */
export async function addHistoryItem(item: NewHistoryItem): Promise<string | null> {
  console.log('Adding history item:', JSON.stringify(item, null, 2));
  let client: MongoClient | undefined;
  
  try {
    client = await getMongoClient();
    if (!client) {
      console.error('Failed to connect to MongoDB: No client returned');
      throw new Error('Failed to connect to MongoDB');
    }
    
    const session = client.startSession();
    let insertedId: ObjectId | undefined;
    
    await session.withTransaction(async () => {
      const dbName = process.env.MONGODB_DB_NAME || 'elevenlabs';
      console.log('Using database:', dbName);
      
      const db = client!.db(dbName);
      const collection = db.collection<HistoryItem>(HISTORY_COLLECTION);

      // Ensure the blob exists if there's an audio URL
      if (item.audioUrl) {
        try {
          console.log('Verifying blob container:', CONTAINER_NAME);
          const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
          await containerClient.createIfNotExists();
          console.log('Blob container verified');
        } catch (blobError) {
          console.error('Error with blob storage:', blobError);
          // Continue even if blob storage fails
        }
      }

      const now = new Date();
      
      // Create a new history item with all required fields
      const historyItem: HistoryItem = {
        title: item.title || 'Untitled',
        voice: item.voice,
        audioUrl: item.audioUrl,
        time: item.time || now.toLocaleTimeString(),
        date: item.date || now.toLocaleDateString(),
        service: item.service,
        userId: item.userId,
        blobName: item.blobName,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
      };
      
      console.log('Adding history item to MongoDB:', historyItem);
      
      // Insert the new item
      const result = await collection.insertOne(historyItem);
      insertedId = result.insertedId;
      
      console.log('History item inserted with ID:', insertedId);
    });
    
    await session.endSession();
    
    // Safely convert ObjectId to string
    return insertedId ? insertedId.toString() : null;
  } catch (error) {
    console.error('Error adding history item:', error);
    // Return null instead of the error
    return null;
  }
}

/**
 * Delete a history item by ID
 */
export async function deleteHistoryItem(itemId: string, userId: string): Promise<boolean> {
  let client: MongoClient | undefined;
  
  try {
    client = await getMongoClient();
    if (!client) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    const session = client.startSession();
    let deleted = false;
    
    try {
      await session.withTransaction(async () => {
        const db = client!.db(process.env.MONGODB_DB_NAME || 'elevenlabs');
        const collection = db.collection<HistoryItem>(HISTORY_COLLECTION);

        // Get the item first to check for associated blobs
        const item = await collection.findOne<WithId<HistoryItem>>({ 
          _id: new ObjectId(itemId), 
          userId 
        } as const);

        console.log(`Deleting history item: ${itemId} for user: ${userId}`);

        if (item?.blobName) {
          try {
            const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
            const blockBlobClient = containerClient.getBlockBlobClient(item.blobName);
            await blockBlobClient.deleteIfExists();
            console.log(`Deleted blob: ${item.blobName}`);
          } catch (error) {
            console.error('Error deleting blob:', error);
            // Continue with deleting the DB record even if blob deletion fails
          }
        }

        // Delete the history item
        const result = await collection.deleteOne({ 
          _id: new ObjectId(itemId), 
          userId 
        } as const);
        
        deleted = result.deletedCount > 0;
        console.log(`Deleted ${result.deletedCount} history records`);
      });
      
      return deleted;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Error in deleteHistoryItem:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}