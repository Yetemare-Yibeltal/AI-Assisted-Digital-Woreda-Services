export type SupportedLanguage = "en" | "am";

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  confidence: number;
  fromCache: boolean;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}

export interface BatchTranslationRequest {
  texts: string[];
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}
