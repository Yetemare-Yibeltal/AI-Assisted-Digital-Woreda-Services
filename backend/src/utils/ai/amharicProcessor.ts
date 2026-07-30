const amharicCharPattern = /[\u1200-\u137F]/;

export const containsAmharic = (text: string): boolean => {
  return amharicCharPattern.test(text);
};

export const detectLanguage = (text: string): "en" | "am" => {
  if (!text) return "en";
  const amharicChars = (text.match(/[\u1200-\u137F]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  if (totalChars === 0) return "en";
  return amharicChars / totalChars > 0.15 ? "am" : "en";
};

export const normalizeAmharic = (text: string): string => {
  return text
    .replace(/[አ-ፐ]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 0x1200 && code <= 0x134f) {
        return String.fromCharCode(code - (code % 8) + 0);
      }
      return char;
    })
    .replace(/\s+/g, " ")
    .trim();
};

export const getAmharicNumber = (num: number): string => {
  const digits = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"];
  const tens = ["", "አስራ", "ሃያ", "ሰላሳ", "አርባ", "ሃምሳ", "ስልሳ", "ሰባ", "ሰማንያ", "ዘጠና"];
  const teens = [
    "አስራ",
    "አስራአንድ",
    "አስራሁለት",
    "አስራሶስት",
    "አስራአራት",
    "አስራአምስት",
    "አስራስድስት",
    "አስራሰባት",
    "አስራስምንት",
    "አስራዘጠኝ",
  ];
  if (num < 10) return digits[num] || String(num);
  if (num < 20) return teens[num - 10] || String(num);
  const tenDigit = Math.floor(num / 10);
  const unitDigit = num % 10;
  return tens[tenDigit] + (unitDigit > 0 ? " " + digits[unitDigit] : "");
};
