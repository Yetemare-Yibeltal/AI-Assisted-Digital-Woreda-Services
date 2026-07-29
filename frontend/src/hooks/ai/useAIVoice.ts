import { useState, useCallback, useRef, useEffect } from "react";

interface VoiceState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  supported: boolean;
}

export function useAIVoice(language: "en" | "am" = "en") {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    transcript: "",
    interimTranscript: "",
    error: null,
    supported: true,
  });
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState((prev) => ({ ...prev, supported: false, error: "Speech recognition not supported" }));
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setState((prev) => ({ ...prev, isListening: true, error: null, transcript: "", interimTranscript: "" }));

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "am" ? "am-ET" : "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        setState((prev) => ({
          ...prev,
          transcript: prev.transcript + (final ? " " + final : ""),
          interimTranscript: interim,
        }));
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          setState((prev) => ({ ...prev, error: event.error, isListening: false }));
        }
      };

      recognition.onend = () => {
        setState((prev) => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setState((prev) => ({ ...prev, isListening: false, error: "Failed to start" }));
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const clearTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: "", interimTranscript: "" }));
  }, []);

  return { ...state, startListening, stopListening, clearTranscript };
}

export default useAIVoice;