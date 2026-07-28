import { getRecommendationModel, isAIReady } from "../../config/ai/providers";
import { isAIConfigured } from "../../config/ai/index";
import prompts from "../../config/ai/prompts";
import Service from "../../models/Service";
import { cacheService } from "../cacheService";

interface RecommendationResult {
  serviceName: string;
  serviceNameAmharic: string;
  serviceSlug: string;
  category: string;
  categoryAmharic: string;
  confidenceScore: number;
  reasoning: string;
  reasoningAmharic: string;
  requiredDocuments: Array<{ name: string; nameAmharic: string; isMandatory: boolean }>;
  fees: Array<{ name: string; nameAmharic: string; amount: number }>;
  totalFee: number;
  processingTime: string;
  processingTimeAmharic: string;
  steps: Array<{ title: string; titleAmharic: string; description: string }>;
  eligibility: string;
  eligibilityAmharic: string;
  alternativeServices: Array<{ name: string; nameAmharic: string; slug: string }>;
  nextActions: string[];
  nextActionsAmharic: string[];
}

const categoryTranslations: Record<string, { en: string; am: string }> = {
  civil_registration: { en: "Civil Registration", am: "ሲቪል ምዝገባ" },
  land_administration: { en: "Land Administration", am: "የመሬት አስተዳደር" },
  business_licensing: { en: "Business Licensing", am: "የንግድ ፈቃድ" },
  tax_services: { en: "Tax Services", am: "የግብር አገልግሎቶች" },
  social_services: { en: "Social Services", am: "ማህበራዊ አገልግሎቶች" },
  infrastructure: { en: "Infrastructure", am: "መሰረተ ልማት" },
  education: { en: "Education", am: "ትምህርት" },
  health: { en: "Health", am: "ጤና" },
  agriculture: { en: "Agriculture", am: "ግብርና" },
  legal_services: { en: "Legal Services", am: "ህጋዊ አገልግሎቶች" },
  other: { en: "Other Services", am: "ሌሎች አገልግሎቶች" },
};

const keywordMapping: Record<string, string[]> = {
  civil_registration: [
    "birth",
    "death",
    "marriage",
    "divorce",
    "certificate",
    "registration",
    "ልደት",
    "ሞት",
    "ጋብቻ",
    "ፍቺ",
    "ሰርተፍኬት",
    "ምዝገባ",
    "ህጻን",
    "ልጅ",
    "አራስ",
  ],
  land_administration: [
    "land",
    "property",
    "title",
    "deed",
    "plot",
    "survey",
    "boundary",
    "መሬት",
    "ይዞታ",
    "ቦታ",
    "ቅኝት",
    "ድንበር",
    "ባለቤትነት",
  ],
  business_licensing: [
    "business",
    "trade",
    "license",
    "shop",
    "store",
    "commercial",
    "ንግድ",
    "ፈቃድ",
    "ሱቅ",
    "ንግድ ቤት",
    "ኢንቨስትመንት",
  ],
  tax_services: [
    "tax",
    "revenue",
    "clearance",
    "tin",
    "income",
    "ግብር",
    "ገቢ",
    "ክሊራንስ",
    "ቀረጥ",
    "ታክስ",
  ],
  social_services: [
    "id",
    "identification",
    "residence",
    "permit",
    "kebele",
    "መታወቂያ",
    "መኖሪያ",
    "ቀበሌ",
    "ካርድ",
    "ድጋፍ",
  ],
  education: [
    "school",
    "education",
    "student",
    "transcript",
    "enrollment",
    "ትምህርት",
    "ተማሪ",
    "ምዝገባ",
    "ትራንስክሪፕት",
    "ዲፕሎማ",
  ],
  health: [
    "health",
    "medical",
    "hospital",
    "clinic",
    "vaccination",
    "ጤና",
    "ህክምና",
    "ሆስፒታል",
    "ክሊኒክ",
    "ክትባት",
    "ዶክተር",
  ],
  agriculture: [
    "farm",
    "agriculture",
    "crop",
    "livestock",
    "fertilizer",
    "እርሻ",
    "ግብርና",
    "እንስሳት",
    "ማዳበሪያ",
    "ዘር",
    "ከብት",
  ],
  legal_services: [
    "legal",
    "law",
    "attorney",
    "court",
    "notary",
    "affidavit",
    "ህግ",
    "ፍርድ ቤት",
    "ኖታሪ",
    "ውል",
    "ውክልና",
  ],
};

