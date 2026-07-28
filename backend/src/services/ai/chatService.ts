import { getChatModel, getRecommendationModel, isAIReady } from "../../config/ai/providers";
import { aiConfig, isAIConfigured } from "../../config/ai/index";
import prompts from "../../config/ai/prompts";
import { cacheService } from "../cacheService";
import Service from "../../models/Service";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  language?: "en" | "am";
  timestamp?: Date;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  citizenInfo?: {
    name?: string;
    phoneNumber?: string;
    language?: "en" | "am";
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AIResponse {
  message: string;
  language: "en" | "am";
  recommendations?: ServiceRecommendation[];
  suggestedQuestions?: string[];
  confidence: number;
}

interface ServiceRecommendation {
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

const sessions: Map<string, ChatSession> = new Map();

const detectLanguage = (text: string): "en" | "am" => {
  const amharicPattern = /[\u1200-\u137F]/;
  const amharicChars = (text.match(amharicPattern) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  if (totalChars === 0) return "en";
  const amharicRatio = amharicChars / totalChars;
  return amharicRatio > 0.2 ? "am" : "en";
};

const getOrCreateSession = (sessionId: string, language: "en" | "am" = "en"): ChatSession => {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      messages: [
        {
          role: "assistant",
          content:
            language === "am" ? prompts.generalChat.greetingAmharic : prompts.generalChat.greeting,
          language,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return sessions.get(sessionId)!;
};

const addMessageToSession = (sessionId: string, message: ChatMessage): void => {
  const session = getOrCreateSession(sessionId, message.language);
  session.messages.push(message);
  if (session.messages.length > aiConfig.chat.maxHistoryLength) {
    session.messages = session.messages.slice(-aiConfig.chat.maxHistoryLength);
  }
  session.updatedAt = new Date();
};

const getSessionContext = (sessionId: string): string => {
  const session = sessions.get(sessionId);
  if (!session || session.messages.length <= 1) return "";

  return session.messages
    .slice(-10)
    .map((m) => `${m.role === "user" ? "Citizen" : "Assistant"}: ${m.content}`)
    .join("\n");
};

const getDetailedRecommendations = async (
  userQuery: string,
  language: "en" | "am"
): Promise<ServiceRecommendation[]> => {
  try {
    const allServices = await Service.find({ isActive: true })
      .select(
        "name nameAmharic slug category description descriptionAmharic fees steps requiredDocuments processingTime processingTimeAmharic"
      )
      .lean();

    const serviceListText = allServices
      .map(
        (s) =>
          `- ${s.name} (${s.nameAmharic}) [${s.category}]: ${s.description?.substring(0, 150)} | Fee: ${s.fees?.reduce((sum: number, f: any) => sum + f.amount, 0) || 0} ETB | Time: ${s.processingTime}`
      )
      .join("\n");

    if (isAIReady() && isAIConfigured()) {
      const model = getRecommendationModel();
      if (!model) throw new Error("AI model not available");

      const promptText =
        language === "am"
          ? `${prompts.serviceRecommendation.systemAmharic}\n\nየሚገኙ አገልግሎቶች:\n${serviceListText}\n\n${prompts.serviceRecommendation.userTemplateAmharic(userQuery)}\n\nእባክዎ ዝርዝር እና አጭር ምክረሃሳብ ይስጡ። ለእያንዳንዱ የሚመከር አገልግሎት ማብራሪያ ያካትቱ።`
          : `${prompts.serviceRecommendation.system}\n\nAvailable services:\n${serviceListText}\n\n${prompts.serviceRecommendation.userTemplate(userQuery)}\n\nPlease provide detailed and brief recommendations. Include reasoning for each recommended service.`;

      const result = await model.generateContent(promptText);
      const aiResponse = result.response.text();

      try {
        const parsed = JSON.parse(aiResponse);
        return buildRecommendationsFromAI(parsed, allServices, language);
      } catch {
        return buildRecommendationsFromText(aiResponse, allServices, language);
      }
    }

    return buildRecommendationsLocally(userQuery, allServices as any[], language);
  } catch (error) {
    console.error("AI recommendation error:", error);
    return [];
  }
};

const buildRecommendationsFromAI = (
  aiResult: any,
  services: any[],
  language: "en" | "am"
): ServiceRecommendation[] => {
  const recommendations: ServiceRecommendation[] = [];

  const mainService = services.find(
    (s) =>
      s.slug === aiResult.recommendedService ||
      s.name.toLowerCase().includes(aiResult.recommendedService?.toLowerCase())
  );

  if (mainService) {
    recommendations.push({
      serviceName: mainService.name,
      serviceNameAmharic: mainService.nameAmharic,
      serviceSlug: mainService.slug,
      category: mainService.category,
      matchScore: 95,
      reasoning:
        aiResult.reasoning ||
        `Based on your query, ${mainService.name} is the most relevant service for your needs.`,
      reasoningAmharic:
        aiResult.reasoningAmharic ||
        `በጥያቄዎ መሰረት፣ ${mainService.nameAmharic} ለፍላጎትዎ በጣም ተገቢው አገልግሎት ነው።`,
      requiredDocuments: mainService.requiredDocuments?.map((d: any) => d.name) || [],
      requiredDocumentsAmharic: mainService.requiredDocuments?.map((d: any) => d.nameAmharic) || [],
      estimatedTime: mainService.processingTime || "3-5 days",
      estimatedTimeAmharic: mainService.processingTimeAmharic || "3-5 ቀናት",
      totalFee: mainService.fees?.reduce((sum: number, f: any) => sum + f.amount, 0) || 0,
      nextSteps: aiResult.nextSteps || mainService.steps?.map((s: any) => s.title) || [],
      nextStepsAmharic:
        aiResult.nextStepsAmharic || mainService.steps?.map((s: any) => s.titleAmharic) || [],
      alternativeServices: aiResult.alternativeServices || [],
    });
  }

  return recommendations;
};

const buildRecommendationsFromText = (
  text: string,
  services: any[],
  language: "en" | "am"
): ServiceRecommendation[] => {
  const recommendations: ServiceRecommendation[] = [];
  const lowerText = text.toLowerCase();

  for (const service of services) {
    const nameMatch = lowerText.includes(service.name.toLowerCase());
    const categoryMatch = lowerText.includes(service.category.toLowerCase());
    const descMatch = service.description
      ?.toLowerCase()
      .split(" ")
      .some((w: string) => lowerText.includes(w));

    if (nameMatch || categoryMatch || descMatch) {
      const matchScore = nameMatch ? 90 : categoryMatch ? 70 : 50;
      recommendations.push({
        serviceName: service.name,
        serviceNameAmharic: service.nameAmharic,
        serviceSlug: service.slug,
        category: service.category,
        matchScore,
        reasoning: `This service matches your query because it relates to ${service.category.replace(/_/g, " ")}.`,
        reasoningAmharic: `ይህ አገልግሎት ከጥያቄዎ ጋር ይዛመዳል ምክንያቱም ከ${service.category} ጋር የተያያዘ ነው።`,
        requiredDocuments: service.requiredDocuments?.map((d: any) => d.name) || [],
        requiredDocumentsAmharic: service.requiredDocuments?.map((d: any) => d.nameAmharic) || [],
        estimatedTime: service.processingTime || "3-5 days",
        estimatedTimeAmharic: service.processingTimeAmharic || "3-5 ቀናት",
        totalFee: service.fees?.reduce((sum: number, f: any) => sum + f.amount, 0) || 0,
        nextSteps: service.steps?.map((s: any) => s.title) || [],
        nextStepsAmharic: service.steps?.map((s: any) => s.titleAmharic) || [],
      });
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
};

const buildRecommendationsLocally = (
  query: string,
  services: any[],
  language: "en" | "am"
): ServiceRecommendation[] => {
  const lowerQuery = query.toLowerCase();
  const recommendations: ServiceRecommendation[] = [];

  const keywords: Record<string, string[]> = {
    birth: ["birth", "newborn", "baby", "child", "infant", "ልደት", "ህጻን", "ልጅ"],
    marriage: ["marriage", "wedding", "marry", "spouse", "ጋብቻ", "ሰርግ", "ሙሽራ"],
    land: ["land", "property", "title", "deed", "plot", "መሬት", "ይዞታ", "ቦታ"],
    business: ["business", "trade", "shop", "store", "license", "ንግድ", "ሱቅ", "ፈቃድ"],
    tax: ["tax", "revenue", "clearance", "tin", "ግብር", "ገቢ", "ክሊራንስ"],
    id: ["id", "identification", "card", "kebele", "መታወቂያ", "ካርድ", "ቀበሌ"],
  };

  for (const service of services) {
    let matchScore = 0;
    const categoryLower = service.category.toLowerCase();
    const nameLower = service.name.toLowerCase();
    const descLower = (service.description || "").toLowerCase();

    for (const [category, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (lowerQuery.includes(word)) {
          if (categoryLower.includes(category) || nameLower.includes(category)) {
            matchScore += 30;
          }
          if (nameLower.includes(word) || descLower.includes(word)) {
            matchScore += 40;
          }
        }
      }
    }

    if (matchScore > 0) {
      recommendations.push({
        serviceName: service.name,
        serviceNameAmharic: service.nameAmharic,
        serviceSlug: service.slug,
        category: service.category,
        matchScore: Math.min(matchScore, 100),
        reasoning: `This service is recommended based on keywords in your query matching ${service.category.replace(/_/g, " ")} services.`,
        reasoningAmharic: `ይህ አገልግሎት የሚመከረው በጥያቄዎ ውስጥ ካሉት ቁልፍ ቃላት ጋር ስለሚዛመድ ነው።`,
        requiredDocuments: service.requiredDocuments?.map((d: any) => d.name) || [],
        requiredDocumentsAmharic: service.requiredDocuments?.map((d: any) => d.nameAmharic) || [],
        estimatedTime: service.processingTime || "3-5 days",
        estimatedTimeAmharic: service.processingTimeAmharic || "3-5 ቀናት",
        totalFee: service.fees?.reduce((sum: number, f: any) => sum + f.amount, 0) || 0,
        nextSteps: service.steps?.map((s: any) => s.title) || [],
        nextStepsAmharic: service.steps?.map((s: any) => s.titleAmharic) || [],
      });
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
};

const generateSuggestedQuestions = (
  recommendations: ServiceRecommendation[],
  language: "en" | "am"
): string[] => {
  const questions: string[] = [];

  if (language === "am") {
    questions.push("እነዚህን አገልግሎቶች ለማግኘት ምን ማድረግ አለብኝ?");
    questions.push("ምን ያህል ጊዜ ይወስዳል?");
    if (recommendations.length > 0) {
      questions.push(`${recommendations[0].serviceNameAmharic} ለማግኘት ምን ሰነዶች ያስፈልጋሉ?`);
      questions.push("ክፍያው ስንት ነው?");
    }
  } else {
    questions.push("What documents do I need?");
    questions.push("How long will it take?");
    if (recommendations.length > 0) {
      questions.push(`What are the requirements for ${recommendations[0].serviceName}?`);
      questions.push("What is the total cost?");
    }
  }

  return questions;
};

const sendMessage = async (
  sessionId: string,
  userMessage: string,
  language?: "en" | "am"
): Promise<AIResponse> => {
  const detectedLang = language || detectLanguage(userMessage);
  const session = getOrCreateSession(sessionId, detectedLang);

  addMessageToSession(sessionId, {
    role: "user",
    content: userMessage,
    language: detectedLang,
    timestamp: new Date(),
  });

  const recommendations = await getDetailedRecommendations(userMessage, detectedLang);
  const suggestedQuestions = generateSuggestedQuestions(recommendations, detectedLang);

  let responseMessage: string;
  if (recommendations.length === 0) {
    responseMessage =
      detectedLang === "am"
        ? "ይቅርታ፣ ከጥያቄዎ ጋር የሚዛመድ አገልግሎት ማግኘት አልቻልኩም። እባክዎ በተለየ መንገድ ይግለጹ ወይም ለበለጠ እርዳታ የዳንግላ ወረዳ ቢሮን ይጎብኙ።"
        : "I couldn't find a matching service for your query. Please try describing your need differently or visit the Dangila Woreda office for personal assistance.";
  } else {
    const recText = recommendations
      .map((r, i) => {
        const detail =
          detectedLang === "am"
            ? `${i + 1}. **${r.serviceNameAmharic}** (${r.matchScore}% ተዛማጅ)\n   📝 ${r.reasoningAmharic}\n   ⏱️ ${r.estimatedTimeAmharic}\n   💰 ${r.totalFee} ብር\n   📋 የሚያስፈልጉ ሰነዶች: ${r.requiredDocumentsAmharic.join(", ")}\n   🔜 ቀጣይ እርምጃዎች: ${r.nextStepsAmharic.join(" → ")}`
            : `${i + 1}. **${r.serviceName}** (${r.matchScore}% match)\n   📝 ${r.reasoning}\n   ⏱️ ${r.estimatedTime}\n   💰 ${r.totalFee} ETB\n   📋 Required Documents: ${r.requiredDocuments.join(", ")}\n   🔜 Next Steps: ${r.nextSteps.join(" → ")}`;
        return detail;
      })
      .join("\n\n");

    responseMessage =
      detectedLang === "am"
        ? `በጥያቄዎ መሰረት፣ የሚከተሉትን አገልግሎቶች እመክራለሁ፦\n\n${recText}\n\nሌላ ጥያቄ ካለዎት እኔ እዚህ ነኝ!`
        : `Based on your query, I recommend the following services:\n\n${recText}\n\nI'm here if you have any other questions!`;
  }

  const aiResponse: AIResponse = {
    message: responseMessage,
    language: detectedLang,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    suggestedQuestions,
    confidence: recommendations.length > 0 ? 85 : 30,
  };

  addMessageToSession(sessionId, {
    role: "assistant",
    content: responseMessage,
    language: detectedLang,
    timestamp: new Date(),
  });

  return aiResponse;
};

const clearSession = (sessionId: string): void => {
  sessions.delete(sessionId);
};

const getSessionHistory = (sessionId: string): ChatMessage[] => {
  const session = sessions.get(sessionId);
  return session ? session.messages : [];
};

const cleanupOldSessions = (maxAgeMs: number = 30 * 60 * 1000): void => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.updatedAt.getTime() > maxAgeMs) {
      sessions.delete(id);
    }
  }
};

setInterval(() => cleanupOldSessions(), 15 * 60 * 1000);

export { sendMessage, clearSession, getSessionHistory, getDetailedRecommendations, detectLanguage };

export type { ChatMessage, ChatSession, AIResponse, ServiceRecommendation };

export default {
  sendMessage,
  clearSession,
  getSessionHistory,
  getDetailedRecommendations,
  detectLanguage,
};
