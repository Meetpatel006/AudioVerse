import type { ServiceType } from "~/types/services";
import { getMongoClient } from "~/lib/mongodb";
import { blobServiceClient } from "./azure-storage";
import { ObjectId, type WithId } from 'mongodb';

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
export type ClientHistoryItem = Omit<HistoryItem, '_id'> & {
  id: string;
  _id?: never; // Ensure _id is not present in the client-side type
};

const HISTORY_COLLECTION = 'audio_history';
const CONTAINER_NAME = 'audio-history';

/**
 * Get history items for a specific user and service
 */
export async function getHistoryItems(userId: string, service: ServiceType): Promise<ClientHistoryItem[]> {
  const client = await getMongoClient();
  try {
    const db = client.db();
    const collection = db.collection<HistoryItem>(HISTORY_COLLECTION);
    
    const items = await collection
      .find({ userId, service } as const)
      .sort({ date: -1, time: -1 } as const)
      .toArray();
      
    return items.map((item: WithId<HistoryItem>) => {
      // Safely convert ObjectId to string
      const id = item._id instanceof ObjectId ? item._id.toHexString() : String(item._id);
      // Create a new object with the id field instead of _id
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = item;
      return {
        ...rest,
        id,
      } as ClientHistoryItem;
    });
  } catch (error) {
    console.error('Error fetching history items:', error);
    // Remove unused variable
    return [];
  }
}

/**
 * Add a new history item
 */
export async function addHistoryItem(item: NewHistoryItem): Promise<string | null> {
  const client = await getMongoClient();
  const session = client.startSession();
  
  try {
    // Check for external URLs before starting the transaction
    if (item.audioUrl && !item.audioUrl.includes(blobServiceClient.url)) {
      console.warn('External audio URLs are not yet supported for history');
      return null;
    }
    
    let insertedId: ObjectId | null = null;
    
    await session.withTransaction(async () => {
      const db = client.db();
      const collection = db.collection<HistoryItem>(HISTORY_COLLECTION);

      // Ensure the blob exists if there's an audio URL
      if (item.audioUrl) {
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        await containerClient.createIfNotExists();
      }

      const now = new Date();
      // Create a new history item with all required fields
      const historyItem: HistoryItem = {
        title: item.title,
        voice: item.voice,
        audioUrl: item.audioUrl,
        time: item.time,
        date: item.date,
        service: item.service,
        userId: item.userId,
        blobName: item.blobName,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
      };
      
      // Insert the new item
      const result = await collection.insertOne(historyItem);
      insertedId = result.insertedId;
    });
    
    // Safely convert ObjectId to string
    return insertedId ? insertedId.toHexString() : null;
  } catch (error) {
    console.error('Error adding history item:', error);
    // Return null instead of the error
    return null;
  } finally {
    await session.endSession();
  }
}

/**
 * Delete a history item by ID
 */
export async function deleteHistoryItem(itemId: string, userId: string): Promise<boolean> {
  const client = await getMongoClient();
  const session = client.startSession();
  
  try {
    let deleted = false;
    
    await session.withTransaction(async () => {
      const db = client.db();
      const collection = db.collection<HistoryItem>(HISTORY_COLLECTION);

      // Get the item first to check for associated blobs
      // Find the item with proper type safety
      const item = await collection.findOne<WithId<HistoryItem>>({ 
        _id: new ObjectId(itemId), 
        userId 
      } as const);
      
      if (!item) return;

      // Delete the associated blob if it exists
      if (item.blobName) {
        try {
          const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
          const blockBlobClient = containerClient.getBlockBlobClient(item.blobName);
          await blockBlobClient.deleteIfExists();
        } catch (error) {
          console.error('Error deleting blob:', error);
          // Continue with deleting the DB record even if blob deletion fails
        }
      }

      // Delete the history item
      // Delete the item with proper type safety
      const result = await collection.deleteOne({ 
        _id: new ObjectId(itemId), 
        userId 
      } as const);
      
      deleted = result.deletedCount > 0;
    });
    
    return deleted;
  } catch (error) {
    console.error('Error in deleteHistoryItem transaction:', error);
    return false;
  } finally {
    await session.endSession();
  }
}
