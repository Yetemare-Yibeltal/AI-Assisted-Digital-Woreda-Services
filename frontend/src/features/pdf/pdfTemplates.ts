export interface PDFTemplate {
  name: string;
  orientation: "portrait" | "landscape";
  pageSize: "A4" | "letter";
  margins: { top: number; right: number; bottom: number; left: number };
}

export const receiptTemplate: PDFTemplate = {
  name: "receipt",
  orientation: "portrait",
  pageSize: "A4",
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
};

export const certificateTemplate: PDFTemplate = {
  name: "certificate",
  orientation: "landscape",
  pageSize: "A4",
  margins: { top: 25, right: 20, bottom: 25, left: 20 },
};

export const documentRequestTemplate: PDFTemplate = {
  name: "document-request",
  orientation: "portrait",
  pageSize: "A4",
  margins: { top: 25, right: 20, bottom: 25, left: 20 },
};

export const getTemplate = (
  type: "receipt" | "certificate" | "document-request",
): PDFTemplate => {
  switch (type) {
    case "receipt":
      return receiptTemplate;
    case "certificate":
      return certificateTemplate;
    case "document-request":
      return documentRequestTemplate;
    default:
      return receiptTemplate;
  }
};
