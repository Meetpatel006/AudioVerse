class AudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private errorHandler: ((error: Error) => void) | null = null;
  private canPlayHandler: (() => void) | null = null;
  private currentBlobUrl: string | null = null;

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      aac: 'audio/aac',
      webm: 'audio/webm',
      opus: 'audio/ogg; codecs=opus',
      flac: 'audio/flac',
      weba: 'audio/webm'
    };
    return mimeTypes[extension] || 'audio/mpeg';
  }

  initialize(): HTMLAudioElement | null {
    if (this.audioElement) return this.audioElement;
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.preload = 'metadata';
      return this.audioElement;
    }
    return null;
  }

  private revokeBlob() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  /**
   * Sets audio source, with Azure Blob SAS support
   */
  private stripSasToken(url: string): string {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('.blob.core.windows.net')) {
        // Remove query parameters for Azure Blob URLs
        return `${urlObj.origin}${urlObj.pathname}`;
      }
      return url;
    } catch (e) {
      console.warn('Invalid URL, using as-is:', url);
      return url;
    }
  }

  async setAudioSource(url: string): Promise<void> {
    if (!this.audioElement) {
      return Promise.reject(new Error('Audio element not initialized'));
    }
    if (!url) {
      return Promise.reject(new Error('No audio URL provided'));
    }

    // Clean up the URL by removing SAS token if present
    const cleanUrl = this.stripSasToken(url);
    
    // Always fetch SAS URLs to avoid MIME/type header issues
    const isAzureBlob = cleanUrl.includes('.blob.core.windows.net');
    if (isAzureBlob) {
      console.log('Using clean Azure Blob URL for playback:', cleanUrl);
      return this.fetchAndPlayBlob(cleanUrl);
    }

    // Otherwise try direct playback
    return this.tryDirectPlay(url).catch(err => {
      console.warn('Direct play failed, falling back to Blob method:', err);
      return this.fetchAndPlayBlob(url);
    });
  }

  /**
   * Try playing directly
   */
  private tryDirectPlay(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audioElement) return reject(new Error('No audio element'));
      this.revokeBlob();
      this.audioElement.src = url;

      const cleanup = () => {
        this.audioElement?.removeEventListener('canplay', onCanPlay);
        this.audioElement?.removeEventListener('error', onError);
      };

      const onCanPlay = () => {
        cleanup();
        this.canPlayHandler?.();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error('Audio format not supported by browser'));
      };

      this.audioElement.addEventListener('canplay', onCanPlay, { once: true });
      this.audioElement.addEventListener('error', onError, { once: true });

      this.audioElement.load();
    });
  }

  /**
   * Always fetch → Blob → Object URL → play
   */
  private async fetchAndPlayBlob(url: string): Promise<void> {
    if (!this.audioElement) throw new Error('Audio element not initialized');

  const extension = (url.split('.').pop()?.split('?')?.[0] ?? '').toLowerCase();
  const mimeType = this.getMimeType(extension);

    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include', // Include credentials if needed for authentication
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error details');
      throw new Error(`Failed to fetch audio: ${res.status} ${res.statusText}\n${errorText}`);
    }

    const blob = await res.blob();
    const fixedBlob = blob.type ? blob : new Blob([blob], { type: mimeType });

    this.revokeBlob();
    this.currentBlobUrl = URL.createObjectURL(fixedBlob);
    this.audioElement.src = this.currentBlobUrl;

    return new Promise((resolve, reject) => {
      if (!this.audioElement) return reject(new Error('Audio element not initialized'));
      const el = this.audioElement;

      const cleanup = () => {
        el.removeEventListener('canplay', onCanPlay);
        el.removeEventListener('error', onError);
      };

      const onCanPlay = () => {
        cleanup();
        this.canPlayHandler?.();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error('Failed to play fetched Blob audio'));
      };

      el.addEventListener('canplay', onCanPlay, { once: true });
      el.addEventListener('error', onError, { once: true });

      el.load();
    });
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }

  onCanPlay(handler: () => void): void {
    this.canPlayHandler = handler;
  }

  async play(): Promise<void> {
    if (!this.audioElement) throw new Error('Audio element not initialized');
    try {
      await this.audioElement.play();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to play audio');
      this.errorHandler?.(error);
      throw error;
    }
  }

  pause(): void {
    this.audioElement?.pause();
  }

  skipForward(seconds = 10): void {
    if (!this.audioElement) return;
    try {
      this.audioElement.currentTime = Math.min(this.audioElement.duration || Infinity, this.audioElement.currentTime + seconds);
    } catch (e) {
      console.warn('skipForward failed', e);
    }
  }

  skipBackward(seconds = 10): void {
    if (!this.audioElement) return;
    try {
      this.audioElement.currentTime = Math.max(0, this.audioElement.currentTime - seconds);
    } catch (e) {
      console.warn('skipBackward failed', e);
    }
  }

  getCurrentTime(): number {
    return this.audioElement ? this.audioElement.currentTime : 0;
  }

  getAudio(): HTMLAudioElement | null {
    return this.audioElement;
  }

  getProgress(): number {
    if (!this.audioElement?.duration) return 0;
    return (this.audioElement.currentTime / this.audioElement.duration) * 100;
  }

  getDuration(): number {
    return this.audioElement?.duration || 0;
  }

  dispose(): void {
    this.pause();
    this.revokeBlob();
    if (this.audioElement) {
      this.audioElement.src = '';
      this.audioElement = null;
    }
  }
}

export const audioManager = new AudioManager();
