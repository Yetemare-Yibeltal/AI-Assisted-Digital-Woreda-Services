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
  assignedToName?: string;
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

export const APPLICATION_STATUS_LABELS: Record<
  ApplicationStatus,
  { en: string; am: string; color: string }
> = {
  pending: {
    en: "Pending",
    am: "በመጠባበቅ ላይ",
    color: "bg-yellow-500/20 text-yellow-400",
  },
  under_review: {
    en: "Under Review",
    am: "በግምገማ ላይ",
    color: "bg-blue-500/20 text-blue-400",
  },
  documents_requested: {
    en: "Documents Requested",
    am: "ሰነዶች ተጠይቀዋል",
    color: "bg-orange-500/20 text-orange-400",
  },
  approved: {
    en: "Approved",
    am: "ጸድቋል",
    color: "bg-green-500/20 text-green-400",
  },
  rejected: {
    en: "Rejected",
    am: "ውድቅ ተደርጓል",
    color: "bg-red-500/20 text-red-400",
  },
  completed: {
    en: "Completed",
    am: "ተጠናቋል",
    color: "bg-emerald-500/20 text-emerald-400",
  },
};

export const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "South Ethiopia",
  "South West Ethiopia",
  "Tigray",
  "Central Ethiopia",
];
