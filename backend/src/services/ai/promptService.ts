import { amharicPrompts } from "../../config/ai/amharicPrompts";
import prompts from "../../config/ai/prompts";

export const buildPrompt = (
  templateKey: string,
  language: "en" | "am",
  variables?: Record<string, string>
): string => {
  const promptSet = language === "am" ? amharicPrompts : prompts;
  let template = (promptSet as any)[templateKey] || "";
  if (variables) {
    Object.entries(variables).forEach(([key, val]) => {
      template = template.replace(new RegExp(`{${key}}`, "g"), val);
    });
  }
  return template;
};

export const getSystemPrompt = (language: "en" | "am"): string => {
  if (language === "am") {
    return amharicPrompts.chatSystem || "";
  }
  return "You are a helpful assistant for Dangila Woreda Services in Ethiopia. Help citizens understand government services, required documents, fees, processing times, and procedures. Be accurate, polite, and helpful.";
};

export default { buildPrompt, getSystemPrompt };
