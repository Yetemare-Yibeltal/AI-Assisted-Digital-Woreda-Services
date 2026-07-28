import { AppError } from "./AppError";

export interface IValidationErrorDetail {
  field: string;
  message: string;
  value: unknown;
  constraint?: string;
}

export class ValidationError extends AppError {
  public readonly errors: IValidationErrorDetail[];

  constructor(message: string = "Validation failed", errors: IValidationErrorDetail[] = []) {
    super(message, 422, "VALIDATION_ERROR");
    this.errors = errors;
    this.name = "ValidationError";
  }

  static fromJoiError(joiError: any): ValidationError {
    const details: IValidationErrorDetail[] = joiError.details.map((detail: any) => ({
      field: detail.path.join("."),
      message: detail.message,
      value: detail.context?.value || null,
      constraint: detail.type,
    }));
    return new ValidationError("Validation failed. Please check your input.", details);
  }

  static fromMongooseError(mongooseError: any): ValidationError {
    const details: IValidationErrorDetail[] = Object.keys(mongooseError.errors).map((key) => ({
      field: key,
      message: mongooseError.errors[key].message,
      value: mongooseError.errors[key].value || null,
      constraint: mongooseError.errors[key].kind,
    }));
    return new ValidationError("Database validation failed.", details);
  }

  static singleField(field: string, message: string, value: unknown = null): ValidationError {
    return new ValidationError(`Validation failed for field '${field}'`, [
      { field, message, value },
    ]);
  }

  static requiredField(field: string): ValidationError {
    return ValidationError.singleField(field, `${field} is required`);
  }

  static invalidFormat(field: string, format: string): ValidationError {
    return ValidationError.singleField(field, `${field} must be in ${format} format`);
  }

  static invalidEnum(field: string, allowedValues: string[]): ValidationError {
    return ValidationError.singleField(
      field,
      `${field} must be one of: ${allowedValues.join(", ")}`
    );
  }

  getFieldErrors(): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    this.errors.forEach((error) => {
      if (!fieldErrors[error.field]) {
        fieldErrors[error.field] = error.message;
      }
    });
    return fieldErrors;
  }

  hasFieldError(field: string): boolean {
    return this.errors.some((error) => error.field === field);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        statusCode: this.statusCode,
        errors: this.errors,
      },
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export default ValidationError;
