'use client';

import { useState } from "react";

export function ExtendPanel() {
  const [seed, setSeed] = useState("");
  const [leftExtend, setLeftExtend] = useState("");
  const [rightExtend, setRightExtend] = useState("");
  const [source, setSource] = useState("text2music");

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Extend Seeds</label>
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">Seeds for reproducible extension.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Left Extend Length</label>
          <input
            type="text"
            value={leftExtend}
            onChange={(e) => setLeftExtend(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Right Extend Length</label>
          <input
            type="text"
            value={rightExtend}
            onChange={(e) => setRightExtend(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Extend Source</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="text2music">text2music</option>
          <option value="last_extend">last_extend</option>
          <option value="upload">upload</option>
        </select>
      </div>
      <button className="w-full rounded-lg bg-black py-2 text-white">Extend</button>
    </div>
  );
}