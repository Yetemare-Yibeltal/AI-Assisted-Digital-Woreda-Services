import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Clock,
  ListChecks,
  ArrowRight,
  FileText,
  CheckCircle2,
  Star,
  TrendingUp,
} from "lucide-react";

interface AIServiceCardProps {
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
  stepCount: number;
  documentCount: number;
  requiredDocuments: Array<{ name: string; nameAmharic: string; isMandatory: boolean }>;
  language?: "en" | "am";
  className?: string;
  featured?: boolean;
}

export function AIServiceCard({
  serviceName,
  serviceNameAmharic,
  serviceSlug,
  category,
  categoryAmharic,
  confidenceScore,
  reasoning,
  reasoningAmharic,
  totalFee,
  processingTime,
  processingTimeAmharic,
  stepCount,
  documentCount,
  requiredDocuments,
  language = "en",
  className,
  featured = false,
}: AIServiceCardProps) {
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

  const mandatoryDocs = requiredDocuments.filter((d) => d.isMandatory).length;

  return (
    <Card
      variant="glass"
      className={cn(
        "overflow-hidden transition-all duration-300 hover:border-primary/20 group",
        featured && "border-primary/30 ring-1 ring-primary/10",
        className
      )}
    >
      {featured && (
        <div className="bg-gradient-to-r from-primary to-emerald-500 px-4 py-1">
          <p className="text-[11px] font-bold text-white text-center flex items-center justify-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {language === "am" ? "ምርጥ ምክር" : "Top Recommendation"}
          </p>
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Left Content */}
          <div className="flex-1 space-y-3">
            {/* Title & Badges */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base sm:text-lg font-extrabold group-hover:text-primary transition-colors">
                  {language === "am" ? serviceNameAmharic : serviceName}
                </h3>
                <Badge
                  variant="outline"
                  size="sm"
                  className={cn("shrink-0", getConfidenceColor(confidenceScore))}
                >
                  {confidenceScore}% {getConfidenceLabel(confidenceScore)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="secondary" size="sm">
                  {language === "am" ? categoryAmharic : category?.replace(/_/g, " ")}
                </Badge>
                {featured && (
                  <Badge variant="warning" size="sm" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {language === "am" ? "የተመከረ" : "Recommended"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Reasoning */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === "am" ? reasoningAmharic : reasoning}
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs flex-wrap">
              {totalFee > 0 && (
                <span className="flex items-center gap-1.5 font-semibold">
                  <Coins className="h-4 w-4 text-ethiopia-yellow" />
                  {totalFee.toLocaleString()} ETB
                </span>
              )}
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4 text-blue-400" />
                {language === "am" ? processingTimeAmharic : processingTime}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ListChecks className="h-4 w-4 text-ethiopia-green" />
                {stepCount} {language === "am" ? "ደረጃዎች" : "steps"}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-4 w-4 text-purple-400" />
                {mandatoryDocs} {language === "am" ? "ግዴታ ሰነዶች" : "mandatory docs"}
              </span>
            </div>

            {/* Required Documents Preview */}
            {requiredDocuments.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {requiredDocuments.slice(0, 4).map((doc, i) => (
                  <Badge key={i} variant="secondary" size="sm" className="text-[10px] gap-1">
                    {doc.isMandatory ? (
                      <CheckCircle2 className="h-2.5 w-2.5 text-ethiopia-red" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full border border-muted-foreground/30" />
                    )}
                    {language === "am" ? doc.nameAmharic : doc.name}
                  </Badge>
                ))}
                {requiredDocuments.length > 4 && (
                  <Badge variant="secondary" size="sm" className="text-[10px]">
                    +{requiredDocuments.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="sm:w-44 space-y-2 flex-shrink-0">
            <Link to={`/services/${serviceSlug}`}>
              <Button variant="primary" size="sm" className="w-full gap-1.5">
                <FileText className="h-4 w-4" />
                {language === "am" ? "ዝርዝር ይመልከቱ" : "View Details"}
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
            </Link>
            <Link to={`/apply/${serviceSlug}`}>
              <Button variant="glass" size="sm" className="w-full gap-1.5 text-xs">
                {language === "am" ? "አሁን ያመልክቱ" : "Apply Now"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AIServiceCard;