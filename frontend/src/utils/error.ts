export interface AppError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export const parseError = (error: unknown): AppError => {
  if (error && typeof error === "object" && "status" in error) {
    const err = error as any;
    return {
      status: err.status || 500,
      message: err.message || "An unexpected error occurred",
      code: err.code,
      details: err.details,
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || "An unexpected error occurred",
    };
  }

  return {
    status: 500,
    message: "An unexpected error occurred",
  };
};

export const getErrorMessage = (error: unknown): string => {
  return parseError(error).message;
};

export const isNetworkError = (error: unknown): boolean => {
  const err = error as any;
  return (
    err?.message === "Network Error" ||
    err?.status === 0 ||
    (err?.originalError && !err?.originalError?.response)
  );
};

export const isServerError = (error: unknown): boolean => {
  const parsed = parseError(error);
  return parsed.status >= 500;
};

export const isAuthError = (error: unknown): boolean => {
  const parsed = parseError(error);
  return parsed.status === 401;
};

export const isValidationError = (error: unknown): boolean => {
  const parsed = parseError(error);
  return parsed.status === 422;
};
