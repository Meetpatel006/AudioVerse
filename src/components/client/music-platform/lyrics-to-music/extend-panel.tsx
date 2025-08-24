'use client';

import { useState } from "react";
import { extendMusic } from "~/actions/generate-music";
import { useAuth } from "~/contexts/AuthContext";
import { useAudioStore } from "~/stores/audio-store";
import { GenerateButton } from "../generate-button";

// TODO: These should come from a shared store or props
const MOCK_PROMPT = "A cheerful pop song with guitar and drums";
const MOCK_SRC_AUDIO_PATH = "https://example.com/audio.wav"; // This should be the URL of the audio to extend

export function ExtendPanel() {
  const { user } = useAuth();
  const { setAudioUrl } = useAudioStore();
  const [loading, setLoading] = useState(false);

  const [extendSeeds, setExtendSeeds] = useState("");
  const [leftExtendLength, setLeftExtendLength] = useState<number | undefined>(undefined);
  const [rightExtendLength, setRightExtendLength] = useState<number | undefined>(undefined);

  const handleExtend = async () => {
    if (!user) {
      alert("Please sign in to extend music.");
      return;
    }
    if (!MOCK_SRC_AUDIO_PATH) {
        alert("Please generate or select an audio to extend first.");
        return;
    }
    if (leftExtendLength === undefined && rightExtendLength === undefined) {
        alert("Please specify either left or right extend length.");
        return;
    }

    setLoading(true);
    try {
      const result = await extendMusic({
        prompt: MOCK_PROMPT,
        src_audio_path: MOCK_SRC_AUDIO_PATH,
        extend_seeds: extendSeeds,
        left_extend_length: leftExtendLength,
        right_extend_length: rightExtendLength,
        userId: user.id,
      });
      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
      }
    } catch (error) {
      console.error("Failed to extend music:", error);
      alert("Failed to extend music. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Extend Seeds</label>
        <input
          type="text"
          value={extendSeeds}
          onChange={(e) => setExtendSeeds(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">Seeds for reproducible extension.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Left Extend Length (seconds)</label>
          <input
            type="number"
            value={leftExtendLength || ''}
            onChange={(e) => setLeftExtendLength(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Right Extend Length (seconds)</label>
          <input
            type="number"
            value={rightExtendLength || ''}
            onChange={(e) => setRightExtendLength(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            min="0"
          />
        </div>
      </div>
      <GenerateButton
        onGenerate={handleExtend}
        isDisabled={loading || (!leftExtendLength && !rightExtendLength)}
        isLoading={loading}
        showDownload={false}
        creditsRemaining={0}
        showCredits={false}
        buttonText="Extend"
      />
    </div>
  );
}