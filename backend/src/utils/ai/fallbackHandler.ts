export interface FallbackResponse {
  message: string;
  suggestions?: string[];
}

const fallbacks = {
  en: {
    default:
      "I'm sorry, I couldn't process your request at this time. Please try again later or visit the Dangila Woreda office for assistance.",
    suggestions: [
      "How do I get a birth certificate?",
      "What documents are needed for marriage?",
      "How much is the business license fee?",
    ],
  },
  am: {
    default: "ይቅርታ፣ በዚህ ጊዜ ጥያቄዎን ማስኬድ አልተቻለም። እባክዎ ቆይተው ይሞክሩ ወይም የዳንግላ ወረዳ ቢሮን ይጎብኙ።",
    suggestions: ["የልደት ሰርተፍኬት እንዴት ማግኘት እችላለሁ?", "ለጋብቻ ምን ሰነዶች ያስፈልጋሉ?", "የንግድ ፈቃድ ክፍያ ስንት ነው?"],
  },
};

export const getFallbackResponse = (
  language: "en" | "am" = "en",
  type: string = "default"
): FallbackResponse => {
  const langFallbacks = fallbacks[language] || fallbacks.en;
  return {
    message: langFallbacks.default,
    suggestions: langFallbacks.suggestions || [],
  };
};

export const handleAIError = (error: any, language: "en" | "am"): FallbackResponse => {
  console.error("AI Error:", error?.message || error);
  return getFallbackResponse(language);
};
