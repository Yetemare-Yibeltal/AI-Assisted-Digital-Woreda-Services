export interface IApplicationType {
  id: string;
  applicationId: string;
  trackingNumber: string;
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
  notificationPreference: "sms" | "email" | "both";
  language: "en" | "am";
  createdAt: string;
  updatedAt: string;
}

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
  status: ApplicationStatus;
  changedBy: string | null;
  changedAt: string;
  notes: string;
  isAutomatic: boolean;
}

export type ApplicationStatus =
  "pending" | "under_review" | "documents_requested" | "approved" | "rejected" | "completed";
