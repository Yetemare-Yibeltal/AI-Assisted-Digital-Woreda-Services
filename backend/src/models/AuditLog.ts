import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId: string;
  userEmail: string;
  userRole: string;
  action:
    | "create"
    | "update"
    | "delete"
    | "status_change"
    | "login"
    | "logout"
    | "export"
    | "assign"
    | "verify";
  resource: string;
  resourceId: string;
  resourceName: string;
  details: string;
  changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure" | "warning";
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  userRole: { type: String, required: true },
  action: {
    type: String,
    enum: [
      "create",
      "update",
      "delete",
      "status_change",
      "login",
      "logout",
      "export",
      "assign",
      "verify",
    ],
    required: true,
  },
  resource: { type: String, required: true },
  resourceId: { type: String, default: "" },
  resourceName: { type: String, default: "" },
  details: { type: String, default: "" },
  changes: {
    type: [{ field: String, oldValue: Schema.Types.Mixed, newValue: Schema.Types.Mixed }],
    default: [],
  },
  metadata: { type: Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, default: "" },
  status: { type: String, enum: ["success", "failure", "warning"], default: "success" },
  timestamp: { type: Date, default: Date.now, index: true },
});

AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLog);
export default AuditLog;
