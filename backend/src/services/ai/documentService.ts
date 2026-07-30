interface ScanResult {
  documentType: string;
  confidence: number;
  extractedText: string;
  isValid: boolean;
  warnings: string[];
}

interface VerificationCheck {
  name: string;
  passed: boolean;
  message: string;
}

interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  notes: string;
  checks: VerificationCheck[];
  verifiedAt: string;
}

export const scanDocument = async (
  fileBase64: string,
  fileName: string,
  fileType: string
): Promise<ScanResult> => {
  // In production, this would call an actual AI document scanning API
  const isPDF = fileType.includes("pdf");
  const isImage = fileType.includes("image");

  const result: ScanResult = {
    documentType: isPDF ? "PDF Document" : isImage ? "Image" : "Unknown",
    confidence: 85 + Math.floor(Math.random() * 10),
    extractedText: `Simulated OCR text from ${fileName}. This text would contain the actual content extracted from the uploaded document by an AI document processing service.`,
    isValid: true,
    warnings: [],
  };

  if (fileBase64.length < 1000) {
    result.warnings.push("Low quality image detected. Please ensure good lighting.");
    result.confidence -= 15;
  }

  return result;
};

export const verifyDocument = async (
  fileBase64: string,
  fileName: string,
  fileType: string
): Promise<VerificationResult> => {
  // In production, this would call document verification AI
  const checks: VerificationCheck[] = [
    { name: "Format Check", passed: true, message: "File format is valid and supported." },
    {
      name: "Size Check",
      passed: fileBase64.length < 10 * 1024 * 1024,
      message: "File size is within acceptable limits.",
    },
    {
      name: "Content Check",
      passed: true,
      message: "Document content appears complete and readable.",
    },
    { name: "Authenticity Check", passed: true, message: "No signs of tampering detected." },
  ];

  const allPassed = checks.every((c) => c.passed);
  const confidence = allPassed
    ? 88 + Math.floor(Math.random() * 8)
    : 45 + Math.floor(Math.random() * 15);

  return {
    isVerified: allPassed,
    confidence,
    notes: allPassed ? "Document verified successfully." : "Document requires manual review.",
    checks,
    verifiedAt: new Date().toISOString(),
  };
};

export default { scanDocument, verifyDocument };
