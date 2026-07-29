import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceRequirements } from "@/components/services/ServiceRequirements";
import { ServiceFees } from "@/components/services/ServiceFees";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import { GradientHeading } from "@/components/shared/GradientText";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  ArrowRight,
  Clock,
  Coins,
  ListChecks,
  FileText,
  HelpCircle,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import type { IService } from "@/types/service.types";
import type { ApiResponse } from "@/types/api.types";

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<IService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const language = storage.getLanguage();

  useEffect(() => {
    if (!slug) {
      setError("Service not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .get<ApiResponse<IService>>(`/public/services/slug/${slug}`)
      .then((response) => {
        if (response.data.success && response.data.data) {
          setService(response.data.data);
        } else {
          setError(language === "am" ? "አገልግሎት አልተገኘም" : "Service not found");
        }
      })
      .catch((err) => {
        console.error("Failed to load service:", err);
        setError(
          language === "am"
            ? "አገልግሎት መጫን አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
            : "Failed to load service. Please try again."
        );
      })
      .finally(() => setLoading(false));
  }, [slug, language]);

  if (loading) {
    return (
      <Container maxWidth="xl" padding="default">
        <div className="space-y-6">
          <Skeleton variant="text" className="w-2/3 h-10" />
          <Skeleton variant="text" className="w-full h-5" />
          <Skeleton variant="text" className="w-1/2 h-5" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton variant="rectangular" className="h-64 w-full rounded-xl" />
              <Skeleton variant="rectangular" className="h-64 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton variant="rectangular" className="h-48 w-full rounded-xl" />
              <Skeleton variant="rectangular" className="h-16 w-full rounded-xl" />
            </div>
          </div>
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
            {language === "am" ? "አልተገኘም" : "Not Found"}
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/services">
              <Button variant="primary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                {language === "am" ? "ወደ አገልግሎቶች" : "Back to Services"}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">
                {language === "am" ? "ወደ መነሻ ገጽ" : "Go Home"}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const totalFee = service.fees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
  const stepCount = service.steps?.length || 0;
  const mandatoryDocs =
    service.requiredDocuments?.filter((d) => d.isMandatory).length || 0;
  const optionalDocs =
    service.requiredDocuments?.filter((d) => !d.isMandatory).length || 0;

  return (
    <Container maxWidth="xl" padding="default">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary transition-colors">
          {language === "am" ? "መነሻ" : "Home"}
        </Link>
        <span>/</span>
        <Link to="/services" className="hover:text-primary transition-colors">
          {language === "am" ? "አገልግሎቶች" : "Services"}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">
          {language === "am" ? service.nameAmharic : service.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Header */}
          <div>
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-extrabold">
                {language === "am" ? service.nameAmharic : service.name}
              </h1>
              {service.isPopular && (
                <Badge variant="warning" size="sm" className="mt-1.5">
                  {language === "am" ? "ታዋቂ" : "Popular"}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-lg mt-2 leading-relaxed">
              {language === "am"
                ? service.descriptionAmharic
                : service.description}
            </p>

            {/* Quick Info Badges */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <Badge variant="secondary" size="sm" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {language === "am"
                  ? service.category?.replace(/_/g, " ")
                  : (service.category || "").replace(/_/g, " ")}
              </Badge>
              {totalFee > 0 && (
                <span className="text-sm flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-ethiopia-yellow" />
                  <span className="font-semibold">
                    {totalFee.toLocaleString()} ETB
                  </span>
                </span>
              )}
              <span className="text-sm flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="font-medium">
                  {language === "am"
                    ? service.processingTimeAmharic
                    : service.processingTime}
                </span>
              </span>
              <span className="text-sm flex items-center gap-1.5">
                <ListChecks className="h-4 w-4 text-ethiopia-green" />
                <span className="font-medium">
                  {stepCount}{" "}
                  {language === "am" ? "ደረጃዎች" : "steps"}
                </span>
              </span>
            </div>
          </div>

          <Separator />

          {/* Tabs for Steps, Documents, FAQ */}
          <Tabs defaultValue="steps" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="steps" className="gap-2">
                <ListChecks className="h-4 w-4" />
                {language === "am" ? "ደረጃዎች" : "Steps"} ({stepCount})
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                {language === "am" ? "ሰነዶች" : "Documents"} (
                {mandatoryDocs + optionalDocs})
              </TabsTrigger>
              <TabsTrigger value="fees" className="gap-2" badge={totalFee > 0 ? `${totalFee} ETB` : undefined}>
                <Coins className="h-4 w-4" />
                {language === "am" ? "ክፍያዎች" : "Fees"}
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="steps" className="mt-4">
              <ServiceSteps steps={service.steps} language={language} />
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <ServiceRequirements
                documents={service.requiredDocuments}
                language={language}
              />
            </TabsContent>

            <TabsContent value="fees" className="mt-4">
              <ServiceFees fees={service.fees} language={language} />
            </TabsContent>

            <TabsContent value="faq" className="mt-4">
              <ServiceFAQ language={language} />
            </TabsContent>
          </Tabs>

          {/* Eligibility */}
          {service.eligibility && (
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>
                    {language === "am" ? "ብቁነት" : "Eligibility"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {language === "am"
                    ? service.eligibilityAmharic
                    : service.eligibility}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Fee Summary Card */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-ethiopia-yellow" />
                {language === "am" ? "የክፍያ ማጠቃለያ" : "Fee Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalFee > 0 ? (
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-primary">
                    {totalFee.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">ETB</p>
                  {service.fees && service.fees.length > 0 && (
                    <div className="mt-4 space-y-2 text-left">
                      {service.fees.map((fee, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {language === "am" ? fee.nameAmharic : fee.name}
                          </span>
                          <span className="font-medium">
                            {fee.amount.toLocaleString()} {fee.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-emerald-400 font-semibold">
                    {language === "am" ? "ነጻ አገልግሎት" : "Free Service"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Time Card */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                {language === "am" ? "የማስኬጃ ጊዜ" : "Processing Time"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {language === "am"
                  ? service.processingTimeAmharic
                  : service.processingTime}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "am"
                  ? "ከማመልከቻ ማቅረቢያ ቀን ጀምሮ"
                  : "From the date of application submission"}
              </p>
            </CardContent>
          </Card>

          {/* Office Location */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-400" />
                {language === "am" ? "ቢሮ" : "Office"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Dangila Woreda Administration</p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === "am"
                  ? "ዳንግላ ከተማ፣ አዊ ዞን፣ አማራ ክልል"
                  : "Dangila Town, Awi Zone, Amhara Region"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === "am" ? "ሰኞ - አርብ፣ 8:30 AM - 5:30 PM" : "Mon - Fri, 8:30 AM - 5:30 PM"}
              </p>
            </CardContent>
          </Card>

          {/* Apply Button */}
          <Link to={`/apply/${service.slug}`}>
            <Button
              variant="primary"
              size="lg"
              className="w-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40"
            >
              <FileText className="h-5 w-5" />
              {language === "am" ? "አሁን ያመልክቱ" : "Apply Now"}
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </Link>

          {/* AI Help */}
          <Alert variant="info" className="text-sm">
            <AlertDescription>
              {language === "am"
                ? "ጥያቄ አለዎት? እርዳታ ለማግኘት የAI ረዳት ይጠቀሙ።"
                : "Have questions? Use the AI assistant for help."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Container>
  );
}