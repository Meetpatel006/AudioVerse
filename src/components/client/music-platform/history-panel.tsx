"use client";

import * as React from "react";
import { useMemo } from "react";
import { IoDownloadOutline, IoPlay } from "react-icons/io5";
import { type ClientHistoryItem, isHistoryItem } from "~/lib/history";
import { useAudioStore } from "~/stores/audio-store";
import { useVoiceStore, type Voice } from "~/stores/voice-store";
import type { ServiceType } from "~/types/services";

export function HistoryPanel({
  service,
  searchQuery,
  setSearchQuery,
  hoveredItem,
  setHoveredItem,
  historyItems = [] as ClientHistoryItem[],
}: {
  service: ServiceType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  historyItems?: ClientHistoryItem[];
}) {
  const { playAudio } = useAudioStore();
  const getVoices = useVoiceStore((state) => state.getVoices);
  const voices = getVoices(service);

  const handlePlayHistoryItem = (item: ClientHistoryItem) => {
    if (item.audioUrl) {
      playAudio({
        id: item.id.toString(),
        title: item.title,
        voice: item.voice ?? null,
        audioUrl: item.audioUrl,
        service: item.service,
      });
    }
  };

  // Memoize filtered and grouped items to avoid unnecessary recalculations
  const { filteredGroups, filteredItems } = useMemo(() => {
    // Ensure we have valid history items
    const validItems = (historyItems || []).filter((item): item is ClientHistoryItem => 
      Boolean(item) && isHistoryItem({ ...item, _id: item.id })
    );

    // Filter items based on search query
    const filtered = validItems.filter((item) => {
      const title = item.title || '';
      const voiceName = item.voice ? voices.find((voice) => voice.id === item.voice)?.name || '' : '';
      
      return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             voiceName.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    // Group filtered items by date for display
    const groups = filtered.reduce<Record<string, ClientHistoryItem[]>>((acc, item) => {
      const date = item.date || 'Unknown Date';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
    
    const grouped = Object.entries(groups);
    
    return {
      filteredItems: filtered,
      filteredGroups: grouped,
    };
  }, [historyItems, searchQuery, voices]);

  const renderContent = (): React.ReactNode => {
    if (filteredItems.length > 0) {
      return (
        <div className="mt-2 flex h-[100vh] w-full flex-col overflow-y-auto">
          {filteredGroups.map(([date, items]) => {
            if (!items || !Array.isArray(items)) return null;
            
            return (
              <div key={date}>
                <div className="sticky top-0 z-10 my-2 flex w-full justify-center bg-white py-1">
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                    {date}
                  </div>
                </div>

                {items.map((item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    voices={voices}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                    onPlay={handlePlayHistoryItem}
                  />
                ))}
              </div>
            );
          })}
        </div>
      );
    }
    
    if (historyItems && historyItems.length > 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-sm text-gray-500">No results found</p>
          <p className="mt-2 text-xs text-gray-400">
            Try a different search term or clear the search
          </p>
        </div>
      );
    }
    
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-sm text-gray-500">No history items found</p>
        <p className="mt-2 text-xs text-gray-400">
          Your generated music will appear here
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="w-full flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>
      {renderContent()}
    </div>
  );
}

function HistoryItem({
  item,
  voices,
  hoveredItem,
  setHoveredItem,
  onPlay,
}: {
  item: ClientHistoryItem;
  voices: Voice[];
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  onPlay: (item: ClientHistoryItem) => void;
}) {
  const voiceUsed =
    item.voice ? voices.find((voice) => voice.id === item.voice) || null : null;

  const handleDownload = () => {
    if (!item.audioUrl) return;
    
    const link = document.createElement("a");
    link.href = item.audioUrl;
    link.download = `${item.title ?? "melody"}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      className="relative flex items-center rounded-lg p-4 hover:bg-gray-100"
    >
      <div className="flex w-full flex-col gap-1">
        <div className="relative w-full">
          <p className="truncate text-sm">{item.title ?? "No title"}</p>
          {hoveredItem === item.id && (
            <div className="absolute right-0 top-0 flex items-center gap-1 bg-gray-100 pl-2">
              <button
                onClick={() => onPlay(item)}
                className="rounded-full p-1 hover:bg-gray-200"
              >
                <IoPlay className="h-5 w-5" />
              </button>
              <button 
                onClick={handleDownload}
                className="rounded-full p-1 hover:bg-gray-200"
              >
                <IoDownloadOutline className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {voiceUsed && (
            <>
              <div
                className="flex h-3 w-3 items-center justify-center rounded-full text-xs text-white"
                style={{ background: voiceUsed.gradientColors }}
              ></div>
              <span className="text-xs font-light text-gray-500">
                {voiceUsed.name}
              </span>
            </>
          )}
          {voiceUsed && <span className="text-xs font-light text-gray-500">·</span>}
          <span className="text-xs font-light text-gray-500">
            {item.time ?? "now"}
          </span>
        </div>
      </div>
    </div>
  );
}
