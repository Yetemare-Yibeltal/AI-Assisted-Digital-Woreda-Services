import { Request, Response } from "express";
import Application from "../models/Application";
import Service from "../models/Service";
import Admin from "../models/Admin";
import AuditLog from "../models/AuditLog";
import Notification from "../models/Notification";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/responseFormatter";

// =============================================
// MAIN OVERVIEW
// =============================================
const getDashboardOverview = asyncHandler(async (_req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(today);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(today);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date();
  monthStart.setMonth(monthStart.getMonth() - 1);
  const yearStart = new Date();
  yearStart.setFullYear(yearStart.getFullYear() - 1);

  const [
    totalApplications,
    todayApplications,
    yesterdayApplications,
    weekApplications,
    monthApplications,
    yearApplications,
    totalServices,
    activeServices,
    totalAdmins,
    activeAdmins,
    pendingApplications,
    underReviewApplications,
    approvedToday,
    rejectedToday,
    completedToday,
    overdueApplications,
    pendingDocuments,
    unreadNotifications,
    highPriorityPending,
    urgentPending,
    totalCitizensServed,
    monthCitizensServed,
  ] = await Promise.all([
    Application.countDocuments(),
    Application.countDocuments({ createdAt: { $gte: today } }),
    Application.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd } }),
    Application.countDocuments({ createdAt: { $gte: weekStart } }),
    Application.countDocuments({ createdAt: { $gte: monthStart } }),
    Application.countDocuments({ createdAt: { $gte: yearStart } }),
    Service.countDocuments(),
    Service.countDocuments({ isActive: true }),
    Admin.countDocuments(),
    Admin.countDocuments({ isActive: true }),
    Application.countDocuments({ status: "pending" }),
    Application.countDocuments({ status: "under_review" }),
    Application.countDocuments({ status: "approved", updatedAt: { $gte: today } }),
    Application.countDocuments({ status: "rejected", updatedAt: { $gte: today } }),
    Application.countDocuments({ status: "completed", updatedAt: { $gte: today } }),
    Application.countDocuments({
      estimatedCompletionDate: { $lt: new Date() },
      status: { $nin: ["completed", "rejected"] },
    }),
    Application.countDocuments({
      "uploadedDocuments.isVerified": false,
      uploadedDocuments: { $exists: true, $not: { $size: 0 } },
    }),
    Notification.countDocuments({ isRead: false }),
    Application.countDocuments({ status: "pending", priority: "high" }),
    Application.countDocuments({ status: "pending", priority: "urgent" }),
    Application.distinct("applicantInfo.phoneNumber").then((p) => p.length),
    Application.distinct("applicantInfo.phoneNumber", { createdAt: { $gte: monthStart } }).then(
      (p) => p.length
    ),
  ]);

  const approvalRate =
    totalApplications > 0
      ? Math.round(
          ((await Application.countDocuments({ status: { $in: ["approved", "completed"] } })) /
            totalApplications) *
            100
        )
      : 0;

  const rejectionRate =
    totalApplications > 0
      ? Math.round(
          ((await Application.countDocuments({ status: "rejected" })) / totalApplications) * 100
        )
      : 0;

  const averageProcessingDays = await Application.aggregate([
    { $match: { completedAt: { $ne: null } } },
    {
      $group: {
        _id: null,
        avg: {
          $avg: { $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60 * 24] },
        },
      },
    },
  ]).then((r) => Math.round((r[0]?.avg || 0) * 10) / 10);

  sendSuccess(
    res,
    {
      overview: {
        applications: {
          total: totalApplications,
          today: todayApplications,
          yesterday: yesterdayApplications,
          thisWeek: weekApplications,
          thisMonth: monthApplications,
          thisYear: yearApplications,
        },
        services: {
          total: totalServices,
          active: activeServices,
          inactive: totalServices - activeServices,
        },
        staff: { total: totalAdmins, active: activeAdmins, inactive: totalAdmins - activeAdmins },
        citizens: { totalServed: totalCitizensServed, thisMonth: monthCitizensServed },
      },
      statusBreakdown: {
        pending: pendingApplications,
        underReview: underReviewApplications,
        approvedToday,
        rejectedToday,
        completedToday,
        overdue: overdueApplications,
        pendingDocumentVerifications: pendingDocuments,
        highPriorityPending,
        urgentPending,
      },
      performance: { approvalRate, rejectionRate, averageProcessingDays },
      notifications: { unread: unreadNotifications },
    },
    "Dashboard overview retrieved successfully"
  );
});

