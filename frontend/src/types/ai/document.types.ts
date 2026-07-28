export interface AIDocumentChecklist {
  serviceName: string;
  documents: Array<{
    name: string;
    nameAmharic: string;
    isMandatory: boolean;
    description: string;
    descriptionAmharic: string;
  }>;
  totalDocuments: number;
  mandatoryCount: number;
}

export interface AIDocumentVerification {
  documentId: string;
  isVerified: boolean;
  confidence: number;
  notes: string;
  verifiedAt: string;
}
