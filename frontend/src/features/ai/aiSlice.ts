import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  role: "user" | "assistant";
  content: string;
  language: "en" | "am";
  timestamp: string;
}

interface AIState {
  chatOpen: boolean;
  messages: Message[];
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  language: "en" | "am";
}

const initialState: AIState = {
  chatOpen: false,
  messages: [],
  loading: false,
  error: null,
  sessionId: null,
  language: (localStorage.getItem("dangila_language") as "en" | "am") || "en",
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.chatOpen = !state.chatOpen;
    },
    openChat: (state) => {
      state.chatOpen = true;
    },
    closeChat: (state) => {
      state.chatOpen = false;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      if (state.messages.length > 50) {
        state.messages = state.messages.slice(-50);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSessionId: (state, action: PayloadAction<string | null>) => {
      state.sessionId = action.payload;
    },
    setLanguage: (state, action: PayloadAction<"en" | "am">) => {
      state.language = action.payload;
      localStorage.setItem("dangila_language", action.payload);
    },
  },
});

export const {
  toggleChat,
  openChat,
  closeChat,
  addMessage,
  clearMessages,
  setLoading,
  setError,
  setSessionId,
  setLanguage,
} = aiSlice.actions;

export default aiSlice.reducer;
