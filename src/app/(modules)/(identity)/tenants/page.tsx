import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { TooltipProvider } from "@core/ui/tooltip";

const TenantsView = dynamic(
  () => import("@/modules/identity/tenants").then((m) => ({ default: m.TenantsView }))
);

export const metadata: Metadata = {
  title: "Tenants | NEXORA",
  description: "Manage tenant organizations and their configurations",
};

export default function TenantsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Tenant Management">
        <TooltipProvider>
          <TenantsView />
        </TooltipProvider>
      </ModuleErrorBoundary>
    </main>
  );
}
