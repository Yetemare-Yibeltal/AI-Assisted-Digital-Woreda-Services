import { AppError } from "./AppError";

export class AuthorizationError extends AppError {
  public readonly requiredRole: string | null;
  public readonly requiredPermission: string | null;
  public readonly userRole: string | null;

  constructor(
    message: string = "You do not have permission to perform this action",
    requiredRole: string | null = null,
    requiredPermission: string | null = null,
    userRole: string | null = null
  ) {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.requiredRole = requiredRole;
    this.requiredPermission = requiredPermission;
    this.userRole = userRole;
    this.name = "AuthorizationError";
  }

  static insufficientRole(requiredRole: string, userRole: string): AuthorizationError {
    return new AuthorizationError(
      `This action requires '${requiredRole}' role. Your current role is '${userRole}'.`,
      requiredRole,
      null,
      userRole
    );
  }

  static insufficientPermission(requiredPermission: string): AuthorizationError {
    return new AuthorizationError(
      `You do not have the required permission: '${requiredPermission}'.`,
      null,
      requiredPermission,
      null
    );
  }

  static adminOnly(): AuthorizationError {
    return new AuthorizationError(
      "This action can only be performed by an administrator.",
      "admin",
      null,
      null
    );
  }

  static superAdminOnly(): AuthorizationError {
    return new AuthorizationError(
      "This action can only be performed by a super administrator.",
      "super_admin",
      null,
      null
    );
  }

  static notResourceOwner(resourceType: string): AuthorizationError {
    return new AuthorizationError(
      `You can only access your own ${resourceType.toLowerCase()} records.`,
      null,
      `own_${resourceType.toLowerCase()}`,
      null
    );
  }

  static cannotModifyApplication(status: string): AuthorizationError {
    return new AuthorizationError(
      `Applications with status '${status}' cannot be modified at this stage.`,
      null,
      "modify_application",
      null
    );
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        statusCode: this.statusCode,
        requiredRole: this.requiredRole,
        requiredPermission: this.requiredPermission,
      },
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export default AuthorizationError;
