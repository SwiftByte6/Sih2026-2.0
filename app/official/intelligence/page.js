"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { IntelligenceHubView } from "@/components/intelligence/IntelligenceHubView";

export default function OfficialIntelligencePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-500 text-sm animate-pulse">
          Loading AICTE Intelligence Hub...
        </div>
      }
    >
      <AppShell
        role="official"
        breadcrumbs={[
          { label: "Dashboard", href: "/official/dashboard" },
          { label: "AICTE Intelligence Hub" },
        ]}
      >
        <IntelligenceHubView initialCaseId="rel-001" />
      </AppShell>
    </Suspense>
  );
}
