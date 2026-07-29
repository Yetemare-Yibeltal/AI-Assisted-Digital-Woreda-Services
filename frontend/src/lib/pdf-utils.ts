import { jsPDF } from "jspdf";
import { formatDate, formatCurrency } from "@/utils/formatters";

export function createPDFDocument(
  orientation: "portrait" | "landscape" = "portrait",
): jsPDF {
  return new jsPDF({ orientation, unit: "mm", format: "a4" });
}

export function addGovernmentHeader(
  doc: jsPDF,
  language: "en" | "am",
  y: number = 25,
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
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
  y += 7;
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
  y += 5;
  doc.setDrawColor(0, 154, 68);
  doc.line(20, y, pageWidth - 20, y);
  return y + 5;
}

export function addTrackingBox(
  doc: jsPDF,
  trackingNumber: string,
  x: number,
  y: number,
): number {
  doc.setDrawColor(0, 154, 68);
  doc.roundedRect(x - 40, y, 80, 15, 3, 3);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 154, 68);
  doc.text(trackingNumber, x, y + 10, { align: "center" });
  doc.setTextColor(0, 0, 0);
  return y + 20;
}

export function addStamp(doc: jsPDF, x: number, y: number): void {
  doc.setTextColor(204, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.roundedRect(x - 25, y - 10, 50, 25, 3, 3);
  doc.text("OFFICIAL STAMP", x, y - 2, { align: "center" });
  doc.setFontSize(8);
  doc.text("DANGILA WOREDA", x, y + 8, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
