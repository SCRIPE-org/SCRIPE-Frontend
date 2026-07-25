import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const CreateTenantView = dynamic(() =>
  import("@modules/identity/tenants/src/presentation/views/CreateTenantView").then((m) => ({
    default: m.CreateTenantView,
  }))
);

export const metadata: Metadata = {
  title: "Create Tenant",
  description: "Provision a new tenant organization on the SCRIPE platform",
};

export default function CreateTenantPage() {
  return (
    <ModuleErrorBoundary moduleName="tenant.createTitle">
      <CreateTenantView />
    </ModuleErrorBoundary>
  );
}
