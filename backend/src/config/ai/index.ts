import config from "../index";

const aiConfig = {
  gemini: {
    apiKey: config.ai.geminiApiKey,
    model: "gemini-1.5-flash",
    maxOutputTokens: 1024,
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
  },
  chat: {
    model: "gemini-1.5-flash",
    maxHistoryLength: 20,
    maxOutputTokens: 800,
    temperature: 0.8,
    systemPrompt:
      "You are a helpful assistant for Dangila Woreda Services in Ethiopia. You help citizens understand government services, required documents, fees, and procedures. Always be polite, accurate, and helpful. Respond in the same language the citizen uses (Amharic or English).",
    systemPromptAmharic:
      "እርስዎ በኢትዮጵያ ውስጥ ለዳንግላ ወረዳ አገልግሎቶች አጋዥ ረዳት ነዎት። ዜጎች የመንግስት አገልግሎቶችን፣ የሚያስፈልጉ ሰነዶችን፣ ክፍያዎችን እና ሂደቶችን እንዲረዱ ያግዛሉ። ሁልጊዜ ጨዋ፣ ትክክለኛ እና አጋዥ ይሁኑ።",
  },
  recommendation: {
    model: "gemini-1.5-flash",
    temperature: 0.3,
    maxOutputTokens: 500,
  },
  translation: {
    model: "gemini-1.5-flash",
    temperature: 0.1,
    maxOutputTokens: 1000,
    supportedLanguages: ["en", "am"] as const,
  },
  fallback: {
    enabled: true,
    defaultResponse:
      "I apologize, but I'm having trouble processing your request right now. Please try again later or visit the Dangila Woreda office for assistance.",
    defaultResponseAmharic:
      "ይቅርታ፣ አሁን ጥያቄዎን ለማስኬድ ችግር አጋጥሟል። እባክዎ ቆይተው እንደገና ይሞክሩ ወይም ለእርዳታ የዳንግላ ወረዳ ቢሮን ይጎብኙ።",
  },
  rateLimit: {
    maxRequestsPerHour: 20,
    maxTokensPerRequest: 2000,
  },
};

const isAIConfigured = (): boolean => {
  return !!aiConfig.gemini.apiKey && aiConfig.gemini.apiKey.length > 10;
};

export { aiConfig, isAIConfigured };
export default aiConfig;
