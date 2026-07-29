import { storage } from "@/utils/storage";
import { amharicPrompts } from "./amharicPrompts";
import { englishPrompts } from "./englishPrompts";

export function getPrompts() {
  const lang = storage.getLanguage();
  return lang === "am" ? amharicPrompts : englishPrompts;
}

export function getPrompt(key: keyof typeof englishPrompts): string {
  const prompts = getPrompts();
  return prompts[key] || "";
}

export function fillTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

export default { getPrompts, getPrompt, fillTemplate };
