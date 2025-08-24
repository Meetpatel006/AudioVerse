"use client";

import { useState } from "react";
import { retakeMusic } from "~/actions/generate-music";
import { useAuth } from "~/contexts/AuthContext";
import { useAudioStore } from "~/stores/audio-store";
import { GenerateButton } from "../generate-button";

// TODO: These should probably come from a shared store or props
const MOCK_PROMPT = "A cheerful pop song with guitar and drums";
const MOCK_LYRICS = "Feel the rhythm, feel the beat, dancing through the summer heat";

export function RetakePanel() {
  const { user } = useAuth();
  const { setAudioUrl } = useAudioStore();
  const [variance, setVariance] = useState(0.5);
  const [seeds, setSeeds] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRetake = async () => {
    if (!user) {
      alert("Please sign in to retake music.");
      return;
    }
    if (!seeds) {
      alert("Please provide seeds from a previous generation.");
      return;
    }

    setLoading(true);
    try {
      const result = await retakeMusic({
        prompt: MOCK_PROMPT, // Using mock prompt
        lyrics: MOCK_LYRICS, // Using mock lyrics
        retake_seeds: seeds,
        retake_variance: variance,
        userId: user.id,
      });
      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
      }
    } catch (error) {
      console.error("Failed to retake music:", error);
      alert("Failed to retake music. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Variance: {variance.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={variance}
          onChange={(e) => setVariance(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          How different the new output is compared to the original.
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Retake Seeds
        </label>
        <input
          type="text"
          value={seeds}
          onChange={(e) => setSeeds(e.target.value)}
          placeholder="e.g., 123456, 789012"
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">
          Seeds from a previous generation.
        </p>
      </div>
      <GenerateButton
        onGenerate={handleRetake}
        isDisabled={loading || !seeds}
        isLoading={loading}
        showDownload={false}
        creditsRemaining={0}
        showCredits={false}
        buttonText="Retake"
      />
    </div>
  );
}