import { getTranslationModel, isAIReady } from "../../config/ai/providers";
import { isAIConfigured } from "../../config/ai/index";
import { cacheService } from "../cacheService";

type SupportedLanguage = "en" | "am";

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  confidence: number;
  fromCache: boolean;
}

const commonTranslations: Record<string, Record<string, string>> = {
  en_to_am: {
    pending: "በመጠባበቅ ላይ",
    "under review": "በግምገማ ላይ",
    "documents requested": "ሰነዶች ተጠይቀዋል",
    approved: "ጸድቋል",
    rejected: "ውድቅ ተደርጓል",
    completed: "ተጠናቋል",
    "birth certificate": "የልደት ሰርተፍኬት",
    "marriage certificate": "የጋብቻ ሰርተፍኬት",
    "land title deed": "የመሬት ይዞታ ማረጋገጫ",
    "business license": "የንግድ ፈቃድ",
    "tax clearance": "የግብር ክሊራንስ",
    "id card": "መታወቂያ ካርድ",
    "full name": "ሙሉ ስም",
    "phone number": "ስልክ ቁጥር",
    "date of birth": "የትውልድ ቀን",
    kebele: "ቀበሌ",
    woreda: "ወረዳ",
    region: "ክልል",
    zone: "ዞን",
    address: "አድራሻ",
    gender: "ጾታ",
    male: "ወንድ",
    female: "ሴት",
    email: "ኢሜይል",
    occupation: "ሙያ",
    document: "ሰነድ",
    fee: "ክፍያ",
    "processing time": "የማስኬጃ ጊዜ",
    application: "ማመልከቻ",
    "tracking number": "የመከታተያ ቁጥር",
    status: "ሁኔታ",
    priority: "ቅድሚያ",
    low: "ዝቅተኛ",
    medium: "መካከለኛ",
    high: "ከፍተኛ",
    urgent: "አስቸኳይ",
    submit: "አስገባ",
    save: "አስቀምጥ",
    cancel: "ሰርዝ",
    next: "ቀጣይ",
    back: "ተመለስ",
    download: "አውርድ",
    print: "አትም",
    search: "ፈልግ",
    filter: "አጣራ",
    clear: "አጽዳ",
    loading: "በመጫን ላይ",
    error: "ስህተት",
    success: "ተሳክቷል",
    warning: "ማስጠንቀቂያ",
    confirm: "አረጋግጥ",
    delete: "ሰርዝ",
    edit: "አስተካክል",
    view: "ተመልከት",
    required: "ያስፈልጋል",
    optional: "አማራጭ",
  },
  am_to_en: {
    ሰርተፍኬት: "certificate",
    ምዝገባ: "registration",
    ማመልከቻ: "application",
    አገልግሎት: "service",
    ፈቃድ: "license",
    ግብር: "tax",
    ክፍያ: "fee",
    ሰነድ: "document",
    ቀበሌ: "kebele",
    ወረዳ: "woreda",
    ዜጋ: "citizen",
    መታወቂያ: "identification",
    ማረጋገጫ: "verification",
    ይዞታ: "ownership",
    መሬት: "land",
    ንግድ: "business",
    ጤና: "health",
    ትምህርት: "education",
    ግብርና: "agriculture",
    "መሰረተ ልማት": "infrastructure",
  },
};

const translateLocally = (
  text: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): string => {
  const lowerText = text.toLowerCase();
  const direction = sourceLanguage === "en" && targetLanguage === "am" ? "en_to_am" : "am_to_en";
  const dictionary = commonTranslations[direction];

  let translated = text;
  for (const [key, value] of Object.entries(dictionary)) {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    translated = translated.replace(regex, value);
  }

  return translated;
};

