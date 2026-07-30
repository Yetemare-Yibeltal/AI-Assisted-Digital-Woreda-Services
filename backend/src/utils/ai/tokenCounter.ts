export const countTokens = (text: string): number => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/);
  const tokens = words.reduce((count, word) => {
    return count + Math.ceil(word.length / 4) + (count > 0 ? 1 : 0);
  }, 0);
  return Math.max(tokens, words.length);
};

export const truncateToTokenLimit = (text: string, maxTokens: number): string => {
  const words = text.split(/\s+/);
  let tokenCount = 0;
  const result: string[] = [];
  for (const word of words) {
    const wordTokens = Math.ceil(word.length / 4) + 1;
    if (tokenCount + wordTokens > maxTokens) break;
    result.push(word);
    tokenCount += wordTokens;
  }
  return result.join(" ");
};
