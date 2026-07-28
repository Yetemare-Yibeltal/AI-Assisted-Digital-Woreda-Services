export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  language?: "en" | "am";
  timestamp?: string;
}

export interface ServiceRecommendation {
  serviceName: string;
  serviceNameAmharic: string;
  serviceSlug: string;
  category: string;
  matchScore: number;
  reasoning: string;
  reasoningAmharic: string;
  requiredDocuments: string[];
  requiredDocumentsAmharic: string[];
  estimatedTime: string;
  estimatedTimeAmharic: string;
  totalFee: number;
  nextSteps: string[];
  nextStepsAmharic: string[];
  alternativeServices?: string[];
}

export interface AIResponse {
  message: string;
  language: "en" | "am";
  recommendations?: ServiceRecommendation[];
  suggestedQuestions?: string[];
  confidence: number;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  messageCount: number;
}

export interface SendMessageRequest {
  sessionId?: string;
  message: string;
  language?: "en" | "am";
}
