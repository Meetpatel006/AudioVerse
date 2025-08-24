
"use server";

import { addHistoryItem } from "~/lib/history-server";
import { env } from "~/env";
import type { ServiceType } from "~/types/services";
import { blobServiceClient } from "~/lib/azure-storage";

const MUSIC_API_URL = env.LYRICS_TO_MUSIC_API_URL || "https://gcet--ace-step-flask-api-flask-app-dev.modal.run";

// #region Parameter Interfaces
interface BaseParams {
  format?: 'wav' | 'mp3';
  audio_duration?: number;
  length?: number;
  prompt?: string;
  lyrics?: string;
}

interface BasicSettings {
  infer_step?: number;
  guidance_scale?: number;
  scheduler_type?: 'euler' | 'heun' ;
  cfg_type?: 'apg' | 'cfg';
  omega_scale?: number;
  manual_seeds?: number[] | string;
  guidance_interval?: number;
  guidance_interval_decay?: number;
  min_guidance_scale?: number;
  use_erg_tag?: boolean;
  use_erg_lyric?: boolean;
  use_erg_diffusion?: boolean;
  oss_steps?: number[] | string;
  guidance_scale_text?: number;
  guidance_scale_lyric?: number;
}

interface Audio2AudioParams {
  audio2audio_enable?: boolean;
  ref_audio_strength?: number;
  ref_audio_input?: string;
}

interface LoRAParams {
  lora_name_or_path?: string;
  lora_weight?: number;
}

interface MiscParams {
    batch_size?: number;
    save_path?: string;
    debug?: boolean;
}
// #endregion

// #region Action Parameter Types
export type GenerateMusicParams = BaseParams & BasicSettings & Audio2AudioParams & LoRAParams & MiscParams & { userId: string };

export type RetakeMusicParams = Omit<GenerateMusicParams, 'audio2audio_enable' | 'ref_audio_strength' | 'ref_audio_input'> & {
  retake_seeds: number[] | string;
  retake_variance?: number;
};

export type RepaintMusicParams = Omit<GenerateMusicParams, 'audio2audio_enable' | 'ref_audio_strength' | 'ref_audio_input'> & {
  src_audio_path: string;
  repaint_start: number;
  repaint_end: number;
};

export type EditMusicParams = Omit<GenerateMusicParams, 'audio2audio_enable' | 'ref_audio_strength' | 'ref_audio_input'> & {
  src_audio_path: string;
  edit_target_prompt: string;
  edit_target_lyrics?: string;
  edit_n_min?: number;
  edit_n_max?: number;
};

export type ExtendMusicParams = Omit<GenerateMusicParams, 'audio2audio_enable' | 'ref_audio_strength' | 'ref_audio_input'> & {
  src_audio_path: string;
  left_extend_length?: number;
  right_extend_length?: number;
  extend_seeds?: number[] | string;
  retake_variance?: number;
};
// #endregion

/**
 * A helper function to call the music generation API.
 * @param endpoint The API endpoint to call (e.g., '/generate').
 * @param body The request body.
 * @param serviceName The name of the service for history tracking.
 * @param userId The user's ID.
 * @returns The audio URL and audio ID.
 */
async function callMusicApi(endpoint: string, body: any, serviceName: ServiceType, userId: string) {
  try {
    const response = await fetch(`${MUSIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': process.env.LYRICS_TO_MUSIC_API_KEY || ''
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Failed to ${serviceName}`);
    }

    const data = await response.json();
    const audioUrl = data.audio_url;
    const blobName = data.blob_name || `music-${Date.now()}.wav`;
    
    if (!audioUrl) {
      throw new Error("No audio URL received from the API.");
    }

    // Generate a unique ID for this audio generation
    const audioId = Math.random().toString(36).substring(2, 15);
    
    // Use the provided user ID or fall back to 'anonymous'
    const finalUserId = userId || 'anonymous';
    
    // Create a title from the prompt or use a default
    const title = (body.prompt || 'Generated Music').substring(0, 50) + 
                 ((body.prompt && body.prompt.length > 50) ? '...' : '');
    
    // Store in history
    try {
      await addHistoryItem({
        title,
        voice: null,
        audioUrl,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        service: serviceName,
        userId: finalUserId,
        blobName
      });
    } catch (historyError) {
      // Don't fail the request if history saving fails
    }

    return {
      audioId,
      audioUrl,
      shouldShowThrottleAlert: false
    };
  } catch (error) {
    console.error(`Error in ${serviceName}:`, error);
    throw new Error(error instanceof Error ? error.message : `Failed to ${serviceName}`);
  }
}

export async function generateMusic(params: GenerateMusicParams & { userId: string }) {
  const { userId, ...body } = params;
  
  // Ensure required fields have default values
  const requestBody = {
    prompt: '',
    lyrics: '',
    audio_duration: 30, // Default duration in seconds
    format: 'wav',     // Default format
    ...body            // Override with any provided values
  };
  
  try {
    return await callMusicApi(
      '/generate', 
      requestBody, 
      'lyrics-to-music' as ServiceType, 
      userId
    );
  } catch (error) {
    throw error;
  }
}

export async function retakeMusic(params: RetakeMusicParams & { userId: string }) {
  const { userId, ...body } = params;
  
  return callMusicApi(
    '/generate/retake', 
    body, 
    'lyrics-to-music' as ServiceType, 
    userId
  );
}

export async function repaintMusic(params: RepaintMusicParams & { userId: string }) {
  const { userId, ...body } = params;
  
  return callMusicApi(
    '/generate/repaint', 
    body, 
    'lyrics-to-music' as ServiceType, 
    userId
  );
}

export async function editMusic(params: EditMusicParams & { userId: string }) {
  const { userId, ...body } = params;
  
  return callMusicApi(
    '/generate/edit', 
    body, 
    'lyrics-to-music' as ServiceType, 
    userId
  );
}

export async function extendMusic(params: ExtendMusicParams & { userId: string }) {
  const { userId, ...body } = params;
  
  return callMusicApi(
    '/generate/extend', 
    body, 
    'lyrics-to-music' as ServiceType, 
    userId
  );
}
