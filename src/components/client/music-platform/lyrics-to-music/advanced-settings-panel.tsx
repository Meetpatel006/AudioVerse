'use client';

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const ADVANCED_SETTINGS_KEY = "advanced-settings";

export function AdvancedSettingsPanel() {
  const [schedulerType, setSchedulerType] = useState("euler");
  const [cfgType, setCfgType] = useState("cfg");
  const [useErgTag, setUseErgTag] = useState(false);
  const [useErgLyric, setUseErgLyric] = useState(false);
  const [useErgDiffusion, setUseErgDiffusion] = useState(false);
  const [granularityScale, setGranularityScale] = useState(0.5);
  const [guidanceInterval, setGuidanceInterval] = useState(0.5);
  const [guidanceIntervalDecay, setGuidanceIntervalDecay] = useState(0.5);
  const [minGuidanceScale, setMinGuidanceScale] = useState(0.5);
  const [ossSteps, setOssSteps] = useState(29);

  useEffect(() => {
    const savedSettings = localStorage.getItem(ADVANCED_SETTINGS_KEY);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSchedulerType(settings.schedulerType || "euler");
      setCfgType(settings.cfgType || "cfg");
      setUseErgTag(settings.useErgTag || false);
      setUseErgLyric(settings.useErgLyric || false);
      setUseErgDiffusion(settings.useErgDiffusion || false);
      setGranularityScale(settings.granularityScale || 0.5);
      setGuidanceInterval(settings.guidanceInterval || 0.5);
      setGuidanceIntervalDecay(settings.guidanceIntervalDecay || 0.5);
      setMinGuidanceScale(settings.minGuidanceScale || 0.5);
      setOssSteps(settings.ossSteps || 29);
    }
  }, []);

  const handleSave = () => {
    const settings = {
      schedulerType,
      cfgType,
      useErgTag,
      useErgLyric,
      useErgDiffusion,
      granularityScale,
      guidanceInterval,
      guidanceIntervalDecay,
      minGuidanceScale,
      ossSteps,
    };
    localStorage.setItem(ADVANCED_SETTINGS_KEY, JSON.stringify(settings));
    toast.success("Settings saved!");
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Scheduler Type</label>
        <select
          value={schedulerType}
          onChange={(e) => setSchedulerType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="euler">euler</option>
          <option value="heun">heun</option>
        </select>
        <p className="text-xs text-gray-500">Defines the algorithm for step-by-step generation.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">CFG Type</label>
        <select
          value={cfgType}
          onChange={(e) => setCfgType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="cfg">cfg</option>
          <option value="apg">apg</option>
          <option value="cfg_star">cfg_star</option>
        </select>
        <p className="text-xs text-gray-500">Classifier-Free Guidance variant.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">use ERG for</label>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={useErgTag}
            onChange={(e) => setUseErgTag(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm">tag</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={useErgLyric}
            onChange={(e) => setUseErgLyric(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm">lyric</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={useErgDiffusion}
            onChange={(e) => setUseErgDiffusion(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm">diffusion</label>
        </div>
        <p className="text-xs text-gray-500">Adjusts attention weights to create weaker conditions.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Granularity Scale</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={granularityScale}
          onChange={(e) => setGranularityScale(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500">Controls artifact handling.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Guidance Interval</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={guidanceInterval}
          onChange={(e) => setGuidanceInterval(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500">Defines when in the diffusion process guidance is applied.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Guidance Interval Decay</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={guidanceIntervalDecay}
          onChange={(e) => setGuidanceIntervalDecay(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500">Reduces the effect of guidance as steps progress.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Min Guidance Scale</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={minGuidanceScale}
          onChange={(e) => setMinGuidanceScale(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500">The lowest allowed guidance after decay.</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">OSS Steps</label>
        <select
          value={ossSteps}
          onChange={(e) => setOssSteps(parseInt(e.target.value))}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value={16}>16</option>
          <option value={29}>29</option>
          <option value={52}>52</option>
        </select>
        <p className="text-xs text-gray-500">Predefined optimal step counts.</p>
      </div>
      <button onClick={handleSave} className="w-full rounded-lg bg-black py-2 text-white">Save Settings</button>
    </div>
  );
}