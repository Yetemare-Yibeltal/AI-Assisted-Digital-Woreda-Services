import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { ServiceCard, ServiceCardSkeleton } from "./ServiceCard";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, Grid3X3, List } from "lucide-react";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import type { IService } from "@/types/service.types";
import type { PaginatedResponse, PaginationMeta } from "@/types/api.types";
import { SERVICE_CATEGORIES } from "@/types/service.types";

interface ServiceListProps {
  className?: string;
  defaultCategory?: string;
  defaultSearch?: string;
  limit?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  variant?: "grid" | "list";
}

export function ServiceList({
  className,
  defaultCategory,
  defaultSearch,
  limit = 12,
  showFilters = true,
  showSearch = true,
  variant = "grid",
}: ServiceListProps) {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(defaultSearch || "");
  const [category, setCategory] = useState(defaultCategory || "");
  const [sortBy, setSortBy] = useState("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [language] = useState<"en" | "am">(storage.getLanguage());
  const [viewMode, setViewMode] = useState<"grid" | "list">(variant);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (category) params.category = category;

      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&");

      const response = await api.get<PaginatedResponse<IService>>(
        `/public/services?${queryString}`
      );

      if (response.data.success) {
        setServices(response.data.data);
        if (response.data.meta) {
          setMeta(response.data.meta);
        }
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError(
        language === "am"
          ? "አገልግሎቶችን መጫን አልተሳካም።"
          : "Failed to load services. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, sortBy, sortOrder, language]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSearchClear = () => {
    setSearch("");
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value === "all" ? "" : value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    fetchServices();
  };

  const activeFiltersCount = [category].filter(Boolean).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search & Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={language === "am" ? "አገልግሎቶችን ይፈልጉ..." : "Search services..."}
                value={search}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {search && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Select value={category || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue
                  placeholder={language === "am" ? "ሁሉም ምድቦች" : "All Categories"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === "am" ? "ሁሉም ምድቦች" : "All Categories"}
                </SelectItem>
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {language === "am" ? cat.labelAmharic : cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order-asc">Default</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="createdAt-desc">Newest</SelectItem>
                <SelectItem value="createdAt-asc">Oldest</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden sm:flex items-center border border-border/30 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "glass" : "ghost"}
                size="icon-sm"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "glass" : "ghost"}
                size="icon-sm"
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {language === "am" ? "ማጣሪያዎች:" : "Filters:"}
          </span>
          {category && (
            <Badge variant="default" size="sm" removable onRemove={() => setCategory("")}>
              {SERVICE_CATEGORIES.find((c) => c.value === category)?.label || category}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              setCategory("");
              setSearch("");
              setPage(1);
            }}
          >
            <X className="h-3 w-3 mr-1" />
            {language === "am" ? "ሁሉንም አጽዳ" : "Clear all"}
          </Button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="primary" onClick={handleRetry}>
            {language === "am" ? "እንደገና ሞክር" : "Try Again"}
          </Button>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">📭</div>
          <h3 className="text-lg font-semibold mb-2">
            {language === "am" ? "ምንም አገልግሎት አልተገኘም" : "No services found"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === "am"
              ? "የፍለጋ ቃላትዎን ይቀይሩ ወይም ማጣሪያዎችን ያስወግዱ።"
              : "Try adjusting your search terms or removing filters."}
          </p>
          {(search || category) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("");
                setPage(1);
              }}
            >
              {language === "am" ? "ሁሉንም አጽዳ" : "Clear filters"}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade-in"
                : "space-y-4"
            )}
          >
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                language={language}
                compact={viewMode === "list"}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                meta={meta}
                onPageChange={handlePageChange}
                pageSizeOptions={[6, 12, 24, 48]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ServiceList;