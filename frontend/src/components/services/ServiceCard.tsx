import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlassCardBadge } from "@/components/shared/GlassCard";
import {
  Clock,
  Coins,
  ListChecks,
  ArrowRight,
  FileText,
  Baby,
  Heart,
  MapPin,
  Store,
  Receipt,
  GraduationCap,
  Activity,
  Leaf,
  Scale,
  MoreHorizontal,
} from "lucide-react";
import type { IService } from "@/types/service.types";
import { SERVICE_CATEGORY_MAP } from "@/utils/enums";

interface ServiceCardProps {
  service: IService;
  language?: "en" | "am";
  className?: string;
  compact?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  Baby: <Baby className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  MapPin: <MapPin className="h-6 w-6" />,
  Store: <Store className="h-6 w-6" />,
  Receipt: <Receipt className="h-6 w-6" />,
  FileText: <FileText className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
  Activity: <Activity className="h-6 w-6" />,
  Leaf: <Leaf className="h-6 w-6" />,
  Scale: <Scale className="h-6 w-6" />,
};

export function ServiceCard({ service, language = "en", className, compact = false }: ServiceCardProps) {
  const categoryInfo = SERVICE_CATEGORY_MAP[service.category as keyof typeof SERVICE_CATEGORY_MAP];
  const totalFee = service.fees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
  const stepCount = service.steps?.length || 0;

  return (
    <Link to={`/services/${service.slug}`} className={cn("block group", className)}>
      <Card
        variant="glass-hover"
        className="h-full transition-all duration-300 hover:border-primary/20"
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                {iconMap[service.icon] || <FileText className="h-6 w-6" />}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base lg:text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {language === "am" ? service.nameAmharic : service.name}
                </CardTitle>
                {!compact && (
                  <CardDescription className="line-clamp-1 mt-0.5">
                    {language === "am" ? service.shortDescriptionAmharic : service.shortDescription}
                  </CardDescription>
                )}
              </div>
            </div>
          </div>

          {categoryInfo && (
            <div className="mt-2">
              <Badge variant="default" size="sm" className="gap-1">
                {language === "am" ? categoryInfo.am : categoryInfo.en}
              </Badge>
            </div>
          )}
        </CardHeader>

        {!compact && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {language === "am" ? service.descriptionAmharic : service.description}
            </p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {totalFee > 0 && (
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-ethiopia-yellow" />
                  {totalFee.toLocaleString()} ETB
                </span>
              )}
              {service.processingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  {language === "am" ? service.processingTimeAmharic : service.processingTime}
                </span>
              )}
              {stepCount > 0 && (
                <span className="flex items-center gap-1">
                  <ListChecks className="h-3.5 w-3.5 text-ethiopia-green" />
                  {stepCount} {language === "am" ? "ደረጃዎች" : "steps"}
                </span>
              )}
            </div>
          </CardContent>
        )}

        {compact && (
          <div className="px-6 pb-4 mt-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {totalFee > 0 && `${totalFee.toLocaleString()} ETB`}
              </span>
              <span className="text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {language === "am" ? "ዝርዝር" : "Details"}
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}

export function ServiceCardSkeleton() {
  return (
    <Card variant="glass" className="h-full animate-pulse">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary/50" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-secondary/50 rounded w-3/4" />
            <div className="h-3 bg-secondary/50 rounded w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-3 bg-secondary/50 rounded w-full" />
          <div className="h-3 bg-secondary/50 rounded w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}

export default ServiceCard;