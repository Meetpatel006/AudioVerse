"use server";

import { getUploadUrl } from "~/lib/azure-storage";
import { addHistoryItem } from "~/lib/history-server";
import { getMongoClient } from "~/lib/mongodb";
import { ObjectId } from 'mongodb';

const MELODY_MAKER_API_URL = process.env.MELODY_MAKER_API_URL || "https://gcet--melodyflow-api-serve-fastapi-dev.modal.run";

export async function generateMelody(
  prompt: string,
  solver: 'midpoint' | 'euler',
  numInferenceSteps: number,
  duration: number,
  targetFlow: number,
  regularization: boolean,
  regularizationStrength: number,
  userId: string
) {
  try {
    console.log("Starting melody generation request");
    // Map our parameters to the API parameters
    const requestBody = {
      text: prompt,
      solver: solver,
      steps: numInferenceSteps,
      target_flowstep: targetFlow,
      regularize: regularization,
      regularization_strength: regularizationStrength,
      duration: duration,
      model_name: "facebook/melodyflow-t24-30secs",
      num_variations: 1 // Default to 1 variation
    };

    // Log the payload for debugging
    console.log("Sending payload to Melody Maker API:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${MELODY_MAKER_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log("Melody Maker API response:", response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Melody Maker API error response:", response.status, response.statusText, error);
      throw new Error(error.detail || 'Failed to generate melody');
    }

    const data = await response.json();
    console.log("Received response from Melody Maker API:", JSON.stringify(data, null, 2));
    const audioUrl = data.audio_url;
    const blobName = data.blob_name;

    // Generate a unique ID for this audio generation
    const audioId = Math.random().toString(36).substring(2, 15);

    // Use the provided user ID or fall back to 'anonymous'
    const finalUserId = userId || 'anonymous';

    // Store in history
    await addHistoryItem({
      title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
      voice: null,
      audioUrl: audioUrl,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      service: "melody-maker",
      userId: finalUserId,
      blobName: blobName
    });

    return {
      audioId,
      shouldShowThrottleAlert: false,
      audioUrl
    };
  } catch (error) {
    console.error('Error generating melody:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate melody');
  }
}

export async function generationStatus(
  audioId: string
): Promise<{ success: boolean; audioUrl: string | null }> {
  try {
    // For melody maker, the audio is typically generated synchronously, so we don't need to poll
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