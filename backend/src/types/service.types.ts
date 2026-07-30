export interface IServiceType {
  id: string;
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
  isActive: boolean;
  isPopular: boolean;
  order: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

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
