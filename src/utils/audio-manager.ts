class AudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private errorHandler: ((error: Error) => void) | null = null;
  private canPlayHandler: (() => void) | null = null;

  initialize(): HTMLAudioElement | null {
    if (this.audioElement) return this.audioElement;

    if (typeof window !== "undefined") {
      this.audioElement = new Audio();
      return this.audioElement;
    }

    return null;
  }

  getAudio(): HTMLAudioElement | null {
    return this.audioElement;
  }

  getCurrentTime(): number {
    return this.audioElement?.currentTime ?? 0;
  }

  getDuration(): number {
    return this.audioElement?.duration ?? 0;
  }

  getProgress(): number {
    if (!this.audioElement?.duration) return 0;
    return (this.audioElement.currentTime / this.audioElement.duration) * 100;
  }

  setAudioSource(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audioElement) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      // Clear previous event handlers
      this.audioElement.onerror = null;
      this.audioElement.oncanplay = null;

      // Set up new handlers
      this.audioElement.onerror = () => {
        const error = new Error(`Failed to load audio from ${url}`);
        this.errorHandler?.(error);
        reject(error);
      };

      this.audioElement.oncanplay = () => {
        this.canPlayHandler?.();
        resolve();
      };

      // Set the source and start loading
      this.audioElement.src = url;
      this.audioElement.load();
    });
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }

  onCanPlay(handler: () => void): void {
    this.canPlayHandler = handler;
  }

  async play(): Promise<void> {
    if (!this.audioElement) {
      throw new Error('Audio element not initialized');
    }

    try {
      await this.audioElement.play();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to play audio');
      this.errorHandler?.(error);
      throw error;
    }
  }

  pause(): void {
    return this.audioElement?.pause();
  }

  skipForward(seconds = 10): void {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.min(
        this.audioElement.duration ?? 0,
        this.audioElement.currentTime + seconds,
      );
    }
  }

  skipBackward(seconds = 10): void {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(
        0,
        this.audioElement.currentTime - seconds,
      );
    }
  }
}

export const audioManager = new AudioManager();
