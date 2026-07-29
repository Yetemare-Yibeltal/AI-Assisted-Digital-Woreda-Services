import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SupportedLanguage = "en" | "am";

interface TranslationState {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  originalText: string;
  translatedText: string;
  loading: boolean;
  error: string | null;
  history: Array<{
    original: string;
    translated: string;
    from: SupportedLanguage;
    to: SupportedLanguage;
    timestamp: string;
  }>;
}

const initialState: TranslationState = {
  sourceLanguage: "en",
  targetLanguage: "am",
  originalText: "",
  translatedText: "",
  loading: false,
  error: null,
  history: [],
};

const translationSlice = createSlice({
  name: "translation",
  initialState,
  reducers: {
    setSourceLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.sourceLanguage = action.payload;
    },
    setTargetLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.targetLanguage = action.payload;
    },
    swapLanguages: (state) => {
      const temp = state.sourceLanguage;
      state.sourceLanguage = state.targetLanguage;
      state.targetLanguage = temp;
    },
    setOriginalText: (state, action: PayloadAction<string>) => {
      state.originalText = action.payload;
    },
    setTranslatedText: (state, action: PayloadAction<string>) => {
      state.translatedText = action.payload;
      state.loading = false;
      state.error = null;
      if (action.payload) {
        state.history.unshift({
          original: state.originalText,
          translated: action.payload,
          from: state.sourceLanguage,
          to: state.targetLanguage,
          timestamp: new Date().toISOString(),
        });
        if (state.history.length > 20) state.history.pop();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearTranslation: (state) => {
      state.originalText = "";
      state.translatedText = "";
      state.error = null;
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const {
  setSourceLanguage,
  setTargetLanguage,
  swapLanguages,
  setOriginalText,
  setTranslatedText,
  setLoading,
  setError,
  clearTranslation,
  clearHistory,
} = translationSlice.actions;

export default translationSlice.reducer;
