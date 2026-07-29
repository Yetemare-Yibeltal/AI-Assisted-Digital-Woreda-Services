export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language: "en" | "am";
}

export interface AIResponse {
  message: string;
  language: "en" | "am";
  recommendations?: ServiceRecommendation[];
  suggestedQuestions?: string[];
  confidence: number;
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

export interface AIState {
  chatOpen: boolean;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  language: "en" | "am";
}