const scoreServiceMatch = (query: string, service: any): number => {
  const lowerQuery = query.toLowerCase();
  const nameLower = service.name.toLowerCase();
  const nameAmLower = service.nameAmharic.toLowerCase();
  const descLower = (service.description || "").toLowerCase();
  const descAmLower = (service.descriptionAmharic || "").toLowerCase();
  const tagsLower = (service.tags || []).map((t: string) => t.toLowerCase());
  const categoryKeywords = keywordMapping[service.category] || [];

  let score = 0;

  // Direct name match
  if (lowerQuery.includes(nameLower) || nameLower.includes(lowerQuery)) score += 40;
  if (lowerQuery.includes(nameAmLower)) score += 35;

  // Tag matches
  for (const tag of tagsLower) {
    if (lowerQuery.includes(tag)) score += 20;
  }

  // Keyword matches
  for (const keyword of categoryKeywords) {
    if (lowerQuery.includes(keyword)) {
      score += 15;
      if (descLower.includes(keyword) || descAmLower.includes(keyword)) score += 10;
    }
  }

  // Description word overlap
  const queryWords = lowerQuery.split(/\s+/);
  const descWords = descLower.split(/\s+/);
  const overlapWords = queryWords.filter((w) => descWords.includes(w));
  score += overlapWords.length * 5;

  return Math.min(score, 100);
};

