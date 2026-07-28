export interface PDFGenerationOptions {
  language: "en" | "am";
  includeStamp: boolean;
  includeBarcode: boolean;
}

export interface PDFTemplateData {
  trackingNumber: string;
  applicationId: string;
  applicantName: string;
  applicantNameAmharic: string;
  serviceName: string;
  serviceNameAmharic: string;
  submissionDate: string;
  status: string;
  kebele: string;
  phoneNumber: string;
  estimatedCompletionDate: string | null;
  fees: Array<{ name: string; nameAmharic: string; amount: number }>;
  totalFee: number;
}
