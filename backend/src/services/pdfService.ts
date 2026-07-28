import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { IApplication } from "../models/Application";
import { IService } from "../models/Service";
import logger from "../utils/logger";

interface PDFGenerationOptions {
  language: "en" | "am";
  includeStamp: boolean;
  includeBarcode: boolean;
  outputPath?: string;
}

const createPDFDocument = (options: PDFGenerationOptions): PDFKit.PDFDocument => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: "Dangila Woreda Services Document",
      Author: "Dangila Woreda Administration",
      Subject: "Official Document",
    },
  });
  return doc;
};

const addHeader = (doc: PDFKit.PDFDocument, language: "en" | "am"): void => {
  const headerText =
    language === "am" ? "የኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ" : "Federal Democratic Republic of Ethiopia";

  const subHeaderText =
    language === "am"
      ? "የአማራ ክልል - አዊ ዞን - የዳንግላ ወረዳ አስተዳደር"
      : "Amhara Region - Awi Zone - Dangila Woreda Administration";

  doc.fontSize(12).text(headerText, { align: "center" });
  doc.fontSize(10).text(subHeaderText, { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#1a5632");
  doc.moveDown(1);
};

const addFooter = (doc: PDFKit.PDFDocument): void => {
  const bottomY = doc.page.height - 50;
  doc.moveTo(50, bottomY).lineTo(545, bottomY).stroke("#cccccc");
  doc
    .fillColor("#666666")
    .fontSize(8)
    .text(
      `Generated on ${new Date().toLocaleString()} | Dangila Woreda Digital Services`,
      50,
      bottomY + 10,
      { align: "center" }
    );
};

const generateApplicationReceipt = async (
  application: IApplication,
  service: IService,
  options: PDFGenerationOptions = { language: "en", includeStamp: true, includeBarcode: true }
): Promise<Buffer> => {
  const doc = createPDFDocument(options);
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  addHeader(doc, options.language);

  const title = options.language === "am" ? "የማመልከቻ ደረሰኝ" : "Application Receipt";
  doc.fontSize(16).text(title, { align: "center" });
  doc.moveDown(1);

  const details =
    options.language === "am"
      ? [
          { label: "የመከታተያ ቁጥር", value: application.trackingNumber },
          { label: "የማመልከቻ ቁጥር", value: application.applicationId },
          { label: "የአገልግሎት አይነት", value: service.nameAmharic },
          { label: "የአመልካች ስም", value: application.applicantInfo.fullNameAmharic },
          { label: "ስልክ ቁጥር", value: application.applicantInfo.phoneNumber },
          { label: "ቀበሌ", value: application.address.kebele },
          {
            label: "የቀረበበት ቀን",
            value: new Date(application.createdAt).toLocaleDateString("am-ET"),
          },
          { label: "ሁኔታ", value: application.status },
          {
            label: "የሚጠበቀው የማጠናቀቂያ ቀን",
            value: application.estimatedCompletionDate
              ? new Date(application.estimatedCompletionDate).toLocaleDateString("am-ET")
              : "N/A",
          },
        ]
      : [
          { label: "Tracking Number", value: application.trackingNumber },
          { label: "Application ID", value: application.applicationId },
          { label: "Service Type", value: service.name },
          { label: "Applicant Name", value: application.applicantInfo.fullName },
          { label: "Phone Number", value: application.applicantInfo.phoneNumber },
          { label: "Kebele", value: application.address.kebele },
          { label: "Submission Date", value: new Date(application.createdAt).toLocaleDateString() },
          { label: "Status", value: application.status },
          {
            label: "Estimated Completion",
            value: application.estimatedCompletionDate
              ? new Date(application.estimatedCompletionDate).toLocaleDateString()
              : "N/A",
          },
        ];

  const labelWidth = 180;
  const valueWidth = 300;
  const startX = 50;
  let currentY = doc.y;

  details.forEach((detail) => {
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(detail.label + ":", startX, currentY, { width: labelWidth });
    doc.font("Helvetica").text(detail.value, startX + labelWidth, currentY, { width: valueWidth });
    currentY = doc.y + 5;
  });

  doc.moveDown(2);

  if (service.fees && service.fees.length > 0) {
    const feesTitle = options.language === "am" ? "ክፍያዎች" : "Fees";
    doc.fontSize(12).font("Helvetica-Bold").text(feesTitle);
    doc.moveDown(0.5);

    let totalFee = 0;
    service.fees.forEach((fee) => {
      const feeLabel = options.language === "am" ? fee.nameAmharic : fee.name;
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`${feeLabel}: ${fee.amount} ${fee.currency}`, { indent: 20 });
      totalFee += fee.amount;
    });

    doc
      .font("Helvetica-Bold")
      .text(`${options.language === "am" ? "ጠቅላላ" : "Total"}: ${totalFee} ETB`, { indent: 20 });
  }

  doc.moveDown(2);

  const notice =
    options.language === "am"
      ? "ይህ ደረሰኝ ማመልከቻዎ መቀበሉን የሚያረጋግጥ ነው። ለወደፊት ማጣቀሻ ይዘውት ይቆዩ።"
      : "This receipt confirms your application has been received. Please keep it for future reference.";

  doc.fillColor("#666666").fontSize(9).text(notice, { align: "center" });

  addFooter(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
};

const generateApprovalCertificate = async (
  application: IApplication,
  service: IService,
  approvedBy: string,
  options: PDFGenerationOptions = { language: "en", includeStamp: true, includeBarcode: true }
): Promise<Buffer> => {
  const doc = createPDFDocument(options);
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  addHeader(doc, options.language);

  const title = options.language === "am" ? "የማጽደቅ ሰርተፍኬት" : "Certificate of Approval";

  doc.fillColor("#1a5632").fontSize(18).text(title, { align: "center" });
  doc.fillColor("#000000");
  doc.moveDown(2);

  const bodyText =
    options.language === "am"
      ? `ይህ ሰርተፍኬት የሚያረጋግጠው ${application.applicantInfo.fullNameAmharic} (${application.trackingNumber}) ያቀረቡት የ${service.nameAmharic} ማመልከቻ ጸድቋል።`
      : `This certificate confirms that the application for ${service.name} submitted by ${application.applicantInfo.fullName} (${application.trackingNumber}) has been approved.`;

  doc.fontSize(11).text(bodyText, { align: "justify" });
  doc.moveDown(3);

  doc.fontSize(10).text(`Approved by: ${approvedBy}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown(1);
  doc.text(`Official Stamp:`);

  if (options.includeStamp) {
    doc
      .fillColor("#cc0000")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("OFFICIAL STAMP", { align: "right" });
    doc.fontSize(8).font("Helvetica").text("Dangila Woreda", { align: "right" });
    doc.fillColor("#000000");
  }

  addFooter(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
};

const generateDocumentRequestLetter = async (
  application: IApplication,
  requestedDocuments: string[],
  options: PDFGenerationOptions = { language: "en", includeStamp: true, includeBarcode: false }
): Promise<Buffer> => {
  const doc = createPDFDocument(options);
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  addHeader(doc, options.language);

  const title = options.language === "am" ? "የሰነድ ጥያቄ ደብዳቤ" : "Document Request Letter";

  doc.fontSize(14).text(title, { align: "center" });
  doc.moveDown(2);

  const greeting =
    options.language === "am"
      ? `ውድ ${application.applicantInfo.fullNameAmharic},`
      : `Dear ${application.applicantInfo.fullName},`;

  doc.fontSize(11).text(greeting);
  doc.moveDown(1);

  const bodyIntro =
    options.language === "am"
      ? `የእርስዎን የ${application.serviceName} ማመልከቻ (${application.trackingNumber}) በተመለከተ የሚከተሉት ሰነዶች ያስፈልጋሉ:`
      : `Regarding your application for ${application.serviceName} (${application.trackingNumber}), the following documents are required:`;

  doc.text(bodyIntro);
  doc.moveDown(0.5);

  requestedDocuments.forEach((documentName: string, index: number) => {
    doc.text(`${index + 1}. ${documentName}`, { indent: 30 });
  });

  doc.moveDown(2);

  const closing =
    options.language === "am"
      ? "እባክዎ እነዚህን ሰነዶች በ10 የስራ ቀናት ውስጥ ያቅርቡ።"
      : "Please submit these documents within 10 business days.";

  doc.text(closing);

  addFooter(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
};

const savePDFToFile = async (pdfBuffer: Buffer, fileName: string): Promise<string> => {
  const uploadDir = path.resolve(__dirname, "../../uploads/pdfs");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, pdfBuffer);

  logger.info(`PDF saved: ${filePath}`);
  return filePath;
};

export {
  generateApplicationReceipt,
  generateApprovalCertificate,
  generateDocumentRequestLetter,
  savePDFToFile,
};

export default {
  generateApplicationReceipt,
  generateApprovalCertificate,
  generateDocumentRequestLetter,
  savePDFToFile,
};
