import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  Mic,
  MicOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Volume2,
  Send,
  Sparkles,
} from "lucide-react";

interface AIVoiceInputProps {
  language?: "en" | "am";
  onTranscript?: (text: string) => void;
  onSend?: (text: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function AIVoiceInput({
  language = "en",
  onTranscript,
  onSend,
  className,
  disabled = false,
  placeholder,
}: AIVoiceInputProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      setError(
        language === "am"
          ? "ይህ አሳሽ የድምጽ ግቤትን አይደግፍም። Chromeን ይጠቀሙ።"
          : "Voice input is not supported in this browser. Please use Chrome."
      );
      return;
    }
  }, [language]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setError(null);
    setTranscript("");
    setInterimTranscript("");
    setIsListening(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "am" ? "am-ET" : "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        if (final) {
          setTranscript((prev) => prev + " " + final);
          onTranscript?.(final);
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        let errorMsg = "";
        switch (event.error) {
          case "no-speech":
            errorMsg = language === "am" ? "ምንም ንግግር አልተገኘም" : "No speech detected";
            break;
          case "aborted":
            errorMsg = "";
            break;
          case "audio-capture":
            errorMsg = language === "am" ? "ማይክሮፎን አልተገኘም" : "No microphone found";
            break;
          case "not-allowed":
            errorMsg = language === "am" ? "የማይክሮፎን ፈቃድ ተከልክሏል" : "Microphone permission denied";
            break;
          default:
            errorMsg = language === "am" ? "ያልታወቀ ስህተት" : "Unknown error";
        }
        if (errorMsg) setError(errorMsg);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          setLoading(true);
          // Optionally send to backend for processing
          setTimeout(() => setLoading(false), 500);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setError(
        language === "am"
          ? "የድምጽ ግቤት መጀመር አልተሳካም"
          : "Failed to start voice input"
      );
      setIsListening(false);
    }
  }, [language, onTranscript, transcript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  };

  const handleSend = () => {
    const text = transcript.trim();
    if (text && onSend) {
      onSend(text);
      handleClear();
    } else if (text) {
      toast({
        title: language === "am" ? "ተልኳል" : "Sent",
        description: text.length > 50 ? text.slice(0, 50) + "..." : text,
      });
      handleClear();
    }
  };

  if (!supported) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Alert variant="warning" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {/* Microphone Button */}
        <Button
          type="button"
          variant={isListening ? "primary" : "glass"}
          size="icon"
          onClick={handleToggle}
          disabled={disabled || loading}
          className={cn(
            "h-10 w-10 rounded-full transition-all duration-200",
            isListening && "animate-pulse shadow-lg shadow-red-500/30 bg-red-500 hover:bg-red-600"
          )}
          title={
            isListening
              ? language === "am" ? "ማዳመጥ አቁም" : "Stop listening"
              : language === "am" ? "ማዳመጥ ጀምር" : "Start listening"
          }
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>

        {/* Status indicator */}
        <div className="flex-1 min-w-0">
          {isListening && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <span className="w-1 h-4 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-4 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-4 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-red-400 font-medium">
                {language === "am" ? "በማዳመጥ ላይ..." : "Listening..."}
              </span>
            </div>
          )}
          {!isListening && !transcript && (
            <span className="text-xs text-muted-foreground">
              {placeholder ||
                (language === "am"
                  ? "ለመናገር ማይክሮፎኑን ይጫኑ"
                  : "Press the mic to speak")}
            </span>
          )}
        </div>

        {/* Actions */}
        {transcript && !isListening && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={handleClear} title={language === "am" ? "አጽዳ" : "Clear"}>
              <X className="h-4 w-4" />
            </Button>
            {onSend && (
              <Button variant="primary" size="icon-sm" onClick={handleSend} title={language === "am" ? "ላክ" : "Send"}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="p-3 rounded-lg bg-secondary/10 border border-border/20 relative">
          {transcript && (
            <p className="text-sm leading-relaxed">
              {transcript}
              {interimTranscript && (
                <span className="text-muted-foreground italic"> {interimTranscript}</span>
              )}
            </p>
          )}
          {!transcript && interimTranscript && (
            <p className="text-sm text-muted-foreground italic">{interimTranscript}</p>
          )}
          {loading && (
            <div className="absolute top-2 right-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export default AIVoiceInput;