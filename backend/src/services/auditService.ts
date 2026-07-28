import AuditLog, { IAuditLog } from "../models/AuditLog";
import {
  extractPaginationParams,
  buildPaginationOptions,
  buildDateRangeFilter,
} from "../utils/pagination";

interface CreateAuditLogData {
  userId: string;
  userEmail: string;
  userRole: string;
  action:
    | "create"
    | "update"
    | "delete"
    | "status_change"
    | "login"
    | "logout"
    | "export"
    | "assign"
    | "verify";
  resource: string;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  metadata?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure" | "warning";
}

const logAction = async (data: CreateAuditLogData): Promise<IAuditLog> => {
  const auditLog = await AuditLog.create({
    ...data,
    timestamp: new Date(),
  });
  return auditLog;
};

const getAuditLogs = async (queryParams: any) => {
  const params = extractPaginationParams(queryParams);
  const options = buildPaginationOptions(params);

  const filter: any = {};

  if (queryParams.userId) filter.userId = queryParams.userId;
  if (queryParams.userEmail) filter.userEmail = queryParams.userEmail;
  if (queryParams.action) filter.action = queryParams.action;
  if (queryParams.resource) filter.resource = queryParams.resource;
  if (queryParams.resourceId) filter.resourceId = queryParams.resourceId;
  if (queryParams.status) filter.status = queryParams.status;

  const dateFilter = buildDateRangeFilter(queryParams.startDate, queryParams.endDate);
  const finalFilter = { ...filter, ...dateFilter };

  const [logs, totalItems] = await Promise.all([
    AuditLog.find(finalFilter)
      .sort({ timestamp: -1 })
      .skip(options.skip)
      .limit(options.limit)
      .select("-__v")
      .lean(),
    AuditLog.countDocuments(finalFilter),
  ]);

  return { logs, totalItems, page: params.page, limit: params.limit };
};

const getAuditLogById = async (id: string): Promise<IAuditLog> => {
  const log = await AuditLog.findById(id).lean();
  if (!log) {
    throw new Error("Audit log not found");
  }
  return log;
};

const getUserAuditLogs = async (userId: string, queryParams: any) => {
  return getAuditLogs({ ...queryParams, userId });
};

const getResourceAuditLogs = async (resourceId: string, queryParams: any) => {
  return getAuditLogs({ ...queryParams, resourceId });
};

const getAuditStats = async (
  daysBack: number = 30
): Promise<{
  totalActions: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byStatus: Record<string, number>;
  topUsers: Array<{ userId: string; userEmail: string; count: number }>;
}> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const [byAction, byResource, byStatus, topUsers, totalActions] = await Promise.all([
    AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
    ]),
    AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: "$resource", count: { $sum: 1 } } },
    ]),
    AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: { userId: "$userId", userEmail: "$userEmail" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    AuditLog.countDocuments({ timestamp: { $gte: startDate } }),
  ]);

  const formatGrouped = (data: Array<{ _id: string; count: number }>) => {
    const result: Record<string, number> = {};
    data.forEach((item) => {
      result[item._id] = item.count;
    });
    return result;
  };

  return {
    totalActions,
    byAction: formatGrouped(byAction),
    byResource: formatGrouped(byResource),
    byStatus: formatGrouped(byStatus),
    topUsers: topUsers.map((u: { _id: { userId: string; userEmail: string }; count: number }) => ({
      userId: u._id.userId,
      userEmail: u._id.userEmail,
      count: u.count,
    })),
  };
};

const cleanOldAuditLogs = async (daysOld: number = 365): Promise<number> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await AuditLog.deleteMany({ timestamp: { $lt: cutoffDate } });
  return result.deletedCount;
};

export {
  logAction,
  getAuditLogs,
  getAuditLogById,
  getUserAuditLogs,
  getResourceAuditLogs,
  getAuditStats,
  cleanOldAuditLogs,
};

export type { CreateAuditLogData };

export default {
  logAction,
  getAuditLogs,
  getAuditLogById,
  getUserAuditLogs,
  getResourceAuditLogs,
  getAuditStats,
  cleanOldAuditLogs,
};