// =============================================
// APPLICATION STATUS DISTRIBUTION
// =============================================
const getStatusDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const [byStatus, byPriority, byCategory, byService] = await Promise.all([
    Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Application.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Application.aggregate([
      { $group: { _id: "$serviceCategory", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Application.aggregate([
      { $group: { _id: "$serviceName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  sendSuccess(
    res,
    { byStatus, byPriority, byCategory, byService },
    "Status distribution retrieved"
  );
});

// =============================================
// APPLICATION TRENDS (DAILY/WEEKLY/MONTHLY)
// =============================================
const getApplicationTrends = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dailyTrends = await Application.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const weeklyTrends = await Application.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { week: { $isoWeek: "$createdAt" }, year: { $isoWeekYear: "$createdAt" } },
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $in: ["$status", ["approved", "completed"]] }, 1, 0] } },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
  ]);

  const monthlyTrends = await Application.aggregate([
    { $match: { createdAt: { $gte: new Date(new Date().getFullYear() - 1, 0, 1) } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $in: ["$status", ["approved", "completed"]] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  sendSuccess(
    res,
    { daily: dailyTrends, weekly: weeklyTrends, monthly: monthlyTrends },
    "Application trends retrieved"
  );
});

// =============================================
// SERVICE PERFORMANCE RANKINGS
// =============================================
const getServicePerformance = asyncHandler(async (_req: Request, res: Response) => {
  const servicePerformance = await Application.aggregate([
    {
      $group: {
        _id: { service: "$service", serviceName: "$serviceName", category: "$serviceCategory" },
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $in: ["$status", ["approved", "completed"]] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        approvalRate: {
          $cond: [
            { $gt: ["$total", 0] },
            { $multiply: [{ $divide: ["$approved", "$total"] }, 100] },
            0,
          ],
        },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 20 },
  ]);

  const categoryPerformance = await Application.aggregate([
    {
      $group: {
        _id: "$serviceCategory",
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $in: ["$status", ["approved", "completed"]] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
  ]);

  sendSuccess(
    res,
    { byService: servicePerformance, byCategory: categoryPerformance },
    "Service performance retrieved"
  );
});

// =============================================
// OFFICER WORKLOAD & PRODUCTIVITY
// =============================================
const getOfficerWorkload = asyncHandler(async (_req: Request, res: Response) => {
  const officerWorkload = await Application.aggregate([
    { $match: { assignedTo: { $ne: null }, status: { $nin: ["completed", "rejected"] } } },
    {
      $group: {
        _id: "$assignedTo",
        activeApplications: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        underReview: { $sum: { $cond: [{ $eq: ["$status", "under_review"] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $in: ["$priority", ["high", "urgent"]] }, 1, 0] } },
      },
    },
    { $lookup: { from: "admins", localField: "_id", foreignField: "_id", as: "officer" } },
    { $unwind: { path: "$officer", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        officerId: "$_id",
        officerName: "$officer.fullName",
        officerEmail: "$officer.email",
        department: "$officer.department",
        position: "$officer.position",
        activeApplications: 1,
        pending: 1,
        underReview: 1,
        highPriority: 1,
      },
    },
    { $sort: { activeApplications: -1 } },
  ]);

  const completedByOfficer = await Application.aggregate([
    { $match: { completedAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } } },
    { $lookup: { from: "admins", localField: "assignedTo", foreignField: "_id", as: "officer" } },
    { $unwind: { path: "$officer", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { officerId: "$assignedTo", officerName: "$officer.fullName" },
        completed: { $sum: 1 },
        avgDays: {
          $avg: { $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60 * 24] },
        },
      },
    },
    { $sort: { completed: -1 } },
    { $limit: 15 },
  ]);

  sendSuccess(
    res,
    { currentWorkload: officerWorkload, monthlyCompletions: completedByOfficer },
    "Officer workload retrieved"
  );
});

// =============================================
// PROCESSING TIME ANALYTICS & SLA
// =============================================
const getProcessingTimeAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const byService = await Application.aggregate([
    { $match: { completedAt: { $ne: null } } },
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
        withinSLA: { $sum: { $cond: [{ $lte: ["$processingDays", 7] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        slaCompliance: {
          $cond: [
            { $gt: ["$totalCompleted", 0] },
            { $multiply: [{ $divide: ["$withinSLA", "$totalCompleted"] }, 100] },
            0,
          ],
        },
      },
    },
    { $sort: { averageDays: -1 } },
  ]);

  const overall = await Application.aggregate([
    { $match: { completedAt: { $ne: null } } },
    {
      $group: {
        _id: null,
        overallAverage: {
          $avg: { $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60 * 24] },
        },
        totalCompleted: { $sum: 1 },
        within7Days: {
          $sum: {
            $cond: [
              {
                $lte: [
                  { $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60 * 24] },
                  7,
                ],
              },
              1,
              0,
            ],
          },
        },
        within14Days: {
          $sum: {
            $cond: [
              {
                $lte: [
                  { $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60 * 24] },
                  14,
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  sendSuccess(
    res,
    { byService, overall: overall[0] || null },
    "Processing time analytics retrieved"
  );
});

// =============================================
// CITIZEN DEMOGRAPHICS
// =============================================
const getCitizenDemographics = asyncHandler(async (_req: Request, res: Response) => {
  const currentYear = new Date().getFullYear();

  const [byKebele, byGender, byAge, byNotificationPref, byLanguage] = await Promise.all([
    Application.aggregate([
      {
        $group: {
          _id: { kebele: "$address.kebele", woreda: "$address.woreda" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 25 },
    ]),
    Application.aggregate([{ $group: { _id: "$applicantInfo.gender", count: { $sum: 1 } } }]),
    Application.aggregate([
      { $project: { age: { $subtract: [currentYear, { $year: "$applicantInfo.dateOfBirth" }] } } },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 25, 35, 45, 55, 65, 120],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    Application.aggregate([{ $group: { _id: "$notificationPreference", count: { $sum: 1 } } }]),
    Application.aggregate([{ $group: { _id: "$language", count: { $sum: 1 } } }]),
  ]);

  sendSuccess(
    res,
    { byKebele, byGender, byAge, byNotificationPreference: byNotificationPref, byLanguage },
    "Citizen demographics retrieved"
  );
});

// =============================================
// REVENUE SUMMARY
// =============================================
const getRevenueSummary = asyncHandler(async (_req: Request, res: Response) => {
  const monthStart = new Date();
  monthStart.setMonth(monthStart.getMonth() - 1);

  const revenueByService = await Application.aggregate([
    { $match: { status: { $in: ["approved", "completed"] } } },
    {
      $lookup: { from: "services", localField: "service", foreignField: "_id", as: "serviceInfo" },
    },
    { $unwind: { path: "$serviceInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$serviceInfo.fees", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$serviceName",
        totalRevenue: { $sum: "$serviceInfo.fees.amount" },
        applicationCount: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  const revenueThisMonth = await Application.aggregate([
    { $match: { status: { $in: ["approved", "completed"] }, updatedAt: { $gte: monthStart } } },
    {
      $lookup: { from: "services", localField: "service", foreignField: "_id", as: "serviceInfo" },
    },
    { $unwind: { path: "$serviceInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$serviceInfo.fees", preserveNullAndEmptyArrays: true } },
    { $group: { _id: null, total: { $sum: "$serviceInfo.fees.amount" }, count: { $sum: 1 } } },
  ]);

  sendSuccess(
    res,
    {
      byService: revenueByService,
      thisMonth: revenueThisMonth[0] || { total: 0, count: 0 },
      totalRevenue: revenueByService.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
    },
    "Revenue summary retrieved"
  );
});

// =============================================
// UPCOMING DEADLINES & OVERDUE
// =============================================
const getDeadlines = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [upcoming, overdue] = await Promise.all([
    Application.find({
      estimatedCompletionDate: { $gte: now, $lte: nextWeek },
      status: { $nin: ["completed", "rejected"] },
    })
      .select(
        "applicationId trackingNumber serviceName applicantInfo.fullName estimatedCompletionDate priority status"
      )
      .sort({ estimatedCompletionDate: 1 })
      .limit(25)
      .lean(),
    Application.find({
      estimatedCompletionDate: { $lt: now },
      status: { $nin: ["completed", "rejected"] },
    })
      .select(
        "applicationId trackingNumber serviceName applicantInfo.fullName estimatedCompletionDate priority status daysSinceSubmission"
      )
      .sort({ estimatedCompletionDate: 1 })
      .limit(25)
      .lean(),
  ]);

  sendSuccess(
    res,
    { upcoming, upcomingCount: upcoming.length, overdue, overdueCount: overdue.length },
    "Deadlines retrieved"
  );
});

// =============================================
// RECENT ACTIVITY & AUDIT TRAIL
// =============================================
const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 15;

  const [recentApplications, recentAuditLogs] = await Promise.all([
    Application.find()
      .select(
        "applicationId trackingNumber serviceName applicantInfo.fullName status priority createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    AuditLog.find()
      .select("userId userEmail action resource resourceName details status timestamp")
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean(),
  ]);

  sendSuccess(res, { recentApplications, recentAuditLogs }, "Recent activity retrieved");
});

// =============================================
// PEAK HOUR & DAY ANALYSIS
// =============================================
const getPeakAnalysis = asyncHandler(async (_req: Request, res: Response) => {
  const byHour = await Application.aggregate([
    { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const byDayOfWeek = await Application.aggregate([
    { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const byDayNamed = byDayOfWeek.map((d) => ({ day: dayNames[(d._id - 1) % 7], count: d.count }));

  sendSuccess(res, { byHour, byDayOfWeek: byDayNamed }, "Peak analysis retrieved");
});

// =============================================
// EXPORT SUMMARY
// =============================================
const getExportSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await Application.aggregate([
    {
      $facet: {
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        byCategory: [{ $group: { _id: "$serviceCategory", count: { $sum: 1 } } }],
        byKebele: [
          { $group: { _id: "$address.kebele", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 50 },
        ],
        byMonth: [
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ],
        totalRevenue: [
          { $match: { status: { $in: ["approved", "completed"] } } },
          {
            $lookup: {
              from: "services",
              localField: "service",
              foreignField: "_id",
              as: "serviceInfo",
            },
          },
          { $unwind: "$serviceInfo" },
          { $unwind: "$serviceInfo.fees" },
          { $group: { _id: null, total: { $sum: "$serviceInfo.fees.amount" } } },
        ],
      },
    },
  ]);

  sendSuccess(res, summary[0], "Export summary retrieved");
});

export {
  getDashboardOverview,
  getStatusDistribution,
  getApplicationTrends,
  getServicePerformance,
  getOfficerWorkload,
  getProcessingTimeAnalytics,
  getCitizenDemographics,
  getRevenueSummary,
  getDeadlines,
  getRecentActivity,
  getPeakAnalysis,
  getExportSummary,
};

export default {
  getDashboardOverview,
  getStatusDistribution,
  getApplicationTrends,
  getServicePerformance,
  getOfficerWorkload,
  getProcessingTimeAnalytics,
  getCitizenDemographics,
  getRevenueSummary,
  getDeadlines,
  getRecentActivity,
  getPeakAnalysis,
  getExportSummary,
};
