import { Suspense } from "react";
import { DashboardLayout } from "@core/ui/layout/dashboard-layout";
import { ModulesLoadingSkeleton } from "@core/ui/layout/modules-loading-skeleton";

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <Suspense fallback={<ModulesLoadingSkeleton />}>{children}</Suspense>
    </DashboardLayout>
  );
}

