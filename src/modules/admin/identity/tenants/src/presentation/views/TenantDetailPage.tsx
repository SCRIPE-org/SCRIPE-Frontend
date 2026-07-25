/**
 * Tenant Detail Page
 *
 * Main container for the "Tenant World" experience: PageHeader-based hero
 * (TenantHeader), StatCard KPI row (TenantStats), and pill-tab content
 * (TenantTabs) — the canonical "record that owns a page" composition.
 *
 * @module tenants
 */
"use client";

import dynamic from "next/dynamic";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";
import { Skeleton } from "@core/ui/skeleton";
import { ErrorMessage } from "@core/ui/error-message";
import { Button } from "@core/ui/button";
import { CurrencyDisplayToggle } from "@core/ui/currency-display-toggle";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantDetailViewModel } from "../viewmodels/useTenantDetailViewModel";

// Lazy-load heavy sub-sections
const TenantHeader = dynamic(
  () => import("../components/TenantHeader").then((m) => ({ default: m.TenantHeader })),
  { ssr: false }
);
const TenantStats = dynamic(
  () => import("../components/TenantStats").then((m) => ({ default: m.TenantStats })),
  { ssr: false }
);
const TenantTabs = dynamic(
  () => import("../components/TenantTabs").then((m) => ({ default: m.TenantTabs })),
  { ssr: false }
);

interface TenantDetailPageProps {
  tenantId: string;
}

/**
 * Presentation UI component rendering the tenant detail page.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantDetailPage({ tenantId }: TenantDetailPageProps) {
  const { t } = useI18n();
  const {
    tenant,
    loading,
    error,
    direction,
    handleBack,
    handleUpdate,
    handleEnter,
    breadcrumbSegments,
  } = useTenantDetailViewModel({ tenantId });

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <div className="space-y-5" dir={direction}>
        <Skeleton shape="title" className="h-8 w-48" />
        {/* Hero header skeleton */}
        <div className="space-y-4 rounded-nx-lg border border-nx-line p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-nx-md" />
            <div className="flex-1 space-y-3">
              <Skeleton shape="title" className="h-7 w-64" />
              <Skeleton shape="text" className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton shape="control" className="h-9 w-28" />
              <Skeleton shape="control" className="h-9 w-20" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-nx-lg" />
          ))}
        </div>
        {/* Tabs skeleton */}
        <div className="flex gap-1 pb-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} shape="control" className="w-28" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-nx-lg" />
      </div>
    );
  }

  // ── Error State ──
  if (error || !tenant) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" dir={direction}>
        <ErrorMessage message={error ?? t("tenant.notFound")} />
        <Button onClick={handleBack} variant="outline">
          {t("tenant.backToList")}
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen space-y-5" dir={direction}>
      {/* Breadcrumbs + Currency Toggle */}
      <div className="flex items-center justify-between">
        <PageBreadcrumbs segments={breadcrumbSegments} />
        <CurrencyDisplayToggle />
      </div>

      {/* Hero Header: tenant info, status banners, actions, subscription bar */}
      <TenantHeader tenant={tenant} onUpdate={handleUpdate} onEnter={handleEnter} />

      {/* KPI Stat Cards */}
      <TenantStats tenantId={tenantId} />

      {/* Pill-style Tabbed Content */}
      <TenantTabs
        tenantId={tenantId}
        tenantName={tenant.name}
        tenantCode={tenant.code}
        parentTenantId={tenant.parentId}
      />
    </main>
  );
}
