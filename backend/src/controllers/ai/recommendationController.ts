import { Request, Response } from "express";
import * as recommendationService from "../../services/ai/recommendationService";
import * as translationService from "../../services/ai/translationService";
import Service from "../../models/Service";
import { asyncHandler } from "../../middleware/asyncHandler";
import { sendSuccess, sendError } from "../../utils/responseFormatter";
import { isAIConfigured } from "../../config/ai/index";

const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { query, language, maxResults } = req.body;

  if (!query || query.trim().length === 0) {
    sendError(res, "Query is required for recommendations", 400);
    return;
  }

  if (query.length > 1000) {
    sendError(res, "Query is too long. Please limit to 1000 characters.", 400);
    return;
  }

  const detectedLang = language || translationService.detectLanguage(query);
  const results = await recommendationService.getRecommendations(
    query,
    detectedLang,
    maxResults || 5
  );

  if (results.length === 0) {
    sendSuccess(
      res,
      {
        query,
        language: detectedLang,
        recommendations: [],
        count: 0,
        message:
          detectedLang === "am"
            ? "ከጥያቄዎ ጋር የሚዛመድ አገልግሎት አልተገኘም። እባክዎ በተለየ መንገድ ይሞክሩ።"
            : "No matching services found for your query. Please try describing your need differently.",
        timestamp: new Date().toISOString(),
      },
      "No recommendations found"
    );
    return;
  }

  const translatedResults = await Promise.all(
    results.map(async (rec) => {
      if (detectedLang === "am" && !rec.reasoningAmharic) {
        rec.reasoningAmharic = rec.reasoning;
      }
      if (detectedLang === "en" && !rec.reasoning) {
        rec.reasoning = rec.reasoningAmharic;
      }
      return rec;
    })
  );

  sendSuccess(
    res,
    {
      query,
      language: detectedLang,
      recommendations: translatedResults,
      count: translatedResults.length,
      topMatch: translatedResults[0],
      aiPowered: isAIConfigured(),
      timestamp: new Date().toISOString(),
    },
    "Recommendations retrieved successfully"
  );
});

const getRecommendationsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const language = (req.query.lang as "en" | "am") || "en";

  const validCategories = [
    "civil_registration",
    "land_administration",
    "business_licensing",
    "tax_services",
    "social_services",
    "infrastructure",
    "education",
    "health",
    "agriculture",
    "legal_services",
    "other",
  ];

  if (!validCategories.includes(category)) {
    sendError(res, `Invalid category. Must be one of: ${validCategories.join(", ")}`, 400);
    return;
  }

  const recommendations = await recommendationService.getServiceRecommendationsByCategory(
    category,
    language
  );

  const categoryServiceCount = await Service.countDocuments({ category, isActive: true });

  sendSuccess(
    res,
    {
      category,
      language,
      recommendations,
      count: recommendations.length,
      totalInCategory: categoryServiceCount,
      timestamp: new Date().toISOString(),
    },
    "Category recommendations retrieved successfully"
  );
});

const compareServices = asyncHandler(async (req: Request, res: Response) => {
  const { serviceSlugs, language } = req.body;

  if (!serviceSlugs || !Array.isArray(serviceSlugs) || serviceSlugs.length < 2) {
    sendError(res, "At least 2 service slugs are required for comparison", 400);
    return;
  }

  if (serviceSlugs.length > 5) {
    sendError(res, "Maximum 5 services can be compared at once", 400);
    return;
  }

  const services = await Service.find({
    slug: { $in: serviceSlugs },
    isActive: true,
  })
    .select(
      "name nameAmharic slug category description descriptionAmharic fees requiredDocuments processingTime processingTimeAmharic steps eligibility eligibilityAmharic"
    )
    .lean();

  if (services.length < 2) {
    sendError(res, "Not enough valid services found for comparison", 404);
    return;
  }

  const detectedLang = language || "en";
  const comparison = services.map((s: any) => ({
    name: detectedLang === "am" ? s.nameAmharic : s.name,
    slug: s.slug,
    category: s.category,
    description: detectedLang === "am" ? s.descriptionAmharic : s.description,
    totalFee: (s.fees || []).reduce((sum: number, f: any) => sum + f.amount, 0),
    processingTime: detectedLang === "am" ? s.processingTimeAmharic : s.processingTime,
    documentCount: (s.requiredDocuments || []).length,
    stepCount: (s.steps || []).length,
    eligibility: detectedLang === "am" ? s.eligibilityAmharic : s.eligibility,
    requiredDocuments: (s.requiredDocuments || []).map((d: any) =>
      detectedLang === "am" ? d.nameAmharic : d.name
    ),
    fees: (s.fees || []).map((f: any) => ({
      name: detectedLang === "am" ? f.nameAmharic : f.name,
      amount: f.amount,
      currency: f.currency || "ETB",
    })),
  }));

  sendSuccess(
    res,
    {
      servicesCompared: comparison,
      count: comparison.length,
      language: detectedLang,
      timestamp: new Date().toISOString(),
    },
    "Service comparison retrieved successfully"
  );
});

const getPopularRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const language = (req.query.lang as "en" | "am") || "en";

  const popularServices = await Service.find({ isActive: true, isPopular: true })
    .select(
      "name nameAmharic slug category description descriptionAmharic fees processingTime processingTimeAmharic"
    )
    .sort({ order: 1 })
    .limit(10)
    .lean();

  const recommendations = popularServices.map((s: any) => ({
    serviceName: language === "am" ? s.nameAmharic : s.name,
    serviceSlug: s.slug,
    category: s.category,
    description: language === "am" ? s.descriptionAmharic : s.description,
    totalFee: (s.fees || []).reduce((sum: number, f: any) => sum + f.amount, 0),
    processingTime: language === "am" ? s.processingTimeAmharic : s.processingTime,
    confidenceScore: 100,
  }));

  sendSuccess(
    res,
    {
      recommendations,
      count: recommendations.length,
      language,
      type: "popular_services",
      timestamp: new Date().toISOString(),
    },
    "Popular recommendations retrieved successfully"
  );
});

export {
  getRecommendations,
  getRecommendationsByCategory,
  compareServices,
  getPopularRecommendations,
};

export default {
  getRecommendations,
  getRecommendationsByCategory,
  compareServices,
  getPopularRecommendations,
};
