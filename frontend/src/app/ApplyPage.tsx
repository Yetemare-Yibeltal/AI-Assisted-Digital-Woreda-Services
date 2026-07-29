import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ArrowLeft, AlertCircle, FileText } from "lucide-react";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import type { IService } from "@/types/service.types";
import type { ApiResponse } from "@/types/api.types";

export default function ApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<IService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const language = storage.getLanguage();
  const isAuthenticated = !!storage.getAccessToken();

  useEffect(() => {
    if (!slug) {
      setError(language === "am" ? "አገልግሎት አልተገኘም" : "Service not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = isAuthenticated
      ? `/services/slug/${slug}`
      : `/public/services/slug/${slug}`;

    api
      .get<ApiResponse<IService>>(endpoint)
      .then((response) => {
        if (response.data.success && response.data.data) {
          setService(response.data.data);
        } else {
          setError(language === "am" ? "አገልግሎት አልተገኘም" : "Service not found");
        }
      })
      .catch((err) => {
        console.error("Failed to load service for application:", err);
        setError(
          language === "am"
            ? "አገልግሎት መጫን አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
            : "Failed to load service details. Please try again."
        );
      })
      .finally(() => setLoading(false));
  }, [slug, language, isAuthenticated]);

  if (loading) {
    return (
      <Container maxWidth="xl" padding="default">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton variant="text" className="w-2/3 h-10" />
          <Skeleton variant="text" className="w-full h-5" />
          <Skeleton variant="rectangular" className="h-96 w-full rounded-xl" />
        </div>
      </Container>
    );
  }

  if (error || !service) {
    return (
      <Container maxWidth="md" padding="default" className="text-center py-20">
        <div className="glass-card p-8 max-w-lg mx-auto">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {language === "am" ? "አልተገኘም" : "Service Not Found"}
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex items-center justify-center gap-4">
            <Link to={`/services/${slug}`}>
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                {language === "am" ? "ወደ አገልግሎት ዝርዝር" : "Back to Service"}
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="primary">
                {language === "am" ? "ሁሉም አገልግሎቶች" : "All Services"}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" padding="default">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          {language === "am" ? "መነሻ" : "Home"}
        </Link>
        <span>/</span>
        <Link to="/services" className="hover:text-primary transition-colors">
          {language === "am" ? "አገልግሎቶች" : "Services"}
        </Link>
        <span>/</span>
        <Link to={`/services/${slug}`} className="hover:text-primary transition-colors truncate max-w-[200px]">
          {language === "am" ? service.nameAmharic : service.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {language === "am" ? "ማመልከቻ" : "Apply"}
        </span>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          {language === "am" ? "ማመልከቻ" : "Application"}:{" "}
          <span className="animated-gradient-text">
            {language === "am" ? service.nameAmharic : service.name}
          </span>
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === "am"
            ? "እባክዎ የሚፈለገውን መረጃ በትክክል ይሙሉ። ሁሉም መስኮች የግዴታ ካልሆነ በስተቀር መሞላት አለባቸው።"
            : "Please fill in all required information accurately. All fields are mandatory unless marked optional."}
        </p>
      </div>

      {/* Service Requirements Quick View */}
      <div className="mb-6">
        <Alert variant="info">
          <AlertDescription>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium mb-1">
                  {language === "am" ? "ከማመልከትዎ በፊት" : "Before you apply"}
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>
                    {language === "am"
                      ? `የሚያስፈልጉ ሰነዶች: ${service.requiredDocuments?.filter(d => d.isMandatory).length || 0} ግዴታ, ${service.requiredDocuments?.filter(d => !d.isMandatory).length || 0} አማራጭ`
                      : `Required documents: ${service.requiredDocuments?.filter(d => d.isMandatory).length || 0} mandatory, ${service.requiredDocuments?.filter(d => !d.isMandatory).length || 0} optional`}
                  </li>
                  <li>
                    {language === "am"
                      ? `ጠቅላላ ክፍያ: ${service.fees?.reduce((s, f) => s + f.amount, 0)?.toLocaleString() || 0} ETB`
                      : `Total fee: ${service.fees?.reduce((s, f) => s + f.amount, 0)?.toLocaleString() || 0} ETB`}
                  </li>
                  <li>
                    {language === "am"
                      ? `የማስኬጃ ጊዜ: ${service.processingTimeAmharic || service.processingTime}`
                      : `Processing time: ${service.processingTime}`}
                  </li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      {/* Application Form */}
      <ApplicationForm service={service} isAuthenticated={isAuthenticated} />
    </Container>
  );
}