const translateWithAI = async (
  text: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<string> => {
  if (!isAIReady() || !isAIConfigured()) {
    return translateLocally(text, sourceLanguage, targetLanguage);
  }

  const model = getTranslationModel();
  if (!model) {
    return translateLocally(text, sourceLanguage, targetLanguage);
  }

  const sourceLangName = sourceLanguage === "en" ? "English" : "Amharic";
  const targetLangName = targetLanguage === "en" ? "English" : "Amharic";

  const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. This is for a government services application in Ethiopia (Dangila Woreda). Keep the translation accurate and natural. Only return the translated text, nothing else.\n\nText to translate:\n"${text}"\n\nTranslation:`;

  try {
    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();

    // Remove any quotes the AI might add
    return translatedText.replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("AI translation failed:", error);
    return translateLocally(text, sourceLanguage, targetLanguage);
  }
};

const translate = async (
  text: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TranslationResult> => {
  if (!text || text.trim().length === 0) {
    return {
      originalText: text,
      translatedText: text,
      sourceLanguage,
      targetLanguage,
      confidence: 100,
      fromCache: true,
    };
  }

  // Same language — no translation needed
  if (sourceLanguage === targetLanguage) {
    return {
      originalText: text,
      translatedText: text,
      sourceLanguage,
      targetLanguage,
      confidence: 100,
      fromCache: true,
    };
  }

  const cacheKey = `translation:${sourceLanguage}:${targetLanguage}:${text.substring(0, 200)}`;
  const cached = cacheService.get<string>(cacheKey);

  if (cached) {
    return {
      originalText: text,
      translatedText: cached,
      sourceLanguage,
      targetLanguage,
      confidence: 90,
      fromCache: true,
    };
  }

  const translatedText = await translateWithAI(text, sourceLanguage, targetLanguage);

  cacheService.set(cacheKey, translatedText, 3600000); // 1 hour cache

  return {
    originalText: text,
    translatedText,
    sourceLanguage,
    targetLanguage,
    confidence: 85,
    fromCache: false,
  };
};

const translateBatch = async (
  texts: string[],
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TranslationResult[]> => {
  const results = await Promise.allSettled(
    texts.map((text) => translate(text, sourceLanguage, targetLanguage))
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      originalText: texts[index],
      translatedText: texts[index],
      sourceLanguage,
      targetLanguage,
      confidence: 0,
      fromCache: false,
    };
  });
};

const detectLanguage = (text: string): SupportedLanguage => {
  const amharicPattern = /[\u1200-\u137F]/;
  const amharicChars = (text.match(amharicPattern) || []).length;
  const totalChars = text.replace(/\s/g, "").length;

  if (totalChars === 0) return "en";
  return amharicChars / totalChars > 0.15 ? "am" : "en";
};

const translateServiceInfo = async (
  serviceData: {
    name?: string;
    nameAmharic?: string;
    description?: string;
    descriptionAmharic?: string;
    steps?: Array<{
      title?: string;
      titleAmharic?: string;
      description?: string;
      descriptionAmharic?: string;
    }>;
  },
  targetLanguage: SupportedLanguage
): Promise<any> => {
  const translated: any = { ...serviceData };

  if (targetLanguage === "am" && serviceData.name) {
    translated.name =
      serviceData.nameAmharic || (await translateWithAI(serviceData.name, "en", "am"));
    translated.description =
      serviceData.descriptionAmharic ||
      (await translateWithAI(serviceData.description || "", "en", "am"));
    if (serviceData.steps) {
      translated.steps = await Promise.all(
        serviceData.steps.map(async (step) => ({
          title: step.titleAmharic || (await translateWithAI(step.title || "", "en", "am")),
          description:
            step.descriptionAmharic || (await translateWithAI(step.description || "", "en", "am")),
        }))
      );
    }
  } else if (targetLanguage === "en" && serviceData.nameAmharic) {
    translated.name =
      serviceData.name || (await translateWithAI(serviceData.nameAmharic, "am", "en"));
    translated.description =
      serviceData.description ||
      (await translateWithAI(serviceData.descriptionAmharic || "", "am", "en"));
    if (serviceData.steps) {
      translated.steps = await Promise.all(
        serviceData.steps.map(async (step) => ({
          title: step.title || (await translateWithAI(step.titleAmharic || "", "am", "en")),
          description:
            step.description || (await translateWithAI(step.descriptionAmharic || "", "am", "en")),
        }))
      );
    }
  }

  return translated;
};

export { translate, translateBatch, detectLanguage, translateLocally, translateServiceInfo };

export type { TranslationResult, SupportedLanguage };

export default {
  translate,
  translateBatch,
  detectLanguage,
  translateLocally,
  translateServiceInfo,
};
