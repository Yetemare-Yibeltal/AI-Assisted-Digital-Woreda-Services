import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { GradientHeading } from "@/components/shared/GradientText";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import { formatCurrency } from "@/utils/formatters";
import api from "@/utils/api";
import {
  Search,
  Sparkles,
  ArrowRight,
  FileText,
  Coins,
  Clock,
  ListChecks,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/shadcn-utils";
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

export default function AIRecommendPage() {
  const { toast } = useToast();
  const language = storage.getLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
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

      if (response.data.success && response.data.data) {
        setResults(response.data.data.recommendations || []);
      } else {
        setError(language === "am" ? "ምንም ውጤት አልተገኘም" : "No results found");
      }
    } catch (err) {
      const msg = getErrorMessage(err, language === "am" ? "ምክሮች መጫን አልተሳካም" : "Failed to load recommendations");
      setError(msg);
      toast({ variant: "error", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handlePopularClick = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await api.get("/ai/recommendations/popular");
      if (response.data.success && response.data.data) {
        setResults(response.data.data.recommendations || []);
      }
    } catch (err) {
      setError(language === "am" ? "ታዋቂ አገልግሎቶች መጫን አልተሳካም" : "Failed to load popular services");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10";
    if (score >= 50) return "text-yellow-400 bg-yellow-500/10";
    return "text-red-400 bg-red-500/10";
  };

  return (
    <Container maxWidth="4xl" padding="default" className="py-8">
      <GradientHeading
        title="AI Service Recommendations"
        titleAmharic="AI የአገልግሎት ምክሮች"
        subtitle={
          language === "am"
            ? "ምን አይነት አገልግሎት እንደሚፈልጉ ይግለጹ፣ AI በጣም ጥሩውን አማራጭ ያመላክታል።"
            : "Describe what you need, and AI will recommend the best service for you."
        }
        size="lg"
        className="mb-8"
      />

      {/* Search Form */}
      <Card variant="glass" className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={
                    language === "am"
                      ? "ምን አገልግሎት ይፈልጋሉ? (ለምሳሌ: የልደት ሰርተፍኬት ማውጣት እፈልጋለሁ)"
                      : "What service do you need? (e.g., I need to register my land)"
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-11 h-12 text-base"
                  autoFocus
                  maxLength={1000}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={!query.trim()}
                leftIcon={loading ? undefined : <Sparkles className="h-5 w-5" />}
              >
                {language === "am" ? "ምክር አግኝ" : "Get Recommendations"}
              </Button>
              <Button
                type="button"
                variant="glass"
                size="lg"
                onClick={handlePopularClick}
                disabled={loading}
              >
                {language === "am" ? "ታዋቂ" : "Popular"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} variant="glass">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-1/2 h-5" />
                    <Skeleton variant="text" className="w-3/4 h-4" />
                    <Skeleton variant="text" className="w-full h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && hasSearched && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="primary" onClick={handlePopularClick}>
            {language === "am" ? "ታዋቂ አገልግሎቶችን ይመልከቱ" : "View Popular Services"}
          </Button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">
              {language === "am" ? `${results.length} ምክሮች` : `${results.length} Recommendations`}
            </h2>
          </div>

          {results.map((rec, index) => (
            <Card
              key={index}
              variant="glass"
              className={cn(
                "overflow-hidden transition-all duration-300 hover:border-primary/30",
                index === 0 && "border-primary/30 ring-1 ring-primary/20"
              )}
            >
              {index === 0 && (
                <div className="bg-gradient-to-r from-primary to-emerald-500 px-4 py-1.5">
                  <p className="text-xs font-bold text-white text-center">
                    {language === "am" ? "ምርጥ ምክር" : "Top Recommendation"}
                  </p>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Service Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-extrabold">
                          {language === "am" ? rec.serviceNameAmharic : rec.serviceName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" size="sm">
                            {language === "am" ? rec.categoryAmharic : rec.category?.replace(/_/g, " ")}
                          </Badge>
                          <Badge
                            variant="secondary"
                            size="sm"
                            className={getConfidenceColor(rec.confidenceScore)}
                          >
                            {rec.confidenceScore}% {language === "am" ? "ተዛማጅ" : "match"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-sm font-medium text-primary mb-1">
                        {language === "am" ? "ለምን ይህ ምክር?" : "Why this recommendation?"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === "am" ? rec.reasoningAmharic : rec.reasoning}
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      {rec.totalFee > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Coins className="h-4 w-4 text-ethiopia-yellow" />
                          <span className="font-semibold">{rec.totalFee.toLocaleString()} ETB</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span>{language === "am" ? rec.processingTimeAmharic : rec.processingTime}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ListChecks className="h-4 w-4 text-ethiopia-green" />
                        <span>{rec.steps.length} {language === "am" ? "ደረጃዎች" : "steps"}</span>
                      </span>
                    </div>

                    {/* Next Actions */}
                    {rec.nextActions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {language === "am" ? "ቀጣይ እርምጃዎች" : "Next Steps"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(language === "am" ? rec.nextActionsAmharic : rec.nextActions).map((action, i) => (
                            <Badge key={i} variant="default" size="sm" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Actions */}
                  <div className="lg:w-56 space-y-3 flex-shrink-0">
                    <Link to={`/services/${rec.serviceSlug}`}>
                      <Button variant="primary" className="w-full gap-2">
                        <FileText className="h-4 w-4" />
                        {language === "am" ? "ዝርዝር ይመልከቱ" : "View Details"}
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </Link>
                    <Link to={`/apply/${rec.serviceSlug}`}>
                      <Button variant="glass" className="w-full gap-2">
                        {language === "am" ? "አሁን ያመልክቱ" : "Apply Now"}
                      </Button>
                    </Link>

                    {rec.alternativeServices && rec.alternativeServices.length > 0 && (
                      <div className="pt-3 border-t border-border/20">
                        <p className="text-xs text-muted-foreground mb-2">
                          {language === "am" ? "አማራጭ አገልግሎቶች" : "Alternatives"}
                        </p>
                        {rec.alternativeServices.slice(0, 3).map((alt, i) => (
                          <Link
                            key={i}
                            to={`/services/${alt.slug}`}
                            className="block text-xs text-primary hover:underline py-1"
                          >
                            {language === "am" ? alt.nameAmharic : alt.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state when no search yet */}
      {!hasSearched && !loading && (
        <div className="text-center py-16">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground text-lg">
            {language === "am"
              ? "ምን አገልግሎት እንደሚፈልጉ ይግለጹ፣ AI ይመክራል።"
              : "Describe what service you need above, and AI will recommend the best match."}
          </p>
        </div>
      )}
    </Container>
  );
}