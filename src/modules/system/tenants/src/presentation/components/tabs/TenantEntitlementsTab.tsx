"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { Loader2, CheckCircle2, Crown, Shield, Settings2 } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { cn } from "@core/common/utils";
import { TenantSubscriptionCard } from "../cards/TenantSubscriptionCard";

interface TenantEntitlementsTabProps {
      tenantId: string;
}

export function TenantEntitlementsTab({ tenantId }: TenantEntitlementsTabProps) {
      const { t, language, direction } = useI18n();
      const [activeSubTab, setActiveSubTab] = useState("features");

      return (
            <div className="space-y-6" dir={direction}>
                  <div className="mb-4">
                        <h3 className="text-lg font-semibold">{t("tenant.entitlementsTitle")}</h3>
                        <p className="text-sm text-muted-foreground">
                              {t("tenant.entitlementsDescription")}
                        </p>
                  </div>

                  {/* Subscription Plan Card — moved from Settings tab */}
                  <TenantSubscriptionCard tenantId={tenantId} />

                  <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                        <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1">
                              <TabsTrigger value="features" className="flex items-center gap-2">
                                    <Crown className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t("tenant.tabFeatures") || "Features"}</span>
                              </TabsTrigger>
                              <TabsTrigger value="overrides" className="flex items-center gap-2">
                                    <Settings2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t("tenant.tabOverrides") || "Overrides"}</span>
                              </TabsTrigger>
                              <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t("tenant.tabSubscriptionHistory") || "Subscriptions"}</span>
                              </TabsTrigger>
                        </TabsList>

                        <TabsContent value="features" className="mt-4">
                              <FeaturesGrid tenantId={tenantId} />
                        </TabsContent>

                        <TabsContent value="overrides" className="mt-4">
                              <LazyOverridesView tenantId={tenantId} />
                        </TabsContent>

                        <TabsContent value="subscriptions" className="mt-4">
                              <LazySubscriptionsView tenantId={tenantId} />
                        </TabsContent>
                  </Tabs>
            </div>
      );
}

// ─────────────────────────────────────────────────────────────────
// Features Grid (resolved features)
// ─────────────────────────────────────────────────────────────────

function FeaturesGrid({ tenantId }: { tenantId: string }) {
      const { t, language } = useI18n();
      const ITEMS_PER_PAGE = 10;
      const [page, setPage] = useState(1);
      const [search, setSearch] = useState("");

      const { data: features, isLoading, error } = useQuery({
            queryKey: ["tenant-entitlements", tenantId],
            queryFn: () => systemContainer.tenantRepository.getResolvedFeatures(tenantId),
      });

      const filtered = useMemo(() => {
            if (!features) return [];
            if (!search.trim()) return features;
            const q = search.toLowerCase();
            return features.filter((f: any) => {
                  const displayName =
                        (language === "ar" ? f.displayNameAr : f.displayNameEn) ||
                        f.name?.split(".").pop() || f.name;
                  return (
                        f.name?.toLowerCase().includes(q) ||
                        displayName?.toLowerCase().includes(q)
                  );
            });
      }, [features, search, language]);

      const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
      const safeCurrentPage = Math.min(page, totalPages);
      const paginated = useMemo(
            () => filtered.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE),
            [filtered, safeCurrentPage]
      );

      // Reset to page 1 when search changes
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
                  {/* Search */}
                  <div className="flex items-center gap-2">
                        <input
                              type="text"
                              value={search}
                              onChange={(e) => handleSearch(e.target.value)}
                              placeholder={t("common.search") || "Search features..."}
                              className="h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {filtered.length} {t("table.results") || "results"}
                        </span>
                  </div>

                  {/* Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {paginated.map((feature: any) => {
                              const displayName =
                                    (language === "ar" ? feature.displayNameAr : feature.displayNameEn) ||
                                    feature.name?.split(".").pop() ||
                                    feature.name;
                              const moduleName = feature.name?.split(".")[0] || "";

                              return (
                                    <div
                                          key={feature.featureId || feature.name}
                                          className="flex items-start gap-4 rounded-lg border border-border/50 bg-card p-4 transition-all hover:shadow-md"
                                    >
                                          <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                                                <CheckCircle2 className="h-5 w-5" />
                                          </div>
                                          <div className="flex-1 overflow-hidden">
                                                <h4 className="truncate font-medium" title={feature.name}>
                                                      {displayName}
                                                </h4>
                                                <p className="text-xs text-muted-foreground uppercase mt-1 tracking-wider">
                                                      {moduleName}
                                                </p>
                                          </div>
                                          <div className="shrink-0 flex items-center justify-end">
                                                {feature.valueType === "Boolean" ? (
                                                      <Badge variant={feature.value === "true" ? "success" : "secondary"}>
                                                            {feature.value === "true" ? t("tenants.enabled") : t("tenants.disabled")}
                                                      </Badge>
                                                ) : (
                                                      <Badge variant="outline" className="font-mono bg-muted/50">
                                                            {feature.value === "-1" ? "∞" : feature.value}
                                                      </Badge>
                                                )}
                                          </div>
                                    </div>
                              );
                        })}
                        {filtered.length === 0 && (
                              <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    {search ? t("common.noResults") : t("common.noData")}
                              </div>
                        )}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t pt-4">
                              <p className="text-sm text-muted-foreground">
                                    {t("common.page") || "Page"} {safeCurrentPage} / {totalPages}
                              </p>
                              <div className="flex items-center gap-1">
                                    <button
                                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                                          disabled={safeCurrentPage <= 1}
                                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
                                    >
                                          {t("common.previous") || "Previous"}
                                    </button>
                                    <button
                                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                          disabled={safeCurrentPage >= totalPages}
                                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
                                    >
                                          {t("common.next") || "Next"}
                                    </button>
                              </div>
                        </div>
                  )}
            </div>
      );
}

// ─────────────────────────────────────────────────────────────────
// Lazy-loaded sub-views from entitlements module (via standalone routes)
// These render inline within the tenant detail page
// ─────────────────────────────────────────────────────────────────

import dynamic from "next/dynamic";

const OverridesViewLazy = dynamic(
      () =>
            import("@modules/entitlements/overrides/src/presentation/views/OverridesView").then(
                  (m) => ({ default: m.OverridesView })
            ),
      {
            ssr: false,
            loading: () => (
                  <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
            ),
      }
);

const SubscriptionsViewLazy = dynamic(
      () =>
            import("@modules/entitlements/subscriptions/src/presentation/views/SubscriptionsView").then(
                  (m) => ({ default: m.SubscriptionsView })
            ),
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

function LazySubscriptionsView({ tenantId }: { tenantId: string }) {
      return <SubscriptionsViewLazy tenantId={tenantId} />;
}
