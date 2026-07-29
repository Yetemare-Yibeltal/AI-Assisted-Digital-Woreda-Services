import { useState, useCallback } from "react";
import {
  generateReceipt,
  generateCertificate,
  generateDocumentRequest,
} from "@/features/pdf/pdfGenerator";
import type { IApplication } from "@/types/application.types";
import type { IService } from "@/types/service.types";

export function usePDF() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPDF = useCallback(
    async (
      type: "receipt" | "certificate" | "document-request",
      application: IApplication,
      service: IService,
      language: "en" | "am" = "en",
      approvedBy?: string,
      documents?: string[],
    ) => {
      setGenerating(true);
      setError(null);
      try {
        let blob: Blob;
        if (type === "receipt")
          blob = await generateReceipt(application, service, language);
        else if (type === "certificate")
          blob = await generateCertificate(
            application,
            service,
            approvedBy || "",
            language,
          );
        else
          blob = await generateDocumentRequest(
            application,
            documents || [],
            language,
          );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type}-${application.trackingNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err: any) {
        setError(err?.message || "PDF generation failed");
      } finally {
        setGenerating(false);
      }
    },
    [],
  );

  return { generating, error, downloadPDF };
}
