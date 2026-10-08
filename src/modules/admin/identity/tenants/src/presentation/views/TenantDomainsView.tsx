/**
 * TenantDomainsView — Dedicated Custom Domains Page for Workspace & Tenant Admins
 *
 * Provides a dedicated, full-surface interface for Tenant Administrators
 * to configure, verify, and manage custom vanity hostnames, DNS routing records,
 * and SSL/TLS certificates.
 *
 * Clean Architecture: View → ViewModel → Repository
 *
 * @module tenants
 */
"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { PageHeader } from "@core/ui/page-header";
import { EmptyState } from "@core/ui/empty-state";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Globe, Building2 } from "lucide-react";
import Link from "next/link";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { TenantDomainsTab } from "../components/tabs/TenantDomainsTab";

/**
 * Documentation for module export
 */
export function TenantDomainsView() {
  useModuleLocales(() => import("../../../locales"), "tenants");

  const { t, direction } = useI18n();
  const { activeTenantId, activeTenantName, isHydrated } = useAdminContext();

  if (!isHydrated) {
    return (
      <div className="space-y-6" dir={direction}>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!activeTenantId) {
    return (
      <div className="space-y-6" dir={direction}>
        <PageHeader
          title={t("tenant.domainsTitle")}
          description={t("tenant.domainsDescription", { name: "Tenant Workspace" })}
        />
        <EmptyState
          icon={Building2}
          title={t("tenant.tenantWorld")}
          description={t("tenant.enterToManage")}
          action={
            <Button asChild variant="outline" className="gap-2">
              <Link href="/tenants">
                <Globe className="h-4 w-4" aria-hidden="true" />
                {t("tenant.backToList")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={direction}>
      <PageHeader
        title={t("tenant.domainsTitle")}
        description={t("tenant.domainsDescription", {
          name: activeTenantName || "Workspace",
        })}
      />

      <TenantDomainsTab
        tenantId={activeTenantId}
        tenantName={activeTenantName || "Workspace"}
      />
    </div>
  );
}
