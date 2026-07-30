import AuditLog from "../models/AuditLog";
import Notification from "../models/Notification";
import logger from "../utils/logger";

export const cleanupJob = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const auditResult = await AuditLog.deleteMany({ timestamp: { $lt: thirtyDaysAgo } });
    const notificationResult = await Notification.deleteMany({
      isRead: true,
      createdAt: { $lt: thirtyDaysAgo },
    });
    logger.info(
      `Cleanup: ${auditResult.deletedCount} audit logs, ${notificationResult.deletedCount} notifications removed`
    );
  } catch (error) {
    logger.error("Cleanup job failed:", error);
  }
};
