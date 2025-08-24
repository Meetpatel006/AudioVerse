
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
 * @returns The audio URL.
 */
async function callMusicApi(endpoint: string, body: object, serviceName: ServiceType, userId: string) {
  try {
    console.log(`Starting music generation request for service: ${serviceName}`);
    console.log(`Sending payload to Music API (${endpoint}):`, JSON.stringify(body, null, 2));

    const response = await fetch(`${MUSIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log(`Music API response from ${endpoint}:`, response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`Music API error response from ${endpoint}:`, response.status, response.statusText, error);
      throw new Error(error.detail || `Failed to ${serviceName}`);
    }

    const data = await response.json();
    console.log(`Received response from Music API (${endpoint}):`, JSON.stringify(data, null, 2));
    
    const audioUrl = data.audio_url;
    const blobName = data.blob_name;
    
    if (!audioUrl) {
      throw new Error("No audio URL received from the API.");
    }

    const finalUserId = userId || 'anonymous';
    const title = (body as BaseParams).prompt?.substring(0, 50) || 'Generated Music';
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();
    
    // No need to re-upload, just use the provided URL
    try {
      // Store metadata in MongoDB
      await addHistoryItem({
        title,
        voice: null,
        audioUrl,
        time,
        date,
        service: serviceName,
        userId: finalUserId,
        blobName
      });

      return { audioUrl };
    } catch (error) {
      console.error('Error uploading audio to blob storage:', error);
      throw new Error('Failed to process the generated audio');
    }
  } catch (error) {
    console.error(`Error in ${serviceName}:`, error);
    throw new Error(error instanceof Error ? error.message : `Failed to ${serviceName}`);
  }
}

export async function generateMusic(params: GenerateMusicParams) {
  const { userId, ...body } = params;
  return callMusicApi('/generate', body, 'lyrics-to-music' as ServiceType, userId);
}

export async function retakeMusic(params: RetakeMusicParams) {
  const { userId, ...body } = params;
  return callMusicApi('/generate/retake', body, 'lyrics-to-music' as ServiceType, userId);
}

export async function repaintMusic(params: RepaintMusicParams) {
  const { userId, ...body } = params;
  return callMusicApi('/generate/repaint', body, 'lyrics-to-music' as ServiceType, userId);
}

export async function editMusic(params: EditMusicParams) {
  const { userId, ...body } = params;
  return callMusicApi('/generate/edit', body, 'lyrics-to-music' as ServiceType, userId);
}

export async function extendMusic(params: ExtendMusicParams) {
  const { userId, ...body } = params;
  return callMusicApi('/generate/extend', body, 'lyrics-to-music' as ServiceType, userId);
}
