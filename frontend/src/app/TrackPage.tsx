import React, { useState } from "react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GradientHeading } from "@/components/shared/GradientText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Search, AlertCircle, CheckCircle2, Clock, MapPin, FileText, ArrowRight } from "lucide-react";
import { storage } from "@/utils/storage";
import { formatDate, formatTrackingNumber } from "@/utils/formatters";
import api from "@/utils/api";
import type { ApplicationStatus } from "@/types/application.types";
import type { ApiResponse } from "@/types/api.types";

interface TrackResult {
  trackingNumber: string;
  serviceName: string;
  status: ApplicationStatus;
  submittedAt: string;
  estimatedCompletionDate: string | null;
  completedAt: string | null;
}

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const language = storage.getLanguage();

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const cleanTracking = trackingNumber.trim();
    if (!cleanTracking) {
      setError(language === "am" ? "እባክዎ የመከታተያ ቁጥር ያስገቡ" : "Please enter a tracking number");
      setResult(null);
      return;
    }

    if (!/^DNG-\d{6,}$/i.test(cleanTracking)) {
      setError(language === "am" ? "ትክክለኛ የመከታተያ ቁጥር ያስገቡ (ለምሳሌ DNG-00000001)" : "Enter a valid tracking number (e.g. DNG-00000001)");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.get<ApiResponse<TrackResult>>(
        `/public/applications/track/${cleanTracking}`
      );

      if (response.data.success && response.data.data) {
        setResult(response.data.data);
      } else {
        setError(
          language === "am"
            ? "ማመልከቻ አልተገኘም። የመከታተያ ቁጥርዎን ያረጋግጡ።"
            : "Application not found. Please check your tracking number."
        );
      }
    } catch (err: any) {
      if (err?.status === 404) {
        setError(
          language === "am"
            ? "ማመልከቻ አልተገኘም። የመከታተያ ቁጥርዎን ያረጋግጡ።"
            : "Application not found. Please verify your tracking number."
        );
      } else {
        setError(
          language === "am"
            ? "ማመልከቻ መፈለግ አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
            : "Failed to look up application. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="2xl" padding="default" className="py-12 lg:py-20">
      <div className="max-w-2xl mx-auto">
        <GradientHeading
          title="Track Your Application"
          titleAmharic="ማመልከቻዎን ይከታተሉ"
          subtitle={
            language === "am"
              ? "የማመልከቻዎን ሁኔታ ለማየት የመከታተያ ቁጥርዎን ያስገቡ።"
              : "Enter your tracking number to check the status of your application."
          }
          size="lg"
          align="center"
          className="mb-8"
        />

        {/* Search Form */}
        <form onSubmit={handleTrack} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={
                language === "am"
                  ? "የመከታተያ ቁጥር (ለምሳሌ DNG-00000001)"
                  : "Tracking number (e.g. DNG-00000001)"
              }
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              className="pl-11 h-12 text-lg font-mono uppercase tracking-wider"
              maxLength={20}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!trackingNumber.trim()}
            leftIcon={loading ? undefined : <Search className="h-5 w-5" />}
            className="min-w-[120px]"
          >
            {language === "am" ? "ፈልግ" : "Track"}
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <Alert variant="warning" className="mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-300" dismissible onDismiss={() => setError(null)}>
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text={language === "am" ? "በመፈለግ ላይ..." : "Searching..."} />
          </div>
        )}

        {/* Result Card */}
        {result && !loading && (
          <div className="animate-in fade-in-0 zoom-in-95 duration-300">
            <Card variant="glass" className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/80 to-primary p-1" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {language === "am" ? "የመከታተያ ቁጥር" : "Tracking Number"}
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-mono text-primary tracking-widest">
                      {formatTrackingNumber(result.trackingNumber)}
                    </p>
                  </div>
                  <StatusBadge status={result.status} size="lg" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {language === "am" ? "አገልግሎት" : "Service"}
                      </p>
                      <p className="text-sm font-semibold mt-0.5">{result.serviceName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {language === "am" ? "የቀረበበት ቀን" : "Submitted"}
                      </p>
                      <p className="text-sm font-semibold mt-0.5">
                        {formatDate(result.submittedAt, language)}
                      </p>
                    </div>
                  </div>

                  {result.estimatedCompletionDate && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {language === "am" ? "የሚጠበቀው ቀን" : "Estimated Completion"}
                        </p>
                        <p className="text-sm font-semibold mt-0.5">
                          {formatDate(result.estimatedCompletionDate, language)}
                        </p>
                      </div>
                    </div>
                  )}

                  {result.completedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {language === "am" ? "የተጠናቀቀበት ቀን" : "Completed"}
                        </p>
                        <p className="text-sm font-semibold mt-0.5">
                          {formatDate(result.completedAt, language)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Progress bar placeholder */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 rounded-full bg-secondary/50 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                      style={{
                        width:
                          result.status === "completed"
                            ? "100%"
                            : result.status === "approved"
                            ? "75%"
                            : result.status === "under_review"
                            ? "40%"
                            : result.status === "documents_requested"
                            ? "25%"
                            : "10%",
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.status === "completed" ? "100%" : result.status === "approved" ? "75%" : result.status === "under_review" ? "40%" : "10%"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Link to="/services">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      {language === "am" ? "አገልግሎቶችን ይመልከቱ" : "Browse Services"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="ghost" size="sm">
                      {language === "am" ? "ወደ መነሻ ገጽ" : "Go Home"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Container>
  );
}