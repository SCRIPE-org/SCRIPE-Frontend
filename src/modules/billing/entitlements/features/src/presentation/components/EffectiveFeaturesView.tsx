/**
 * EffectiveFeaturesView — Tenant's resolved features (edition + overrides).
 *
 * Groups features by category and displays edition, override, and effective values.
 * Used when the viewer is a tenant admin or during super admin drill-down.
 */
"use client";

import { useMemo } from "react";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { PageHeader } from "@core/ui/page-header";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { ArrowUpDown, Inbox, Layers3 } from "lucide-react";
import type { TenantEffectiveFeature } from "../../domain/entities/TenantEffectiveFeature";
import { FeatureValueBadge } from "./FeatureValueBadge";

interface EffectiveFeaturesViewProps {
  features: TenantEffectiveFeature[];
  isLoading: boolean;
  error: Error | null;
  t: (key: string) => string;
  language: string;
}

/**
 * Presentation UI component rendering the effective features view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function EffectiveFeaturesView({
  features,
  isLoading,
  error,
  t,
  language,
}: EffectiveFeaturesViewProps) {
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
      <div
        role="status"
        aria-busy="true"
        aria-label={t("common.loading")}
        className="space-y-4 p-6"
      >
        <Skeleton shape="title" />
        <Skeleton shape="block" className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={`${t("common.error")}: ${error.message}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        icon={Layers3}
        title={t("entitlements.features.effectiveTitle")}
        description={t("entitlements.features.effectiveDescription")}
      />

      {Object.entries(grouped).map(([category, categoryFeatures]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{category}</CardTitle>
            <CardDescription>
              {categoryFeatures.length} {t("entitlements.features.featureCount")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("entitlements.features.displayName")}</TableHead>
                  <TableHead>{t("entitlements.features.featureName")}</TableHead>
                  <TableHead className="text-center">
                    {t("entitlements.features.editionValue")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("entitlements.features.overrideValue")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("entitlements.features.effectiveValue")}
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
                      <span className="font-mono text-xs text-nx-ink-2">{feature.name}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <FeatureValueBadge
                        value={feature.editionValue}
                        valueType={feature.valueType}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {feature.hasOverride ? (
                        <Badge variant="warning">
                          <ArrowUpDown className="me-1 h-3 w-3" aria-hidden="true" />
                          {feature.overrideValue}
                        </Badge>
                      ) : (
                        <span className="text-nx-ink-3">—</span>
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
        <EmptyState icon={Inbox} title={t("entitlements.features.noFeatures")} size="lg" />
      )}
    </div>
  );
}
