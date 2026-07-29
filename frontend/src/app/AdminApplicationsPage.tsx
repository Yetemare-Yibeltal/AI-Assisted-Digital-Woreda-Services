import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { StatusUpdateModal } from "@/components/admin/StatusUpdateModal";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import type { IApplication, ApplicationStatus } from "@/types/application.types";

export default function AdminApplicationsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const language = storage.getLanguage();
  const [selectedApp, setSelectedApp] = useState<IApplication | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const handleViewApplication = (application: IApplication) => {
    navigate(`/admin/applications/${application._id}`);
  };

  const handleStatusChange = (application: IApplication, newStatus: ApplicationStatus) => {
    setSelectedApp(application);
    setStatusModalOpen(true);
  };

  const handleStatusUpdated = (updatedApp: IApplication) => {
    setStatusModalOpen(false);
    setSelectedApp(null);
    toast({
      variant: "success",
      title: language === "am" ? "ሁኔታ ዘምኗል" : "Status Updated",
      description: language === "am"
        ? `ማመልከቻ ${updatedApp.trackingNumber} ሁኔታ ተቀይሯል።`
        : `Application ${updatedApp.trackingNumber} status has been updated.`,
    });
  };

  return (
    <Container maxWidth="xl" padding="default">
      <Header
        title="Applications"
        titleAmharic="ማመልከቻዎች"
        description={
          language === "am"
            ? "ሁሉንም የዜጎች ማመልከቻዎች ያስተዳድሩ።"
            : "Manage all citizen applications."
        }
        onCreateClick={() => navigate("/services")}
        onExportClick={() => toast({ title: "Export", description: "Coming soon" })}
      />

      <ApplicationsTable
        onViewApplication={handleViewApplication}
        onStatusChange={handleStatusChange}
      />

      {selectedApp && (
        <StatusUpdateModal
          application={selectedApp}
          open={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false);
            setSelectedApp(null);
          }}
          onUpdated={handleStatusUpdated}
          language={language}
        />
      )}
    </Container>
  );
}