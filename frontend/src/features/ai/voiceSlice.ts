import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SupportedLanguage = "en" | "am";

interface VoiceState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  language: SupportedLanguage;
  isSpeaking: boolean;
  voiceText: string;
}

const initialState: VoiceState = {
  isListening: false,
  transcript: "",
  error: null,
  language: "en",
  isSpeaking: false,
  voiceText: "",
};

const voiceSlice = createSlice({
  name: "voice",
  initialState,
  reducers: {
    startListening: (state) => {
      state.isListening = true;
      state.error = null;
      state.transcript = "";
    },
    stopListening: (state) => {
      state.isListening = false;
    },
    setTranscript: (state, action: PayloadAction<string>) => {
      state.transcript = action.payload;
    },
    appendTranscript: (state, action: PayloadAction<string>) => {
      state.transcript += action.payload;
    },
    setVoiceError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isListening = false;
    },
    setVoiceLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.language = action.payload;
    },
    startSpeaking: (state, action: PayloadAction<string>) => {
      state.isSpeaking = true;
      state.voiceText = action.payload;
    },
    stopSpeaking: (state) => {
      state.isSpeaking = false;
      state.voiceText = "";
    },
    resetVoice: (state) => {
      state.isListening = false;
      state.transcript = "";
      state.error = null;
      state.isSpeaking = false;
      state.voiceText = "";
    },
  },
});

export const {
  startListening,
  stopListening,
  setTranscript,
  appendTranscript,
  setVoiceError,
  setVoiceLanguage,
  startSpeaking,
  stopSpeaking,
  resetVoice,
} = voiceSlice.actions;

export default voiceSlice.reducer;
