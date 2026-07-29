import React, { useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableLoading,
  TableEmpty,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Search, ArrowUpDown, Filter } from "lucide-react";
import type { PaginationMeta } from "@/types/api.types";

interface Column<T> {
  key: string;
  header: string;
  headerAmharic?: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  meta?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  searchValue?: string;
  onSort?: (field: string, direction: "asc" | "desc") => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  language?: "en" | "am";
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  meta,
  onPageChange,
  onSearch,
  searchValue = "",
  onSort,
  sortField,
  sortDirection,
  language = "en",
  className,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const [searchInput, setSearchInput] = useState(searchValue);

  const handleSearch = useCallback(() => {
    onSearch?.(searchInput);
  }, [searchInput, onSearch]);

  const handleSort = (field: string) => {
    if (!onSort) return;
    if (sortField === field) {
      onSort(field, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(field, "asc");
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {onSearch && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={language === "am" ? "ፈልግ..." : "Search..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
      )}
      <Table containerClassName="rounded-xl border border-border/20">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                sortable={col.sortable}
                sortDirection={sortField === col.key ? sortDirection : null}
                onSort={() => col.sortable && handleSort(col.key)}
                style={{ width: col.width }}
                className={col.className}
              >
                {language === "am" && col.headerAmharic ? col.headerAmharic : col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {loading ? (
          <TableLoading columns={columns.length} rows={6} />
        ) : data.length === 0 ? (
          <TableEmpty columns={columns.length} title={emptyTitle} description={emptyDescription} />
        ) : (
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow key={(item as any)._id || rowIndex)} hover>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(item, rowIndex) : item[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
      {meta && onPageChange && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}

export default DataTable;