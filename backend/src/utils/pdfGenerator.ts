import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface PDFContent {
  title: string;
  subtitle?: string;
  sections: Array<{
    heading?: string;
    items: Array<{ label: string; value: string }>;
  }>;
  footer?: string;
}

export const generatePDF = async (content: PDFContent, outputPath?: string): Promise<Buffer> => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Federal Democratic Republic of Ethiopia", { align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Amhara Region - Awi Zone - Dangila Woreda", { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#009A44");
    doc.moveDown(1);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text(content.title, { align: "center" });
    if (content.subtitle) {
      doc.fontSize(12).text(content.subtitle, { align: "center" });
    }
    doc.moveDown(1.5);

    // Sections
    for (const section of content.sections) {
      if (section.heading) {
        doc.fontSize(13).font("Helvetica-Bold").text(section.heading);
        doc.moveDown(0.3);
      }
      for (const item of section.items) {
        doc.fontSize(10).font("Helvetica-Bold").text(`${item.label}:`, { continued: true });
        doc.font("Helvetica").text(` ${item.value}`);
        doc.moveDown(0.2);
      }
      doc.moveDown(0.5);
    }

    // Footer
    if (content.footer) {
      doc.moveDown(2);
      doc.fontSize(8).text(content.footer, { align: "center", color: "#888" });
    }

    doc.end();

    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
    }
  });
};
