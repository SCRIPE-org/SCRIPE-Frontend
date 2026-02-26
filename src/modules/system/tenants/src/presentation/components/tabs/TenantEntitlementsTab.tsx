"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { Loader2, CheckCircle2, Crown, Shield, Settings2 } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { cn } from "@core/common/utils";

interface TenantEntitlementsTabProps {
      tenantId: string;
}

export function TenantEntitlementsTab({ tenantId }: TenantEntitlementsTabProps) {
      const { t, language, direction } = useI18n();
      const [activeSubTab, setActiveSubTab] = useState("features");

      return (
            <div className="space-y-4" dir={direction}>
                  <div className="mb-4">
                        <h3 className="text-lg font-semibold">{t("tenant.entitlementsTitle")}</h3>
                        <p className="text-sm text-muted-foreground">
                              {t("tenant.entitlementsDescription")}
                        </p>
                  </div>

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

      const { data: features, isLoading, error } = useQuery({
            queryKey: ["tenant-entitlements", tenantId],
            queryFn: () => systemContainer.tenantRepository.getResolvedFeatures(tenantId),
      });

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature: any) => {
                        // Use displayName based on language, fall back to system name
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
                  {features.length === 0 && (
                        <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                              {t("common.noData")}
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
