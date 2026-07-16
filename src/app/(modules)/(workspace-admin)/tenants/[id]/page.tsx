import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantDetailPage = dynamic(() =>
  import("@modules/identity/tenants/src/presentation/views/TenantDetailPage").then((m) => ({
    default: m.TenantDetailPage,
  }))
);

export const metadata: Metadata = {
  title: "Tenant Details | SCRIPE",
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
