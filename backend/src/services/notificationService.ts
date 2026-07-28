import Notification, { INotification } from "../models/Notification";
import { NotFoundError } from "../errors/NotFoundError";
import { AppError } from "../errors/AppError";
import { extractPaginationParams, buildPaginationOptions } from "../utils/pagination";

interface CreateNotificationData {
  recipient: string;
  recipientModel: "Admin" | "Applicant";
  title: string;
  titleAmharic?: string;
  message: string;
  messageAmharic?: string;
  type: "application_update" | "document_request" | "assignment" | "system_alert" | "reminder";
  referenceId?: string;
  referenceModel?: string;
  link?: string;
  priority?: "low" | "medium" | "high";
}

const createNotification = async (data: CreateNotificationData): Promise<INotification> => {
  const notification = await Notification.create({
    ...data,
    isRead: false,
    readAt: null,
  });
  return notification;
};

const getNotificationsByRecipient = async (recipient: string, queryParams: any) => {
  const params = extractPaginationParams(queryParams);
  const options = buildPaginationOptions(params);

  const filter: any = { recipient };

  if (queryParams.type) filter.type = queryParams.type;
  if (queryParams.isRead !== undefined) {
    filter.isRead = queryParams.isRead === "true";
  }
  if (queryParams.priority) filter.priority = queryParams.priority;

  const [notifications, totalItems] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  const unreadCount = await Notification.countDocuments({ recipient, isRead: false });

  return {
    notifications,
    totalItems,
    unreadCount,
    page: params.page,
    limit: params.limit,
  };
};

const markAsRead = async (notificationId: string, recipient: string): Promise<INotification> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new NotFoundError("Notification", notificationId);
  }

  return notification;
};

const markAllAsRead = async (recipient: string): Promise<number> => {
  const result = await Notification.updateMany(
    { recipient, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return result.modifiedCount;
};

const getUnreadCount = async (recipient: string): Promise<number> => {
  const count = await Notification.countDocuments({ recipient, isRead: false });
  return count;
};

const deleteNotification = async (notificationId: string, recipient: string): Promise<void> => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient,
  });

  if (!notification) {
    throw new NotFoundError("Notification", notificationId);
  }
};

const deleteOldNotifications = async (daysOld: number = 90): Promise<number> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true,
  });

  return result.deletedCount;
};

const notifyApplicationStatusChange = async (
  applicationId: string,
  trackingNumber: string,
  applicantName: string,
  oldStatus: string,
  newStatus: string,
  adminId: string
): Promise<void> => {
  await createNotification({
    recipient: adminId,
    recipientModel: "Admin",
    title: `Application Status Updated`,
    message: `Application ${trackingNumber} for ${applicantName} moved from ${oldStatus} to ${newStatus}`,
    type: "application_update",
    referenceId: applicationId,
    referenceModel: "Application",
    priority: "medium",
  });
};

const notifyNewApplication = async (
  applicationId: string,
  trackingNumber: string,
  applicantName: string,
  serviceName: string
): Promise<void> => {
  const NotificationModel = Notification;
  await NotificationModel.create({
    recipient: "all_admins",
    recipientModel: "Admin",
    title: "New Application Received",
    message: `New application ${trackingNumber} for ${serviceName} from ${applicantName}`,
    type: "application_update",
    referenceId: applicationId,
    referenceModel: "Application",
    priority: "high",
    isRead: false,
  });
};

export {
  createNotification,
  getNotificationsByRecipient,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  deleteOldNotifications,
  notifyApplicationStatusChange,
  notifyNewApplication,
};

export default {
  createNotification,
  getNotificationsByRecipient,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  deleteOldNotifications,
  notifyApplicationStatusChange,
  notifyNewApplication,
};
