export const aiProviders = {
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
    model: "gemini-1.5-flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  },
  fallback: {
    enabled: true,
    defaultResponse: "I'm sorry, I couldn't process that. Please try again.",
    defaultResponseAmharic: "ይቅርታ፣ ማስኬድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
  },
};

export const getActiveProvider = () => {
  if (aiProviders.gemini.apiKey) return "gemini";
  return "fallback";
};

export default aiProviders;
