"use client";

import { useUIStore } from "~/stores/ui-store";
import type { ServiceType } from "~/types/services";
import { HistoryPanel } from "../history-panel";
import { useState } from "react";
import type { ClientHistoryItem } from "~/lib/history";
import { IoClose } from "react-icons/io5";
import { AdvancedSettingsPanel } from "./advanced-settings-panel";
import { AudioToolsPanel } from "./audio-tools-panel";

export function MelodySidebar({
  service,
  historyItems,
}: {
  service: ServiceType;
  historyItems?: ClientHistoryItem[];
}) {
  const {
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    toggleMobileMenu,
    isMobileScreen,
  } = useUIStore();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="hidden h-full w-[350px] flex-col border-l bg-white p-5 md:flex lg:w-[500px]">
        <div className="relative mb-6 flex">
          <div className="absolute bottom-0 left-0 right-0 border-b border-gray-200"></div>
          <button
            onClick={() => setActiveTab("history")}
            className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${activeTab === "history" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"}`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${activeTab === "advanced" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"}`}
          >
            Advanced Settings
          </button>
          <button
            onClick={() => setActiveTab("audio-tools")}
            className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${activeTab === "audio-tools" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"}`}
          >
            Audio Tools
          </button>
        </div>
        <div className="transition-opacity duration-200">
          {activeTab === "history" && (
            <HistoryPanel
              service={service}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              historyItems={historyItems}
            />
          )}
          {activeTab === "advanced" && <AdvancedSettingsPanel />}
          {activeTab === "audio-tools" && <AudioToolsPanel />}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileScreen && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleMobileMenu}
        />
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="max-h-[80vh] overflow-y-auto rounded-t-xl bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-end">
            <button onClick={toggleMobileMenu}>
              <IoClose className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="relative mb-6 flex">
            <div className="absolute bottom-0 left-0 right-0 border-b border-gray-200"></div>
            <button
              onClick={() => setActiveTab("history")}
              className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${activeTab === "history" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"}`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab("advanced")}
              className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${activeTab === "advanced" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"}`}
            >
              Advanced Settings
            </button>
            <button
              onClick={() => setActiveTab("audio-tools")}
              className={`relative z-10 mr-4 pb-2 text-sm transition-colors duration-200 ${activeTab === "audio-tools" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"}`}
            >
              Audio Tools
            </button>
          </div>

          {/* Tab content */}
          <div className="transition-opacity duration-200">
            {activeTab === "history" && (
              <HistoryPanel
                service={service}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
                historyItems={historyItems}
              />
            )}
            {activeTab === "advanced" && <AdvancedSettingsPanel />}
            {activeTab === "audio-tools" && <AudioToolsPanel />}
          </div>
        </div>
      </div>
    </>
  );
}