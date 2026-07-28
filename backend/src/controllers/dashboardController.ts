import { Request, Response } from "express";
import mongoose from "mongoose";
import Application from "../models/Application";
import Service from "../models/Service";
import Admin from "../models/Admin";
import AuditLog from "../models/AuditLog";
import Notification from "../models/Notification";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/responseFormatter";

const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date();
  monthStart.setMonth(monthStart.getMonth() - 1);

  const [
    totalApplications,
    todayApplications,
    weekApplications,
    monthApplications,
    totalServices,
    activeServices,
    totalAdmins,
    activeAdmins,
    pendingDocuments,
    unreadNotifications,
  ] = await Promise.all([
    Application.countDocuments(),
    Application.countDocuments({ createdAt: { $gte: today } }),
    Application.countDocuments({ createdAt: { $gte: weekStart } }),
    Application.countDocuments({ createdAt: { $gte: monthStart } }),
    Service.countDocuments(),
    Service.countDocuments({ isActive: true }),
    Admin.countDocuments(),
    Admin.countDocuments({ isActive: true }),
    Application.countDocuments({
      "uploadedDocuments.isVerified": false,
      uploadedDocuments: { $exists: true, $not: { $size: 0 } },
    }),
    Notification.countDocuments({ isRead: false }),
  ]);

  sendSuccess(
    res,
    {
      overview: {
        totalApplications,
        todayApplications,
        weekApplications,
        monthApplications,
        totalServices,
        activeServices,
        totalAdmins,
        activeAdmins,
        pendingDocumentVerifications: pendingDocuments,
        unreadNotifications,
      },
    },
    "Dashboard overview retrieved successfully"
  );
});

const getApplicationStatusDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const statusDistribution = await Application.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const priorityDistribution = await Application.aggregate([
    { $group: { _id: "$priority", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const categoryDistribution = await Application.aggregate([
    { $group: { _id: "$serviceCategory", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  sendSuccess(
    res,
    {
      byStatus: statusDistribution,
      byPriority: priorityDistribution,
      byCategory: categoryDistribution,
    },
    "Application distribution retrieved successfully"
  );
});

const getApplicationTrends = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dailyTrends = await Application.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        total: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendSuccess(res, dailyTrends, "Application trends retrieved successfully");
});

const getServicePopularity = asyncHandler(async (_req: Request, res: Response) => {
  const servicePopularity = await Application.aggregate([
    { $group: { _id: "$service", serviceName: { $first: "$serviceName" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ]);

  sendSuccess(res, servicePopularity, "Service popularity retrieved successfully");
});

const getOfficerWorkload = asyncHandler(async (_req: Request, res: Response) => {
  const officerWorkload = await Application.aggregate([
    {
      $match: {
        assignedTo: { $ne: null },
        status: { $nin: ["completed", "rejected"] },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        activeApplications: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        underReview: {
          $sum: { $cond: [{ $eq: ["$status", "under_review"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "_id",
        foreignField: "_id",
        as: "officer",
      },
    },
    { $unwind: { path: "$officer", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        officerId: "$_id",
        officerName: "$officer.fullName",
        officerEmail: "$officer.email",
        department: "$officer.department",
        activeApplications: 1,
        pending: 1,
        underReview: 1,
      },
    },
    { $sort: { activeApplications: -1 } },
  ]);

  sendSuccess(res, officerWorkload, "Officer workload retrieved successfully");
});

const getProcessingTimeAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const processingTimes = await Application.aggregate([
    {
      $match: {
        completedAt: { $ne: null },
      },
    },
    {
      $project: {
        serviceName: 1,
        processingDays: {
          $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60 * 24],
        },
      },
    },
    {
      $group: {
        _id: "$serviceName",
        averageDays: { $avg: "$processingDays" },
        minDays: { $min: "$processingDays" },
        maxDays: { $max: "$processingDays" },
        totalCompleted: { $sum: 1 },
      },
    },
    { $sort: { averageDays: -1 } },
  ]);

  const overallStats = await Application.aggregate([
    {
      $match: {
        completedAt: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        overallAverage: {
          $avg: {
            $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60 * 24],
          },
        },
        totalCompleted: { $sum: 1 },
      },
    },
  ]);

  sendSuccess(
    res,
    {
      byService: processingTimes,
      overall: overallStats[0] || { overallAverage: 0, totalCompleted: 0 },
    },
    "Processing time analytics retrieved successfully"
  );
});

const getKebeleDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const kebeleDistribution = await Application.aggregate([
    {
      $group: {
        _id: {
          kebele: "$address.kebele",
          woreda: "$address.woreda",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  sendSuccess(res, kebeleDistribution, "Kebele distribution retrieved successfully");
});

const getGenderDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const genderDistribution = await Application.aggregate([
    {
      $group: {
        _id: "$applicantInfo.gender",
        count: { $sum: 1 },
      },
    },
  ]);

  sendSuccess(res, genderDistribution, "Gender distribution retrieved successfully");
});

const getAgeDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const currentYear = new Date().getFullYear();

  const ageDistribution = await Application.aggregate([
    {
      $project: {
        age: {
          $subtract: [currentYear, { $year: "$applicantInfo.dateOfBirth" }],
        },
      },
    },
    {
      $bucket: {
        groupBy: "$age",
        boundaries: [0, 18, 25, 35, 45, 55, 65, 120],
        default: "Other",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  sendSuccess(res, ageDistribution, "Age distribution retrieved successfully");
});

const getMonthlyComparison = asyncHandler(async (_req: Request, res: Response) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyComparison = await Application.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        total: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $in: ["$status", ["approved", "completed"]] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  sendSuccess(res, monthlyComparison, "Monthly comparison retrieved successfully");
});

const getUpcomingDeadlines = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingDeadlines = await Application.find({
    estimatedCompletionDate: { $gte: now, $lte: nextWeek },
    status: { $nin: ["completed", "rejected"] },
  })
    .select(
      "applicationId trackingNumber serviceName applicantInfo.fullName estimatedCompletionDate priority status"
    )
    .sort({ estimatedCompletionDate: 1 })
    .limit(20)
    .lean();

  const overdueApplications = await Application.find({
    estimatedCompletionDate: { $lt: now },
    status: { $nin: ["completed", "rejected"] },
  })
    .select(
      "applicationId trackingNumber serviceName applicantInfo.fullName estimatedCompletionDate priority status"
    )
    .sort({ estimatedCompletionDate: 1 })
    .limit(20)
    .lean();

  sendSuccess(
    res,
    {
      upcoming: upcomingDeadlines,
      overdue: overdueApplications,
      upcomingCount: upcomingDeadlines.length,
      overdueCount: overdueApplications.length,
    },
    "Upcoming deadlines retrieved successfully"
  );
});

const getRecentApplications = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const recentApplications = await Application.find()
    .select(
      "applicationId trackingNumber serviceName applicantInfo.fullName applicantInfo.phoneNumber status priority createdAt"
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  sendSuccess(res, recentApplications, "Recent applications retrieved successfully");
});

export {
  getDashboardStats,
  getApplicationStatusDistribution,
  getApplicationTrends,
  getServicePopularity,
  getOfficerWorkload,
  getProcessingTimeAnalytics,
  getKebeleDistribution,
  getGenderDistribution,
  getAgeDistribution,
  getMonthlyComparison,
  getUpcomingDeadlines,
  getRecentApplications,
};

export default {
  getDashboardStats,
  getApplicationStatusDistribution,
  getApplicationTrends,
  getServicePopularity,
  getOfficerWorkload,
  getProcessingTimeAnalytics,
  getKebeleDistribution,
  getGenderDistribution,
  getAgeDistribution,
  getMonthlyComparison,
  getUpcomingDeadlines,
  getRecentApplications,
};
