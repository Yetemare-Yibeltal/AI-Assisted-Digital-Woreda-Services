import aiClient from "./aiClient";
import { storage } from "@/utils/storage";

interface RecommendationRequest {
  query: string;
  maxResults?: number;
  language?: string;
}

export async function getRecommendations(params: RecommendationRequest) {
  const language = params.language || storage.getLanguage();
  try {
    const response = await aiClient.getRecommendations(
      params.query,
      params.maxResults || 5,
      language,
    );
    if (response?.success && response.data) {
      return response.data.recommendations || [];
    }
  } catch (error) {
    console.error("Recommendation service error:", error);
  }
  return [];
}

export default { getRecommendations };
