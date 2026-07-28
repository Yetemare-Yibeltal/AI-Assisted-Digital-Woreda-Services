import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import type { PaginationMeta } from "@/types/api.types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showTotal?: boolean;
  totalLabel?: string;
  siblingCount?: number;
  className?: string;
  size?: "sm" | "default";
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | "ellipsis-start" | "ellipsis-end")[] {
  const totalNumbers = siblingCount * 2 + 5;
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];

  if (totalPages <= totalNumbers) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const leftSibling = Math.max(currentPage - siblingCount, 2);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    pages.push(1);

    if (showLeftEllipsis) {
      pages.push("ellipsis-start");
    } else {
      for (let i = 2; i < leftSibling; i++) {
        pages.push(i);
      }
    }

    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i);
    }

    if (showRightEllipsis) {
      pages.push("ellipsis-end");
    } else {
      for (let i = rightSibling + 1; i < totalPages; i++) {
        pages.push(i);
      }
    }

    pages.push(totalPages);
  }

  return pages;
}

export function Pagination({
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24, 48],
  showPageSizeSelector = true,
  showTotal = true,
  totalLabel = "items",
  siblingCount = 1,
  className,
  size = "default",
}: PaginationProps) {
  const { page, limit, totalItems, totalPages, hasNextPage, hasPrevPage } = meta;

  if (totalPages <= 1 && !showPageSizeSelector && !showTotal) {
    return null;
  }

  const pages = generatePageNumbers(page, totalPages, siblingCount);
  const sizeClasses = size === "sm" ? "h-8 text-xs" : "h-9 text-sm";

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}
    >
      {/* Total items and page size selector */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {showTotal && (
          <span>
            {totalItems.toLocaleString()} {totalLabel}
          </span>
        )}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Show</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-[70px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="hidden sm:inline">per page</span>
          </div>
        )}
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          aria-label="First page"
          className={sizeClasses}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          aria-label="Previous page"
          className={sizeClasses}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5 mx-1">
          {pages.map((pageNum, index) => {
            if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className={cn(
                    "flex items-center justify-center",
                    size === "sm" ? "w-8 h-8" : "w-9 h-9"
                  )}
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }

            const isActive = pageNum === page;
            return (
              <Button
                key={pageNum}
                variant={isActive ? "primary" : "ghost"}
                size="icon-sm"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  sizeClasses,
                  isActive && "pointer-events-none shadow-md"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next page */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          className={sizeClasses}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          aria-label="Last page"
          className={sizeClasses}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page info */}
      <div className="text-sm text-muted-foreground hidden lg:block">
        Page {page} of {totalPages}
      </div>
    </nav>
  );
}

export default Pagination;