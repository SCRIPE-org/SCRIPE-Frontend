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
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import {
      Loader2,
      CheckCircle2,
      Crown,
      Shield,
      Settings2,
      Search,
      ChevronLeft,
      ChevronRight,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { cn } from "@core/common/utils";
import { TenantSubscriptionCard } from "../cards/TenantSubscriptionCard";

interface TenantEntitlementsTabProps {
      tenantId: string;
}

export function TenantEntitlementsTab({ tenantId }: TenantEntitlementsTabProps) {
      const { t, direction } = useI18n();
      const isRtl = direction === "rtl";
      const [activeSubTab, setActiveSubTab] = useState("subscriptions");

      return (
            <div className="space-y-6" dir={direction}>
                  {/* Section header */}
                  <div>
                        <h3 className="text-lg font-semibold">{t("tenant.entitlementsTitle")}</h3>
                        <p className="text-sm text-muted-foreground">
                              {t("tenant.entitlementsDescription")}
                        </p>
                  </div>

                  {/* Sub-tabs navigation */}
                  <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                        <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 rounded-lg">
                              <TabsTrigger
                                    value="subscriptions"
                                    className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                    <Shield className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                          {t("tenant.tabSubscriptionHistory") || "Subscriptions"}
                                    </span>
                              </TabsTrigger>
                              <TabsTrigger
                                    value="features"
                                    className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                    <Crown className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                          {t("tenant.tabFeatures") || "Features"}
                                    </span>
                              </TabsTrigger>
                              <TabsTrigger
                                    value="overrides"
                                    className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                    <Settings2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                          {t("tenant.tabOverrides") || "Overrides"}
                                    </span>
                              </TabsTrigger>
                        </TabsList>

                        <TabsContent value="subscriptions" className="mt-4">
                              <TenantSubscriptionCard tenantId={tenantId} />
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
      const { t, language, direction } = useI18n();
      const isRtl = direction === "rtl";
      const ITEMS_PER_PAGE = 12;
      const [page, setPage] = useState(1);
      const [search, setSearch] = useState("");

      const {
            data: features,
            isLoading,
            error,
      } = useQuery({
            queryKey: ["tenant-entitlements", tenantId],
            queryFn: () => systemContainer.tenantRepository.getResolvedFeatures(tenantId),
      });

      const filtered = useMemo(() => {
            if (!features) return [];
            if (!search.trim()) return features;
            const q = search.toLowerCase();
            return features.filter((f: any) => {
                  const displayName =
                        (language === "ar" ? f.nameAr : f.nameEn) ||
                        f.key?.split(".").pop() ||
                        f.key;
                  return (
                        f.key?.toLowerCase().includes(q) || displayName?.toLowerCase().includes(q)
                  );
            });
      }, [features, search, language]);

      const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
      const safeCurrentPage = Math.min(page, totalPages);
      const paginated = useMemo(
            () =>
                  filtered.slice(
                        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
                        safeCurrentPage * ITEMS_PER_PAGE
                  ),
            [filtered, safeCurrentPage]
      );

      const handleSearch = (val: string) => {
            setSearch(val);
            setPage(1);
      };

      if (isLoading) {
            return (
                  <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
            );
      }

      if (error || !features) {
            return (
                  <div className="flex h-32 items-center justify-center text-muted-foreground">
                        {t("common.errorLoading")}
                  </div>
            );
      }

      return (
            <div className="space-y-4">
                  {/* Search + count */}
                  <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                              <Search
                                    className={cn(
                                          "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                                          isRtl ? "right-3" : "left-3"
                                    )}
                              />
                              <Input
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder={t("common.search") || "Search features..."}
                                    className={cn("h-9", isRtl ? "pr-9" : "pl-9")}
                              />
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                              {filtered.length} {t("table.results") || "results"}
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
                                                "flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4",
                                                "transition-all duration-200 hover:border-border hover:shadow-sm"
                                          )}
                                    >
                                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate" title={feature.key}>
                                                      {displayName}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground uppercase mt-0.5 tracking-wider">
                                                      {moduleName}
                                                </p>
                                          </div>
                                          <div className="shrink-0">
                                                {feature.valueType === "Boolean" ? (
                                                      <Badge
                                                            variant={feature.effectiveValue === "true" ? "success" : "secondary"}
                                                            className="text-xs"
                                                      >
                                                            {feature.effectiveValue === "true"
                                                                  ? t("tenant.enabled") || "Enabled"
                                                                  : t("tenant.disabled") || "Disabled"}
                                                      </Badge>
                                                ) : (
                                                      <Badge variant="outline" className="font-mono text-xs bg-muted/50">
                                                            {feature.effectiveValue === "-1" ? "∞" : feature.effectiveValue}
                                                      </Badge>
                                                )}
                                          </div>
                                    </div>
                              );
                        })}
                        {filtered.length === 0 && (
                              <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                    {search ? t("common.noResults") : t("common.noData")}
                              </div>
                        )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                              <p className="text-sm text-muted-foreground">
                                    {t("common.page") || "Page"} {safeCurrentPage} / {totalPages}
                              </p>
                              <div className="flex items-center gap-1">
                                    <button
                                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                                          disabled={safeCurrentPage <= 1}
                                          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent h-8 px-3"
                                    >
                                          {isRtl ? (
                                                <ChevronRight className="h-4 w-4" />
                                          ) : (
                                                <ChevronLeft className="h-4 w-4" />
                                          )}
                                          <span className="ms-1">{t("common.previous") || "Previous"}</span>
                                    </button>
                                    <button
                                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                          disabled={safeCurrentPage >= totalPages}
                                          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent h-8 px-3"
                                    >
                                          <span className="me-1">{t("common.next") || "Next"}</span>
                                          {isRtl ? (
                                                <ChevronLeft className="h-4 w-4" />
                                          ) : (
                                                <ChevronRight className="h-4 w-4" />
                                          )}
                                    </button>
                              </div>
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
            import(
                  "@modules/entitlements/overrides/src/presentation/views/OverridesView"
            ).then((m) => ({ default: m.OverridesView })),
      {
            ssr: false,
            loading: () => (
                  <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
            ),
      }
);

function LazyOverridesView({ tenantId }: { tenantId: string }) {
      return <OverridesViewLazy tenantId={tenantId} />;
}
