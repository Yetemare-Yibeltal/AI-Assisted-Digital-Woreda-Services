import mongoose, { Schema, Document } from "mongoose";

export interface IAIAnalytics extends Document {
  totalRequests: number;
  requestsToday: number;
  byFeature: Record<string, number>;
  averageResponseTime: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalyticsSchema = new Schema<IAIAnalytics>(
  {
    totalRequests: { type: Number, default: 0 },
    requestsToday: { type: Number, default: 0 },
    byFeature: { type: Schema.Types.Mixed, default: {} },
    averageResponseTime: { type: Number, default: 0 },
    successRate: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.model<IAIAnalytics>("AIAnalytics", AIAnalyticsSchema);
