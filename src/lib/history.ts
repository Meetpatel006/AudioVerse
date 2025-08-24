// Type definitions for history items that can be used in client components
import type { ServiceType } from "~/types/services";

// Base interface for the document in MongoDB (for reference only)
export interface HistoryItem {
  _id: string; // We'll use string instead of ObjectId in client components
  title: string;
  voice: string | null;
  audioUrl: string | null;
  time: string;
  date: string;
  service: ServiceType;
  userId: string;
  blobName?: string;
  createdAt: string; // We'll use string instead of Date in client components
  updatedAt: string; // We'll use string instead of Date in client components
  // Add any additional fields that might be present in the server response
  [key: string]: any;
}

// Type for the client-side representation
export type ClientHistoryItem = Omit<HistoryItem, '_id'> & {
  id: string;
  _id?: never; // Ensure _id is not present in the client-side type
};

// Type guard to check if an object is a valid HistoryItem
export function isHistoryItem(item: any): item is HistoryItem {
  return (
    item &&
    typeof item === 'object' &&
    '_id' in item &&
    'title' in item &&
    'service' in item &&
    'userId' in item &&
    'createdAt' in item &&
    'updatedAt' in item
  );
}

// Function to convert any object to a ClientHistoryItem
export function toClientHistoryItem(item: any): ClientHistoryItem {
  if (!isHistoryItem(item)) {
    throw new Error('Invalid history item');
  }
  
  const { _id, ...rest } = item;
  return {
    ...rest,
    id: _id.toString(),
  };
}

/**
 * Get history items for a specific user and service
 * This function should only be called from server components or server actions
 */
export async function getHistoryItems(userId: string, service: ServiceType): Promise<ClientHistoryItem[]> {
  // This is a placeholder function that will be replaced by the server version
  // In a client component, you should use the API route instead
  throw new Error('getHistoryItems should only be called from server components or server actions. Use the API route instead.');
}