import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  public readonly resourceType: string;
  public readonly resourceId: string;

  constructor(resourceType: string = "Resource", resourceId: string = "") {
    const message = resourceId
      ? `${resourceType} with ID '${resourceId}' was not found`
      : `${resourceType} was not found`;

    super(message, 404, "NOT_FOUND");
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.name = "NotFoundError";
  }

  static service(serviceId: string): NotFoundError {
    return new NotFoundError("Service", serviceId);
  }

  static application(applicationId: string): NotFoundError {
    return new NotFoundError("Application", applicationId);
  }

  static admin(adminId: string): NotFoundError {
    return new NotFoundError("Admin", adminId);
  }

  static document(documentId: string): NotFoundError {
    return new NotFoundError("Document", documentId);
  }

  static route(path: string): NotFoundError {
    return new NotFoundError("Route", path);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        statusCode: this.statusCode,
        resourceType: this.resourceType,
        resourceId: this.resourceId,
      },
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export default NotFoundError;
