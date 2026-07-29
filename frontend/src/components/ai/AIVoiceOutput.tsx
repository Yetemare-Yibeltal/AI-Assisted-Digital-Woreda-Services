import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import {
  Volume2,
  Pause,
  Play,
  SkipForward,
  SkipBack,
  Settings,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AIVoiceOutputProps {
  text: string;
  language?: "en" | "am";
  autoPlay?: boolean;
  className?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function AIVoiceOutput({
  text,
  language = "en",
  autoPlay = false,
  className,
  onStart,
  onEnd,
  onError,
}: AIVoiceOutputProps) {
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSupported(false);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const getVoiceForLanguage = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (language === "am") {
      const amVoice = voices.find((v) => v.lang.startsWith("am"));
      if (amVoice) return amVoice;
      const anyVoice = voices.find((v) => v.lang.includes("am"));
      return anyVoice || voices[0] || null;
    }
    const enVoice = voices.find((v) => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB"));
    return enVoice || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
  }, [language]);

  const speak = useCallback(() => {
    if (!text.trim()) return;

    window.speechSynthesis.cancel();
    setLoading(true);

    // Load voices if needed (some browsers load asynchronously)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        startSpeaking();
      };
    } else {
      startSpeaking();
    }

    function startSpeaking() {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoiceForLanguage();
      if (voice) utterance.voice = voice;

      utterance.lang = language === "am" ? "am-ET" : "en-US";
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Word tracking
      wordsRef.current = text.split(/\s+/);
      setCurrentWordIndex(-1);
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          const textBefore = text.substring(0, charIndex);
          const wordCount = textBefore.split(/\s+/).length - 1;
          setCurrentWordIndex(Math.max(0, wordCount));
        }
      };

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setLoading(false);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
        setLoading(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        if (event.error !== "canceled" && event.error !== "interrupted") {
          const errorMsg = language === "am"
            ? "ድምጽ ማጫወት አልተሳካም"
            : "Voice playback failed";
          onError?.(errorMsg);
          toast({ variant: "error", title: errorMsg });
        }
        setIsSpeaking(false);
        setIsPaused(false);
        setLoading(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [text, language, rate, pitch, volume, onStart, onEnd, onError, toast, getVoiceForLanguage]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, []);

  const handleToggle = () => {
    if (loading) return;
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak();
    }
  };

  const skipForward = () => {
    window.speechSynthesis.cancel();
    const nextIndex = Math.min(currentWordIndex + 15, wordsRef.current.length - 1);
    if (nextIndex < wordsRef.current.length) {
      const remainingText = wordsRef.current.slice(nextIndex).join(" ");
      const utterance = new SpeechSynthesisUtterance(remainingText);
      const voice = getVoiceForLanguage();
      if (voice) utterance.voice = voice;
      utterance.lang = language === "am" ? "am-ET" : "en-US";
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
      setCurrentWordIndex(nextIndex);
    }
  };

  const skipBack = () => {
    window.speechSynthesis.cancel();
    const prevIndex = Math.max(0, currentWordIndex - 10);
    const remainingText = wordsRef.current.slice(prevIndex).join(" ");
    const utterance = new SpeechSynthesisUtterance(remainingText);
    const voice = getVoiceForLanguage();
    if (voice) utterance.voice = voice;
    utterance.lang = language === "am" ? "am-ET" : "en-US";
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
    setCurrentWordIndex(prevIndex);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Alert variant="warning" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {language === "am"
              ? "ይህ አሳሽ የድምጽ ማጫወትን አይደግፍም።"
              : "Text-to-speech is not supported in this browser."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!text.trim()) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Controls Bar */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="glass"
          size="icon-sm"
          onClick={skipBack}
          disabled={!isSpeaking || loading}
          title={language === "am" ? "10 ቃላት ወደ ኋላ" : "Back 10 words"}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="primary"
          size="icon"
          onClick={handleToggle}
          disabled={loading}
          className={cn(
            "h-10 w-10 rounded-full transition-all duration-200",
            isSpeaking && !isPaused && "shadow-lg shadow-primary/20"
          )}
          title={
            loading
              ? language === "am" ? "በመጫን ላይ..." : "Loading..."
              : isPaused
              ? language === "am" ? "ቀጥል" : "Resume"
              : isSpeaking
              ? language === "am" ? "ለአፍታ አቁም" : "Pause"
              : language === "am" ? "አጫውት" : "Play"
          }
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPaused ? (
            <Play className="h-5 w-5" />
          ) : isSpeaking ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>

        <Button
          type="button"
          variant="glass"
          size="icon-sm"
          onClick={skipForward}
          disabled={!isSpeaking || loading}
          title={language === "am" ? "15 ቃላት ወደ ፊት" : "Forward 15 words"}
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowSettings(!showSettings)}
          className={cn(showSettings && "text-primary bg-primary/10")}
          title={language === "am" ? "ቅንብሮች" : "Settings"}
        >
          <Settings className="h-4 w-4" />
        </Button>

        {isSpeaking && (
          <Badge variant="success" size="sm" className="gap-1 animate-pulse">
            <Volume2 className="h-3 w-3" />
            {language === "am" ? "በማጫወት ላይ" : "Playing"}
          </Badge>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 rounded-lg bg-secondary/10 border border-border/20 space-y-3 animate-in slide-in-from-top-2 fade-in-0 duration-200">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">
                {language === "am" ? "ፍጥነት" : "Speed"}: {rate}x
              </label>
            </div>
            <Slider
              value={[rate]}
              onValueChange={([val]) => setRate(val)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.5x</span>
              <span>1x</span>
              <span>2x</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">
                {language === "am" ? "ድምጽ" : "Pitch"}: {pitch}
              </label>
            </div>
            <Slider
              value={[pitch]}
              onValueChange={([val]) => setPitch(val)}
              min={0.5}
              max={1.5}
              step={0.1}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">
                {language === "am" ? "የድምጽ መጠን" : "Volume"}: {Math.round(volume * 100)}%
              </label>
            </div>
            <Slider
              value={[volume]}
              onValueChange={([val]) => setVolume(val)}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
        </div>
      )}

      {/* Word Tracking Bar */}
      {isSpeaking && wordsRef.current.length > 0 && (
        <div className="h-1 bg-secondary/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-200"
            style={{
              width: `${((currentWordIndex + 1) / Math.max(wordsRef.current.length, 1)) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default AIVoiceOutput;