import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  Search,
  Sparkles,
  Lightbulb,
  ArrowRight,
  FileText,
  Coins,
  Clock,
  ListChecks,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Star,
  ThumbsUp,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface RecommendationResult {
  serviceName: string;
  serviceNameAmharic: string;
  serviceSlug: string;
  category: string;
  categoryAmharic: string;
  confidenceScore: number;
  reasoning: string;
  reasoningAmharic: string;
  requiredDocuments: Array<{ name: string; nameAmharic: string; isMandatory: boolean }>;
  fees: Array<{ name: string; nameAmharic: string; amount: number }>;
  totalFee: number;
  processingTime: string;
  processingTimeAmharic: string;
  steps: Array<{ title: string; titleAmharic: string; description: string }>;
  eligibility: string;
  eligibilityAmharic: string;
  alternativeServices: Array<{ name: string; nameAmharic: string; slug: string }>;
  nextActions: string[];
  nextActionsAmharic: string[];
}

interface AIServiceRecommenderProps {
  language?: "en" | "am";
  className?: string;
  onSelectService?: (service: RecommendationResult) => void;
  defaultQuery?: string;
}

export function AIServiceRecommender({
  language = "en",
  className,
  onSelectService,
  defaultQuery = "",
}: AIServiceRecommenderProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      const response = await api.post<ApiResponse<{ recommendations: RecommendationResult[] }>>(
        "/ai/recommendations",
        { query: trimmed, language, maxResults: 5 }
      );

      if (response.data?.success && response.data?.data) {
        const recommendations = response.data.data.recommendations || [];
        setResults(recommendations);
        if (recommendations.length === 0) {
          setError(
            language === "am"
              ? "ከጥያቄዎ ጋር የሚዛመድ አገልግሎት አልተገኘም። እባክዎ በተለየ መንገድ ይሞክሩ።"
              : "No matching services found. Try describing your need differently."
          );
        }
      } else {
        setError(language === "am" ? "ምንም ውጤት አልተገኘም" : "No results found");
      }
    } catch (err) {
      const msg = getErrorMessage(err, language === "am" ? "ምክሮች መጫን አልተሳካም" : "Failed to load recommendations");
      setError(msg);
      toast({ variant: "error", title: language === "am" ? "ስህተት" : "Error", description: msg });
    } finally {
      setLoading(false);
    }
  }, [query, language, toast]);

  const handlePopularClick = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await api.get("/ai/recommendations/popular");
      if (response.data?.success && response.data?.data) {
        const recommendations = response.data.data.recommendations || [];
        setResults(recommendations);
      }
    } catch (err) {
      setError(language === "am" ? "ታዋቂ አገልግሎቶች መጫን አልተሳካም" : "Failed to load popular services");
    } finally {
      setLoading(false);
    }
  }, [language]);

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return language === "am" ? "ከፍተኛ" : "High";
    if (score >= 50) return language === "am" ? "መካከለኛ" : "Medium";
    return language === "am" ? "ዝቅተኛ" : "Low";
  };

  return (
    <Card variant="glass" className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ethiopia-yellow/10 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-ethiopia-yellow" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {language === "am" ? "AI አገልግሎት ምክር" : "AI Service Recommendations"}
            </CardTitle>
            <CardDescription className="text-xs">
              {language === "am"
                ? "ምን አይነት አገልግሎት እንደሚፈልጉ ይግለጹ፣ AI ይመክራል"
                : "Describe what you need, AI will recommend the best service"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch}>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  language === "am"
                    ? "ምን አገልግሎት ይፈልጋሉ? ለምሳሌ: የልደት ሰርተፍኬት ማውጣት እፈልጋለሁ"
                    : "What service do you need? e.g., I need a birth certificate for my child"
                }
                className="pl-10 h-11 text-sm"
                maxLength={1000}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                size="default"
                loading={loading}
                disabled={!query.trim()}
                leftIcon={loading ? undefined : <Sparkles className="h-4 w-4" />}
              >
                {language === "am" ? "ምክር አግኝ" : "Recommend"}
              </Button>
              <Button
                type="button"
                variant="glass"
                size="default"
                onClick={handlePopularClick}
                disabled={loading}
                leftIcon={<Star className="h-4 w-4" />}
              >
                {language === "am" ? "ታዋቂ" : "Popular"}
              </Button>
            </div>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-secondary/10">
                <Skeleton variant="circular" width={44} height={44} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="w-1/2 h-5" />
                  <Skeleton variant="text" className="w-3/4 h-4" />
                  <Skeleton variant="text" className="w-full h-4" />
                  <div className="flex gap-3 pt-1">
                    <Skeleton variant="text" className="w-20 h-4" />
                    <Skeleton variant="text" className="w-24 h-4" />
                    <Skeleton variant="text" className="w-16 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && hasSearched && !loading && (
          <Alert variant="warning" dismissible onDismiss={() => setError(null)}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            <Button variant="outline" size="sm" onClick={handlePopularClick} className="ml-2">
              {language === "am" ? "ታዋቂ አገልግሎቶች" : "Popular Services"}
            </Button>
          </Alert>
        )}

        {/* Results */}
        {results.length > 0 && !loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">
                {language === "am"
                  ? `${results.length} ምክሮች ተገኝተዋል`
                  : `${results.length} recommendations found`}
              </span>
            </div>

            {results.map((rec, index) => (
              <Card
                key={index}
                variant="glass"
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  index === 0 && "border-primary/30 ring-1 ring-primary/10"
                )}
              >
                {index === 0 && (
                  <div className="bg-gradient-to-r from-primary to-emerald-500 px-4 py-1">
                    <p className="text-[11px] font-bold text-white text-center flex items-center justify-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {language === "am" ? "ምርጥ ምክር" : "Top Recommendation"}
                    </p>
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Service Info */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-extrabold">
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
                      </div>

                      {/* Reasoning */}
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          {language === "am" ? "ለምን ይህ ምክር?" : "Why this?"}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {language === "am" ? rec.reasoningAmharic : rec.reasoning}
                        </p>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        {rec.totalFee > 0 && (
                          <span className="flex items-center gap-1 font-semibold">
                            <Coins className="h-3.5 w-3.5 text-ethiopia-yellow" />
                            {rec.totalFee.toLocaleString()} ETB
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          {language === "am" ? rec.processingTimeAmharic : rec.processingTime}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <ListChecks className="h-3.5 w-3.5 text-ethiopia-green" />
                          {rec.steps.length} {language === "am" ? "ደረጃዎች" : "steps"}
                        </span>
                      </div>

                      {/* Required Documents (compact) */}
                      {rec.requiredDocuments.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rec.requiredDocuments.slice(0, 4).map((doc, i) => (
                            <Badge key={i} variant="secondary" size="sm" className="text-[10px]">
                              {doc.isMandatory ? "•" : "◦"}{" "}
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
                      {rec.nextActions.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                            {language === "am" ? "ቀጣይ እርምጃዎች" : "Next Steps"}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(language === "am" ? rec.nextActionsAmharic : rec.nextActions).map((action, i) => (
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
                    <div className="sm:w-48 space-y-2 flex-shrink-0">
                      <Link to={`/services/${rec.serviceSlug}`}>
                        <Button variant="primary" size="sm" className="w-full gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          {language === "am" ? "ዝርዝር" : "Details"}
                          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                        </Button>
                      </Link>
                      <Link to={`/apply/${rec.serviceSlug}`}>
                        <Button variant="glass" size="sm" className="w-full gap-1.5 text-xs">
                          {language === "am" ? "አሁን ያመልክቱ" : "Apply Now"}
                        </Button>
                      </Link>

                      {rec.alternativeServices.length > 0 && (
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
            ))}
          </div>
        )}

        {/* Empty state */}
        {!hasSearched && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-ethiopia-yellow/10 flex items-center justify-center">
              <Search className="h-8 w-8 text-ethiopia-yellow/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              {language === "am"
                ? "ምን አገልግሎት እንደሚፈልጉ ይግለጹ፣ AI በጣም ጥሩውን ምክር ይሰጣል።"
                : "Describe what service you need above, and AI will find the best match for you."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIServiceRecommender;