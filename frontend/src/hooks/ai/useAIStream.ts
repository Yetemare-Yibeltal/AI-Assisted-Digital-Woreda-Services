import { useState, useCallback } from "react";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";

export function useAIStream() {
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const language = storage.getLanguage();

  const streamMessage = useCallback(
    async (message: string, sessionId: string | null = null) => {
      setStreaming(true);
      setStreamedText("");
      setError(null);

      try {
        const response = await fetch("/api/v1/ai/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, sessionId, language }),
        });

        if (!response.ok) throw new Error("Stream failed");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No reader");

        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            setStreamedText((prev) => prev + chunk);
          }
        }
      } catch (err: any) {
        setError(getErrorMessage(err, "Stream failed"));
      } finally {
        setStreaming(false);
      }
    },
    [language],
  );

  const clearStream = useCallback(() => setStreamedText(""), []);

  return { streaming, streamedText, error, streamMessage, clearStream };
}

export default useAIStream;
