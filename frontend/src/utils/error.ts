export interface AppError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, string[]> | string[];
  timestamp?: string;
  originalError?: unknown;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  rethrow?: boolean;
}

export const parseError = (error: unknown): AppError => {
  if (!error) {
    return {
      status: 500,
      message: "An unknown error occurred",
      code: "UNKNOWN_ERROR",
    };
  }

  if (typeof error === "object" && error !== null) {
    const err = error as any;

    if (err.status && err.message) {
      return {
        status: err.status || 500,
        message: err.message,
        code: err.code || err.error?.code,
        details: err.details || err.error?.details,
        timestamp: err.timestamp,
        originalError: err.originalError || error,
      };
    }

    if (err.response) {
      const data = err.response.data;
      return {
        status: err.response.status || 500,
        message:
          data?.message ||
          data?.error?.message ||
          `Request failed with status ${err.response.status}`,
        code: data?.error?.code || data?.code,
        details: data?.error?.details || data?.details,
        timestamp: data?.timestamp,
        originalError: error,
      };
    }

    if (err instanceof Error) {
      return {
        status: 500,
        message: err.message || "An unexpected error occurred",
        code: "CLIENT_ERROR",
        originalError: error,
      };
    }

    if (err.data) {
      return {
        status: err.status || 500,
        message: err.data?.message || err.message || "Request failed",
        code: err.data?.error?.code || err.code,
        details: err.data?.error?.details,
        originalError: error,
      };
    }
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || "An unexpected error occurred",
      code: "CLIENT_ERROR",
      originalError: error,
    };
  }

  if (typeof error === "string") {
    return {
      status: 500,
      message: error,
      code: "STRING_ERROR",
    };
  }

  return {
    status: 500,
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
};

export const getErrorMessage = (
  error: unknown,
  fallback: string = "Something went wrong",
): string => {
  if (!error) return fallback;
  const parsed = parseError(error);
  return parsed.message || fallback;
};

export const getErrorCode = (error: unknown): string => {
  return parseError(error).code || "UNKNOWN_ERROR";
};

export const getErrorStatus = (error: unknown): number => {
  return parseError(error).status;
};

export const getFieldErrors = (error: unknown): Record<string, string> => {
  const parsed = parseError(error);
  if (!parsed.details) return {};

  if (Array.isArray(parsed.details)) {
    const fieldErrors: Record<string, string> = {};
    parsed.details.forEach((detail: any) => {
      if (detail.field && detail.message) {
        const fieldName = detail.field
          .replace("body.", "")
          .replace("query.", "")
          .replace("params.", "");
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = detail.message;
        }
      }
    });
    return fieldErrors;
  }

  if (typeof parsed.details === "object") {
    const result: Record<string, string> = {};
    Object.entries(parsed.details as Record<string, string[]>).forEach(
      ([key, messages]) => {
        result[key] = Array.isArray(messages) ? messages[0] : String(messages);
      },
    );
    return result;
  }

  return {};
};

export const getFieldError = (
  error: unknown,
  fieldName: string,
): string | null => {
  const fieldErrors = getFieldErrors(error);
  return fieldErrors[fieldName] || null;
};

export const isNetworkError = (error: unknown): boolean => {
  const err = error as any;
  if (!err) return false;
  return (
    err.message === "Network Error" ||
    err.code === "ERR_NETWORK" ||
    err.code === "ECONNABORTED" ||
    (err.status === 0 && !err.response) ||
    (err.originalError &&
      !err.originalError.response &&
      err.originalError.code === "ERR_NETWORK")
  );
};

export const isServerError = (error: unknown): boolean => {
  const status = getErrorStatus(error);
  return status >= 500 && status < 600;
};

export const isClientError = (error: unknown): boolean => {
  const status = getErrorStatus(error);
  return status >= 400 && status < 500;
};

export const isAuthError = (error: unknown): boolean => {
  return getErrorStatus(error) === 401;
};

export const isForbiddenError = (error: unknown): boolean => {
  return getErrorStatus(error) === 403;
};

export const isNotFoundError = (error: unknown): boolean => {
  return getErrorStatus(error) === 404;
};

export const isValidationError = (error: unknown): boolean => {
  return getErrorStatus(error) === 422;
};

export const isRateLimitError = (error: unknown): boolean => {
  return getErrorStatus(error) === 429;
};

export const isConflictError = (error: unknown): boolean => {
  return getErrorStatus(error) === 409;
};

export const handleError = (
  error: unknown,
  options: ErrorHandlerOptions = {},
): AppError => {
  const { showToast = true, logToConsole = true, rethrow = false } = options;

  const appError = parseError(error);

  if (logToConsole) {
    if (appError.status >= 500) {
      console.error(
        `[ERROR ${appError.status}]`,
        appError.message,
        appError.originalError || "",
      );
    } else if (appError.status >= 400) {
      console.warn(`[WARN ${appError.status}]`, appError.message);
    } else {
      console.error("[ERROR]", appError.message, appError.originalError || "");
    }
  }

  if (showToast && !isAuthError(error) && !isForbiddenError(error)) {
    import("sonner")
      .then(({ toast }) => {
        if (isNetworkError(error)) {
          toast.error("Network error. Please check your internet connection.");
        } else if (isServerError(error)) {
          toast.error("Server error. Please try again later.");
        } else if (isValidationError(error)) {
          toast.error(appError.message);
        } else if (isRateLimitError(error)) {
          toast.error("Too many requests. Please wait and try again.");
        } else {
          toast.error(appError.message);
        }
      })
      .catch(() => {
        alert(appError.message);
      });
  }

  if (rethrow) {
    throw appError;
  }

  return appError;
};

export const silentError = (error: unknown): AppError => {
  return handleError(error, {
    showToast: false,
    logToConsole: true,
    rethrow: false,
  });
};

export const formatErrorForDisplay = (error: unknown): string => {
  const parsed = parseError(error);

  if (isNetworkError(error)) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  if (isServerError(error)) {
    return "The server encountered an error. Our team has been notified. Please try again later.";
  }

  if (isAuthError(error)) {
    return "Your session has expired. Please log in again to continue.";
  }

  if (isForbiddenError(error)) {
    return "You don't have permission to perform this action. Please contact your administrator.";
  }

  if (isNotFoundError(error)) {
    return "The requested resource was not found. It may have been moved or deleted.";
  }

  if (isRateLimitError(error)) {
    return "You've made too many requests. Please wait a moment and try again.";
  }

  return parsed.message;
};
