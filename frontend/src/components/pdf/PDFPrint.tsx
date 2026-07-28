import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/formatters";
import type { IApplication } from "@/types/application.types";
import type { IService } from "@/types/service.types";

interface PDFPrintProps {
  application: IApplication;
  service: IService;
  type: "receipt" | "certificate" | "document-request";
  approvedBy?: string;
  documents?: string[];
  language?: "en" | "am";
  onPrintComplete?: () => void;
  className?: string;
  trigger?: React.ReactNode;
}

export function PDFPrint({
  application,
  service,
  type,
  approvedBy = "Dangila Woreda Administration",
  documents = [],
  language = "en",
  onPrintComplete,
  className,
  trigger,
}: PDFPrintProps) {
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = React.useState(false);

  const generatePrintHTML = useCallback((): string => {
    const title =
      type === "receipt"
        ? language === "am"
          ? "የማመልከቻ ደረሰኝ"
          : "Application Receipt"
        : type === "certificate"
        ? language === "am"
          ? "የማጽደቅ ሰርተፍኬት"
          : "Certificate of Approval"
        : language === "am"
        ? "የሰነድ ጥያቄ ደብዳቤ"
        : "Document Request Letter";

    const headerEn = "Federal Democratic Republic of Ethiopia";
    const headerAm = "የኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ";
    const subheaderEn = "Amhara Region - Awi Zone - Dangila Woreda Administration";
    const subheaderAm = "የአማራ ክልል - አዊ ዞን - የዳንግላ ወረዳ አስተዳደር";

    const totalFee = service.fees?.reduce((sum, f) => sum + f.amount, 0) || 0;

    const receiptRows = `
      <tr><td><strong>${language === "am" ? "የመከታተያ ቁጥር" : "Tracking Number"}</strong></td><td>${application.trackingNumber}</td></tr>
      <tr><td><strong>${language === "am" ? "የማመልከቻ ቁጥር" : "Application ID"}</strong></td><td>${application.applicationId}</td></tr>
      <tr><td><strong>${language === "am" ? "አገልግሎት" : "Service"}</strong></td><td>${language === "am" ? service.nameAmharic : service.name}</td></tr>
      <tr><td><strong>${language === "am" ? "የአመልካች ስም" : "Applicant Name"}</strong></td><td>${language === "am" ? application.applicantInfo.fullNameAmharic : application.applicantInfo.fullName}</td></tr>
      <tr><td><strong>${language === "am" ? "ስልክ" : "Phone"}</strong></td><td>${application.applicantInfo.phoneNumber}</td></tr>
      <tr><td><strong>${language === "am" ? "ቀበሌ" : "Kebele"}</strong></td><td>${application.address.kebele}</td></tr>
      <tr><td><strong>${language === "am" ? "ቀን" : "Date"}</strong></td><td>${formatDate(application.createdAt, language)}</td></tr>
      <tr><td><strong>${language === "am" ? "ሁኔታ" : "Status"}</strong></td><td>${application.status}</td></tr>
    `;

    const feesRows = service.fees
      ?.map(
        (fee) => `
      <tr><td>${language === "am" ? fee.nameAmharic : fee.name}</td><td style="text-align:right">${formatCurrency(fee.amount, fee.currency)}</td></tr>
    `
      )
      .join("");

    const bodyContent =
      type === "receipt"
        ? `
      <div class="section">
        <h2 class="title">${title}</h2>
        <div class="tracking-box">${application.trackingNumber}</div>
        <table>${receiptRows}</table>
      </div>
      ${
        service.fees && service.fees.length > 0
          ? `
      <div class="section">
        <h3>${language === "am" ? "ክፍያዎች" : "Fees"}</h3>
        <table>${feesRows}</table>
        <p style="text-align:right;font-weight:bold;margin-top:8px">
          ${language === "am" ? "ጠቅላላ" : "Total"}: ${formatCurrency(totalFee)}
        </p>
      </div>`
          : ""
      }
      <p class="notice">${
        language === "am"
          ? "ይህ ደረሰኝ ማመልከቻዎ መቀበሉን ያረጋግጣል።"
          : "This receipt confirms your application has been received."
      }</p>
    `
        : type === "certificate"
        ? `
      <div class="section" style="text-align:center">
        <h2 class="title" style="font-size:24pt">${title}</h2>
        <div class="certificate-body">
          ${
            language === "am"
              ? `ይህ ሰርተፍኬት የሚያረጋግጠው ${application.applicantInfo.fullNameAmharic} ያቀረቡት የ${service.nameAmharic} ማመልከቻ (${application.trackingNumber}) ጸድቋል።`
              : `This certificate confirms that the application for ${service.name} submitted by ${application.applicantInfo.fullName} (${application.trackingNumber}) has been approved.`
          }
        </div>
        <p style="margin-top:40px"><strong>${language === "am" ? "ጸድቋል" : "Approved by"}:</strong> ${approvedBy}</p>
        <p><strong>${language === "am" ? "ቀን" : "Date"}:</strong> ${formatDate(new Date().toISOString(), language)}</p>
        <div class="stamp">${language === "am" ? "ኦፊሴላዊ ማህተም" : "OFFICIAL STAMP"}</div>
      </div>
    `
        : `
      <div class="section">
        <h2 class="title">${title}</h2>
        <p>${language === "am" ? "ለ" : "To"}: ${language === "am" ? application.applicantInfo.fullNameAmharic : application.applicantInfo.fullName}</p>
        <p>${language === "am" ? "የመከታተያ ቁጥር" : "Tracking Number"}: ${application.trackingNumber}</p>
        <p>${language === "am" ? "የሚከተሉት ሰነዶች ያስፈልጋሉ" : "The following documents are required"}:</p>
        <ol>${documents.map((d) => `<li>${d}</li>`).join("")}</ol>
        <p style="margin-top:20px"><strong>${language === "am" ? "የማስረከቢያ ቀን" : "Submission Deadline"}:</strong> ${formatDate(new Date(Date.now() + 10 * 86400000).toISOString(), language)}</p>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { margin: 1.5cm; size: A4; }
          body { font-family: Arial, sans-serif; font-size: 12pt; color: #1a1a1a; margin: 0; padding: 0; }
          .header { text-align: center; border-bottom: 2px solid #009A44; padding-bottom: 12px; margin-bottom: 24px; }
          .header h1 { font-size: 14pt; margin: 0 0 4px; }
          .header p { font-size: 11pt; margin: 0; color: #555; }
          .title { font-size: 18pt; color: #009A44; margin: 0 0 16px; }
          .section { margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          td { padding: 6px 12px; border-bottom: 1px solid #ddd; vertical-align: top; }
          td:first-child { width: 40%; font-weight: normal; color: #555; }
          .tracking-box { font-size: 20pt; font-weight: bold; color: #009A44; text-align: center; border: 2px solid #009A44; padding: 12px; margin: 16px 0; letter-spacing: 4px; }
          .notice { font-size: 10pt; color: #888; text-align: center; margin-top: 24px; font-style: italic; }
          .certificate-body { font-size: 13pt; line-height: 1.8; margin: 24px 0; }
          .stamp { display: inline-block; border: 3px solid #cc0000; color: #cc0000; padding: 8px 20px; font-size: 14pt; font-weight: bold; transform: rotate(-10deg); margin-top: 30px; opacity: 0.8; }
          .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 9pt; color: #999; text-align: center; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${language === "am" ? headerAm : headerEn}</h1>
          <p>${language === "am" ? subheaderAm : subheaderEn}</p>
        </div>
        ${bodyContent}
        <div class="footer">
          ${language === "am" ? "በዳንግላ ዲጂታል ወረዳ አገልግሎቶች የተፈጠረ" : "Generated by Dangila Digital Woreda Services"} &mdash; ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
  }, [application, service, type, approvedBy, documents, language]);

  const handlePrint = useCallback(() => {
    setLoading(true);
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      setLoading(false);
      return;
    }

    printWindow.document.write(generatePrintHTML());
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
        setLoading(false);
        onPrintComplete?.();
      };
      // Fallback if onafterprint doesn't fire
      setTimeout(() => {
        setLoading(false);
        onPrintComplete?.();
      }, 2000);
    };
  }, [generatePrintHTML, onPrintComplete]);

  return trigger ? (
    <div onClick={handlePrint} className={cn("cursor-pointer", className)}>
      {trigger}
    </div>
  ) : (
    <Button
      variant="glass"
      onClick={handlePrint}
      disabled={loading}
      loading={loading}
      leftIcon={loading ? undefined : <Printer className="h-4 w-4" />}
      className={className}
    >
      {language === "am" ? "አትም" : "Print"}
    </Button>
  );
}

export default PDFPrint;