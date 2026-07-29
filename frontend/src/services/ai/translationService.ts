import aiClient from "./aiClient";

interface TranslationRequest {
  text: string;
  sourceLanguage: "en" | "am";
  targetLanguage: "en" | "am";
}

export async function translateText(
  params: TranslationRequest,
): Promise<string> {
  try {
    const response = await aiClient.translate(
      params.text,
      params.sourceLanguage,
      params.targetLanguage,
    );
    if (response?.success && response.data) {
      return response.data.translatedText || "";
    }
  } catch (error) {
    console.error("Translation service error:", error);
  }
  return params.text;
}

export default { translateText };
