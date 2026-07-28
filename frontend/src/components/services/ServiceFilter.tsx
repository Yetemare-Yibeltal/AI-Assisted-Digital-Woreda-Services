import React, { useState, useEffect } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import type { ApiResponse } from "@/types/api.types";
import { SERVICE_CATEGORIES } from "@/types/service.types";

interface ServiceFilterProps {
  onFilterChange: (filters: ServiceFilters) => void;
  className?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  showPopular?: boolean;
  showActive?: boolean;
}

export interface ServiceFilters {
  search: string;
  category: string;
  isPopular: boolean | null;
  isActive: boolean | null;
}

const defaultFilters: ServiceFilters = {
  search: "",
  category: "",
  isPopular: null,
  isActive: null,
};

export function ServiceFilter({
  onFilterChange,
  className,
  showSearch = true,
  showCategories = true,
  showPopular = true,
  showActive = true,
}: ServiceFilterProps) {
  const [filters, setFilters] = useState<ServiceFilters>(defaultFilters);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [language] = useState<"en" | "am">(storage.getLanguage());
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const response = await api.get<ApiResponse<{ categories: string[] }>>(
          "/public/services/categories"
        );
        if (response.data.success && response.data.data) {
          const counts: Record<string, number> = {};
          (response.data.data as any).categories?.forEach?.((cat: any) => {
            counts[cat._id || cat] = cat.count || 0;
          }) ||
            (Array.isArray(response.data.data) &&
              response.data.data.forEach((cat: string) => {
                counts[cat] = 0;
              }));
          setCategoryCounts(counts);
        }
      } catch {
        // Silently fail
      }
    };

    fetchCategoryCounts();
  }, []);

  const updateFilter = (key: keyof ServiceFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value !== "";
    if (key === "category") return value !== "";
    return value !== null;
  }).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            {language === "am" ? "ማጣሪያዎች" : "Filters"}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {activeFilterCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeFilterCount}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse filters" : "Expand filters"}
          >
            {expanded ? <X className="h-3.5 w-3.5" /> : <Filter className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={language === "am" ? "ፈልግ..." : "Search..."}
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10 pr-10 text-sm"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter("search", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Categories */}
          {showCategories && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {language === "am" ? "ምድቦች" : "Categories"}
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {SERVICE_CATEGORIES.map((cat) => (
                  <div
                    key={cat.value}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                      filters.category === cat.value
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary/30 text-muted-foreground"
                    )}
                    onClick={() =>
                      updateFilter(
                        "category",
                        filters.category === cat.value ? "" : cat.value
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full border-2",
                          filters.category === cat.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      />
                      <span className="text-sm">
                        {language === "am" ? cat.labelAmharic : cat.label}
                      </span>
                    </div>
                    {categoryCounts[cat.value] !== undefined && (
                      <Badge variant="secondary" size="sm">
                        {categoryCounts[cat.value]}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Popular Filter */}
          {showPopular && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-popular"
                checked={filters.isPopular === true}
                onCheckedChange={(checked) =>
                  updateFilter("isPopular", checked === true ? true : null)
                }
              />
              <label
                htmlFor="filter-popular"
                className="text-sm cursor-pointer select-none"
              >
                {language === "am" ? "ታዋቂ አገልግሎቶች ብቻ" : "Popular services only"}
              </label>
            </div>
          )}

          {/* Active Filter */}
          {showActive && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-active"
                checked={filters.isActive === true}
                onCheckedChange={(checked) =>
                  updateFilter("isActive", checked === true ? true : null)
                }
              />
              <label
                htmlFor="filter-active"
                className="text-sm cursor-pointer select-none"
              >
                {language === "am" ? "ንቁ አገልግሎቶች ብቻ" : "Active services only"}
              </label>
            </div>
          )}

          {/* Reset */}
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={resetFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {language === "am" ? "ሁሉንም አጽዳ" : "Reset all filters"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default ServiceFilter;