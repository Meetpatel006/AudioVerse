"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaUpload } from "react-icons/fa";
import {
  generateSpeechToSpeech,
  generateUploadUrl,
  generationStatus,
  getAvailableVoices,
  type Voice,
} from "~/actions/generate-speech";
import { GenerateButton } from "~/components/client/creative-platform/generate-button";
import { useAudioStore } from "~/stores/audio-store";
import { useVoiceStore } from "~/stores/voice-store";
import type { ServiceType } from "~/types/services";

const ALLOWED_AUDIO_TYPES = ["audio/mp3", "audio/wav"];

interface VoiceChangerProps {
  credits: number;
  service: ServiceType;
  userId: string;
}

export function VoiceChanger({ credits, service, userId }: VoiceChangerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { playAudio } = useAudioStore();
  const getSelectedVoice = useVoiceStore((state) => state.getSelectedVoice);

  const handleFileSelect = (selectedFile: File) => {
    const isAllowedAudio = ALLOWED_AUDIO_TYPES.includes(selectedFile.type);
    const isUnder50MB = selectedFile.size <= 50 * 1024 * 1024;

    if (isAllowedAudio && isUnder50MB) {
      setFile(selectedFile);
    } else {
      alert(
        isAllowedAudio
          ? "File is too large. Max size is 50MB"
          : "Please select an MP3 or WAV file only",
      );
    }
  };

  const handleGenerateSpeech = async (): Promise<void> => {
    if (!file) return;
    
    const selectedVoice = getSelectedVoice(service);
    if (!selectedVoice) {
      toast.error("Please select a voice");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, get the upload URL and blob key
      const uploadResult = await generateUploadUrl(file.type);
      
      // Upload the file to Azure Blob Storage
      const uploadResponse = await fetch(uploadResult.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          "x-ms-blob-type": "BlockBlob",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to Azure Blob Storage");
      }

      // Call the speech-to-speech generation
      const result = await generateSpeechToSpeech(
        uploadResult.blobKey,
        selectedVoice.id,
        userId,
        file.name
      );

      if (result.audioUrl) {
        // If we have the audio URL immediately, play it
        const newAudio = {
          id: result.audioId,
          title: file.name,
          audioUrl: result.audioUrl,
          voice: selectedVoice.id,
          duration: "0:30",
          progress: 0,
          service: service,
          createdAt: new Date().toLocaleDateString(),
        };
        
        playAudio(newAudio);
        setFile(null);
        setIsLoading(false);
      } else {
        // Otherwise, poll for status
        setCurrentAudioId(result.audioId);
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      setIsLoading(false);
      toast.error(error instanceof Error ? error.message : "Failed to generate speech");
    }
  };

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const voices = await getAvailableVoices(service);
        setAvailableVoices(voices);
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };

    fetchVoices();
  }, [service]);

  useEffect(() => {
    if (!currentAudioId || !isLoading) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const status = await generationStatus(currentAudioId);
        const selectedVoice = getSelectedVoice("seedvc");

        if (!isMounted) return;

        if (status.success && status.audioUrl && selectedVoice) {
          clearInterval(pollInterval);
          setIsLoading(false);

          const newAudio = {
            id: currentAudioId,
            title: file ? file.name : "Voice changed audio",
            audioUrl: status.audioUrl,
            voice: selectedVoice.id,
            duration: "0:30",
            progress: 0,
            service: service,
            createdAt: new Date().toLocaleDateString(),
          };

          playAudio(newAudio);
          setCurrentAudioId(null);
          setFile(null);
        } else if (!status.success) {
          clearInterval(pollInterval);
          setIsLoading(false);
          setCurrentAudioId(null);
          toast.error("Voice changing failed");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error checking generation status:", error);
          clearInterval(pollInterval);
          setIsLoading(false);
          setCurrentAudioId(null);
          toast.error("Error checking generation status");
        }
      }
    };

    // Use void to explicitly ignore the promise
    void (async () => {
      // Initial check
      await checkStatus();
      
      // Set up polling
      pollInterval = setInterval(() => {
        void checkStatus();
      }, 2000);
    })();

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [currentAudioId, isLoading, getSelectedVoice, playAudio, file, service]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-between px-4">
      <div className="flex flex-1 items-center justify-center py-8">
        <div 
          className={`w-full max-w-2xl rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <FaUpload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {file ? file.name : 'Drag and drop an audio file, or click to select'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {file ? 'Click to change file' : 'Supports MP3, WAV, and other audio formats (max 50MB)'}
              </p>
            </div>
            {file && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-gray-700">Select Target Voice</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {availableVoices.map((voice) => (
            <button
              key={voice.id}
              className={`flex items-center space-x-3 rounded-lg border p-4 text-left transition-colors ${
                getSelectedVoice(service)?.id === voice.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => {
                const voiceStore = useVoiceStore.getState();
                if ('setSelectedVoice' in voiceStore) {
                  (voiceStore as any).setSelectedVoice(service, voice);
                } else {
                  console.warn('setSelectedVoice not available in voice store');
                }
              }}
              type="button"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{voice.name}</p>
                {voice.preview_url && (
                  <p className="text-xs text-gray-500">Preview available</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 flex justify-center">
        <GenerateButton
          onGenerate={handleGenerateSpeech}
          isDisabled={!file || !getSelectedVoice(service)}
          isLoading={isLoading}
          creditsRemaining={credits}
          showCredits={true}
          buttonText={
            getSelectedVoice(service)
              ? `Convert to ${getSelectedVoice(service)?.name} Voice`
              : 'Select a voice to continue'
          }
        />
      </div>
    </div>
  );
}
