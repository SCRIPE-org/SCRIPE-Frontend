/**
 * Tenant Detail Page — Deep Redesign
 *
 * Main container for the "Tenant World" experience.
 * Premium layout with hero header, animated stat cards,
 * inline subscription bar, and pill-style tabbed content.
 *
 * @module tenants
 */
"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";
import { Skeleton } from "@core/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { CurrencyDisplayToggle } from "@core/ui/currency-display-toggle";

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

export function TenantDetailPage({ tenantId }: TenantDetailPageProps) {
  const router = useRouter();
  const { t, direction } = useI18n();
  const { enterTenantWorld } = useTenantContext();
  const queryClient = useQueryClient();

  const {
    data: tenant,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => systemContainer.tenantRepository.getById(tenantId),
    enabled: !!tenantId,
  });

  const error = queryError
    ? (queryError as Error).message
    : !loading && !tenant
      ? t("tenant.notFound") || "Tenant not found"
      : null;

  const handleBack = () => {
    router.push("/tenants");
  };

  const breadcrumbSegments = [
    { label: t("nav.tenants") || "Tenants", href: "/tenants" },
    ...(tenant ? [{ label: tenant.name }] : []),
  ];

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <div className="space-y-5" dir={direction}>
        <Skeleton className="h-8 w-48 rounded-lg" />
        {/* Hero header skeleton */}
        <div className="rounded-2xl border border-border/50 p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        {/* Tabs skeleton */}
        <div className="flex gap-1 pb-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  // ── Error State ──
  if (error || !tenant) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
        dir={direction}
      >
        <div className="rounded-2xl bg-destructive/10 p-6">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">{error || t("tenant.notFound")}</h2>
        <p className="text-muted-foreground">{t("tenant.errorLoadingDetails")}</p>
        <Button onClick={handleBack} variant="outline" className="rounded-xl">
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
      <TenantHeader
        tenant={tenant}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
        }}
        onEnter={() => {
          enterTenantWorld({
            id: tenant.id,
            name: tenant.name,
            parentId: tenant.parentId,
          });
          router.push("/");
        }}
      />

      {/* Animated Stat Cards */}
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
