'use client';

import { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { useAudioStore } from "~/stores/audio-store";
import { GenerateButton } from "../generate-button";

export function RepaintingPanel() {
  const { user } = useAuth();
  const { setAudioUrl } = useAudioStore();
  const [variance, setVariance] = useState(0.5);
  const [seed, setSeed] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [source, setSource] = useState("text2music");
  const [loading, setLoading] = useState(false);

  const handleRepaint = async () => {
    if (!user) {
      alert("Please sign in to repaint music.");
      return;
    }
    if (!startTime || !endTime) {
      alert("Please provide start and end times.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "repaint",
          prompt: "",
          src_audio_path: source === "upload" ? "" : "", // TODO: wire actual path/source selection
          repaint_start: parseFloat(startTime),
          repaint_end: parseFloat(endTime),
          retake_variance: variance,
          retake_seeds: seed,
          userId: user.id,
        }),
      });
      if (!resp.ok) throw new Error((await resp.json()).error || "Failed to repaint");
      const result = await resp.json();
      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
      }
    } catch (error) {
      console.error("Failed to repaint music:", error);
      alert("Failed to repaint music. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Variance</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={variance}
          onChange={(e) => setVariance(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500">Controls how different the repainted section is.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Repaint Seeds</label>
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">Specific seed values to make the repaint reproducible.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Repaint Source</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="text2music">text2music</option>
          <option value="last_repaint">last_repaint</option>
          <option value="upload">upload</option>
        </select>
      </div>
      <GenerateButton
        onGenerate={handleRepaint}
        isDisabled={loading}
        isLoading={loading}
        showDownload={false}
        creditsRemaining={0}
        showCredits={false}
        buttonText="Repaint"
      />
    </div>
  );
}