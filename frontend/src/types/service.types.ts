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

export interface IService {
  _id: string;
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
  totalFee?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  value: string;
  label: string;
  labelAmharic: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    value: "civil_registration",
    label: "Civil Registration",
    labelAmharic: "ሲቪል ምዝገባ",
  },
  {
    value: "land_administration",
    label: "Land Administration",
    labelAmharic: "የመሬት አስተዳደር",
  },
  {
    value: "business_licensing",
    label: "Business Licensing",
    labelAmharic: "የንግድ ፈቃድ",
  },
  { value: "tax_services", label: "Tax Services", labelAmharic: "የግብር አገልግሎት" },
  {
    value: "social_services",
    label: "Social Services",
    labelAmharic: "ማህበራዊ አገልግሎት",
  },
  {
    value: "infrastructure",
    label: "Infrastructure",
    labelAmharic: "መሰረተ ልማት",
  },
  { value: "education", label: "Education", labelAmharic: "ትምህርት" },
  { value: "health", label: "Health", labelAmharic: "ጤና" },
  { value: "agriculture", label: "Agriculture", labelAmharic: "ግብርና" },
  {
    value: "legal_services",
    label: "Legal Services",
    labelAmharic: "ህጋዊ አገልግሎት",
  },
  { value: "other", label: "Other", labelAmharic: "ሌላ" },
];
