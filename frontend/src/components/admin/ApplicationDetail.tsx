import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge, getStatusLabel } from "@/components/shared/StatusBadge";
import { PDFDownload } from "@/components/pdf/PDFDownload";
import { StatusUpdateModal } from "./StatusUpdateModal";
import { LoadingSpinner, PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  User,
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  X,
  Eye,
  Upload,
  ShieldCheck,
  ShieldX,
  RefreshCw,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  Hash,
} from "lucide-react";
import { formatDate, formatCurrency, formatPhoneNumber } from "@/utils/formatters";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import type { IApplication } from "@/types/application.types";
import type { IService } from "@/types/service.types";
import type { ApiResponse } from "@/types/api.types";

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<IApplication | null>(null);
  const [service, setService] = useState<IService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [language] = useState<"en" | "am">(storage.getLanguage());

  const fetchApplication = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<IApplication>>(`/applications/${id}`);
      if (response.data.success) {
        setApplication(response.data.data);
        // Fetch service details
        const serviceId = response.data.data.service;
        if (serviceId) {
          const serviceRes = await api.get<ApiResponse<IService>>(`/services/${serviceId}`);
          if (serviceRes.data.success) setService(serviceRes.data.data);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchApplication(); }, [fetchApplication]);

  const handleStatusUpdated = (updated: IApplication) => {
    setApplication(updated);
    setStatusModalOpen(false);
  };

  const handleVerifyDocument = async (documentId: string, isVerified: boolean) => {
    try {
      const response = await api.patch(
        `/applications/${id}/documents/${documentId}/verify`,
        { isVerified, notes: isVerified ? "Document verified" : "Document rejected" }
      );
      if (response.data.success) {
        setApplication(response.data.data);
        toast({
          variant: isVerified ? "success" : "warning",
          title: language === "am" ? (isVerified ? "ሰነድ ተረጋግጧል" : "ሰነድ ውድቅ ተደርጓል") : (isVerified ? "Document Verified" : "Document Rejected"),
        });
      }
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err?.message });
    }
  };

  if (loading) return <PageLoader />;
  if (error) return (
    <div className="text-center py-16">
      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
      <h2 className="text-xl font-bold mb-2">{language === "am" ? "ስህተት" : "Error"}</h2>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button variant="primary" onClick={fetchApplication}>{language === "am" ? "እንደገና ሞክር" : "Retry"}</Button>
      <Button variant="outline" onClick={() => navigate(-1)} className="ml-2">{language === "am" ? "ወደ ኋላ" : "Go Back"}</Button>
    </div>
  );
  if (!application) return null;

  const applicant = application.applicantInfo;
  const address = application.address;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {language === "am" ? "ማመልከቻ ዝርዝር" : "Application Detail"}
            </h1>
            <p className="text-sm text-muted-foreground font-mono text-primary">
              {application.trackingNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {service && (
            <PDFDownload
              application={application}
              service={service}
              language={language}
              variant="dropdown"
              size="sm"
            />
          )}
          <Button variant="primary" onClick={() => setStatusModalOpen(true)}>
            {language === "am" ? "ሁኔታ አዘምን" : "Update Status"}
          </Button>
        </div>
      </div>

      {/* Status Timeline */}
      <Card variant="glass">
        <CardHeader><CardTitle>{language === "am" ? "የሁኔታ ታሪክ" : "Status History"}</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/30" />
            <div className="space-y-4">
              {application.statusHistory.map((h, i) => (
                <div key={i} className="relative flex gap-4 pl-1">
                  <div className={cn("z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    h.status === "approved" || h.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                    h.status === "rejected" ? "bg-red-500/20 text-red-400" :
                    "bg-secondary/50 text-muted-foreground")}>
                    {i === 0 ? <Clock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.status as any} size="sm" />
                      {h.isAutomatic && <Badge variant="secondary" size="sm">Auto</Badge>}
                    </div>
                    <p className="text-sm mt-1">{h.notes}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(h.changedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Info & Address Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardHeader><div className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /><CardTitle>{language === "am" ? "የግል መረጃ" : "Personal Info"}</CardTitle></div></CardHeader>
          <CardContent className="space-y-3">
            {[
              { l: language === "am" ? "ሙሉ ስም" : "Full Name", v: applicant.fullName, a: applicant.fullNameAmharic },
              { l: language === "am" ? "ስልክ" : "Phone", v: formatPhoneNumber(applicant.phoneNumber), i: Phone },
              { l: language === "am" ? "ኢሜይል" : "Email", v: applicant.email || "—", i: Mail },
              { l: language === "am" ? "የትውልድ ቀን" : "Date of Birth", v: formatDate(applicant.dateOfBirth), i: Calendar },
              { l: language === "am" ? "ጾታ" : "Gender", v: applicant.gender === "male" ? (language === "am" ? "ወንድ" : "Male") : (language === "am" ? "ሴት" : "Female") },
              { l: language === "am" ? "የመታወቂያ ቁጥር" : "ID Number", v: applicant.idNumber || "—", i: Hash },
              { l: language === "am" ? "ሙያ" : "Occupation", v: applicant.occupation || "—" },
            ].map((r, i) => (
              <div key={i} className="flex justify-between text-sm"><span className="text-muted-foreground">{r.l}</span><span className="font-medium text-right">{r.v}</span></div>
            ))}
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardHeader><div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /><CardTitle>{language === "am" ? "አድራሻ" : "Address"}</CardTitle></div></CardHeader>
          <CardContent className="space-y-3">
            {[
              { l: language === "am" ? "ክልል" : "Region", v: address.region },
              { l: language === "am" ? "ዞን" : "Zone", v: address.zone },
              { l: language === "am" ? "ወረዳ" : "Woreda", v: address.woreda },
              { l: language === "am" ? "ቀበሌ" : "Kebele", v: address.kebele },
              { l: language === "am" ? "የቤት ቁጥር" : "House No", v: address.houseNumber || "—" },
              { l: language === "am" ? "ፖ.ሳ.ቁ" : "P.O. Box", v: address.poBox || "—" },
            ].map((r, i) => (
              <div key={i} className="flex justify-between text-sm"><span className="text-muted-foreground">{r.l}</span><span className="font-medium text-right">{r.v}</span></div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Documents */}
      {application.uploadedDocuments && application.uploadedDocuments.length > 0 && (
        <Card variant="glass">
          <CardHeader><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><CardTitle>{language === "am" ? "ሰነዶች" : "Documents"}</CardTitle></div></CardHeader>
          <CardContent className="space-y-2">
            {application.uploadedDocuments.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-3">
                  {doc.isVerified ? <ShieldCheck className="h-5 w-5 text-emerald-400" /> : <ShieldX className="h-5 w-5 text-yellow-400" />}
                  <div>
                    <p className="text-sm font-medium">{doc.documentType} - {doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!doc.isVerified && (
                    <>
                      <Button size="icon-sm" variant="ghost" onClick={() => handleVerifyDocument(doc._id, true)} className="text-emerald-400" title="Verify"><ShieldCheck className="h-4 w-4" /></Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => handleVerifyDocument(doc._id, false)} className="text-red-400" title="Reject"><ShieldX className="h-4 w-4" /></Button>
                    </>
                  )}
                  {doc.isVerified && <Badge variant="success" size="sm">{language === "am" ? "ተረጋግጧል" : "Verified"}</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Status Update Modal */}
      <StatusUpdateModal
        application={application}
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onUpdated={handleStatusUpdated}
        language={language}
      />
    </div>
  );
}

export default ApplicationDetail;