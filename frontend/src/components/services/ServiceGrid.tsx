import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { ServiceCard, ServiceCardSkeleton } from "./ServiceCard";
import type { IService } from "@/types/service.types";

interface ServiceGridProps {
  services: IService[];
  language?: "en" | "am";
  loading?: boolean;
  skeletonCount?: number;
  columns?: 1 | 2 | 3 | 4;
  featured?: boolean;
  className?: string;
  onServiceClick?: (service: IService) => void;
}

export function ServiceGrid({
  services,
  language = "en",
  loading = false,
  skeletonCount = 6,
  columns = 3,
  featured = false,
  className,
  onServiceClick,
}: ServiceGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (loading) {
    return (
      <div className={cn("grid gap-6", gridCols[columns], className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>{language === "am" ? "ምንም አገልግሎት አልተገኘም" : "No services available"}</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 stagger-fade-in", gridCols[columns], className)}>
      {services.map((service, index) => (
        <div
          key={service._id}
          className={cn(
            featured && index === 0 && columns >= 3 && "sm:col-span-2 sm:row-span-2"
          )}
        >
          <ServiceCard
            service={service}
            language={language}
            compact={false}
          />
        </div>
      ))}
    </div>
  );
}

export default ServiceGrid;