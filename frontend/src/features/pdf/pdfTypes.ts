export interface PDFGenerationOptions {
  type: "receipt" | "certificate" | "document-request";
  language: "en" | "am";
  includeStamp: boolean;
  includeWatermark: boolean;
}

export interface PDFState {
  generating: boolean;
  error: string | null;
  lastGeneratedUrl: string | null;
  lastGeneratedType: string | null;
}

export const defaultPDFOptions: PDFGenerationOptions = {
  type: "receipt",
  language: "en",
  includeStamp: true,
  includeWatermark: true,
};
