/**
 * Generates a simple vector embedding for text.
 * In production, replace with an actual embedding API (Gemini, OpenAI, etc.)
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const normalized = text.trim().toLowerCase();
  const embedding: number[] = new Array(128).fill(0);

  // Create a deterministic hash-based embedding
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const position = i % 128;
    embedding[position] += charCode / 1000;
  }

  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
};

/**
 * Calculates cosine similarity between two embeddings.
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

export default { generateEmbedding, cosineSimilarity };
