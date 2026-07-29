import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Coins,
  Clock,
  ListChecks,
  FileText,
  CheckCircle2,
  TrendingUp,
  Star,
  ThumbsUp,
  ChevronRight,
} from "lucide-react";
import { storage } from "@/utils/storage";

interface Recommendation {
  serviceName: string;
  serviceNameAmharic: string;
  serviceSlug: string;
  category: string;
  categoryAmharic: string;
  confidenceScore: number;
  reasoning: string;
  reasoningAmharic: string;
  totalFee: number;
  processingTime: string;
  processingTimeAmharic: string;
  stepCount?: number;
  documentCount?: number;
  requiredDocuments?: Array<{ name: string; nameAmharic: string; isMandatory: boolean }>;
  nextActions?: string[];
  nextActionsAmharic?: string[];
  alternativeServices?: Array<{ name: string; nameAmharic: string; slug: string }>;
}

interface AIRecommendationListProps {
  recommendations: Recommendation[];
  loading?: boolean;
  language?: "en" | "am";
  className?: string;
  onSelectService?: (service: Recommendation) => void;
  showAlternatives?: boolean;
  compact?: boolean;
}

export function AIRecommendationList({
  recommendations,
  loading = false,
  language = "en",
  className,
  onSelectService,
  showAlternatives = true,
  compact = false,
}: AIRecommendationListProps) {
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} variant="glass">
            <CardContent className="p-5">
              <div className="flex gap-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="w-1/2 h-5" />
                  <Skeleton variant="text" className="w-3/4 h-4" />
                  <div className="flex gap-3 pt-1">
                    <Skeleton variant="text" className="w-16 h-3" />
                    <Skeleton variant="text" className="w-20 h-3" />
                    <Skeleton variant="text" className="w-14 h-3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={cn("text-center py-10", className)}>
        <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-muted-foreground">
          {language === "am" ? "ምንም ምክሮች አልተገኙም" : "No recommendations found"}
        </p>
      </div>
    );
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return language === "am" ? "ከፍተኛ" : "High Match";
    if (score >= 50) return language === "am" ? "መካከለኛ" : "Medium Match";
    return language === "am" ? "ዝቅተኛ" : "Low Match";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {recommendations.map((rec, index) => {
        const isTop = index === 0;
        const mandatoryDocs = rec.requiredDocuments?.filter((d) => d.isMandatory).length || 0;
        const totalDocs = rec.requiredDocuments?.length || 0;

        return (
          <Card
            key={rec.serviceSlug || index}
            variant="glass"
            className={cn(
              "overflow-hidden transition-all duration-300 hover:border-primary/20 group",
              isTop && "border-primary/30 ring-1 ring-primary/10"
            )}
          >
            {isTop && (
              <div className="bg-gradient-to-r from-primary to-emerald-500 px-4 py-1">
                <p className="text-[11px] font-bold text-white text-center flex items-center justify-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {language === "am" ? "ምርጥ ምክር" : "Top Recommendation"}
                </p>
              </div>
            )}

            <div className="p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Main Content */}
                <div className="flex-1 space-y-3">
                  {/* Title & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold group-hover:text-primary transition-colors">
                        {language === "am" ? rec.serviceNameAmharic : rec.serviceName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" size="sm">
                          {language === "am" ? rec.categoryAmharic : rec.category?.replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          size="sm"
                          className={getConfidenceColor(rec.confidenceScore)}
                        >
                          {rec.confidenceScore}% {getConfidenceLabel(rec.confidenceScore)}
                        </Badge>
                      </div>
                    </div>
                    {isTop && (
                      <Badge variant="warning" size="sm" className="shrink-0 gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {language === "am" ? "የተመከረ" : "Recommended"}
                      </Badge>
                    )}
                  </div>

                  {/* Reasoning */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {language === "am" ? rec.reasoningAmharic : rec.reasoning}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    {rec.totalFee > 0 && (
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Coins className="h-4 w-4 text-ethiopia-yellow" />
                        {rec.totalFee.toLocaleString()} ETB
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4 text-blue-400" />
                      {language === "am" ? rec.processingTimeAmharic : rec.processingTime}
                    </span>
                    {rec.stepCount !== undefined && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <ListChecks className="h-4 w-4 text-ethiopia-green" />
                        {rec.stepCount} {language === "am" ? "ደረጃዎች" : "steps"}
                      </span>
                    )}
                    {totalDocs > 0 && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="h-4 w-4 text-purple-400" />
                        {mandatoryDocs} {language === "am" ? "ግዴታ ሰነዶች" : "mandatory docs"}
                      </span>
                    )}
                  </div>

                  {/* Required Documents Preview */}
                  {rec.requiredDocuments && rec.requiredDocuments.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.requiredDocuments.slice(0, 4).map((doc, i) => (
                        <Badge key={i} variant="secondary" size="sm" className="text-[10px] gap-1">
                          {doc.isMandatory ? (
                            <CheckCircle2 className="h-2.5 w-2.5 text-ethiopia-red" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full border border-muted-foreground/30" />
                          )}
                          {language === "am" ? doc.nameAmharic : doc.name}
                        </Badge>
                      ))}
                      {rec.requiredDocuments.length > 4 && (
                        <Badge variant="secondary" size="sm" className="text-[10px]">
                          +{rec.requiredDocuments.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Next Actions */}
                  {rec.nextActions && rec.nextActions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {language === "am" ? "ቀጣይ እርምጃዎች" : "Next Steps"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(language === "am" ? rec.nextActionsAmharic : rec.nextActions)?.map((action, i) => (
                          <Badge key={i} variant="default" size="sm" className="text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Sidebar */}
                <div className="lg:w-48 space-y-2 flex-shrink-0">
                  <Link to={`/services/${rec.serviceSlug}`}>
                    <Button variant="primary" size="sm" className="w-full gap-1.5">
                      <FileText className="h-4 w-4" />
                      {language === "am" ? "ዝርዝር" : "Details"}
                      <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </Link>
                  <Link to={`/apply/${rec.serviceSlug}`}>
                    <Button variant="glass" size="sm" className="w-full gap-1.5 text-xs">
                      {language === "am" ? "አሁን ያመልክቱ" : "Apply Now"}
                    </Button>
                  </Link>

                  {/* Alternative Services */}
                  {showAlternatives && rec.alternativeServices && rec.alternativeServices.length > 0 && (
                    <div className="pt-2 border-t border-border/20">
                      <p className="text-[10px] text-muted-foreground mb-1.5">
                        {language === "am" ? "አማራጮች" : "Alternatives"}
                      </p>
                      {rec.alternativeServices.slice(0, 3).map((alt, i) => (
                        <Link
                          key={i}
                          to={`/services/${alt.slug}`}
                          className="block text-[11px] text-primary hover:underline py-0.5 truncate"
                        >
                          {language === "am" ? alt.nameAmharic : alt.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default AIRecommendationList;