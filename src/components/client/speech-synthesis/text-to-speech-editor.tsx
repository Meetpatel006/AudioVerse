"use client";

import { useEffect, useState } from "react";
import {
  IoBookOutline,
  IoFilmOutline,
  IoGameControllerOutline,
  IoHappyOutline,
  IoLanguageOutline,
  IoLeafOutline,
  IoMegaphoneOutline,
  IoMicOutline,
  IoChevronDownOutline,
} from "react-icons/io5";
import type { ServiceType } from "~/types/services";
import { GenerateButton } from "../generate-button";
import {
  generateTextToSpeech,
  generationStatus,
  getAvailableVoices,
  type Voice,
} from "~/actions/generate-speech";
import { useVoiceStore } from "~/stores/voice-store";
import { useAudioStore } from "~/stores/audio-store";
import toast from "react-hot-toast";
import { cn } from "~/lib/utils";

export function TextToSpeechEditor({
  service,
  credits,
  userId,
}: {
  service: ServiceType;
  credits: number;
  userId: string;
}) {
  const [textContent, setTextContent] = useState("");
  const [activePlaceholder, setActivePlaceholder] = useState(
    "Start typing here or paste any text you want to turn into lifelike speech...",
  );
  const [loading, setLoading] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);

  const getSelectedVoice = useVoiceStore((state) => state.getSelectedVoice);
  const selectVoice = useVoiceStore((state) => state.selectVoice);
  const { playAudio } = useAudioStore();

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const voices = await getAvailableVoices();
        setAvailableVoices(voices);
        
        // Set the first voice as default if none is selected
        if (voices.length > 0 && !selectedVoice) {
          const defaultVoice = voices[0];
          if (defaultVoice) {
            setSelectedVoice(defaultVoice);
            selectVoice(service, defaultVoice.id);
          }
        }
      } catch (error) {
        console.error("Error fetching voices:", error);
        toast.error("Failed to load voices");
      }
    };

    fetchVoices();
  }, [service, selectedVoice, selectVoice]);

  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice);
    selectVoice(service, voice.id);
    setIsVoiceDropdownOpen(false);
  };

  useEffect(() => {
    if (!currentAudioId || !loading) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const status = await generationStatus(currentAudioId);
        const selectedVoice = getSelectedVoice("styletts2");

        if (!isMounted) return;

        if (status.success && status.audioUrl && selectedVoice) {
          clearInterval(pollInterval);
          setLoading(false);

          const newAudio = {
            id: currentAudioId,
            title:
              `${textContent.substring(0, 50)}${textContent.length > 50 ? "..." : ""}`,
            audioUrl: status.audioUrl,
            voice: selectedVoice.id,
            duration: "0:30",
            progress: 0,
            service: service,
            createdAt: new Date().toLocaleDateString("en-US"),
          };

          playAudio(newAudio);
          setCurrentAudioId(null);
        } else if (!status.success) {
          clearInterval(pollInterval);
          setLoading(false);
          setCurrentAudioId(null);
          toast.error("Text to speech generation failed");
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
  }, [currentAudioId, loading, getSelectedVoice, playAudio, textContent, service]);

  const templateTexts = {
    "Narrate a story":
      "Once upon a time in a forest shrouded in mist, a young adventurer discovered an ancient doorway hidden beneath twisted roots. As they reached out to touch the weathered stone, the forest fell silent. What secrets would be revealed beyond this mysterious threshold?",
    "Tell a silly joke":
      "Why don't scientists trust atoms? Because they make up everything! Speaking of making things up, I once convinced my friend that the moon was just the back of the sun. He believed me until nighttime when both were visible in the sky.",
    "Record an advertisement":
      "Introducing TranquilSleep, the revolutionary mattress designed with cutting-edge comfort technology. Experience the perfect balance of support and softness that adapts to your body. Wake up refreshed and energized every morning! Order now and get 30% off your first purchase.",
    "Speak in different languages":
      "Hello! Hola! Bonjour! Ciao! Konnichiwa! Guten Tag! I can help you communicate your message in multiple languages. Perfect for reaching a global audience or adding an international flair to your content.",
    "Direct a dramatic movie scene":
      "The rain beats against the windows as Sarah stares at the faded photograph. 'I never thought it would end this way,' she whispers, her voice barely audible above the storm. Behind her, the door slowly opens. 'It doesn't have to,' says a familiar voice she never expected to hear again.",
    "Hear from a video game character":
      "Greetings, adventurer! I am Captain Varrick of the Starship Horizon. Our mission to explore the outer reaches of the Andromeda galaxy has led us to this mysterious planet. The energy readings are off the charts, and we need your help to investigate the ancient ruins ahead.",
    "Introduce your podcast":
      "Welcome to 'Unexplained Phenomena,' the podcast where we explore the mysteries that science has yet to solve. I'm your host, Alex Morgan, and today we're diving into the fascinating world of synchronicity – those meaningful coincidences that seem to defy the laws of probability.",
    "Guide a meditation class":
      "Settle into a comfortable position and gently close your eyes. Take a deep breath in through your nose, filling your lungs completely. Hold for a moment, and then exhale slowly through your mouth, releasing any tension you've been carrying. Feel your body becoming heavier with each breath, melting into the surface beneath you.",
  };

  const handleButtonHover = (text: string) => {
    setActivePlaceholder(templateTexts[text as keyof typeof templateTexts]);
  };

  const handleButtonClick = (text: string) => {
    setTextContent(templateTexts[text as keyof typeof templateTexts]);
  };

  const handleGenerateSpeech = async (): Promise<void> => {
    const selectedVoice = getSelectedVoice("styletts2");

    if (textContent.trim().length === 0 || !selectedVoice) {
      toast.error("Please select a voice and enter some text");
      return;
    }

    try {
      setLoading(true);
      const { audioId, shouldShowThrottleAlert, audioUrl } = await generateTextToSpeech(
        textContent,
        selectedVoice.id,
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
          title: `${textContent.substring(0, 50)}${textContent.length > 50 ? "..." : ""}`,
          audioUrl: audioUrl,
          voice: selectedVoice.id,
          duration: "0:30", // You might want to calculate this based on the audio
          progress: 0,
          service: "styletts2",
          createdAt: new Date().toLocaleDateString("en-US"),
        };
        playAudio(newAudio);
        setLoading(false);
      } else {
        // If we need to poll for the audio, set up the polling
        setCurrentAudioId(audioId);
      }
    } catch (error) {
      console.error("Error generating speech: ", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate speech");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Voice selector */}
      <div className="relative mb-4">
        <button
          type="button"
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
          disabled={availableVoices.length === 0}
        >
          <span>{selectedVoice ? selectedVoice.name : 'Select a voice...'}</span>
          <IoChevronDownOutline className="w-4 h-4 ml-2 text-gray-400" />
        </button>

        {isVoiceDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="py-1">
              {availableVoices.map((voice) => (
                <button
                  key={voice.id}
                  className={cn(
                    'block w-full px-4 py-2 text-sm text-left hover:bg-gray-100',
                    selectedVoice?.id === voice.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  )}
                  onClick={() => handleVoiceSelect(voice)}
                >
                  {voice.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text area */}
      <div className="flex-grow">
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder={activePlaceholder}
          disabled={loading}
          className="w-full h-full min-h-[200px] resize-none rounded-lg bg-white p-4 placeholder:font-light placeholder:text-gray-500 focus:border-none focus:outline-none focus:ring-0"
        />
      </div>

      <div className="mt-4 px-0 md:px-4">
        {textContent.length === 0 ? (
          <div className="mt-auto">
            <p className="mb-2 text-sm text-gray-500">Get started with</p>

            <div className="flex flex-wrap gap-2">
              {[
                { text: "Narrate a story", icon: <IoBookOutline /> },
                { text: "Tell a silly joke", icon: <IoHappyOutline /> },
                {
                  text: "Record an advertisement",
                  icon: <IoMegaphoneOutline />,
                },
                {
                  text: "Speak in different languages",
                  icon: <IoLanguageOutline />,
                },
                {
                  text: "Direct a dramatic movie scene",
                  icon: <IoFilmOutline />,
                },
                {
                  text: "Hear from a video game character",
                  icon: <IoGameControllerOutline />,
                },
                {
                  text: "Introduce your podcast",
                  icon: <IoMicOutline />,
                },
                {
                  text: "Guide a meditation class",
                  icon: <IoLeafOutline />,
                },
              ].map(({ text, icon }) => (
                <button
                  key={text}
                  className="flex items-center rounded-lg border border-gray-200 bg-white p-2 text-xs hover:bg-gray-50"
                  onMouseEnter={() => handleButtonHover(text)}
                  onMouseLeave={() =>
                    setActivePlaceholder(
                      "Start typing here or paste any text you want to turn into lifelike speech...",
                    )
                  }
                  onClick={() => handleButtonClick(text)}
                >
                  <span className="mr-2 text-gray-500">{icon}</span>
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <GenerateButton
            onGenerate={handleGenerateSpeech}
            isDisabled={
              textContent.length > 5000 ||
              textContent.trim().length === 0 ||
              loading
            }
            isLoading={loading}
            showDownload={true}
            creditsRemaining={credits}
            showCredits={true}
            characterCount={textContent.length}
            characterLimit={5000}
          />
        )}
      </div>
    </div>
  );
}
