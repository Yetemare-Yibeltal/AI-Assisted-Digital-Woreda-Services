import React from "react";
import { AppProvider } from "@/providers/AppProvider";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}