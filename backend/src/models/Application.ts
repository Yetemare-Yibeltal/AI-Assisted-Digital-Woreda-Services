import mongoose, { Schema, Document } from "mongoose";

export interface IApplicantInfo {
  fullName: string;
  fullNameAmharic: string;
  dateOfBirth: Date;
  gender: string;
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
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
  isVerified: boolean;
  verifiedBy: mongoose.Types.ObjectId | null;
  verifiedAt: Date | null;
  notes: string;
}

export interface IStatusHistory {
  status: string;
  changedBy: mongoose.Types.ObjectId | null;
  changedAt: Date;
  notes: string;
  isAutomatic: boolean;
}

export interface IApplication extends Document {
  applicationId: string;
  service: mongoose.Types.ObjectId;
  serviceName: string;
  serviceCategory: string;
  applicantInfo: IApplicantInfo;
  address: IAddress;
  uploadedDocuments: IUploadedDocument[];
  status: string;
  statusHistory: IStatusHistory[];
  assignedTo: mongoose.Types.ObjectId | null;
  priority: string;
  notes: string;
  adminNotes: string;
  estimatedCompletionDate: Date | null;
  completedAt: Date | null;
  rejectionReason: string | null;
  trackingNumber: string;
  notificationPreference: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicantInfoSchema = new Schema<IApplicantInfo>({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    maxlength: [200, "Full name cannot exceed 200 characters"],
  },
  fullNameAmharic: {
    type: String,
    required: [true, "Full name in Amharic is required"],
    trim: true,
    maxlength: [200, "Full name cannot exceed 200 characters"],
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"],
  },
  gender: {
    type: String,
    required: [true, "Gender is required"],
    enum: ["male", "female"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^(\+251|0)[9][0-9]{8}$/, "Please provide a valid Ethiopian phone number"],
  },
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    default: "",
  },
  idNumber: {
    type: String,
    trim: true,
    default: "",
  },
  occupation: {
    type: String,
    trim: true,
    default: "",
  },
});

const AddressSchema = new Schema<IAddress>({
  region: {
    type: String,
    required: [true, "Region is required"],
    default: "Amhara",
  },
  zone: {
    type: String,
    required: [true, "Zone is required"],
    default: "Awi",
  },
  woreda: {
    type: String,
    required: [true, "Woreda is required"],
    default: "Dangila",
  },
  kebele: {
    type: String,
    required: [true, "Kebele is required"],
    trim: true,
  },
  houseNumber: {
    type: String,
    trim: true,
    default: "",
  },
  poBox: {
    type: String,
    trim: true,
    default: "",
  },
});

const UploadedDocumentSchema = new Schema<IUploadedDocument>({
  documentType: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: "",
  },
});

const StatusHistorySchema = new Schema<IStatusHistory>({
  status: {
    type: String,
    required: true,
    enum: ["pending", "under_review", "documents_requested", "approved", "rejected", "completed"],
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: "",
  },
  isAutomatic: {
    type: Boolean,
    default: false,
  },
});

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service reference is required"],
    },
    serviceName: {
      type: String,
      required: true,
    },
    serviceCategory: {
      type: String,
      required: true,
    },
    applicantInfo: {
      type: ApplicantInfoSchema,
      required: true,
    },
    address: {
      type: AddressSchema,
      required: true,
    },
    uploadedDocuments: {
      type: [UploadedDocumentSchema],
      default: [],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "under_review", "documents_requested", "approved", "rejected", "completed"],
      default: "pending",
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    notes: {
      type: String,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    adminNotes: {
      type: String,
      default: "",
      maxlength: [2000, "Admin notes cannot exceed 2000 characters"],
    },
    estimatedCompletionDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    notificationPreference: {
      type: String,
      enum: ["sms", "email", "both"],
      default: "sms",
    },
    language: {
      type: String,
      enum: ["en", "am"],
      default: "am",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ApplicationSchema.index({ applicationId: 1 });
ApplicationSchema.index({ trackingNumber: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ "applicantInfo.phoneNumber": 1 });
ApplicationSchema.index({ service: 1, status: 1 });
ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ assignedTo: 1, status: 1 });

// Virtual: days since submission
ApplicationSchema.virtual("daysSinceSubmission").get(function () {
  const now = new Date();
  const created = this.createdAt;
  return Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save: auto-add initial status history
ApplicationSchema.pre("save", function (next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: "pending",
      changedBy: null,
      changedAt: new Date(),
      notes: "Application submitted",
      isAutomatic: true,
    });
  }
  next();
});

const Application = mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
