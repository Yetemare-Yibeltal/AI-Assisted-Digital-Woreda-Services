import { useState, useCallback, useRef } from "react";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import type { ApiResponse } from "@/types/api.types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language: "en" | "am";
}

interface AIResponse {
  message: string;
  language: "en" | "am";
  sessionId?: string;
  recommendations?: any[];
  suggestedQuestions?: string[];
  confidence: number;
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const language = storage.getLanguage();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
        language,
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        const response = await api.post<ApiResponse<AIResponse>>(
          "/ai/chat/message",
          {
            sessionId,
            message: text.trim(),
            language,
          },
        );

        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          if (data.sessionId) setSessionId(data.sessionId);

          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message || "",
            timestamp: new Date().toISOString(),
            language: data.language || language,
          };

          setMessages((prev) => [...prev, assistantMsg]);
          return data;
        }
      } catch (err: any) {
        const msg = getErrorMessage(err, "Failed to send message");
        setError(msg);
      } finally {
        setLoading(false);
      }
      return null;
    },
    [sessionId, language],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  const loadSession = useCallback(async (sessionIdToLoad: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/ai/chat/session/${sessionIdToLoad}`);
      if (response.data?.success && response.data?.data?.messages) {
        setMessages(response.data.data.messages);
        setSessionId(sessionIdToLoad);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to load session"));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sessionId,
    sendMessage,
    clearChat,
    loadSession,
    setMessages,
  };
}

export default useAIChat;
