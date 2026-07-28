import React, { useState, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormGlobalError } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { DocumentUploadFields } from "./DocumentUploadFields";
import { FormStepper } from "./FormStepper";
import { FormActions } from "./FormActions";
import {
  FileText,
  User,
  MapPin,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  Printer,
} from "lucide-react";
import api from "@/utils/api";
import { storage } from "@/utils/storage";
import type { IService } from "@/types/service.types";

const applicationSchema = z.object({
  applicantInfo: z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters").max(200),
    fullNameAmharic: z.string().min(3, "Full name in Amharic must be at least 3 characters").max(200),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
    phoneNumber: z.string().regex(/^(\+251|0)[9][0-9]{8}$/, "Valid Ethiopian phone number required"),
    email: z.string().email("Valid email required").optional().or(z.literal("")),
    idNumber: z.string().optional(),
    occupation: z.string().optional(),
  }),
  address: z.object({
    region: z.string().min(1, "Region is required"),
    zone: z.string().min(1, "Zone is required"),
    woreda: z.string().min(1, "Woreda is required"),
    kebele: z.string().min(1, "Kebele is required"),
    houseNumber: z.string().optional(),
    poBox: z.string().optional(),
  }),
  notes: z.string().max(1000).optional(),
  notificationPreference: z.enum(["sms", "email", "both"]).default("sms"),
  language: z.enum(["en", "am"]).default("am"),
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  service: IService;
  isAuthenticated?: boolean;
  className?: string;
}

const STEPS = [
  { id: 1, label: "Personal Info", labelAmharic: "የግል መረጃ", icon: User },
  { id: 2, label: "Address", labelAmharic: "አድራሻ", icon: MapPin },
  { id: 3, label: "Documents", labelAmharic: "ሰነዶች", icon: Upload },
  { id: 4, label: "Review & Submit", labelAmharic: "ይገምግሙ እና ያስገቡ", icon: CheckCircle },
];

