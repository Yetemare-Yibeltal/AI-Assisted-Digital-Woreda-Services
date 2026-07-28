import { Request, Response } from "express";
import * as pdfService from "../services/pdfService";
import * as applicationService from "../services/applicationService";
import * as serviceService from "../services/serviceService";
import { asyncHandler } from "../middleware/asyncHandler";

const generateReceipt = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.getApplicationById(req.params.id);
  const service = await serviceService.getServiceById(application.service.toString());

  const language = (req.query.lang as "en" | "am") || application.language || "en";
  const pdfBuffer = await pdfService.generateApplicationReceipt(application, service, {
    language,
    includeStamp: true,
    includeBarcode: true,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="receipt-${application.trackingNumber}.pdf"`
  );
  res.send(pdfBuffer);
});

const generateCertificate = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.getApplicationById(req.params.id);
  const service = await serviceService.getServiceById(application.service.toString());

  if (application.status !== "approved" && application.status !== "completed") {
    res.status(400).json({
      success: false,
      message: "Certificate can only be generated for approved or completed applications",
    });
    return;
  }

  const approvedBy = req.user?.fullName || "Dangila Woreda Administration";
  const language = (req.query.lang as "en" | "am") || application.language || "en";

  const pdfBuffer = await pdfService.generateApprovalCertificate(application, service, approvedBy, {
    language,
    includeStamp: true,
    includeBarcode: true,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="certificate-${application.trackingNumber}.pdf"`
  );
  res.send(pdfBuffer);
});

const generateDocumentRequest = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.getApplicationById(req.params.id);
  const { documents } = req.body;

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    res.status(400).json({
      success: false,
      message: "At least one document name is required",
    });
    return;
  }

  const language = (req.query.lang as "en" | "am") || application.language || "en";

  const pdfBuffer = await pdfService.generateDocumentRequestLetter(application, documents, {
    language,
    includeStamp: true,
    includeBarcode: false,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="document-request-${application.trackingNumber}.pdf"`
  );
  res.send(pdfBuffer);
});

export { generateReceipt, generateCertificate, generateDocumentRequest };

export default {
  generateReceipt,
  generateCertificate,
  generateDocumentRequest,
};
