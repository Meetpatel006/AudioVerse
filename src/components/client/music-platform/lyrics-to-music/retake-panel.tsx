'use client';

import { useState } from "react";

export function RetakePanel() {
  const [variance, setVariance] = useState(0.5);
  const [seed, setSeed] = useState("");

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
        <p className="text-xs text-gray-500">How different the new output is compared to the original.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Retake Seeds</label>
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">Seeds for regenerating variations.</p>
      </div>
      <button className="w-full rounded-lg bg-black py-2 text-white">Retake</button>
    </div>
  );
}