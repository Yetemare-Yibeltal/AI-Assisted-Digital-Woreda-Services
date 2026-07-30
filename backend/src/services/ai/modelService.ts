import { aiModels, getModel } from "../../config/ai/models";

interface ModelInfo {
  name: string;
  available: boolean;
  contextWindow: number;
  maxOutputTokens: number;
}

const modelDetails: Record<string, ModelInfo> = {
  "gemini-1.5-flash": {
    name: "Gemini 1.5 Flash",
    available: true,
    contextWindow: 1048576,
    maxOutputTokens: 8192,
  },
  "gemini-1.5-pro": {
    name: "Gemini 1.5 Pro",
    available: !!process.env.GEMINI_API_KEY,
    contextWindow: 2097152,
    maxOutputTokens: 8192,
  },
};

export const getModelInfo = (type: keyof typeof aiModels): ModelInfo => {
  const modelName = getModel(type);
  return (
    modelDetails[modelName] || {
      name: modelName,
      available: false,
      contextWindow: 0,
      maxOutputTokens: 0,
    }
  );
};

export const listModels = (): ModelInfo[] => {
  return Object.values(modelDetails);
};

export default { getModelInfo, listModels, getModel };
