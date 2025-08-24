'use client';

import { useState } from "react";
import { editMusic } from "~/actions/generate-music";
import { useAuth } from "~/contexts/AuthContext";
import { useAudioStore } from "~/stores/audio-store";
import { GenerateButton } from "../generate-button";

// TODO: These should come from a shared store or props
const MOCK_ORIGINAL_PROMPT = "A cheerful pop song with guitar and drums";
const MOCK_SRC_AUDIO_PATH = "https://example.com/audio.wav"; // This should be the URL of the audio to edit

export function EditPanel() {
  const { user } = useAuth();
  const { setAudioUrl } = useAudioStore();
  const [loading, setLoading] = useState(false);

  const [editTargetPrompt, setEditTargetPrompt] = useState("A cheerful pop song with heavy bass");
  const [editTargetLyrics, setEditTargetLyrics] = useState("");
  const [editMin, setEditMin] = useState(0.2);
  const [editMax, setEditMax] = useState(0.8);

  const handleEdit = async () => {
    if (!user) {
      alert("Please sign in to edit music.");
      return;
    }
    if (!MOCK_SRC_AUDIO_PATH) {
        alert("Please generate or select an audio to edit first.");
        return;
    }

    setLoading(true);
    try {
      const result = await editMusic({
        prompt: MOCK_ORIGINAL_PROMPT,
        src_audio_path: MOCK_SRC_AUDIO_PATH,
        edit_target_prompt: editTargetPrompt,
        edit_target_lyrics: editTargetLyrics,
        edit_n_min: editMin,
        edit_n_max: editMax,
        userId: user.id,
      });
      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
      }
    } catch (error) {
      console.error("Failed to edit music:", error);
      alert("Failed to edit music. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Edit Target Prompt</label>
        <input
          type="text"
          value={editTargetPrompt}
          onChange={(e) => setEditTargetPrompt(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">New prompt describing the desired changes.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Edit Target Lyrics</label>
        <textarea
          value={editTargetLyrics}
          onChange={(e) => setEditTargetLyrics(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">New lyrics for the edited section.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Edit Min: {editMin.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={editMin}
            onChange={(e) => setEditMin(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Edit Max: {editMax.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={editMax}
            onChange={(e) => setEditMax(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      <GenerateButton
        onGenerate={handleEdit}
        isDisabled={loading}
        isLoading={loading}
        showDownload={false}
        creditsRemaining={0}
        showCredits={false}
        buttonText="Edit"
      />
    </div>
  );
}