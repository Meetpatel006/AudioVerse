'use client';

import { useState } from "react";

export function RepaintingPanel() {
  const [variance, setVariance] = useState(0.5);
  const [seed, setSeed] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [source, setSource] = useState("text2music");

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
      <button className="w-full rounded-lg bg-black py-2 text-white">Repaint</button>
    </div>
  );
}