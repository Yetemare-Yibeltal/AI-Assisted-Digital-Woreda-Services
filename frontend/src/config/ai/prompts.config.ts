import { amharicPrompts } from "@/services/ai/amharicPrompts";
import { englishPrompts } from "@/services/ai/englishPrompts";

export const promptsConfig = {
  en: englishPrompts,
  am: amharicPrompts,
};

export const getPromptsForLanguage = (lang: "en" | "am") =>
  promptsConfig[lang] || promptsConfig.en;

export default promptsConfig;
