import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { aiConfig } from "./index";

let genAI: GoogleGenerativeAI | null = null;
let chatModel: GenerativeModel | null = null;
let recommendationModel: GenerativeModel | null = null;
let translationModel: GenerativeModel | null = null;

const initializeAI = (): void => {
  if (!aiConfig.gemini.apiKey) {
    console.warn("Gemini API key not configured. AI features will be disabled.");
    return;
  }

  try {
    genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);

    chatModel = genAI.getGenerativeModel({
      model: aiConfig.chat.model,
      generationConfig: {
        maxOutputTokens: aiConfig.chat.maxOutputTokens,
        temperature: aiConfig.chat.temperature,
        topP: aiConfig.gemini.topP,
        topK: aiConfig.gemini.topK,
      },
    });

    recommendationModel = genAI.getGenerativeModel({
      model: aiConfig.recommendation.model,
      generationConfig: {
        maxOutputTokens: aiConfig.recommendation.maxOutputTokens,
        temperature: aiConfig.recommendation.temperature,
      },
    });

    translationModel = genAI.getGenerativeModel({
      model: aiConfig.translation.model,
      generationConfig: {
        maxOutputTokens: aiConfig.translation.maxOutputTokens,
        temperature: aiConfig.translation.temperature,
      },
    });

    console.log("AI providers initialized successfully");
  } catch (error) {
    console.error("Failed to initialize AI providers:", error);
    genAI = null;
    chatModel = null;
  }
};

const getChatModel = (): GenerativeModel | null => {
  if (!chatModel) initializeAI();
  return chatModel;
};

const getRecommendationModel = (): GenerativeModel | null => {
  if (!recommendationModel) initializeAI();
  return recommendationModel;
};

const getTranslationModel = (): GenerativeModel | null => {
  if (!translationModel) initializeAI();
  return translationModel;
};

const isAIReady = (): boolean => {
  return !!genAI && !!chatModel;
};

export { initializeAI, getChatModel, getRecommendationModel, getTranslationModel, isAIReady };

export default {
  initializeAI,
  getChatModel,
  getRecommendationModel,
  getTranslationModel,
  isAIReady,
};
