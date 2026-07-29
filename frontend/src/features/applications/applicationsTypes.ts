export interface IApplicantInfo {
  fullName: string;
  fullNameAmharic: string;
  dateOfBirth: string;
  gender: "male" | "female";
  phoneNumber: string;
  email: string;
  idNumber: string;
  occupation: string;
}

export interface IAddress {
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  houseNumber: string;
  poBox: string;
}

export interface IUploadedDocument {
  _id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  isVerified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string;
}

export interface IStatusHistory {
  _id: string;
  status: string;
  changedBy: string | null;
  changedAt: string;
  notes: string;
  isAutomatic: boolean;
}

export interface IApplication {
  _id: string;
  applicationId: string;
  service: string;
  serviceName: string;
  serviceCategory: string;
  applicantInfo: IApplicantInfo;
  address: IAddress;
  uploadedDocuments: IUploadedDocument[];
  status: ApplicationStatus;
  statusHistory: IStatusHistory[];
  assignedTo: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  notes: string;
  adminNotes: string;
  estimatedCompletionDate: string | null;
  completedAt: string | null;
  rejectionReason: string | null;
  trackingNumber: string;
  notificationPreference: "sms" | "email" | "both";
  language: "en" | "am";
  daysSinceSubmission?: number;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "documents_requested"
  | "approved"
  | "rejected"
  | "completed";
