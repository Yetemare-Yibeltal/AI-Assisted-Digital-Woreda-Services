import React from "react";
import { Container } from "@/components/layout/Container";
import { ServiceList } from "@/components/services/ServiceList";
import { GradientHeading } from "@/components/shared/GradientText";
import { storage } from "@/utils/storage";

export default function ServicesPage() {
  const language = storage.getLanguage();

  return (
    <Container maxWidth="xl" padding="default">
      <GradientHeading
        title="All Services"
        titleAmharic="ሁሉም አገልግሎቶች"
        subtitle={
          language === "am"
            ? "የዳንግላ ወረዳ አገልግሎቶችን ይመልከቱ፣ ይፈልጉ እና ያጣሩ።"
            : "Browse, search, and filter all Dangila Woreda services."
        }
        size="lg"
        className="mb-6"
      />
      <ServiceList showFilters showSearch />
    </Container>
  );
}