import { Request, Response } from "express";
import * as serviceService from "../services/serviceService";
import * as applicationService from "../services/applicationService";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendPaginated } from "../utils/responseFormatter";

const getPublicServices = asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceService.getAllServices({
    ...req.query,
    isActive: "true",
  });
  sendPaginated(
    res,
    result.services,
    {
      page: result.page,
      limit: result.limit,
      totalItems: result.totalItems,
    },
    "Services retrieved successfully"
  );
});

const getPublicServiceBySlug = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceBySlug(req.params.slug);
  sendSuccess(res, service, "Service retrieved successfully");
});

const getPopularServices = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 8;
  const services = await serviceService.getPopularServices(limit);
  sendSuccess(res, services, "Popular services retrieved successfully");
});

const getServiceCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await serviceService.getServiceCategories();
  sendSuccess(res, categories, "Service categories retrieved successfully");
});

const searchServices = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    sendSuccess(res, [], "No search query provided");
    return;
  }
  const limit = parseInt(req.query.limit as string) || 20;
  const services = await serviceService.searchServices(query, limit);
  sendSuccess(res, services, `Search results for '${query}'`);
});

const trackApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.getApplicationByTrackingNumber(
    req.params.trackingNumber
  );
  sendSuccess(
    res,
    {
      trackingNumber: application.trackingNumber,
      serviceName: application.serviceName,
      status: application.status,
      submittedAt: application.createdAt,
      estimatedCompletionDate: application.estimatedCompletionDate,
      completedAt: application.completedAt,
    },
    "Application found"
  );
});

const createPublicApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.createApplication(req.body);
  sendSuccess(
    res,
    {
      applicationId: application.applicationId,
      trackingNumber: application.trackingNumber,
      status: application.status,
      message: "Application submitted successfully. Save your tracking number!",
    },
    "Application submitted successfully"
  );
});

export {
  getPublicServices,
  getPublicServiceBySlug,
  getPopularServices,
  getServiceCategories,
  searchServices,
  trackApplication,
  createPublicApplication,
};

export default {
  getPublicServices,
  getPublicServiceBySlug,
  getPopularServices,
  getServiceCategories,
  searchServices,
  trackApplication,
  createPublicApplication,
};
