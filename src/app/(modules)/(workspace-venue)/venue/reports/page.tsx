import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { VenueReportsView } from "@modules/venue/reports/src/presentation/views/VenueReportsView";

export const metadata: Metadata = {
  title: "Reports & Analytics | Venue",
  description: "Operational metrics, revenue performance, and executive reports for your venue.",
};

export default function VenueReportsPage() {
  return (
    <ModuleErrorBoundary moduleName="venue.reports">
      <Suspense fallback={<LoadingSpinner showText={false} />}>
        <VenueReportsView />
      </Suspense>
    </ModuleErrorBoundary>
  );
}
