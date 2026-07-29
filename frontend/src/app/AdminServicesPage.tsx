import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { ServiceList } from "@/components/services/ServiceList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";

export default function AdminServicesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const language = storage.getLanguage();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Container maxWidth="xl" padding="default">
      <Header
        title="Services"
        titleAmharic="አገልግሎቶች"
        description={
          language === "am"
            ? "የወረዳ አገልግሎቶችን ያስተዳድሩ፣ ይፍጠሩ እና ያዘምኑ።"
            : "Manage, create, and update woreda services."
        }
        onCreateClick={() => navigate("/admin/services/create")}
        onExportClick={() => toast({ title: language === "am" ? "ኤክስፖርት" : "Export", description: "Coming soon" })}
        onFilterClick={() => setRefreshKey((k) => k + 1)}
      />
      <ServiceList key={refreshKey} showFilters showSearch variant="grid" />
    </Container>
  );
}