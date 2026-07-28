import mongoose, { Schema, Document } from "mongoose";

export interface IServiceStep {
  stepNumber: number;
  title: string;
  titleAmharic: string;
  description: string;
  descriptionAmharic: string;
  estimatedTime: string;
  officeLocation: string;
}

export interface IRequiredDocument {
  name: string;
  nameAmharic: string;
  description: string;
  descriptionAmharic: string;
  isMandatory: boolean;
  format: string;
  maxSize: number;
}

export interface IFee {
  name: string;
  nameAmharic: string;
  amount: number;
  currency: string;
  description: string;
}

export interface IService extends Document {
  name: string;
  nameAmharic: string;
  slug: string;
  category: string;
  description: string;
  descriptionAmharic: string;
  shortDescription: string;
  shortDescriptionAmharic: string;
  icon: string;
  steps: IServiceStep[];
  requiredDocuments: IRequiredDocument[];
  fees: IFee[];
  processingTime: string;
  processingTimeAmharic: string;
  eligibility: string;
  eligibilityAmharic: string;
  applicationFormId: string;
  isActive: boolean;
  isPopular: boolean;
  order: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceStepSchema = new Schema<IServiceStep>({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  titleAmharic: { type: String, required: true },
  description: { type: String, required: true },
  descriptionAmharic: { type: String, required: true },
  estimatedTime: { type: String, default: "Varies" },
  officeLocation: { type: String, default: "Dangila Woreda Office" },
});

const RequiredDocumentSchema = new Schema<IRequiredDocument>({
  name: { type: String, required: true },
  nameAmharic: { type: String, required: true },
  description: { type: String, required: true },
  descriptionAmharic: { type: String, required: true },
  isMandatory: { type: Boolean, default: true },
  format: { type: String, default: "PDF, JPG, PNG" },
  maxSize: { type: Number, default: 5242880 },
});

const FeeSchema = new Schema<IFee>({
  name: { type: String, required: true },
  nameAmharic: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "ETB" },
  description: { type: String, default: "" },
});

const ServiceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, "Service name in English is required"],
      trim: true,
      maxlength: [200, "Service name cannot exceed 200 characters"],
    },
    nameAmharic: {
      type: String,
      required: [true, "Service name in Amharic is required"],
      trim: true,
      maxlength: [200, "Service name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Service category is required"],
      enum: [
        "civil_registration",
        "land_administration",
        "business_licensing",
        "tax_services",
        "social_services",
        "infrastructure",
        "education",
        "health",
        "agriculture",
        "legal_services",
        "other",
      ],
    },
    description: {
      type: String,
      required: [true, "Service description in English is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    descriptionAmharic: {
      type: String,
      required: [true, "Service description in Amharic is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    shortDescriptionAmharic: {
      type: String,
      required: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    icon: {
      type: String,
      default: "FileText",
    },
    steps: {
      type: [ServiceStepSchema],
      validate: {
        validator: function (steps: IServiceStep[]) {
          return steps.length > 0;
        },
        message: "At least one step is required",
      },
    },
    requiredDocuments: {
      type: [RequiredDocumentSchema],
      default: [],
    },
    fees: {
      type: [FeeSchema],
      default: [],
    },
    processingTime: {
      type: String,
      default: "3-5 business days",
    },
    processingTimeAmharic: {
      type: String,
      default: "ከ3-5 የስራ ቀናት",
    },
    eligibility: {
      type: String,
      default: "All citizens of Dangila Woreda",
    },
    eligibilityAmharic: {
      type: String,
      default: "ሁሉም የዳንግላ ወረዳ ነዋሪዎች",
    },
    applicationFormId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
ServiceSchema.index({ category: 1, isActive: 1 });
ServiceSchema.index({ slug: 1 });
ServiceSchema.index({ tags: 1 });
ServiceSchema.index({ isPopular: 1, isActive: 1 });
ServiceSchema.index({ name: "text", nameAmharic: "text", description: "text" });

// Virtual for total fee amount
ServiceSchema.virtual("totalFee").get(function () {
  return this.fees.reduce((sum, fee) => sum + fee.amount, 0);
});

// Pre-save hook to auto-generate application form ID
ServiceSchema.pre("save", function (next) {
  if (!this.applicationFormId) {
    this.applicationFormId = `SRV-${this.slug.toUpperCase()}-${Date.now()}`;
  }
  next();
});

const Service = mongoose.model<IService>("Service", ServiceSchema);

export default Service;
