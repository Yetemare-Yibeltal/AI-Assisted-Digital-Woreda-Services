import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  language: "en" | "am";
  timestamp: Date;
}

export interface IChatHistory extends Document {
  sessionId: string;
  userId?: string;
  messages: IChatMessage[];
  language: "en" | "am";
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  language: { type: String, enum: ["en", "am"], default: "en" },
  timestamp: { type: Date, default: Date.now },
});

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    messages: [ChatMessageSchema],
    language: { type: String, enum: ["en", "am"], default: "en" },
  },
  { timestamps: true }
);

export default mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
