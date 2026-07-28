export interface RecommendationResult {
  serviceName: string;
  serviceNameAmharic: string;
  serviceSlug: string;
  category: string;
  categoryAmharic: string;
  confidenceScore: number;
  reasoning: string;
  reasoningAmharic: string;
  requiredDocuments: Array<{
    name: string;
    nameAmharic: string;
    isMandatory: boolean;
  }>;
  fees: Array<{ name: string; nameAmharic: string; amount: number }>;
  totalFee: number;
  processingTime: string;
  processingTimeAmharic: string;
  steps: Array<{ title: string; titleAmharic: string; description: string }>;
  eligibility: string;
  eligibilityAmharic: string;
  alternativeServices: Array<{
    name: string;
    nameAmharic: string;
    slug: string;
  }>;
  nextActions: string[];
  nextActionsAmharic: string[];
}

export interface RecommendationRequest {
  query: string;
  language?: "en" | "am";
  maxResults?: number;
}

export interface ServiceComparison {
  servicesCompared: Array<{
    name: string;
    slug: string;
    category: string;
    description: string;
    totalFee: number;
    processingTime: string;
    documentCount: number;
    stepCount: number;
    eligibility: string;
    requiredDocuments: string[];
    fees: Array<{ name: string; amount: number; currency: string }>;
  }>;
  count: number;
  language: string;
}
