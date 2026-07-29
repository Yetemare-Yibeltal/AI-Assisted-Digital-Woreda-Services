import { jsPDF } from "jspdf";
import { formatDate, formatCurrency } from "@/utils/formatters";
import type { IApplication } from "@/types/application.types";
import type { IService } from "@/types/service.types";

export async function generateReceipt(
  application: IApplication,
  service: IService,
  language: "en" | "am" = "en",
): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 25;

  // Header
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    language === "am"
      ? "የኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ"
      : "Federal Democratic Republic of Ethiopia",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    language === "am"
      ? "አማራ ክልል - አዊ ዞን - ዳንግላ ወረዳ"
      : "Amhara Region - Awi Zone - Dangila Woreda",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 6;
  doc.setDrawColor(0, 154, 68);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(0, 154, 68);
  doc.text(
    language === "am" ? "የማመልከቻ ደረሰኝ" : "APPLICATION RECEIPT",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 12;

  // Tracking number
  doc.setFontSize(20);
  doc.setTextColor(0, 154, 68);
  doc.text(application.trackingNumber, pageWidth / 2, y, { align: "center" });
  y += 16;

  // Details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const details =
    language === "am"
      ? [
          { label: "የማመልከቻ ቁጥር", value: application.applicationId },
          { label: "አገልግሎት", value: service.nameAmharic },
          {
            label: "የአመልካች ስም",
            value: application.applicantInfo.fullNameAmharic,
          },
          { label: "ስልክ", value: application.applicantInfo.phoneNumber },
          { label: "ቀበሌ", value: application.address.kebele },
          { label: "ቀን", value: formatDate(application.createdAt, "am") },
          { label: "ሁኔታ", value: application.status },
        ]
      : [
          { label: "Application ID", value: application.applicationId },
          { label: "Service", value: service.name },
          {
            label: "Applicant Name",
            value: application.applicantInfo.fullName,
          },
          { label: "Phone", value: application.applicantInfo.phoneNumber },
          { label: "Kebele", value: application.address.kebele },
          { label: "Date", value: formatDate(application.createdAt) },
          { label: "Status", value: application.status },
        ];

  for (const row of details) {
    doc.setFont("helvetica", "bold");
    doc.text(row.label + ":", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(row.value), margin + 50, y);
    y += 7;
  }

  y += 6;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const totalFee = service.fees?.reduce((s, f) => s + f.amount, 0) || 0;
  if (service.fees?.length) {
    doc.setFont("helvetica", "bold");
    doc.text(language === "am" ? "ክፍያዎች" : "Fees", margin, y);
    y += 6;
    for (const fee of service.fees) {
      doc.setFont("helvetica", "normal");
      doc.text(language === "am" ? fee.nameAmharic : fee.name, margin + 5, y);
      doc.text(
        formatCurrency(fee.amount, fee.currency),
        pageWidth - margin,
        y,
        { align: "right" },
      );
      y += 6;
    }
    doc.setFont("helvetica", "bold");
    doc.text(language === "am" ? "ጠቅላላ" : "Total", margin, y);
    doc.text(formatCurrency(totalFee), pageWidth - margin, y, {
      align: "right",
    });
    y += 12;
  }

  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(
    language === "am"
      ? "ይህ ደረሰኝ ማመልከቻዎ መቀበሉን ያረጋግጣል"
      : "This receipt confirms your application has been received",
    pageWidth / 2,
    y,
    { align: "center" },
  );

  return doc.output("blob");
}

export async function generateCertificate(
  application: IApplication,
  service: IService,
  approvedBy: string,
  language: "en" | "am" = "en",
): Promise<Blob> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  let y = 25;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    language === "am"
      ? "የኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ"
      : "Federal Democratic Republic of Ethiopia",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    language === "am"
      ? "አማራ ክልል - አዊ ዞን - ዳንግላ ወረዳ"
      : "Amhara Region - Awi Zone - Dangila Woreda",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 6;
  doc.setDrawColor(0, 154, 68);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  doc.setFontSize(22);
  doc.setTextColor(0, 154, 68);
  doc.text(
    language === "am" ? "የማጽደቅ ሰርተፍኬት" : "CERTIFICATE OF APPROVAL",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 15;

  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  const body =
    language === "am"
      ? `ይህ ሰርተፍኬት ${application.applicantInfo.fullNameAmharic} ለ${service.nameAmharic} ያቀረቡት ማመልከቻ (${application.trackingNumber}) መጽደቁን ያረጋግጣል።`
      : `This certifies that ${application.applicantInfo.fullName} has been approved for ${service.name} (${application.trackingNumber}).`;
  const lines = doc.splitTextToSize(body, pageWidth - margin * 4);
  doc.text(lines, pageWidth / 2, y, { align: "center" });
  y += lines.length * 10 + 20;

  doc.setFontSize(12);
  doc.text(
    `${language === "am" ? "ጸድቋል" : "Approved by"}: ${approvedBy}`,
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 10;
  doc.text(
    `${language === "am" ? "ቀን" : "Date"}: ${formatDate(new Date().toISOString(), language)}`,
    pageWidth / 2,
    y,
    { align: "center" },
  );

  return doc.output("blob");
}

export async function generateDocumentRequest(
  application: IApplication,
  documents: string[],
  language: "en" | "am" = "en",
): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 30;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 154, 68);
  doc.text(
    language === "am" ? "የሰነድ ጥያቄ ደብዳቤ" : "DOCUMENT REQUEST LETTER",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 12;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `${language === "am" ? "ለ" : "To"}: ${language === "am" ? application.applicantInfo.fullNameAmharic : application.applicantInfo.fullName}`,
    margin,
    y,
  );
  y += 8;
  doc.text(
    `${language === "am" ? "የመከታተያ ቁጥር" : "Tracking Number"}: ${application.trackingNumber}`,
    margin,
    y,
  );
  y += 10;

  doc.text(
    language === "am"
      ? "የሚከተሉት ሰነዶች ያስፈልጋሉ:"
      : "The following documents are required:",
    margin,
    y,
  );
  y += 8;
  for (const docName of documents) {
    doc.text(`• ${docName}`, margin + 8, y);
    y += 7;
  }

  y += 8;
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 10);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${language === "am" ? "የማስረከቢያ ቀን" : "Deadline"}: ${formatDate(deadline.toISOString(), language)}`,
    margin,
    y,
  );

  return doc.output("blob");
}
