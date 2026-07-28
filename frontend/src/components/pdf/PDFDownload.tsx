import React, { useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Download,
  FileText,
  Award,
  FileWarning,
  Loader2,
  CheckCircle2,
  Printer,
  ChevronDown,
} from "lucide-react";
import {
  generateReceiptPDF,
  generateCertificatePDF,
  generateDocumentRequestPDF,
  downloadServerPDF,
} from "./PDFGenerator";
import type { IApplication } from "@/types/application.types";
import type { IService } from "@/types/service.types";

interface PDFDownloadProps {
  application: IApplication;
  service: IService;
  approvedBy?: string;
  variant?: "button" | "dropdown";
  size?: "sm" | "default" | "lg";
  className?: string;
  language?: "en" | "am";
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
}

type PDFType = "receipt" | "certificate" | "document-request";

export function PDFDownload({
  application,
  service,
  approvedBy = "Dangila Woreda Administration",
  variant = "button",
  size = "default",
  className,
  language = "en",
  onDownloadStart,
  onDownloadComplete,
}: PDFDownloadProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<PDFType | null>(null);
  const [lastGenerated, setLastGenerated] = useState<PDFType | null>(null);

  const handleDownload = useCallback(
    async (type: PDFType) => {
      setLoading(type);
      onDownloadStart?.();

      try {
        let blob: Blob;
        const lang = language;

        // Try client-side generation first, fall back to server
        try {
          switch (type) {
            case "receipt":
              blob = await generateReceiptPDF(application, service, lang);
              break;
            case "certificate":
              blob = await generateCertificatePDF(application, service, approvedBy, lang);
              break;
            case "document-request":
              const docNames = service.requiredDocuments?.map((d) =>
                lang === "am" ? d.nameAmharic : d.name
              ) || [];
              blob = await generateDocumentRequestPDF(application, docNames, lang);
              break;
            default:
              throw new Error("Unknown PDF type");
          }
        } catch {
          // Fallback to server
          await downloadServerPDF(application._id, type, lang);
          setLastGenerated(type);
          setLoading(null);
          onDownloadComplete?.();
          return;
        }

        // Trigger download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type}-${application.trackingNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setLastGenerated(type);

        toast({
          variant: "success",
          title: language === "am" ? "PDF ተፈጥሯል!" : "PDF Generated!",
          description: language === "am"
            ? `${getPDFTypeLabel(type, "am")} በተሳካ ሁኔታ ወርዷል።`
            : `${getPDFTypeLabel(type, "en")} downloaded successfully.`,
        });
      } catch (error) {
        console.error(`Failed to generate ${type} PDF:`, error);
        toast({
          variant: "error",
          title: language === "am" ? "ስህተት" : "Error",
          description: language === "am"
            ? "PDF መፍጠር አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
            : "Failed to generate PDF. Please try again.",
        });
      } finally {
        setLoading(null);
        onDownloadComplete?.();
      }
    },
    [application, service, approvedBy, language, toast, onDownloadStart, onDownloadComplete]
  );

  const handlePrint = useCallback(
    async (type: PDFType) => {
      setLoading(type);
      try {
        let blob: Blob;
        try {
          switch (type) {
            case "receipt":
              blob = await generateReceiptPDF(application, service, language);
              break;
            case "certificate":
              blob = await generateCertificatePDF(application, service, approvedBy, language);
              break;
            case "document-request":
              const docNames = service.requiredDocuments?.map((d) =>
                language === "am" ? d.nameAmharic : d.name
              ) || [];
              blob = await generateDocumentRequestPDF(application, docNames, language);
              break;
            default:
              throw new Error("Unknown PDF type");
          }
        } catch {
          toast({
            variant: "error",
            title: language === "am" ? "ስህተት" : "Error",
            description: language === "am"
              ? "ለማተም አልተሳካም።"
              : "Failed to prepare for printing.",
          });
          return;
        }

        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
          printWindow.onload = () => printWindow.print();
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } catch (error) {
        console.error(`Failed to print ${type} PDF:`, error);
      } finally {
        setLoading(null);
      }
    },
    [application, service, approvedBy, language, toast]
  );

  const canGenerateCertificate =
    application.status === "approved" || application.status === "completed";

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="glass"
            size={size}
            disabled={!!loading}
            className={cn("gap-2", className)}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{language === "am" ? "PDF አውርድ" : "Download PDF"}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {language === "am" ? "የሰነድ አይነት ይምረጡ" : "Select Document Type"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleDownload("receipt")}
            disabled={loading === "receipt"}
            className="gap-2"
          >
            {loading === "receipt" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <div className="flex flex-col">
              <span>{language === "am" ? "ደረሰኝ" : "Receipt"}</span>
              <span className="text-xs text-muted-foreground">
                {language === "am" ? "የማመልከቻ ደረሰኝ" : "Application receipt"}
              </span>
            </div>
          </DropdownMenuItem>
          {canGenerateCertificate && (
            <DropdownMenuItem
              onClick={() => handleDownload("certificate")}
              disabled={loading === "certificate"}
              className="gap-2"
            >
              {loading === "certificate" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Award className="h-4 w-4" />
              )}
              <div className="flex flex-col">
                <span>{language === "am" ? "ሰርተፍኬት" : "Certificate"}</span>
                <span className="text-xs text-muted-foreground">
                  {language === "am" ? "የማጽደቅ ሰርተፍኬት" : "Approval certificate"}
                </span>
              </div>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => handleDownload("document-request")}
            disabled={loading === "document-request"}
            className="gap-2"
          >
            {loading === "document-request" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileWarning className="h-4 w-4" />
            )}
            <div className="flex flex-col">
              <span>{language === "am" ? "የሰነድ ጥያቄ" : "Document Request"}</span>
              <span className="text-xs text-muted-foreground">
                {language === "am" ? "የሰነድ ጥያቄ ደብዳቤ" : "Document request letter"}
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handlePrint("receipt")}
            disabled={!!loading}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>{language === "am" ? "አትም" : "Print"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="primary"
        size={size}
        onClick={() => handleDownload("receipt")}
        disabled={!!loading}
        loading={loading === "receipt"}
        leftIcon={loading !== "receipt" ? <Download className="h-4 w-4" /> : undefined}
      >
        {language === "am" ? "ደረሰኝ አውርድ" : "Download Receipt"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="glass"
            size={size}
            disabled={!!loading}
            className="px-2"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canGenerateCertificate && (
            <DropdownMenuItem
              onClick={() => handleDownload("certificate")}
              disabled={loading === "certificate"}
              className="gap-2"
            >
              {loading === "certificate" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Award className="h-4 w-4" />
              )}
              <span>{language === "am" ? "ሰርተፍኬት" : "Certificate"}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => handleDownload("document-request")}
            disabled={loading === "document-request"}
            className="gap-2"
          >
            {loading === "document-request" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileWarning className="h-4 w-4" />
            )}
            <span>{language === "am" ? "የሰነድ ጥያቄ" : "Document Request"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handlePrint("receipt")} disabled={!!loading} className="gap-2">
            <Printer className="h-4 w-4" />
            <span>{language === "am" ? "አትም" : "Print"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {lastGenerated && (
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      )}
    </div>
  );
}

function getPDFTypeLabel(type: PDFType, language: "en" | "am"): string {
  const labels: Record<PDFType, { en: string; am: string }> = {
    receipt: { en: "Receipt", am: "ደረሰኝ" },
    certificate: { en: "Certificate", am: "ሰርተፍኬት" },
    "document-request": { en: "Document Request", am: "የሰነድ ጥያቄ" },
  };
  return labels[type]?.[language] || type;
}

export default PDFDownload;