/**
 * Tenant Detail Page Route Handler
 * 
 * Dynamic route for viewing and managing a single tenant.
 * This is the "Tenant World" - a full-page experience for managing tenant resources.
 */

import { TenantDetailPage } from "@modules/system/tenants/src/presentation/views/TenantDetailPage";

interface TenantPageProps {
      params: Promise<{ id: string }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
      const { id } = await params;
      return <TenantDetailPage tenantId={id} />;
}
