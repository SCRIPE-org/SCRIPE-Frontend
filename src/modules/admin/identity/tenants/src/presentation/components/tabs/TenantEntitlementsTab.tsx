// UI-EXCEPTION: compact studio layout
/**
 * Tenant Entitlements Tab — Redesigned
 *
 * Premium layout with subscription overview card (relocated from header)
 * and features grid with sub-tabs for Features, Overrides, Subscriptions.
 *
 * @module tenants
 */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantEntitlementsViewModel } from "../../viewmodels/useTenantEntitlementsViewModel";
import { CheckCircle2, Crown, Shield, Settings2, Search } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@core/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { cn } from "@core/common/utils";
import { TenantSubscriptionCard } from "../cards/TenantSubscriptionCard";

interface TenantEntitlementsTabProps {
  tenantId: string;
}

/**
 * Presentation UI component rendering the tenant entitlements tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantEntitlementsTab({ tenantId }: TenantEntitlementsTabProps) {
  const { t, direction } = useI18n();
  const router = useRouter();
  const isRtl = direction === "rtl";
  const [activeSubTab, setActiveSubTab] = useState("subscriptions");

  return (
    <div className="space-y-6" dir={direction}>
      {/* Section header */}
      <div>
        <h3 className="text-lg font-semibold">{t("tenant.entitlementsTitle")}</h3>
        <p className="text-sm text-nx-ink-2">{t("tenant.entitlementsDescription")}</p>
      </div>

      {/* Sub-tabs navigation */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList variant="pill" className="grid w-full grid-cols-3">
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("tenant.tabSubscriptionHistory")}</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Crown className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("tenant.tabFeatures")}</span>
          </TabsTrigger>
          <TabsTrigger value="overrides" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("tenant.tabOverrides")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-4">
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => router.push(`/entitlements/subscriptions/${tenantId}`)}
              >
                <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t("entSubscriptions.manage")}
              </Button>
            </div>
            <TenantSubscriptionCard tenantId={tenantId} />
          </div>
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <FeaturesGrid tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="overrides" className="mt-4">
          <LazyOverridesView tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Features Grid (redesigned)
// ─────────────────────────────────────────────────────────────────

function FeaturesGrid({ tenantId }: { tenantId: string }) {
  const { t, language, features, isLoading, error } = useTenantEntitlementsViewModel({
    tenantId,
  });
  const ITEMS_PER_PAGE = 12;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!features) return [];
    if (!search.trim()) return features;
    const q = search.toLowerCase();
    return features.filter((f: any) => {
      const displayName =
        (language === "ar" ? f.nameAr : f.nameEn) || f.key?.split(".").pop() || f.key;
      return f.key?.toLowerCase().includes(q) || displayName?.toLowerCase().includes(q);
    });
  }, [features, search, language]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE),
    [filtered, safeCurrentPage]
  );

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner size="sm" showText={false} />
      </div>
    );
  }

  if (error || !features) {
    return <ErrorMessage size="sm" message={t("common.errorLoading")} />;
  }

  return (
    <div className="space-y-4">
      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t("common.search")}
            className="h-9 ps-9"
          />
        </div>
        <Badge variant="outline" className="shrink-0 text-xs tabular-nums">
          {filtered.length} {t("table.results")}
        </Badge>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((feature: any) => {
          const displayName =
            (language === "ar" ? feature.nameAr : feature.nameEn) ||
            feature.key?.split(".").pop() ||
            feature.key;
          const moduleName = feature.key?.split(".")[0] || "";

          return (
            <div
              key={feature.featureId || feature.key}
              className={cn(
                "flex items-start gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4",
                "transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi motion-reduce:transition-none"
              )}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-wash">
                <CheckCircle2 className="h-4 w-4 text-nx-accent" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium" title={feature.key}>
                  {displayName}
                </h4>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-nx-ink-2">
                  {moduleName}
                </p>
              </div>
              <div className="shrink-0">
                {feature.valueType === "Boolean" ? (
                  <Badge
                    variant={feature.effectiveValue === "true" ? "success" : "secondary"}
                    className="text-xs"
                  >
                    {feature.effectiveValue === "true" ? t("tenant.enabled") : t("tenant.disabled")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-nx-raised font-mono text-xs tabular-nums">
                    {feature.effectiveValue === "-1" ? "∞" : feature.effectiveValue}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <EmptyState
            icon={Search}
            size="sm"
            className="col-span-full"
            title={search ? t("common.noResults") : t("common.noData")}
          />
        )}
      </div>

      {/* Pagination — composed from the core pagination primitives, which
          already flip their chevrons for RTL */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-nx-line pt-4">
          <p className="text-sm tabular-nums text-nx-ink-2">
            {t("common.page")} {safeCurrentPage} / {totalPages}
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={safeCurrentPage <= 1 || undefined}
                  tabIndex={safeCurrentPage <= 1 ? -1 : undefined}
                  className={cn("h-8", safeCurrentPage <= 1 && "pointer-events-none opacity-50")}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={safeCurrentPage >= totalPages || undefined}
                  tabIndex={safeCurrentPage >= totalPages ? -1 : undefined}
                  className={cn(
                    "h-8",
                    safeCurrentPage >= totalPages && "pointer-events-none opacity-50"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Lazy-loaded views
// ─────────────────────────────────────────────────────────────────

const OverridesViewLazy = dynamic(
  () =>
    import("@modules/entitlements/overrides/src/presentation/views/OverridesView").then((m) => ({
      default: m.OverridesView,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner size="sm" showText={false} />
      </div>
    ),
  }
);

function LazyOverridesView({ tenantId }: { tenantId: string }) {
  return <OverridesViewLazy tenantId={tenantId} />;
}