export function ApplicationForm({ service, isAuthenticated = false, className }: ApplicationFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [language] = useState<"en" | "am">(storage.getLanguage());
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicantInfo: {
        fullName: "",
        fullNameAmharic: "",
        dateOfBirth: "",
        gender: "male",
        phoneNumber: "",
        email: "",
        idNumber: "",
        occupation: "",
      },
      address: {
        region: "Amhara",
        zone: "Awi",
        woreda: "Dangila",
        kebele: "",
        houseNumber: "",
        poBox: "",
      },
      notes: "",
      notificationPreference: "sms",
      language: language,
      termsAccepted: false,
    },
  });

  const { handleSubmit, trigger, watch } = form;

  const validateStep = useCallback(async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return trigger([
          "applicantInfo.fullName",
          "applicantInfo.fullNameAmharic",
          "applicantInfo.dateOfBirth",
          "applicantInfo.gender",
          "applicantInfo.phoneNumber",
        ]);
      case 2:
        return trigger([
          "address.region",
          "address.zone",
          "address.woreda",
          "address.kebele",
        ]);
      case 3:
        return true;
      case 4:
        return trigger(["termsAccepted"]);
      default:
        return true;
    }
  }, [trigger]);

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (valid && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setLoading(true);
    try {
      const endpoint = isAuthenticated ? "/applications" : "/public/applications";
      const payload = {
        ...data,
        service: service._id,
        language: language,
      };

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        setTrackingNumber(response.data.data.trackingNumber);
        setApplicationId(response.data.data.applicationId);
        setSubmitted(true);

        toast({
          variant: "success",
          title: language === "am" ? "ማመልከቻ ተልኳል!" : "Application Submitted!",
          description: language === "am"
            ? `የእርስዎ የመከታተያ ቁጥር: ${response.data.data.trackingNumber}`
            : `Your tracking number: ${response.data.data.trackingNumber}`,
          duration: 10000,
        });
      }
    } catch (error: any) {
      const message = error?.message || (language === "am" ? "ማመልከቻ መላክ አልተሳካም" : "Failed to submit application");
      toast({
        variant: "error",
        title: language === "am" ? "ስህተት" : "Error",
        description: message,
      });
      console.error("Application submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (applicationId) {
      navigate(`/admin/applications/${applicationId}?print=true`);
    }
  };

  if (submitted) {
    return (
      <div className={cn("max-w-2xl mx-auto", className)}>
        <Card variant="glass" className="text-center py-12">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold mb-2">
                {language === "am" ? "ማመልከቻ በተሳካ ሁኔታ ተልኳል!" : "Application Submitted Successfully!"}
              </h2>
              <p className="text-muted-foreground">
                {language === "am"
                  ? "እባክዎ የመከታተያ ቁጥርዎን ያስቀምጡ።"
                  : "Please save your tracking number for future reference."}
              </p>
            </div>

            <Card variant="flat" className="inline-block mx-auto px-8 py-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {language === "am" ? "የመከታተያ ቁጥር" : "Tracking Number"}
              </p>
              <p className="text-2xl font-extrabold text-primary tabular-nums tracking-widest">
                {trackingNumber}
              </p>
            </Card>

            <Alert variant="info" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {language === "am"
                  ? "የማመልከቻዎ ሁኔታ ሲለወጥ በስልክ ቁጥርዎ ማሳወቂያ ይደርስዎታል።"
                  : "You will be notified via SMS when your application status changes."}
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button variant="primary" onClick={handlePrintReceipt} leftIcon={<Printer className="h-4 w-4" />}>
                {language === "am" ? "ደረሰኝ አትም" : "Print Receipt"}
              </Button>
              <Button variant="glass" onClick={() => navigate("/track")} leftIcon={<Search className="h-4 w-4" />}>
                {language === "am" ? "ማመልከቻ ይከታተሉ" : "Track Application"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                {language === "am" ? "ወደ መነሻ ገጽ" : "Go Home"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("max-w-3xl mx-auto", className)}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) setCurrentStep(step);
            }}
            language={language}
          />

          <div className="mt-6 space-y-6">
            {currentStep === 1 && (
              <Card variant="glass" className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{language === "am" ? "የግል መረጃ" : "Personal Information"}</CardTitle>
                      <CardDescription>
                        {language === "am"
                          ? "እባክዎ ትክክለኛ የግል መረጃዎን ያስገቡ።"
                          : "Please provide your accurate personal information."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <PersonalInfoFields language={language} />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card variant="glass" className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <CardTitle>{language === "am" ? "አድራሻ" : "Address"}</CardTitle>
                      <CardDescription>
                        {language === "am"
                          ? "የአድራሻ መረጃዎን ያስገቡ።"
                          : "Enter your address details."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AddressFields language={language} />
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card variant="glass" className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle>{language === "am" ? "ሰነዶች" : "Documents"}</CardTitle>
                      <CardDescription>
                        {language === "am"
                          ? "የሚያስፈልጉትን ሰነዶች ያያይዙ።"
                          : "Attach the required documents."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DocumentUploadFields
                    requiredDocuments={service.requiredDocuments || []}
                    uploadedFiles={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    language={language}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card variant="glass" className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle>{language === "am" ? "ይገምግሙ እና ያስገቡ" : "Review & Submit"}</CardTitle>
                      <CardDescription>
                        {language === "am"
                          ? "እባክዎ መረጃዎን ይገምግሙና ያስገቡ።"
                          : "Please review your information and submit."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {[
                      { label: "Full Name", value: watch("applicantInfo.fullName") },
                      { label: "Phone", value: watch("applicantInfo.phoneNumber") },
                      { label: "Date of Birth", value: watch("applicantInfo.dateOfBirth") },
                      { label: "Kebele", value: watch("address.kebele") },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value || "—"}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm cursor-pointer">
                          {language === "am"
                            ? "የቀረበው መረጃ ሁሉ እውነት መሆኑን አረጋግጣለሁ።"
                            : "I confirm that all provided information is true and accurate."}
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormGlobalError />
                </CardContent>
              </Card>
            )}
          </div>

          <FormActions
            currentStep={currentStep}
            totalSteps={4}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={currentStep === 4 ? handleSubmit(onSubmit) : undefined}
            loading={loading}
            language={language}
          />
        </form>
      </FormProvider>
    </div>
  );
}

export default ApplicationForm;