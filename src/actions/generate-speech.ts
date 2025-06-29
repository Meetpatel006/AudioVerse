"use server";

import { getUploadUrl } from "~/lib/azure-storage";
import { addHistoryItem } from "~/lib/history";
import { getMongoClient } from "~/lib/mongodb";
import { ObjectId } from 'mongodb';

const STYLETTS2_API_URL = process.env.STYLETTS2_API_URL || "https://gcet--styletts2-api-fastapi-app-dev.modal.run";
const API_KEY = process.env.STYLETTS2_API_KEY || "12345";

export interface Voice {
  id: string;
  name: string;
  preview_url?: string;
}

export async function getAvailableVoices(): Promise<Voice[]> {
  try {
    const response = await fetch(`${STYLETTS2_API_URL}/voices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch available voices');
    }

    const data = await response.json();
    
    // Map the API response to the Voice interface
    // The API returns an object with voice IDs as keys and voice details as values
    return Object.entries(data).map(([id, voiceDetails]) => ({
      id,
      name: String(voiceDetails).charAt(0).toUpperCase() + String(voiceDetails).slice(1), // Capitalize first letter
      preview_url: undefined // The API doesn't provide preview URLs in the response
    }));
  } catch (error) {
    console.error('Error fetching voices:', error);
    // Return default voices if the API call fails
    return [
      { id: 'man', name: 'Man' },
      { id: 'woman', name: 'Woman' }
    ];
  }
}

export async function generateTextToSpeech(text: string, voice: string, userId: string) {
  try {
    const response = await fetch(`${STYLETTS2_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        text,
        target_voice: voice
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to generate speech');
    }

    const data = await response.json();
    const audioUrl = data.audio_url;
    const blobName = data.blob_name;

    // Generate a unique ID for this audio generation
    const audioId = Math.random().toString(36).substring(2, 15);

    // Use the provided user ID or fall back to 'anonymous'
    const finalUserId = userId || 'anonymous';

    // Store in history
    await addHistoryItem({
      title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      voice: voice,
      audioUrl: audioUrl,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      service: "styletts2",
      userId: finalUserId,
      blobName: blobName
    });

    return {
      audioId,
      shouldShowThrottleAlert: false,
      audioUrl
    };
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate speech');
  }
}

export async function generateSpeechToSpeech(
  _originalVoiceS3Key: string,
  _voice: string,
) {
  // Generate a unique ID for this audio generation
  const audioId = Math.random().toString(36).substring(2, 15);

  // In a real implementation, you would call your speech-to-speech API here
  // const result = await callSpeechToSpeechAPI(originalVoiceS3Key, voice);

  // After generating audio, store in history
  await addHistoryItem({
    title: "Speech to Speech",
    voice: _voice,
    audioUrl: null, // Set actual URL after generation
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    service: "seedvc",
    userId: "anonymous", // TODO: Replace with actual user ID from auth
  });

  return {
    audioId,
    shouldShowThrottleAlert: false,
  };
}

export async function generateSoundEffect(_prompt: string) {
  // Generate a unique ID for this audio generation
  const audioId = Math.random().toString(36).substring(2, 15);

  // In a real implementation, you would call your sound effect generation API here
  // const result = await callSoundEffectAPI(prompt);

  // After generating audio, store in history
  await addHistoryItem({
    title: "Sound Effect: " + _prompt,
    voice: null,
    audioUrl: null, // Set actual URL after generation
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    service: "make-an-audio",
    userId: "anonymous", // TODO: Replace with actual user ID from auth
  });

  return {
    audioId,
    shouldShowThrottleAlert: false,
  };
}

export async function generationStatus(
  audioId: string
): Promise<{ success: boolean; audioUrl: string | null }> {
  // In this implementation, we'll assume the audio is immediately available
  // since the StyleTTS2 API returns the URL directly
  // If you need to implement polling for long-running tasks, you can modify this
  
  // For now, we'll just return the audio URL if we have it in the history
  try {
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection('audio_history');
    
    const item = await collection.findOne({ _id: new ObjectId(audioId) });
    
    if (item && item.audioUrl) {
      return {
        success: true,
        audioUrl: item.audioUrl
      };
    }
    
    return {
      success: false,
      audioUrl: null
    };
  } catch (error) {
    console.error('Error checking generation status:', error);
    return {
      success: false,
      audioUrl: null
    };
  }
}

/**
 * Generate an upload URL for Azure Blob Storage
 * @param fileType The MIME type of the file to upload
 * @returns An object containing the upload URL and blob key
 */
export async function generateUploadUrl(fileType: string) {
  return getUploadUrl(fileType);
}