const getRecommendations = async (
  userQuery: string,
  language: "en" | "am" = "en",
  maxResults: number = 5
): Promise<RecommendationResult[]> => {
  const cacheKey = `recommendation:${language}:${userQuery.substring(0, 100)}`;
  const cached = cacheService.get<RecommendationResult[]>(cacheKey);
  if (cached) return cached;

  const allServices = await Service.find({ isActive: true })
    .select(
      "name nameAmharic slug category description descriptionAmharic steps fees requiredDocuments processingTime processingTimeAmharic eligibility eligibilityAmharic tags"
    )
    .lean();

  let results: RecommendationResult[] = [];

  if (isAIReady() && isAIConfigured()) {
    try {
      const model = getRecommendationModel();
      if (model) {
        const serviceList = allServices.map((s: any) => ({
          name: s.name,
          nameAmharic: s.nameAmharic,
          slug: s.slug,
          category: s.category,
          description: s.description?.substring(0, 200),
          fees: s.fees?.reduce((sum: number, f: any) => sum + f.amount, 0) || 0,
          processingTime: s.processingTime,
        }));

        const promptText =
          language === "am"
            ? `${prompts.serviceRecommendation.systemAmharic}\n\nየሚገኙ አገልግሎቶች፦ ${JSON.stringify(serviceList, null, 2)}\n\n${prompts.serviceRecommendation.userTemplateAmharic(userQuery)}`
            : `${prompts.serviceRecommendation.system}\n\nAvailable services: ${JSON.stringify(serviceList, null, 2)}\n\n${prompts.serviceRecommendation.userTemplate(userQuery)}`;

        const result = await model.generateContent(promptText);
        const aiText = result.response.text();

        try {
          const aiResult = JSON.parse(aiText);
          const recommendedService = allServices.find(
            (s: any) =>
              s.slug === aiResult.recommendedService ||
              s.name.toLowerCase().includes(aiResult.recommendedService?.toLowerCase())
          );

          if (recommendedService) {
            results.push(buildRecommendation(recommendedService, 95, language, aiResult.reasoning));
          }

          if (aiResult.alternativeServices) {
            for (const altSlug of aiResult.alternativeServices) {
              const altService = allServices.find((s: any) => s.slug === altSlug);
              if (altService && !results.find((r) => r.serviceSlug === altService.slug)) {
                results.push(buildRecommendation(altService, 75, language));
              }
            }
          }
        } catch {
          // Fall through to local matching
        }
      }
    } catch (error) {
      console.error("AI recommendation failed, falling back to local:", error);
    }
  }

  // Local fallback if AI didn't produce results
  if (results.length === 0) {
    const scored = allServices
      .map((service: any) => ({
        service,
        score: scoreServiceMatch(userQuery, service),
      }))
      .filter((item) => item.score > 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    results = scored.map((item) => buildRecommendation(item.service, item.score, language));
  }

  // Add alternative services
  for (const rec of results) {
    const alternatives = allServices
      .filter((s: any) => s.category === rec.category && s.slug !== rec.serviceSlug)
      .slice(0, 3)
      .map((s: any) => ({ name: s.name, nameAmharic: s.nameAmharic, slug: s.slug }));
    rec.alternativeServices = alternatives;
  }

  if (results.length > 0) {
    cacheService.set(cacheKey, results, 300000);
  }

  return results;
};

const buildRecommendation = (
  service: any,
  score: number,
  language: "en" | "am",
  aiReasoning?: string
): RecommendationResult => {
  const categoryInfo = categoryTranslations[service.category] || {
    en: service.category,
    am: service.category,
  };

  return {
    serviceName: service.name,
    serviceNameAmharic: service.nameAmharic,
    serviceSlug: service.slug,
    category: service.category,
    categoryAmharic: categoryInfo.am,
    confidenceScore: score,
    reasoning:
      aiReasoning ||
      `This service matches ${score}% with your query. ${service.name} handles ${categoryInfo.en.toLowerCase()} matters for Dangila Woreda residents.`,
    reasoningAmharic: `ይህ አገልግሎት ከጥያቄዎ ጋር ${score}% ይዛመዳል። ${service.nameAmharic} ለዳንግላ ወረዳ ነዋሪዎች የ${categoryInfo.am} ጉዳዮችን ያስተናግዳል።`,
    requiredDocuments: (service.requiredDocuments || []).map((d: any) => ({
      name: d.name,
      nameAmharic: d.nameAmharic,
      isMandatory: d.isMandatory !== false,
    })),
    fees: (service.fees || []).map((f: any) => ({
      name: f.name,
      nameAmharic: f.nameAmharic,
      amount: f.amount,
    })),
    totalFee: (service.fees || []).reduce((sum: number, f: any) => sum + f.amount, 0),
    processingTime: service.processingTime || "3-5 business days",
    processingTimeAmharic: service.processingTimeAmharic || "3-5 የስራ ቀናት",
    steps: (service.steps || []).map((s: any) => ({
      title: s.title,
      titleAmharic: s.titleAmharic,
      description: s.description,
    })),
    eligibility: service.eligibility || "All citizens of Dangila Woreda",
    eligibilityAmharic: service.eligibilityAmharic || "ሁሉም የዳንግላ ወረዳ ዜጎች",
    alternativeServices: [],
    nextActions: (service.steps || []).slice(0, 3).map((s: any) => s.title),
    nextActionsAmharic: (service.steps || []).slice(0, 3).map((s: any) => s.titleAmharic),
  };
};

const getServiceRecommendationsByCategory = async (
  category: string,
  language: "en" | "am" = "en"
): Promise<RecommendationResult[]> => {
  const services = await Service.find({ category, isActive: true })
    .select(
      "name nameAmharic slug category description descriptionAmharic steps fees requiredDocuments processingTime processingTimeAmharic eligibility eligibilityAmharic"
    )
    .lean();

  return services.map((s: any) => buildRecommendation(s, 100, language));
};

export { getRecommendations, getServiceRecommendationsByCategory, scoreServiceMatch };

export type { RecommendationResult };

export default {
  getRecommendations,
  getServiceRecommendationsByCategory,
  scoreServiceMatch,
};
