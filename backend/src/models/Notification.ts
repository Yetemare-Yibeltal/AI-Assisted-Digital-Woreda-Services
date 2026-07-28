import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: string;
  recipientModel: "Admin" | "Applicant";
  title: string;
  titleAmharic: string;
  message: string;
  messageAmharic: string;
  type: "application_update" | "document_request" | "assignment" | "system_alert" | "reminder";
  referenceId: string;
  referenceModel: string;
  link: string;
  priority: "low" | "medium" | "high";
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: String, required: true, index: true },
    recipientModel: { type: String, enum: ["Admin", "Applicant"], required: true },
    title: { type: String, required: true },
    titleAmharic: { type: String, default: "" },
    message: { type: String, required: true },
    messageAmharic: { type: String, default: "" },
    type: {
      type: String,
      enum: ["application_update", "document_request", "assignment", "system_alert", "reminder"],
      required: true,
    },
    referenceId: { type: String, default: "" },
    referenceModel: { type: String, default: "" },
    link: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
