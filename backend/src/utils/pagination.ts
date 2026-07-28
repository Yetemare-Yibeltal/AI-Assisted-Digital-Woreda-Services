import { Request } from "express";
import appConfig from "../config/app";

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search: string;
  filters: Record<string, unknown>;
}

interface PaginationOptions {
  skip: number;
  limit: number;
  sort: Record<string, "asc" | "desc">;
  page: number;
}

const extractPaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || appConfig.pagination.defaultPage);
  const limit = Math.min(
    appConfig.pagination.maxLimit,
    Math.max(1, parseInt(req.query.limit as string) || appConfig.pagination.defaultLimit)
  );
  const skip = (page - 1) * limit;
  const sortBy = (req.query.sortBy as string) || appConfig.pagination.sortBy;
  const sortOrderParam = (req.query.sortOrder as string)?.toLowerCase();
  const sortOrder: "asc" | "desc" =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : appConfig.pagination.sortOrder;
  const search = (req.query.search as string) || "";

  // Extract filters excluding pagination and sort fields
  const excludeFields = ["page", "limit", "sortBy", "sortOrder", "search", "fields"];
  const filters: Record<string, unknown> = {};
  Object.keys(req.query).forEach((key) => {
    if (!excludeFields.includes(key)) {
      filters[key] = req.query[key];
    }
  });

  return { page, limit, skip, sortBy, sortOrder, search, filters };
};

const buildPaginationOptions = (params: PaginationParams): PaginationOptions => {
  return {
    skip: params.skip,
    limit: params.limit,
    sort: { [params.sortBy]: params.sortOrder },
    page: params.page,
  };
};

const buildSearchQuery = (search: string, searchFields: string[]): Record<string, unknown> => {
  if (!search || !searchFields.length) return {};
  const searchRegex = { $regex: search, $options: "i" };
  const orConditions = searchFields.map((field) => ({
    [field]: searchRegex,
  }));
  return { $or: orConditions };
};

const buildDateRangeFilter = (startDate?: string, endDate?: string): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
    }
    if (endDate) {
      (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
    }
  }
  return filter;
};

export { extractPaginationParams, buildPaginationOptions, buildSearchQuery, buildDateRangeFilter };

export type { PaginationParams, PaginationOptions };

export default {
  extractPaginationParams,
  buildPaginationOptions,
  buildSearchQuery,
  buildDateRangeFilter,
};
