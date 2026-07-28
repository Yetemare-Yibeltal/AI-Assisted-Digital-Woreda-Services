import mongoose from "mongoose";
import Application, { IApplication, IStatusHistory } from "../models/Application";
import Service from "../models/Service";
import Counter from "../models/Counter";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";
import { AppError } from "../errors/AppError";
import { AuthorizationError } from "../errors/AuthorizationError";
import {
  extractPaginationParams,
  buildPaginationOptions,
  buildSearchQuery,
  buildDateRangeFilter,
} from "../utils/pagination";
import { generateTrackingNumber, generateApplicationId } from "../utils/generateId";

const createApplication = async (
  applicationData: Partial<IApplication>,
  userId?: string
): Promise<IApplication> => {
  const service = await Service.findById(applicationData.service);
  if (!service) {
    throw new NotFoundError("Service", applicationData.service?.toString() || "");
  }

  if (!service.isActive) {
    throw AppError.badRequest("This service is currently unavailable", "SERVICE_INACTIVE");
  }

  const sequence = await Counter.getNextSequence("application");
  const applicationId = generateApplicationId(sequence);
  const trackingNumber = generateTrackingNumber(sequence);

  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + 7);

  const application = await Application.create({
    ...applicationData,
    applicationId,
    trackingNumber,
    serviceName: service.name,
    serviceCategory: service.category,
    status: "pending",
    statusHistory: [
      {
        status: "pending",
        changedBy: userId || null,
        changedAt: new Date(),
        notes: "Application submitted successfully",
        isAutomatic: true,
      },
    ],
    estimatedCompletionDate,
  });

  return application.populate("service", "name nameAmharic slug category");
};

const getAllApplications = async (queryParams: any) => {
  const params = extractPaginationParams(queryParams);
  const options = buildPaginationOptions(params);

  const filter: any = {};

  if (queryParams.status) filter.status = queryParams.status;
  if (queryParams.priority) filter.priority = queryParams.priority;
  if (queryParams.service) filter.service = queryParams.service;
  if (queryParams.serviceCategory) filter.serviceCategory = queryParams.serviceCategory;
  if (queryParams.assignedTo) filter.assignedTo = queryParams.assignedTo;

  const dateFilter = buildDateRangeFilter(queryParams.startDate, queryParams.endDate);
  const searchQuery = buildSearchQuery(params.search, [
    "applicationId",
    "trackingNumber",
    "applicantInfo.fullName",
    "applicantInfo.fullNameAmharic",
    "applicantInfo.phoneNumber",
    "serviceName",
  ]);

  const finalFilter = { ...filter, ...dateFilter, ...searchQuery };

  const [applications, totalItems] = await Promise.all([
    Application.find(finalFilter)
      .populate("service", "name nameAmharic slug")
      .populate("assignedTo", "fullName email")
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit)
      .select("-__v")
      .lean(),
    Application.countDocuments(finalFilter),
  ]);

  return { applications, totalItems, page: params.page, limit: params.limit };
};

const getApplicationById = async (id: string): Promise<IApplication> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid application ID format");
  }

  const application = await Application.findById(id)
    .populate("service", "name nameAmharic slug category steps requiredDocuments fees")
    .populate("assignedTo", "fullName email phoneNumber department")
    .select("-__v");

  if (!application) {
    throw NotFoundError.application(id);
  }

  return application;
};

const getApplicationByTrackingNumber = async (trackingNumber: string): Promise<IApplication> => {
  const application = await Application.findOne({ trackingNumber })
    .populate("service", "name nameAmharic slug category")
    .populate("assignedTo", "fullName email phoneNumber")
    .select("-__v");

  if (!application) {
    throw new NotFoundError("Application", trackingNumber);
  }

  return application;
};

