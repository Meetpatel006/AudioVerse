"use client";

import { useEffect, useState } from "react";
import type { ServiceType } from "~/types/services";
import { GenerateButton } from "~/components/client/creative-platform/generate-button";
import { useAudioStore } from "~/stores/audio-store";
import toast from "react-hot-toast";
import { generateMelody, generationStatus } from "~/actions/generate-melody";

export function MelodyMakerEditor({
  service,
  credits,
  userId,
  onHistoryUpdate,
}: {
  service: ServiceType;
  credits: number;
  userId: string;
  onHistoryUpdate?: () => void;
}) {
  // Form state
  const [prompt, setPrompt] = useState("");
  const [solver, setSolver] = useState<"midpoint" | "euler">("midpoint");
  const [numInferenceSteps, setNumInferenceSteps] = useState(64); // Updated default to match API
  const [duration, setDuration] = useState(30); // Updated default to match API
  const [targetFlow, setTargetFlow] = useState(0.0); // Updated default to match API
  const [regularization, setRegularization] = useState(false);
  const [regularizationStrength, setRegularizationStrength] = useState(0.2); // Updated default to match API
  const [loading, setLoading] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);

  const { playAudio } = useAudioStore();

  useEffect(() => {
    if (!currentAudioId || !loading) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const status = await generationStatus(currentAudioId);

        if (!isMounted) return;

        if (status.success && status.audioUrl) {
          clearInterval(pollInterval);
          setLoading(false);

          const newAudio = {
            id: currentAudioId,
            title: `${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}`,
            audioUrl: status.audioUrl,
            voice: null, // Not applicable for melody maker
            duration: `${duration}:00`,
            progress: 0,
            service: service,
            createdAt: new Date().toLocaleDateString("en-US"),
          };

          playAudio(newAudio);
          setCurrentAudioId(null);
          
          // Update history
          if (onHistoryUpdate) {
            onHistoryUpdate();
          }
        } else if (!status.success) {
          clearInterval(pollInterval);
          setLoading(false);
          setCurrentAudioId(null);
          toast.error("Melody generation failed");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error checking generation status:", error);
          clearInterval(pollInterval);
          setLoading(false);
          setCurrentAudioId(null);
          toast.error("Error checking generation status");
        }
      }
    };

    // Use void to explicitly ignore the promise
    void (async () => {
      // Initial check
      await checkStatus();
      
      // Set up polling
      pollInterval = setInterval(() => {
        void checkStatus();
      }, 2000);
    })();

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [currentAudioId, loading, playAudio, prompt, duration, service, onHistoryUpdate]);

  const handleGenerateMelody = async (): Promise<void> => {
    if (prompt.trim().length === 0) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setLoading(true);
      
      const { audioId, shouldShowThrottleAlert, audioUrl } = await generateMelody(
        prompt,
        solver,
        numInferenceSteps,
        duration,
        targetFlow,
        regularization,
        regularizationStrength,
        userId
      );

      if (shouldShowThrottleAlert) {
        toast("Exceeding 3 requests per minute will queue your requests.", {
          icon: "⏳",
        });
      }

      // If we have the audio URL immediately, update the UI
      if (audioUrl) {
        const newAudio = {
          id: audioId,
          title: `${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}`,
          audioUrl: audioUrl,
          voice: null, // Not applicable for melody maker
          duration: `${duration}:00`,
          progress: 0,
          service: "melody-maker",
          createdAt: new Date().toLocaleDateString("en-US"),
        };
        playAudio(newAudio);
        setLoading(false);
        
        // Update history
        if (onHistoryUpdate) {
          onHistoryUpdate();
        }
      } else {
        // If we need to poll for the audio, set up the polling
        setCurrentAudioId(audioId);
      }
    } catch (error) {
      console.error("Error generating melody: ", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate melody");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-grow">
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the melody you want to create..."
            disabled={loading}
            className="min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Solver
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setSolver("midpoint")}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                solver === "midpoint"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Midpoint
            </button>
            <button
              onClick={() => setSolver("euler")}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                solver === "euler"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Euler
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Choose between midpoint or euler solver for generation
          </p>
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
            disabled={loading}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>2</span>
            <span>128</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Number of denoising steps (steps): {numInferenceSteps}
          </p>
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
            disabled={loading}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1s</span>
            <span>30s</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Duration of generated audio (duration): {duration}s
          </p>
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
            disabled={loading}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>1</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Target flow step (target_flowstep): {targetFlow.toFixed(2)}
          </p>
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="regularization"
            checked={regularization}
            onChange={(e) => setRegularization(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label
            htmlFor="regularization"
            className="ml-2 text-sm text-gray-700"
          >
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
              disabled={loading}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>1</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Regularization strength (regularization_strength): {regularizationStrength.toFixed(2)}
            </p>
          </div>
        )}
        {!regularization && (
          <p className="mb-6 text-xs text-gray-500">
            Enable regularization to control output smoothness
          </p>
        )}
      </div>

      {/* Generate button */}
      <div className="mt-4">
        <GenerateButton
          onGenerate={handleGenerateMelody}
          isDisabled={prompt.trim().length === 0 || loading}
          isLoading={loading}
          showDownload={true}
          creditsRemaining={credits}
          showCredits={true}
          buttonText="Generate Melody"
        />
      </div>
    </div>
  );
}