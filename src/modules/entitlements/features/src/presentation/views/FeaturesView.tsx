/**
 * Features View
 *
 * Context-aware:
 * - System admin (no tenant): Global feature catalog (read-only CRUD table)
 * - Tenant admin / drill-down: Tenant's effective features (edition + overrides)
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useFeaturesViewModel } from "../viewmodels/useFeaturesViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { Feature } from "../../domain/entities/Feature";
import type { TenantEffectiveFeature } from "../../domain/entities/TenantEffectiveFeature";
import { Badge } from "@core/ui/badge";
import { format } from "date-fns";
import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
} from "@core/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { CheckCircle, XCircle, ArrowUpDown } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";

const VALUE_TYPE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
      Boolean: "default",
      Numeric: "secondary",
      String: "outline",
};

export function FeaturesView() {
  useModuleLocales(() => import("../../../../locales"), "entitlements-shared");
      const { t, language } = useI18n();
      const vm = useFeaturesViewModel();

      if (vm.isSystemCatalogMode && vm.catalogVm) {
            return <CatalogView vm={vm.catalogVm} t={t} language={language} />;
      }

      return (
            <EffectiveFeaturesView
                  features={vm.effectiveFeatures}
                  isLoading={vm.isLoadingEffective}
                  error={vm.effectiveError}
                  t={t}
                  language={language}
            />
      );
}

// ── System Admin: Global Feature Catalog ──────────────────────────────

function CatalogView({ vm, t, language }: { vm: any; t: any; language: string }) {
      const config: CrudConfig<Feature> = useMemo(
            () => ({
                  titleKey: "entitlements.features.title",
                  subtitleKey: "entitlements.features.description",
                  resource: "features",
                  hideAddButton: true,

                  columns: [
                        {
                              key: "displayNameAr",
                              label: t("entitlements.features.displayName"),
                              render: (_val: unknown, feature: Feature) =>
                                    feature.getDisplayName(language),
                              sortable: true,
                        },
                        {
                              key: "name",
                              label: t("entitlements.features.featureName"),
                              render: (value: string) => (
                                    <span className="text-xs text-muted-foreground font-mono">{value}</span>
                              ),
                        },
                        {
                              key: "module",
                              label: t("entitlements.features.module"),
                              render: (value: string) => (
                                    <Badge variant="secondary">{value}</Badge>
                              ),
                        },
                        {
                              key: "category",
                              label: t("entitlements.features.category"),
                              render: (_val: unknown, feature: Feature) =>
                                    feature.category ? (
                                          <Badge variant="secondary">{feature.category}</Badge>
                                    ) : (
                                          "-"
                                    ),
                        },
                        {
                              key: "valueType",
                              label: t("entitlements.features.valueType") || "Type",
                              render: (value: string) => (
                                    <Badge variant={VALUE_TYPE_COLORS[value] || "outline"}>{value}</Badge>
                              ),
                        },
                        {
                              key: "defaultValue",
                              label: t("entitlements.features.defaultValue") || "Default",
                        },
                        {
                              key: "createdAt",
                              label: t("common.createdAt") || "Created",
                              render: (value: string) =>
                                    value ? format(new Date(value), "MMM d, yyyy") : "-",
                        },
                  ],
                  getItemDisplayName: (feature: Feature) => feature.getDisplayName(language),
                  hideActionsColumn: true,
            }),
            [t, language]
      );

      return <GenericCrudView viewModel={vm} config={config} />;
}

// ── Tenant Admin / Drill-Down: Effective Features ─────────────────────

function EffectiveFeaturesView({
      features,
      isLoading,
      error,
      t,
      language,
}: {
      features: TenantEffectiveFeature[];
      isLoading: boolean;
      error: Error | null;
      t: any;
      language: string;
}) {
      // Group by category
      const grouped = useMemo(() => {
            const groups: Record<string, TenantEffectiveFeature[]> = {};
            for (const f of features) {
                  const cat = f.category || "General";
                  if (!groups[cat]) groups[cat] = [];
                  groups[cat].push(f);
            }
            return groups;
      }, [features]);

      if (isLoading) {
            return (
                  <div className="space-y-4 p-6">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-64 w-full" />
                  </div>
            );
      }

      if (error) {
            return (
                  <div className="p-6 text-destructive">
                        {t("common.error")}: {error.message}
                  </div>
            );
      }

      return (
            <div className="space-y-6 p-6">
                  <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                              {t("entitlements.features.effectiveTitle") || "My Features"}
                        </h1>
                        <p className="text-muted-foreground">
                              {t("entitlements.features.effectiveDescription") ||
                                    "Features resolved from your subscription edition and any overrides."}
                        </p>
                  </div>

                  {Object.entries(grouped).map(([category, categoryFeatures]) => (
                        <Card key={category}>
                              <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{category}</CardTitle>
                                    <CardDescription>
                                          {categoryFeatures.length} {t("entitlements.features.featureCount") || "features"}
                                    </CardDescription>
                              </CardHeader>
                              <CardContent>
                                    <Table>
                                          <TableHeader>
                                                <TableRow>
                                                      <TableHead>{t("entitlements.features.displayName") || "Feature"}</TableHead>
                                                      <TableHead>{t("entitlements.features.featureName") || "Key"}</TableHead>
                                                      <TableHead className="text-center">
                                                            {t("entitlements.features.editionValue") || "Edition Value"}
                                                      </TableHead>
                                                      <TableHead className="text-center">
                                                            {t("entitlements.features.overrideValue") || "Override"}
                                                      </TableHead>
                                                      <TableHead className="text-center">
                                                            {t("entitlements.features.effectiveValue") || "Effective"}
                                                      </TableHead>
                                                </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                                {categoryFeatures.map((feature) => (
                                                      <TableRow key={feature.featureId}>
                                                            <TableCell className="font-medium">
                                                                  {feature.getDisplayName(language)}
                                                            </TableCell>
                                                            <TableCell>
                                                                  <span className="text-xs text-muted-foreground font-mono">
                                                                        {feature.name}
                                                                  </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                  <FeatureValueBadge
                                                                        value={feature.editionValue}
                                                                        valueType={feature.valueType}
                                                                  />
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                  {feature.hasOverride ? (
                                                                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                                                                              <ArrowUpDown className="mr-1 h-3 w-3" />
                                                                              {feature.overrideValue}
                                                                        </Badge>
                                                                  ) : (
                                                                        <span className="text-muted-foreground">—</span>
                                                                  )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                  <FeatureValueBadge
                                                                        value={feature.effectiveValue}
                                                                        valueType={feature.valueType}
                                                                        isEffective
                                                                  />
                                                            </TableCell>
                                                      </TableRow>
                                                ))}
                                          </TableBody>
                                    </Table>
                              </CardContent>
                        </Card>
                  ))}

                  {features.length === 0 && (
                        <Card>
                              <CardContent className="py-12 text-center text-muted-foreground">
                                    {t("entitlements.features.noFeatures") || "No features found for your subscription."}
                              </CardContent>
                        </Card>
                  )}
            </div>
      );
}

// ── Value Badge Component ─────────────────────────────────────────────

function FeatureValueBadge({
      value,
      valueType,
      isEffective = false,
}: {
      value: string;
      valueType: string;
      isEffective?: boolean;
}) {
      if (valueType === "Boolean") {
            const isTrue = value.toLowerCase() === "true";
            return isTrue ? (
                  <CheckCircle className={`h-4 w-4 mx-auto ${isEffective ? "text-green-500" : "text-muted-foreground"}`} />
            ) : (
                  <XCircle className={`h-4 w-4 mx-auto ${isEffective ? "text-red-500" : "text-muted-foreground"}`} />
            );
      }

      return (
            <Badge variant={isEffective ? "default" : "secondary"}>
                  {value}
            </Badge>
      );
}
