export const englishPrompts = {
  chatSystem: `You are a digital services assistant for Dangila Woreda, Amhara Region, Ethiopia. Help citizens understand government services, required documents, fees, processing times, and procedures. Always be accurate, polite, and helpful. Respond only in English.`,

  greeting:
    "Hello! I'm the Dangila Woreda AI assistant. How can I help you today?",

  fallback:
    "I apologize, but I'm unable to process your request right now. Please try again later or visit the Dangila Woreda office in person.",

  serviceRecommendation: `A citizen says: "{query}". Which of the available services best matches their need? Explain why.`,

  documentChecklist: `List all required documents for the "{serviceName}" service.`,

  formAssist: `Explain what should be entered in the "{fieldLabel}" field.`,
};

export default englishPrompts;
