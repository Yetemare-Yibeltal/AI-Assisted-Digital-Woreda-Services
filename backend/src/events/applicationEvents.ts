import eventEmitter from "./eventEmitter";

export const APPLICATION_SUBMITTED = "application:submitted";
export const APPLICATION_STATUS_CHANGED = "application:statusChanged";
export const APPLICATION_ASSIGNED = "application:assigned";

export const emitApplicationSubmitted = (data: {
  applicationId: string;
  trackingNumber: string;
}) => {
  eventEmitter.emit(APPLICATION_SUBMITTED, data);
};

export const emitApplicationStatusChanged = (data: {
  applicationId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
}) => {
  eventEmitter.emit(APPLICATION_STATUS_CHANGED, data);
};

export const emitApplicationAssigned = (data: { applicationId: string; assignedTo: string }) => {
  eventEmitter.emit(APPLICATION_ASSIGNED, data);
};
