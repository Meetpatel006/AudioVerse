import { create } from "zustand";
import { audioManager } from "~/utils/audio-manager";

export interface AudioInfo {
  id: string;
  title: string;
  voice: string | null;
  audioUrl: string;
  duration?: string;
  progress?: number;
  createdAt?: string;
  service?: string;
}

interface AudioState {
  currentAudio: AudioInfo | null;
  isPlaying: boolean;
  isPlaybarOpen: boolean;
  progress: number;
  duration: string;

  setCurrentAudio: (audio: AudioInfo) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsPlaybarOpen: (isOpen: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: string) => void;

  playAudio: (audio: AudioInfo) => void;
  togglePlayPause: () => void;
  togglePlaybar: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  downloadAudio: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentAudio: null,
  isPlaying: false,
  isPlaybarOpen: false,
  progress: 50,
  duration: "0:00",

  setCurrentAudio: (audio) => set({ currentAudio: audio }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsPlaybarOpen: (isPlaybarOpen) => set({ isPlaybarOpen }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),

  playAudio: async (audio) => {
    const current = get().currentAudio;

    // If clicking the same audio that's already playing, just toggle play/pause
    if (current && current.audioUrl === audio.audioUrl) {
      get().togglePlayPause();
      return;
    }

    // Initialize audio manager
    const audioElement = audioManager.initialize();
    if (!audioElement) {
      console.error('Audio element could not be initialized');
      return;
    }

    // Set up error handling
    audioManager.onError((error) => {
      console.error('Audio error:', error);
      set({ isPlaying: false });
    });

    // Update the UI to show loading state
    set({
      currentAudio: audio,
      isPlaybarOpen: true,
      isPlaying: false, // Start with false until audio is loaded
    });

    try {
      // Set the audio source and wait for it to load
      await audioManager.setAudioSource(audio.audioUrl);
      
      // Start playback
      await audioManager.play();
      
      // If we get here, playback started successfully
      set({ isPlaying: true });

    } catch (err) {
      console.error('Failed to play audio:', err);
      set({ isPlaying: false });
    }
  },

  togglePlayPause: async () => {
    const isPlaying = get().isPlaying;
    const currentAudio = get().currentAudio;
    
    if (!currentAudio) return;

    try {
      if (isPlaying) {
        audioManager.pause();
        set({ isPlaying: false });
      } else {
        const audio = audioManager.getAudio();
        if (!audio) {
          console.error('Audio element not available');
          return;
        }

        // If audio source is not set or different from current audio, update it
        if (!audio.src || audio.src !== currentAudio.audioUrl) {
          await audioManager.setAudioSource(currentAudio.audioUrl);
        }

        await audioManager.play();
        set({ isPlaying: true });
      }
    } catch (err) {
      console.error('Error toggling play/pause:', err);
      set({ isPlaying: false });
    }
  },

  togglePlaybar: () => set({ isPlaybarOpen: !get().isPlaybarOpen }),

  skipForward: () => {
    audioManager.skipForward();
  },

  skipBackward: () => {
    audioManager.skipBackward();
  },

  downloadAudio: () => {
    const audio = get().currentAudio;
    if (!audio?.audioUrl) return;

    const link = document.createElement("a");
    link.href = audio.audioUrl;
    link.download = `${audio.title ?? "audio"}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
}));
