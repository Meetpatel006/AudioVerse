"use server";

import { getUploadUrl } from "~/lib/azure-storage";
import { addHistoryItem } from "~/lib/history";
import { getMongoClient } from "~/lib/mongodb";
import { ObjectId } from 'mongodb';

const STYLETTS2_API_URL = process.env.STYLETTS2_API_URL || "https://gcet--styletts2-api-fastapi-app-dev.modal.run";
const API_KEY = process.env.STYLETTS2_API_KEY || "12345";
const MAKE_AUDIO_API_URL = process.env.MAKE_AUDIO_API_URL || "https://gcet--make-an-audio-api-fastapi-app-dev.modal.run";
const MAKE_AUDIO_API_KEY = process.env.MAKE_AUDIO_API_KEY || "make-audio-2025";

export interface Voice {
  id: string;
  name: string;
  preview_url?: string;
}

export async function getAvailableVoices(service: string = 'styletts2'): Promise<Voice[]> {
  console.log('getAvailableVoices called with service:', service);
  
  if (service === 'seedvc') {
    console.log('Returning Seed-VC voices');
    return [
      { id: 'male', name: 'Male' },
      { id: 'female', name: 'Female' },
      { id: 'trump', name: 'Donald Trump' }
    ];
  }
  
  // Default to StyleTTS2 voices
  try {
    console.log('Fetching voices from:', `${STYLETTS2_API_URL}/voices`);
    
    const response = await fetch(`${STYLETTS2_API_URL}/voices`, {
      method: 'GET',
      headers: {
        'Authorization': API_KEY, // Modal expects just the key, not "Bearer " prefix
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorDetail = 'Failed to fetch available voices';
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || JSON.stringify(errorData);
        console.error('API Error:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();
    console.log('Received voices data:', data);
    
    // Handle different response formats
    let voices: Voice[] = [];
    
    if (Array.isArray(data)) {
      // If the API returns an array of voice objects
      voices = data.map((item: any) => ({
        id: item.id || String(Math.random()),
        name: item.name || 'Unknown Voice',
        preview_url: item.preview_url
      }));
    } else if (typeof data === 'object' && data !== null) {
      // If the API returns an object with voice IDs as keys
      voices = Object.entries(data).map(([id, voiceDetails]) => ({
        id,
        name: typeof voiceDetails === 'string' 
          ? voiceDetails.charAt(0).toUpperCase() + voiceDetails.slice(1)
          : 'Unknown Voice',
        preview_url: undefined
      }));
    }
    
    // Ensure we always return at least some default voices
    if (voices.length === 0) {
      console.warn('No voices found in API response, using fallback voices');
      voices = [
        { id: 'man', name: 'Man' },
        { id: 'woman', name: 'Woman' }
      ];
    }
    
    return voices;
    
  } catch (error) {
    console.error('Error in getAvailableVoices:', error);
    
    // Return default voices if the API call fails
    return [
      { id: 'man', name: 'Man' },
      { id: 'woman', name: 'Woman' },
      { id: 'child', name: 'Child' },
      { id: 'elderly', name: 'Elderly' }
    ];
  }
}

export async function generateTextToSpeech(text: string, voice: string, userId: string) {
  try {
    const response = await fetch(`${STYLETTS2_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY // Modal expects just the key, not "Bearer " prefix
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

const SEED_VC_API_URL = process.env.SEED_VC_API_URL || "https://gcet--seed-vc-api-fastapi-app-dev.modal.run";
const SEED_VC_API_KEY = process.env.SEED_VC_API_KEY || "seed-vc-2025";

export async function generateSpeechToSpeech(
  sourceAudioKey: string,
  targetVoice: string,
  userId: string,
  fileName: string = "voice_changed_audio"
) {
  try {
    // Generate a unique ID for this audio generation
    const audioId = Math.random().toString(36).substring(2, 15);
    
    // Call the Seed-VC API
    const response = await fetch(`${SEED_VC_API_URL}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SEED_VC_API_KEY // Modal expects just the key, not "Bearer " prefix
      },
      body: JSON.stringify({
        source_audio_key: sourceAudioKey,
        target_voice: targetVoice
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to convert voice');
    }

    const data = await response.json();
    const audioUrl = data.audio_url;
    const blobName = data.blob_name;

    if (!audioUrl) {
      throw new Error('No audio URL returned from the API');
    }

    // Store in history
    await addHistoryItem({
      title: `Voice Changed: ${fileName} (${targetVoice} voice)`,
      voice: targetVoice,
      audioUrl: audioUrl,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      service: "seedvc",
      userId: userId,
      blobName: blobName
    });

    return {
      audioId,
      shouldShowThrottleAlert: false,
      audioUrl
    };
  } catch (error) {
    console.error('Error in speech-to-speech conversion:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to convert voice');
  }
}

interface GenerateSoundEffectResponse {
  audioId: string;
  shouldShowThrottleAlert: boolean;
  audioUrl?: string;
}

export async function generateSoundEffect(prompt: string, userId: string): Promise<GenerateSoundEffectResponse> {
  try {
    // Generate a unique ID for this audio generation
    const audioId = Math.random().toString(36).substring(2, 15);

    // Call the Make-An-Audio API
    const response = await fetch(`${MAKE_AUDIO_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MAKE_AUDIO_API_KEY // Modal expects just the key, not "Bearer " prefix
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to generate sound effect');
    }

    const data = await response.json();
    const audioUrl = data.audio_url;
    const blobName = data.blob_name;

    if (!audioUrl) {
      throw new Error('No audio URL returned from the API');
    }

    // Store in history
    await addHistoryItem({
      title: "Sound Effect: " + (prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '')),
      voice: null,
      audioUrl: audioUrl,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      service: "make-an-audio",
      userId: userId || 'anonymous',
      blobName: blobName
    });

    return {
      audioId,
      shouldShowThrottleAlert: false,
      audioUrl
    };
  } catch (error) {
    console.error('Error generating sound effect:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate sound effect');
  }
}

export async function generationStatus(
  audioId: string
): Promise<{ success: boolean; audioUrl: string | null }> {
  try {
    // For Seed-VC, the audio is typically generated synchronously, so we don't need to poll
    // But we'll keep this function for backward compatibility
    // If the audio was generated successfully, it would have been returned in the initial response
    // So if we're checking status, it likely means the audio is not ready or failed
    
    // Return a failure status to stop polling
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
