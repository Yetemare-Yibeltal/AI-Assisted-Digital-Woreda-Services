import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RecommendationResult {
  serviceName: string;
  serviceNameAmharic: string;
  serviceSlug: string;
  category: string;
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

interface RecommendationState {
  results: RecommendationResult[];
  loading: boolean;
  error: string | null;
  query: string;
  language: "en" | "am";
  popularRecommendations: Array<{
    serviceName: string;
    serviceSlug: string;
    category: string;
    description: string;
    totalFee: number;
    processingTime: string;
    confidenceScore: number;
  }>;
}

const initialState: RecommendationState = {
  results: [],
  loading: false,
  error: null,
  query: "",
  language: "en",
  popularRecommendations: [],
};

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    setResults: (state, action: PayloadAction<RecommendationResult[]>) => {
      state.results = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setLanguage: (state, action: PayloadAction<"en" | "am">) => {
      state.language = action.payload;
    },
    setPopularRecommendations: (
      state,
      action: PayloadAction<RecommendationState["popularRecommendations"]>,
    ) => {
      state.popularRecommendations = action.payload;
    },
    clearResults: (state) => {
      state.results = [];
      state.query = "";
      state.error = null;
    },
  },
});

export const {
  setResults,
  setLoading,
  setError,
  setQuery,
  setLanguage,
  setPopularRecommendations,
  clearResults,
} = recommendationSlice.actions;

export default recommendationSlice.reducer;