const updateApplicationStatus = async (
  id: string,
  status: string,
  notes: string,
  userId: string,
  rejectionReason?: string
): Promise<IApplication> => {
  const application = await getApplicationById(id);

  const validTransitions: Record<string, string[]> = {
    pending: ["under_review", "documents_requested", "rejected"],
    under_review: ["documents_requested", "approved", "rejected"],
    documents_requested: ["under_review", "rejected"],
    approved: ["completed", "rejected"],
    rejected: ["pending"],
    completed: [],
  };

  if (!validTransitions[application.status]?.includes(status)) {
    throw AppError.badRequest(
      `Cannot transition from '${application.status}' to '${status}'`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  const statusEntry: IStatusHistory = {
    status,
    changedBy: new mongoose.Types.ObjectId(userId),
    changedAt: new Date(),
    notes,
    isAutomatic: false,
  };

  application.status = status;
  application.statusHistory.push(statusEntry);

  if (status === "rejected" && rejectionReason) {
    application.rejectionReason = rejectionReason;
  }

  if (status === "completed") {
    application.completedAt = new Date();
  }

  if (status === "approved") {
    application.estimatedCompletionDate = new Date();
    application.estimatedCompletionDate.setDate(application.estimatedCompletionDate.getDate() + 3);
  }

  await application.save();

  return application.populate([
    { path: "service", select: "name nameAmharic slug" },
    { path: "assignedTo", select: "fullName email" },
    { path: "statusHistory.changedBy", select: "fullName email" },
  ]);
};

const assignApplication = async (id: string, assignedTo: string): Promise<IApplication> => {
  const application = await getApplicationById(id);

  if (application.status === "completed" || application.status === "rejected") {
    throw AppError.badRequest(
      `Cannot assign a ${application.status} application`,
      "APPLICATION_NOT_ASSIGNABLE"
    );
  }

  application.assignedTo = new mongoose.Types.ObjectId(assignedTo);
  application.statusHistory.push({
    status: application.status,
    changedBy: new mongoose.Types.ObjectId(assignedTo),
    changedAt: new Date(),
    notes: `Application assigned to officer`,
    isAutomatic: true,
  });

  await application.save();
  return application.populate("assignedTo", "fullName email phoneNumber department");
};

const updateApplicationPriority = async (id: string, priority: string): Promise<IApplication> => {
  const application = await getApplicationById(id);
  application.priority = priority as IApplication["priority"];
  application.statusHistory.push({
    status: application.status,
    changedBy: application.assignedTo,
    changedAt: new Date(),
    notes: `Priority updated to ${priority}`,
    isAutomatic: true,
  });
  await application.save();
  return application;
};

const addDocumentToApplication = async (
  id: string,
  documentData: {
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }
): Promise<IApplication> => {
  const application = await getApplicationById(id);

  if (application.status === "completed" || application.status === "rejected") {
    throw AppError.badRequest(
      "Cannot add documents to a completed or rejected application",
      "APPLICATION_NOT_EDITABLE"
    );
  }

  application.uploadedDocuments.push({
    ...documentData,
    uploadedAt: new Date(),
    isVerified: false,
    verifiedBy: null,
    verifiedAt: null,
    notes: "",
  });

  await application.save();
  return application;
};

const verifyDocument = async (
  applicationId: string,
  documentId: string,
  isVerified: boolean,
  notes: string,
  verifiedBy: string
): Promise<IApplication> => {
  const application = await getApplicationById(applicationId);

  const document = application.uploadedDocuments.find(
    (doc) => (doc as any)._id?.toString() === documentId
  );

  if (!document) {
    throw NotFoundError.document(documentId);
  }

  document.isVerified = isVerified;
  document.verifiedBy = new mongoose.Types.ObjectId(verifiedBy);
  document.verifiedAt = new Date();
  document.notes = notes;

  application.statusHistory.push({
    status: application.status,
    changedBy: new mongoose.Types.ObjectId(verifiedBy),
    changedAt: new Date(),
    notes: `Document '${document.documentType}' ${isVerified ? "verified" : "rejected"}: ${notes}`,
    isAutomatic: false,
  });

  await application.save();
  return application;
};

const getApplicationStats = async () => {
  const stats = await Application.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalApplications = await Application.countDocuments();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayApplications = await Application.countDocuments({
    createdAt: { $gte: todayStart },
  });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekApplications = await Application.countDocuments({
    createdAt: { $gte: weekStart },
  });

  const statusCounts: Record<string, number> = {
    pending: 0,
    under_review: 0,
    documents_requested: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  };

  stats.forEach((stat) => {
    statusCounts[stat._id] = stat.count;
  });

  return {
    total: totalApplications,
    today: todayApplications,
    thisWeek: weekApplications,
    byStatus: statusCounts,
  };
};

const deleteApplication = async (id: string): Promise<void> => {
  const application = await getApplicationById(id);
  if (application.status !== "pending") {
    throw AppError.badRequest(
      "Only pending applications can be deleted",
      "APPLICATION_NOT_DELETABLE"
    );
  }
  await Application.findByIdAndDelete(id);
};

export {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationByTrackingNumber,
  updateApplicationStatus,
  assignApplication,
  updateApplicationPriority,
  addDocumentToApplication,
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
  addDocumentToApplication,
  verifyDocument,
  getApplicationStats,
  deleteApplication,
};
