export const aiConfig = {
  enabled: import.meta.env.VITE_AI_ENABLED === "true",
  apiUrl: "/api/v1/ai",
  defaultModel: "gemini-1.5-flash",
  maxTokens: 1024,
  temperature: 0.7,
  rateLimit: { maxRequestsPerHour: 20 },
};

export const isAIEnabled = (): boolean => aiConfig.enabled;
