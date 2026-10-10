import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { VenueCustomersView } from "@modules/venue/customers/src/presentation/views/VenueCustomersView";

export const metadata: Metadata = {
  title: "Customers | Venue",
  description: "View and manage venue customers, contact details, and bookings.",
};

export default function VenueCustomersPage() {
  return (
    <ModuleErrorBoundary moduleName="venue.customers">
      <Suspense fallback={<LoadingSpinner showText={false} />}>
        <VenueCustomersView />
      </Suspense>
    </ModuleErrorBoundary>
  );
}
