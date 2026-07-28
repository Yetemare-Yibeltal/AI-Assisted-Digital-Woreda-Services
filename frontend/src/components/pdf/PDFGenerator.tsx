import { jsPDF } from "jspdf";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { pdfConfig, receiptConfig, certificateConfig } from "@/config/pdf.config";
import api from "@/utils/api";
import type { IApplication } from "@/types/application.types";
import type { IService } from "@/types/service.types";

// =============================================
// Helper functions
// =============================================

function addHeader(doc: jsPDF, language: "en" | "am", config = pdfConfig): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = config.margins.left;

  // Government header
  doc.setFontSize(config.header.fontSize);
  doc.setFont("helvetica", "bold");
  doc.text(language === "am" ? config.header.titleAm : config.header.titleEn, pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(config.header.subFontSize);
  doc.setFont("helvetica", "normal");
  doc.text(language === "am" ? config.header.subtitleAm : config.header.subtitleEn, pageWidth / 2, 33, { align: "center" });

  // Separator line
  doc.setDrawColor(0, 154, 68);
  doc.setLineWidth(0.5);
  doc.line(margin, 38, pageWidth - margin, 38);

  // Watermark
  if (config.watermark.show) {
    const watermark = config.watermark;
    doc.setTextColor(watermark.color);
    doc.setFontSize(watermark.fontSize);
    doc.setFont("helvetica", "bold");
    doc.text(watermark.text, pageWidth / 2, pageWidth / 2, {
      align: "center",
      angle: -45,
      opacity: watermark.opacity,
    });
    doc.setTextColor(config.colors.text);
  }
}

function addFooter(doc: jsPDF, pageNumber: number, totalPages: number, config = pdfConfig): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = config.margins.left;

  if (config.footer.showTimestamp) {
    doc.setFontSize(config.footer.fontSize);
    doc.setFont("helvetica", "normal");
    doc.text(config.footer.text + " | " + new Date().toLocaleString(), margin, pageHeight - 15);
  }

  if (config.footer.showPageNumbers) {
    doc.text(`Page ${pageNumber} / ${totalPages}`, pageWidth - margin, pageHeight - 15, { align: "right" });
  }
}

function addStamp(doc: jsPDF, x: number, y: number, config = pdfConfig): void {
  if (!config.stamp.show) return;

  const stamp = config.stamp;
  doc.setTextColor(stamp.color);
  doc.setFontSize(stamp.fontSize);
  doc.setFont("helvetica", "bold");

  // Draw stamp border
  doc.setDrawColor(204, 0, 0);
  doc.setLineWidth(2);
  doc.roundedRect(x - 25, y - 15, 50, 30, 3, 3);

  // Stamp text
  doc.text(stamp.text, x, y - 2, { align: "center" });
  doc.setFontSize(stamp.fontSize - 4);
  doc.text("DANGILA WOREDA", x, y + 8, { align: "center" });

  doc.setTextColor(config.colors.text);
}

function drawTrackingBox(doc: jsPDF, trackingNumber: string, x: number, y: number): void {
  doc.setDrawColor(0, 154, 68);
  doc.setLineWidth(0.5);
  doc.roundedRect(x - 50, y - 10, 100, 20, 3, 3);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("TRACKING NUMBER", x, y - 2, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 154, 68);
  doc.text(trackingNumber, x, y + 10, { align: "center" });
  doc.setTextColor(pdfConfig.colors.text);
}

// =============================================
// PDF Generation Functions
// =============================================

export async function generateReceiptPDF(
  application: IApplication,
  service: IService,
  language: "en" | "am" = "en"
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const config = { ...pdfConfig, ...receiptConfig };
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = config.margins.left;
  let y = 45;

  addHeader(doc, language, config);

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(config.colors.primary);
  doc.text(language === "am" ? "የማመልከቻ ደረሰኝ" : "APPLICATION RECEIPT", pageWidth / 2, y, { align: "center" });
  y += 12;

  // Tracking number box
  drawTrackingBox(doc, application.trackingNumber, pageWidth / 2, y + 5);
  y += 25;

  // Application details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(config.colors.text);

  const details = language === "am"
    ? [
        { label: "የማመልከቻ ቁጥር", value: application.applicationId },
        { label: "የአገልግሎት አይነት", value: service.nameAmharic },
        { label: "የአመልካች ስም", value: application.applicantInfo.fullNameAmharic },
        { label: "ስልክ ቁጥር", value: application.applicantInfo.phoneNumber },
        { label: "ቀበሌ", value: application.address.kebele },
        { label: "የቀረበበት ቀን", value: formatDate(application.createdAt, "am") },
        { label: "ሁኔታ", value: application.status },
      ]
    : [
        { label: "Application ID", value: application.applicationId },
        { label: "Service", value: service.name },
        { label: "Applicant Name", value: application.applicantInfo.fullName },
        { label: "Phone Number", value: application.applicantInfo.phoneNumber },
        { label: "Kebele", value: application.address.kebele },
        { label: "Submission Date", value: formatDate(application.createdAt) },
        { label: "Status", value: application.status },
      ];

  details.forEach(({ label, value }) => {
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "—", margin + 55, y);
    y += 8;
  });

  y += 8;

  // Fees section
  if (service.fees && service.fees.length > 0) {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(language === "am" ? "ክፍያዎች" : "Fees", margin, y);
    y += 8;

    let totalFee = 0;
    service.fees.forEach((fee) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(language === "am" ? fee.nameAmharic : fee.name, margin + 5, y);
      doc.text(formatCurrency(fee.amount, fee.currency), pageWidth - margin - 30, y, { align: "right" });
      totalFee += fee.amount;
      y += 6;
    });

    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text(language === "am" ? "ጠቅላላ" : "Total", margin, y);
    doc.text(formatCurrency(totalFee), pageWidth - margin - 30, y, { align: "right" });
    y += 12;
  }

  // Notice
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(config.colors.lightText);
  const notice = language === "am"
    ? "ይህ ደረሰኝ ማመልከቻዎ መቀበሉን ያረጋግጣል። ለወደፊት ማጣቀሻ ይዘውት ይቆዩ።"
    : "This receipt confirms your application has been received. Keep it for future reference.";
  doc.text(notice, pageWidth / 2, y, { align: "center" });
  y += 15;

  // Official stamp
  addStamp(doc, pageWidth - margin - 30, y + 5, config);

  addFooter(doc, 1, 1, config);

  return doc.output("blob");
}

