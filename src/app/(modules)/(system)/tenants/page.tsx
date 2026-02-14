import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { TenantsView } from "@modules/system/tenants";

export const metadata: Metadata = {
  title: "Tenants | Verified",
  description: "Manage tenant organizations and their configurations",
};

export default function TenantsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Tenant Management">
        <TenantsView />
      </ModuleErrorBoundary>
    </main>
  );
}
