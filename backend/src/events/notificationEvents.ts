import eventEmitter from "./eventEmitter";

export const NOTIFICATION_CREATED = "notification:created";

export const emitNotificationCreated = (data: {
  recipient: string;
  title: string;
  message: string;
  type: string;
}) => {
  eventEmitter.emit(NOTIFICATION_CREATED, data);
};
