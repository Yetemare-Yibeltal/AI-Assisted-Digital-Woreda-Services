export const aiModels = {
  chat: "gemini-1.5-flash",
  recommendation: "gemini-1.5-flash",
  translation: "gemini-1.5-flash",
};

export const getModel = (feature: keyof typeof aiModels) => aiModels[feature] || aiModels.chat;

export default aiModels;
