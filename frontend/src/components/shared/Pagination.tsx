import React, { useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import type { PaginationMeta } from "@/types/api.types";

interface SharedPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showTotal?: boolean;
  showPageInput?: boolean;
  totalLabel?: string;
  totalLabelAmharic?: string;
  siblingCount?: number;
  className?: string;
  size?: "sm" | "default";
  language?: "en" | "am";
  disabled?: boolean;
}

function generatePages(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (totalPages <= 1) return [];
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(currentPage - siblingCount, 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
  if (showLeftEllipsis) {
    pages.push("ellipsis-start");
  } else {
    for (let i = 2; i < leftSibling; i++) pages.push(i);
  }
  for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
  if (showRightEllipsis) {
    pages.push("ellipsis-end");
  } else {
    for (let i = rightSibling + 1; i < totalPages; i++) pages.push(i);
  }
  pages.push(totalPages);
  return pages;
}

export function SharedPagination({
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showTotal = true,
  showPageInput = false,
  totalLabel = "items",
  totalLabelAmharic,
  siblingCount = 1,
  className,
  size = "default",
  language = "en",
  disabled = false,
}: SharedPaginationProps) {
  const { page, limit, totalItems, totalPages, hasNextPage, hasPrevPage } = meta;
  const [inputPage, setInputPage] = useState(String(page));
  const pages = generatePages(page, totalPages, siblingCount);
  const sizeClasses = size === "sm" ? "h-8 text-xs" : "h-9 text-sm";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  const handlePageInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const newPage = parseInt(inputPage, 10);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
          onPageChange(newPage);
        }
        setInputPage(String(page));
      }
    },
    [inputPage, totalPages, onPageChange, page]
  );

  const handlePageInputBlur = useCallback(() => {
    setInputPage(String(page));
  }, [page]);

  React.useEffect(() => {
    setInputPage(String(page));
  }, [page]);

  if (totalPages <= 1 && !showPageSizeSelector && !showTotal) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3",
        className
      )}
    >
      {/* Left: total + page size selector */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {showTotal && (
          <span className="text-xs sm:text-sm whitespace-nowrap">
            {totalItems.toLocaleString()}{" "}
            {language === "am" && totalLabelAmharic ? totalLabelAmharic : totalLabel}
          </span>
        )}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <Select
              value={String(limit)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
              disabled={disabled}
            >
              <SelectTrigger className={cn("w-[75px]", sizeClasses)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Center: page buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage || disabled}
          aria-label={language === "am" ? "የመጀመሪያ ገጽ" : "First page"}
          className={sizeClasses}
        >
          <ChevronsLeft className={iconSize} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || disabled}
          aria-label={language === "am" ? "ያለፈው ገጽ" : "Previous page"}
          className={sizeClasses}
        >
          <ChevronLeft className={iconSize} />
        </Button>

        <div className="flex items-center gap-0.5 mx-1">
          {pages.map((pageNum, idx) => {
            if (typeof pageNum === "string") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className={cn(
                    "flex items-center justify-center select-none",
                    size === "sm" ? "w-7 h-7" : "w-9 h-9"
                  )}
                >
                  <MoreHorizontal className={cn(iconSize, "text-muted-foreground")} />
                </span>
              );
            }
            const isActive = pageNum === page;
            return (
              <Button
                key={pageNum}
                variant={isActive ? "primary" : "ghost"}
                size="icon-sm"
                onClick={() => onPageChange(pageNum)}
                disabled={disabled}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(sizeClasses, isActive && "pointer-events-none shadow-md")}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || disabled}
          aria-label={language === "am" ? "ቀጣይ ገጽ" : "Next page"}
          className={sizeClasses}
        >
          <ChevronRight className={iconSize} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || disabled}
          aria-label={language === "am" ? "የመጨረሻ ገጽ" : "Last page"}
          className={sizeClasses}
        >
          <ChevronsRight className={iconSize} />
        </Button>
      </div>

      {/* Right: page info / input */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {showPageInput ? (
          <div className="flex items-center gap-1">
            <span className="text-xs">{language === "am" ? "ገጽ" : "Page"}</span>
            <input
              type="text"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={handlePageInput}
              onBlur={handlePageInputBlur}
              disabled={disabled}
              className={cn(
                "w-12 text-center rounded-md border border-border/30 bg-transparent",
                sizeClasses,
                "focus:outline-none focus:border-primary/50"
              )}
            />
            <span className="text-xs">/ {totalPages}</span>
          </div>
        ) : (
          <span className="text-xs">
            {language === "am" ? "ገጽ" : "Page"} {page} / {totalPages}
          </span>
        )}
      </div>
    </nav>
  );
}

export default SharedPagination;