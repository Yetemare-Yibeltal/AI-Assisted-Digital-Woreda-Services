import mongoose, { Schema, Document } from "mongoose";

export interface ITranslationCache extends Document {
  sourceText: string;
  translatedText: string;
  sourceLanguage: "en" | "am";
  targetLanguage: "en" | "am";
  confidence: number;
  hitCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TranslationCacheSchema = new Schema<ITranslationCache>(
  {
    sourceText: { type: String, required: true, index: true },
    translatedText: { type: String, required: true },
    sourceLanguage: { type: String, enum: ["en", "am"], required: true },
    targetLanguage: { type: String, enum: ["en", "am"], required: true },
    confidence: { type: Number, default: 90 },
    hitCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

TranslationCacheSchema.index({ sourceText: "text" });
TranslationCacheSchema.index({ sourceLanguage: 1, targetLanguage: 1 });

export default mongoose.model<ITranslationCache>("TranslationCache", TranslationCacheSchema);
