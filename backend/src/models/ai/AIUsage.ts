import mongoose, { Schema, Document } from "mongoose";

export interface IAIUsage extends Document {
  userId: string;
  feature: string;
  aiModel: string;
  promptTokens: number;
  completionTokens: number;
  responseTime: number;
  status: "success" | "error";
  errorMessage?: string;
  timestamp: Date;
}

const AIUsageSchema = new Schema<IAIUsage>({
  userId: { type: String, required: true, index: true },
  feature: { type: String, required: true },
  aiModel: { type: String, default: "gemini-1.5-flash" },
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 },
  status: { type: String, enum: ["success", "error"], default: "success" },
  errorMessage: { type: String },
  timestamp: { type: Date, default: Date.now },
});

AIUsageSchema.index({ timestamp: -1 });
AIUsageSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IAIUsage>("AIUsage", AIUsageSchema);
