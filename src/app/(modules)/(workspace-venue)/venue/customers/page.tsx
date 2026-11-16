import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ModulesLoadingSkeleton } from "@core/ui/layout/modules-loading-skeleton";
import { VenueCustomersView } from "@modules/venue/customers/src/presentation/views/VenueCustomersView";

export const metadata: Metadata = {
  title: "Customers | Venue",
  description: "View and manage venue customers, contact details, and bookings.",
};

export default function VenueCustomersPage() {
  return (
    <ModuleErrorBoundary moduleName="venue.customers">
      <Suspense fallback={<ModulesLoadingSkeleton variant="table" />}>
        <VenueCustomersView />
      </Suspense>
    </ModuleErrorBoundary>
  );
}
