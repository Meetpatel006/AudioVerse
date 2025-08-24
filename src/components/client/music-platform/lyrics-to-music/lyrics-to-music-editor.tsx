"use client";

import { useState } from "react";
import { GenerateButton } from "../generate-button";
import { generateMusic } from "~/actions/generate-music";
import { useAuth } from "~/contexts/AuthContext";
import { useAudioStore } from "~/stores/audio-store";

interface LyricsToMusicEditorProps {
  service: string;
  credits: number;
  userId: string;
}

export function LyricsToMusicEditor({ service, credits, userId }: LyricsToMusicEditorProps) {
  const [duration, setDuration] = useState(30);
  const [tags, setTags] = useState("funk, pop, soul, rock, meloc");
  const [lyrics, setLyrics] = useState(
    "[verse]\nNeon lights they flicker bright...\n[chorus]\nTogether we..."
  );
  const [loading, setLoading] = useState(false);
  const { playAudio } = useAudioStore();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateMusic({
        prompt: tags,
        lyrics: lyrics,
        audio_duration: duration,
        userId: userId,
      });
      if (result.audioUrl) {
        playAudio({
          id: `generated-${Date.now()}`,
          title: 'Generated Music',
          voice: null,
          audioUrl: result.audioUrl,
          service: 'lyrics-to-music'
        });
      }
    } catch (error) {
      console.error("Failed to generate music:", error);
      alert("Failed to generate music. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Audio Duration</h2>
          <p className="text-gray-500 mb-4">
            Control the length of your generated audio
          </p>
          <div className="flex items-center mb-4">
            <span className="mr-4">Duration: {duration}s</span>
            <input
              type="range"
              min="1"
              max="120"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setDuration(30)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${duration === 30
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              30s
            </button>
            <button
              onClick={() => setDuration(60)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${duration === 60
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              60s
            </button>
            <button
              onClick={() => setDuration(120)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${duration === 120
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              120s
            </button>
            <button
              onClick={() => setDuration(Math.floor(Math.random() * 120) + 1)}
              className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Random
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Preset & Tags</h2>
          <p className="text-gray-500 mb-4">
            Choose presets or add custom style tags
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Preset
              </label>
              <select className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black">
                <option>Custom</option>
                {/* Add other presets here */}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Lyrics</h2>
          <p className="text-gray-500 mb-4">
            Add structured lyrics with tags
          </p>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="[verse]..."
            className="min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <div className="mt-4">
        <GenerateButton
          onGenerate={handleGenerate}
          isDisabled={loading}
          isLoading={loading}
          showDownload={false}
          creditsRemaining={0}
          showCredits={false}
          buttonText="Generate Audio"
        />
      </div>
    </div>
  );
}
