'use client';

import { useState } from 'react';
import { PageLayout } from '~/components/client/music-platform/page-layout';
import { getHistoryItems, type ClientHistoryItem } from '~/lib/history';
// import { headers } from 'next/headers';

export default function MelodyMakerPage() {
  const service = 'melody-maker';
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'melody' | 'harmony'>('melody');
  const [numInferenceSteps, setNumInferenceSteps] = useState(20);
  const [duration, setDuration] = useState(10);
  const [targetFlow, setTargetFlow] = useState(0.5);
  const [regularization, setRegularization] = useState(false);
  const [regularizationStrength, setRegularizationStrength] = useState(0.1);
  
  // Mock history items for now - in a real implementation, you'd fetch these
  const historyItems: ClientHistoryItem[] = [];

  return (
    <PageLayout
      title="Melody Maker"
      service={service}
      showSidebar={true}
      historyItems={historyItems}
    >
      <div className="flex h-full flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Melody Maker</h1>
          <p className="text-gray-500">Create unique melodies with AI</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the melody you want to create..."
                  className="min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mode
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setMode('melody')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'melody' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Melody
                  </button>
                  <button
                    onClick={() => setMode('harmony')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'harmony' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Harmony
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Inference Steps: {numInferenceSteps}
                  </label>
                </div>
                <input
                  type="range"
                  min="2"
                  max="128"
                  value={numInferenceSteps}
                  onChange={(e) => setNumInferenceSteps(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>2</span>
                  <span>128</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Duration: {duration} seconds
                  </label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1s</span>
                  <span>30s</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Target Flow: {targetFlow.toFixed(2)}
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={targetFlow}
                  onChange={(e) => setTargetFlow(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>1</span>
                </div>
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="regularization"
                  checked={regularization}
                  onChange={(e) => setRegularization(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="regularization" className="ml-2 text-sm text-gray-700">
                  Regularization
                </label>
              </div>

              {regularization && (
                <div className="mb-6">
                  <div className="mb-2 flex justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Regularization Strength: {regularizationStrength.toFixed(2)}
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={regularizationStrength}
                    onChange={(e) => setRegularizationStrength(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>1</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                  Generate Melody
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}