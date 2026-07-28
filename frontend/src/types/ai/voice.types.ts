export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  language: "en" | "am";
}

export interface VoiceOutputState {
  isSpeaking: boolean;
  text: string;
  language: "en" | "am";
}
