import { Request, Response, NextFunction } from "express";
import * as applicationService from "../services/applicationService";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/responseFormatter";

const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const application = await applicationService.createApplication(req.body, userId);
  sendCreated(res, application, "Application submitted successfully");
});

const getAllApplications = asyncHandler(async (req: Request, res: Response) => {
  const result = await applicationService.getAllApplications(req.query);
  sendPaginated(
    res,
    result.applications,
    {
      page: result.page,
      limit: result.limit,
      totalItems: result.totalItems,
    },
    "Applications retrieved successfully"
  );
});

const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.getApplicationById(req.params.id);
  sendSuccess(res, application, "Application retrieved successfully");
});

const getApplicationByTrackingNumber = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.getApplicationByTrackingNumber(
    req.params.trackingNumber
  );
  sendSuccess(res, application, "Application retrieved successfully");
});

const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes, rejectionReason } = req.body;
  const userId = req.user?.id || "system";
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    status,
    notes,
    userId,
    rejectionReason
  );
  sendSuccess(res, application, `Application status updated to ${status}`);
});

const assignApplication = asyncHandler(async (req: Request, res: Response) => {
  const { assignedTo } = req.body;
  const application = await applicationService.assignApplication(req.params.id, assignedTo);
  sendSuccess(res, application, "Application assigned successfully");
});

const updateApplicationPriority = asyncHandler(async (req: Request, res: Response) => {
  const { priority } = req.body;
  const application = await applicationService.updateApplicationPriority(req.params.id, priority);
  sendSuccess(res, application, `Application priority updated to ${priority}`);
});

const addDocument = asyncHandler(async (req: Request, res: Response) => {
  const { documentType, fileName, fileUrl, fileSize } = req.body;
  const application = await applicationService.addDocumentToApplication(req.params.id, {
    documentType,
    fileName,
    fileUrl,
    fileSize,
  });
  sendSuccess(res, application, "Document added successfully");
});

const verifyDocument = asyncHandler(async (req: Request, res: Response) => {
  const { isVerified, notes } = req.body;
  const verifiedBy = req.user?.id || "system";
  const application = await applicationService.verifyDocument(
    req.params.id,
    req.params.documentId,
    isVerified,
    notes,
    verifiedBy
  );
  sendSuccess(res, application, `Document ${isVerified ? "verified" : "rejected"} successfully`);
});

const getApplicationStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await applicationService.getApplicationStats();
  sendSuccess(res, stats, "Application statistics retrieved successfully");
});

const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  await applicationService.deleteApplication(req.params.id);
  sendSuccess(res, null, "Application deleted successfully");
});

export {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationByTrackingNumber,
  updateApplicationStatus,
  assignApplication,
  updateApplicationPriority,
  addDocument,
  verifyDocument,
  getApplicationStats,
  deleteApplication,
};

export default {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationByTrackingNumber,
  updateApplicationStatus,
  assignApplication,
  updateApplicationPriority,
  addDocument,
  verifyDocument,
  getApplicationStats,
  deleteApplication,
};
