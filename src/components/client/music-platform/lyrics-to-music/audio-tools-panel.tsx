'use client';

import { useState } from "react";
import { RetakePanel } from "./retake-panel";
import { RepaintingPanel } from "./repainting-panel";
import { EditPanel } from "./edit-panel";
import { ExtendPanel } from "./extend-panel";

export function AudioToolsPanel() {
  const [activeTab, setActiveTab] = useState("retake");

  return (
    <div>
      <div className="relative mb-6 flex">
        <div className="absolute bottom-0 left-0 right-0 border-b border-gray-200"></div>
        <button
          onClick={() => setActiveTab("retake")}
          className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${
            activeTab === "retake" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Retake
        </button>
        <button
          onClick={() => setActiveTab("repainting")}
          className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${
            activeTab === "repainting" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Repainting
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${
            activeTab === "edit" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setActiveTab("extend")}
          className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${
            activeTab === "extend" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Extend
        </button>
      </div>
      <div>
        {activeTab === "retake" && <RetakePanel />}
        {activeTab === "repainting" && <RepaintingPanel />}
        {activeTab === "edit" && <EditPanel />}
        {activeTab === "extend" && <ExtendPanel />}
      </div>
    </div>
  );
}