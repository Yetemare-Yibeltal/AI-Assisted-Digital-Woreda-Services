import { Response } from "express";

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: unknown;
  timestamp: string;
}

const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Operation successful",
  statusCode: number = 200
): void => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = "Resource created successfully"
): void => {
  sendSuccess(res, data, message, 201);
};

const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
  },
  message: string = "Data retrieved successfully"
): void => {
  const totalPages = Math.ceil(pagination.totalItems / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;

  const meta: PaginationMeta = {
    page: pagination.page,
    limit: pagination.limit,
    totalItems: pagination.totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? pagination.page + 1 : null,
    prevPage: hasPrevPage ? pagination.page - 1 : null,
  };

  const response: SuccessResponse<T[]> = {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
};

const sendError = (
  res: Response,
  message: string = "An error occurred",
  statusCode: number = 500,
  error?: unknown
): void => {
  const response: ErrorResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error : undefined,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

const sendFile = (res: Response, filePath: string, fileName: string, contentType: string): void => {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.download(filePath, fileName);
};

export { sendSuccess, sendCreated, sendPaginated, sendError, sendNoContent, sendFile };

export type { PaginationMeta, SuccessResponse, ErrorResponse };

export default {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
  sendNoContent,
  sendFile,
};
