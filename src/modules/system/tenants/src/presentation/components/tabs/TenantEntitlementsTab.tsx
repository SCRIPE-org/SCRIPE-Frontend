"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { entitlementsContainer } from "@modules/entitlements/di";
import { Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { Badge } from "@core/ui/badge";

interface TenantEntitlementsTabProps {
      tenantId: string;
}

export function TenantEntitlementsTab({ tenantId }: TenantEntitlementsTabProps) {
      const { t, direction } = useI18n();

      const { data: features, isLoading, error } = useQuery({
            queryKey: ["tenant-entitlements", tenantId],
            queryFn: () => entitlementsContainer.featureRepository.getTenantResolvedFeatures(tenantId),
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
                        {t("common.errorLoading") || "Failed to load entitlements"}
                  </div>
            );
      }

      return (
            <div className="space-y-4" dir={direction}>
                  <div className="mb-4">
                        <h3 className="text-lg font-semibold">{t("tenant.entitlementsTitle") || "Active Entitlements"}</h3>
                        <p className="text-sm text-muted-foreground">
                              {t("tenant.entitlementsDescription") || "Features and limits currently granted to this tenant via its Subscription Edition or Parent inheritance."}
                        </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature: any) => (
                              <div
                                    key={feature.featureId}
                                    className="flex items-start gap-4 rounded-lg border border-border/50 bg-card p-4 transition-all hover:shadow-md"
                              >
                                    <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                                          <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                          <h4 className="truncate font-medium" title={feature.name}>
                                                {feature.name.split('.').pop() || feature.name}
                                          </h4>
                                          <p className="text-xs text-muted-foreground uppercase mt-1 tracking-wider">
                                                {feature.name.split('.')[0]} Module
                                          </p>
                                    </div>
                                    <div className="shrink-0 flex items-center justify-end">
                                          {feature.valueType === "Boolean" ? (
                                                <Badge variant={feature.value === "true" ? "success" : "secondary"}>
                                                      {feature.value === "true" ? "Enabled" : "Disabled"}
                                                </Badge>
                                          ) : (
                                                <Badge variant="outline" className="font-mono bg-muted/50">
                                                      {feature.value === "-1" ? "Unlimited" : feature.value}
                                                </Badge>
                                          )}
                                    </div>
                              </div>
                        ))}
                        {features.length === 0 && (
                              <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    No features found.
                              </div>
                        )}
                  </div>
            </div>
      );
}
