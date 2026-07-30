const promptTemplates: Record<string, Record<"en" | "am", string>> = {
  chat: {
    en: "You are a helpful assistant for Dangila Woreda Services in Ethiopia. Answer citizen questions about government services, documents, fees, and procedures. Be accurate and polite. User: {message}",
    am: "እርስዎ ለዳንግላ ወረዳ አማራ ክልል ኢትዮጵያ ዲጂታል አገልግሎት ረዳት ነዎት። ስለ መንግስት አገልግሎቶች ጥያቄዎችን ይመልሱ። ተጠቃሚ: {message}",
  },
  recommend: {
    en: "A citizen needs help finding a service in Dangila Woreda. Their need is: {query}. Based on available services, recommend the best match with reasoning.",
    am: "አንድ ዜጋ በዳንግላ ወረዳ አገልግሎት ይፈልጋል፡ {query}። ምርጡን ምክር ይስጡ።",
  },
};

export const buildPrompt = (
  type: string,
  language: "en" | "am",
  variables: Record<string, string> = {}
): string => {
  const template = promptTemplates[type]?.[language] || promptTemplates.chat[language];
  return Object.entries(variables).reduce(
    (prompt, [key, val]) => prompt.replace(`{${key}}`, val),
    template
  );
};
