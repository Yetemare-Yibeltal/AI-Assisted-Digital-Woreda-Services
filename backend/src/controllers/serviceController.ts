import { Request, Response, NextFunction } from "express";
import * as serviceService from "../services/serviceService";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/responseFormatter";

const getAllServices = asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceService.getAllServices(req.query);
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

const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceById(req.params.id);
  sendSuccess(res, service, "Service retrieved successfully");
});

const getServiceBySlug = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceBySlug(req.params.slug);
  sendSuccess(res, service, "Service retrieved successfully");
});

const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.createService(req.body);
  sendCreated(res, service, "Service created successfully");
});

const updateService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.updateService(req.params.id, req.body);
  sendSuccess(res, service, "Service updated successfully");
});

const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await serviceService.deleteService(req.params.id);
  sendNoContent(res);
});

const toggleServiceStatus = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.toggleServiceStatus(req.params.id);
  const statusMessage = service.isActive ? "activated" : "deactivated";
  sendSuccess(res, service, `Service ${statusMessage} successfully`);
});

const getPopularServices = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 8;
  const services = await serviceService.getPopularServices(limit);
  sendSuccess(res, services, "Popular services retrieved successfully");
});

const getServicesByCategory = asyncHandler(async (req: Request, res: Response) => {
  const services = await serviceService.getServicesByCategory(req.params.category);
  sendSuccess(
    res,
    services,
    `Services in category '${req.params.category}' retrieved successfully`
  );
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

const getServiceCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await serviceService.getServiceCategories();
  sendSuccess(res, categories, "Service categories retrieved successfully");
});

const bulkUpdateServices = asyncHandler(async (req: Request, res: Response) => {
  const { ids, updateData } = req.body;
  const modifiedCount = await serviceService.bulkUpdateServices(ids, updateData);
  sendSuccess(res, { modifiedCount }, `${modifiedCount} services updated successfully`);
});

export {
  getAllServices,
  getServiceById,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getPopularServices,
  getServicesByCategory,
  searchServices,
  getServiceCategories,
  bulkUpdateServices,
};

export default {
  getAllServices,
  getServiceById,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getPopularServices,
  getServicesByCategory,
  searchServices,
  getServiceCategories,
  bulkUpdateServices,
};
