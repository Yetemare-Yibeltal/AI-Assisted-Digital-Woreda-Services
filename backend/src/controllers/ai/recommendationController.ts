import { Request, Response } from "express";
import * as recommendationService from "../../services/ai/recommendationService";
import { asyncHandler } from "../../middleware/asyncHandler";
import { sendSuccess } from "../../utils/responseFormatter";

const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { query, language, maxResults } = req.body;
  const recommendations = await recommendationService.getRecommendations(
    query,
    language || "en",
    maxResults || 5
  );
  sendSuccess(res, { recommendations, count: recommendations.length }, "Recommendations retrieved");
});

const getRecommendationsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = req.params.category;
  const language = (req.query.lang as "en" | "am") || "en";
  const recommendations = await recommendationService.getServiceRecommendationsByCategory(
    category,
    language
  );
  sendSuccess(
    res,
    { category, recommendations, count: recommendations.length },
    "Category recommendations retrieved"
  );
});

export { getRecommendations, getRecommendationsByCategory };

export default {
  getRecommendations,
  getRecommendationsByCategory,
};
