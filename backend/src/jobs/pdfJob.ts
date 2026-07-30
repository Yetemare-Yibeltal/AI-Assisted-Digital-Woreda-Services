import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";

interface PDFPayload {
  fileName: string;
  content: {
    title: string;
    subtitle?: string;
    body: string;
    footer?: string;
  };
}

export const pdfJob = async (payload: PDFPayload): Promise<string> => {
  const uploadDir = path.resolve(__dirname, "../../uploads/pdfs");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, payload.fileName);
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text(payload.content.title, { align: "center" });
    if (payload.content.subtitle) {
      doc.fontSize(14).text(payload.content.subtitle, { align: "center" });
    }
    doc.moveDown();
    doc.fontSize(12).text(payload.content.body);
    if (payload.content.footer) {
      doc.moveDown(2);
      doc.fontSize(10).text(payload.content.footer, { align: "center" });
    }

    doc.end();
    stream.on("finish", () => {
      logger.info(`PDF generated: ${filePath}`);
      resolve(filePath);
    });
    stream.on("error", reject);
  });
};
