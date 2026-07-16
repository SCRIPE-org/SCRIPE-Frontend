import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantsView = dynamic(() =>
  import("@modules/identity/tenants").then((m) => ({ default: m.TenantsView }))
);

export const metadata: Metadata = {
  title: "Tenants | SCRIPE",
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