export async function generateCertificatePDF(
  application: IApplication,
  service: IService,
  approvedBy: string,
  language: "en" | "am" = "en"
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const config = { ...pdfConfig, ...certificateConfig };
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = config.margins.left;
  let y = 45;

  addHeader(doc, language, config);

  // Certificate title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(config.colors.primary);
  doc.text(
    language === "am" ? "የማጽደቅ ሰርተፍኬት" : "CERTIFICATE OF APPROVAL",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 15;

  // Decorative line
  doc.setDrawColor(config.colors.primary);
  doc.setLineWidth(1);
  doc.line(pageWidth / 4, y, (pageWidth / 4) * 3, y);
  y += 12;

  // Certificate body
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(config.colors.text);

  const bodyText = language === "am"
    ? `ይህ ሰርተፍኬት የሚያረጋግጠው ${application.applicantInfo.fullNameAmharic} ያቀረቡት የ${service.nameAmharic} ማመልከቻ ቁጥር ${application.trackingNumber} ጸድቋል።`
    : `This certificate confirms that the application for ${service.name} submitted by ${application.applicantInfo.fullName} (${application.trackingNumber}) has been approved.`;

  const lines = doc.splitTextToSize(bodyText, pageWidth - margin * 4);
  doc.text(lines, pageWidth / 2, y, { align: "center" });
  y += lines.length * 10 + 20;

  // Approval details
  doc.setFontSize(11);
  doc.text(`${language === "am" ? "ጸድቋል" : "Approved by"}: ${approvedBy}`, pageWidth / 2, y, { align: "center" });
  y += 10;
  doc.text(`${language === "am" ? "ቀን" : "Date"}: ${formatDate(new Date().toISOString())}`, pageWidth / 2, y, { align: "center" });

  // Stamp
  addStamp(doc, pageWidth - margin - 35, 55, config);

  // Tracking box at bottom
  drawTrackingBox(doc, application.trackingNumber, pageWidth / 2, 165);

  addFooter(doc, 1, 1, config);

  return doc.output("blob");
}

export async function generateDocumentRequestPDF(
  application: IApplication,
  documents: string[],
  language: "en" | "am" = "en"
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const config = pdfConfig;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = config.margins.left;
  let y = 45;

  addHeader(doc, language, config);

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(config.colors.primary);
  doc.text(
    language === "am" ? "የሰነድ ጥያቄ ደብዳቤ" : "DOCUMENT REQUEST LETTER",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 12;

  // Applicant info
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(config.colors.text);
  doc.text(`${language === "am" ? "ለ" : "To"}: ${language === "am" ? application.applicantInfo.fullNameAmharic : application.applicantInfo.fullName}`, margin, y);
  y += 8;
  doc.text(`${language === "am" ? "የመከታተያ ቁጥር" : "Tracking Number"}: ${application.trackingNumber}`, margin, y);
  y += 12;

  // Body
  const bodyIntro = language === "am"
    ? `የእርስዎን የ${application.serviceName} ማመልከቻ በተመለከተ የሚከተሉት ሰነዶች ያስፈልጋሉ:`
    : `Regarding your application for ${application.serviceName}, the following documents are required:`;
  doc.text(bodyIntro, margin, y);
  y += 10;

  // Document list
  doc.setFontSize(10);
  documents.forEach((docName, index) => {
    doc.text(`${index + 1}. ${docName}`, margin + 10, y);
    y += 7;
  });

  y += 10;

  // Deadline
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 10);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${language === "am" ? "የማስረከቢያ ቀን" : "Submission Deadline"}: ${formatDate(deadline.toISOString())}`,
    margin,
    y
  );

  addFooter(doc, 1, 1, config);

  return doc.output("blob");
}

export async function downloadServerPDF(
  applicationId: string,
  type: "receipt" | "certificate" | "document-request",
  language: "en" | "am" = "en",
  additionalData?: any
): Promise<void> {
  try {
    const endpoint = `/pdf/${type}/${applicationId}?lang=${language}`;
    const response = await api.get(endpoint, {
      responseType: "blob",
      ...(additionalData && { data: additionalData, method: "post" }),
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-${applicationId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Failed to download ${type} PDF:`, error);
    throw error;
  }
}

export default {
  generateReceiptPDF,
  generateCertificatePDF,
  generateDocumentRequestPDF,
  downloadServerPDF,
};