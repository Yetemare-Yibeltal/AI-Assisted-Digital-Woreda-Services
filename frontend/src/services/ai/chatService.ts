import aiClient from "./aiClient";
import { getPrompt, fillTemplate } from "./promptTemplates";
import { storage } from "@/utils/storage";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language: string;
}

interface SendMessageOptions {
  sessionId?: string;
  language?: string;
}

export async function sendMessage(
  text: string,
  options: SendMessageOptions = {},
): Promise<{ message: string; sessionId?: string; suggestions?: string[] }> {
  const language = options.language || storage.getLanguage();
  try {
    const response = await aiClient.chat(text, options.sessionId, language);
    if (response?.success && response.data) {
      return {
        message: response.data.message || getPrompt("fallback"),
        sessionId: response.data.sessionId,
        suggestions: response.data.suggestedQuestions,
      };
    }
  } catch (error) {
    console.error("Chat service error:", error);
  }
  return { message: getPrompt("fallback") };
}

export function getGreeting(): string {
  return getPrompt("greeting");
}

export default { sendMessage, getGreeting };
