import React from "react";
import { Container } from "@/components/layout/Container";
import { ApplicationDetail } from "@/components/admin/ApplicationDetail";

export default function AdminApplicationDetailPage() {
  return (
    <Container maxWidth="xl" padding="default">
      <ApplicationDetail />
    </Container>
  );
}