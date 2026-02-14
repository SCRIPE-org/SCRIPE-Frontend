import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { TenantDetailPage } from "@modules/system/tenants/src/presentation/views/TenantDetailPage";

export const metadata: Metadata = {
  title: "Tenant Details | Verified",
  description: "View and manage tenant settings, roles, and permissions",
};

interface TenantPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { id } = await params;
  return (
    <main>
      <ModuleErrorBoundary moduleName="Tenant Details">
        <TenantDetailPage tenantId={id} />
      </ModuleErrorBoundary>
    </main>
  );
}
