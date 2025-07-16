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
export type ClientHistoryItem = Omit<HistoryItem, '_id'> & {
  id: string;
  _id?: never; // Ensure _id is not present in the client-side type
};

const HISTORY_COLLECTION = 'audio_history';
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME || 'works';

/**
 * Get history items for a specific user and service
 */
export async function getHistoryItems(userId: string, service: ServiceType): Promise<ClientHistoryItem[]> {
  let client: MongoClient | undefined;
  
  try {
    client = await getMongoClient();
    if (!client) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    const db = client.db(process.env.MONGODB_DB_NAME || 'elevenlabs');
    const collection = db.collection<HistoryItem>(HISTORY_COLLECTION);
    
    console.log(`Fetching history items for user: ${userId}, service: ${service}`);
    console.log('Collection name:', HISTORY_COLLECTION);
    console.log('Database name:', process.env.MONGODB_DB_NAME || 'elevenlabs');
    
    // First, let's check if the collection exists and has any data
    const totalCount = await collection.countDocuments();
    console.log(`Total documents in collection: ${totalCount}`);
    
    const userCount = await collection.countDocuments({ userId });
    console.log(`Documents for user ${userId}: ${userCount}`);
    
    const serviceCount = await collection.countDocuments({ userId, service });
    console.log(`Documents for user ${userId} and service ${service}: ${serviceCount}`);
    
    const items = await collection
      .find({ userId, service } as const)
      .sort({ createdAt: -1, updatedAt: -1 } as const)
      .toArray();
      
    console.log(`Found ${items.length} history items`);
    console.log('Sample item:', items[0]);
    
    return items.map((item: WithId<HistoryItem>) => {
      try {
        // Safely convert ObjectId to string
        const id = item._id instanceof ObjectId ? item._id.toHexString() : String(item._id);
        // Create a new object with the id field instead of _id
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...rest } = item;
        
        // Ensure date and time are properly formatted
        const clientItem = {
          ...rest,
          id,
          // Ensure date is a string
          date: typeof rest.date === 'string' ? rest.date : new Date(rest.date).toLocaleDateString(),
          // Ensure time is a string
          time: typeof rest.time === 'string' ? rest.time : new Date(rest.time).toLocaleTimeString(),
          // Ensure title is not null or undefined
          title: rest.title || 'Untitled',
          // Ensure audioUrl is properly formatted
          audioUrl: rest.audioUrl || null,
        } as ClientHistoryItem;
        
        console.log('Mapped item:', clientItem);
        return clientItem;
      } catch (mapError) {
        console.error('Error mapping history item:', mapError, item);
        return null;
      }
    }).filter((item): item is ClientHistoryItem => item !== null);
  } catch (error) {
    console.error('Error in getHistoryItems:', error);
    throw error; // Re-throw the error to be handled by the caller
  } finally {
    // Don't close the connection here as it's shared
  }
}

/**
 * Add a new history item
 */
export async function addHistoryItem(item: NewHistoryItem): Promise<string | null> {
  let client: MongoClient | undefined;
  
  try {
    client = await getMongoClient();
    if (!client) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    const session = client.startSession();
    let insertedId: ObjectId | undefined;
    
    await session.withTransaction(async () => {
      const db = client!.db(process.env.MONGODB_DB_NAME || 'elevenlabs');
      const collection = db.collection<HistoryItem>(HISTORY_COLLECTION);

      // Ensure the blob exists if there's an audio URL
      if (item.audioUrl) {
        try {
          const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
          await containerClient.createIfNotExists();
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
