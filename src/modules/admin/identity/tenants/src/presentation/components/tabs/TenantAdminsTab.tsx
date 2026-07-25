/**
 * Tenant Admins Tab Component
 *
 * Manages administrators for a specific tenant using the shared AdminsView widget from the Admin module.
 *
 * @module tenants
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
// Correct usage: Import public view from Admin module public API
import { AdminsView } from "@modules/identity/core";

interface TenantAdminsTabProps {
  tenantId: string;
  tenantName: string;
}

/**
 * Presentation UI component rendering the tenant admins tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantAdminsTab({ tenantId, tenantName }: TenantAdminsTabProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-nx-ink">{t("tenant.manageAdmins")}</h3>
          <p className="text-sm text-nx-ink-2">{t("tenant.adminsDescription", { tenantName })}</p>
        </div>
      </div>

      {/* Use the shared widget with explicit tenant context */}
      <div className="overflow-hidden rounded-nx-lg border border-nx-line">
        <AdminsView tenantId={tenantId} />
      </div>
    </div>
  );
}
