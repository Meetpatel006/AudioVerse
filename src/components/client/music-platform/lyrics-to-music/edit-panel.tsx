'use client';

import { useState } from "react";

export function EditPanel() {
  const [tags, setTags] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [seed, setSeed] = useState("");
  const [editType, setEditType] = useState("only_lyrics");
  const [editMin, setEditMin] = useState(0.6);
  const [editMax, setEditMax] = useState(1.0);
  const [source, setSource] = useState("text2music");

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Edit Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">Extra descriptive tags to steer edits.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Edit Lyrics</label>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">Replace or modify lyrics directly.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Edit Seeds</label>
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-500">Custom seed values for reproducibility.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Edit Type</label>
        <select
          value={editType}
          onChange={(e) => setEditType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="only_lyrics">only_lyrics</option>
          <option value="remix">remix</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Edit Min</label>
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
          <label className="block text-sm font-medium text-gray-700">Edit Max</label>
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
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Edit Source</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="text2music">text2music</option>
          <option value="last_edit">last_edit</option>
          <option value="upload">upload</option>
        </select>
      </div>
      <button className="w-full rounded-lg bg-black py-2 text-white">Edit</button>
    </div>
  );
}