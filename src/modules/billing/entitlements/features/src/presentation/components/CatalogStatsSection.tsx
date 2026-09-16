/**
 * CatalogStatsSection Component
 *
 * Renders the top KPI metrics section for the feature entitlement catalog.
 * Displays total features, total participating modules, enforced controls, and marketing-only flags.
 */
"use client";

import { useMemo } from "react";
import { Boxes, Layers3, Megaphone, ShieldCheck } from "lucide-react";
import { StatCard } from "@core/ui/stat-card";
import type { Feature } from "../../domain/entities/Feature";

/**
 * Properties for the CatalogStatsSection component.
 */
export interface CatalogStatsSectionProps {
  /** The collection of features in the catalog. */
  items: Feature[];
  /** Whether catalog data is currently loading. */
  loading: boolean;
  /** Localization dictionary lookup function. */
  t: (key: string) => string;
  /** Optional custom CSS class name. */
  className?: string;
}

/**
 * Renders the responsive KPI summary cards above the feature catalog grid.
 */
export function CatalogStatsSection({ items, loading, t, className }: CatalogStatsSectionProps) {
  const stats = useMemo(
    () => [
      {
        label: t("entitlements.features.totalFeatures"),
        value: items.length,
        icon: Boxes,
        tone: "neutral" as const,
      },
      {
        label: t("entitlements.features.totalModules"),
        value: new Set(items.map((feature) => feature.module)).size,
        icon: Layers3,
        tone: "info" as const,
      },
      {
        label: t("entitlements.features.enforcedFeatures"),
        value: items.filter((feature) => !feature.isMarketingOnly).length,
        icon: ShieldCheck,
        tone: "success" as const,
      },
      {
        label: t("entitlements.features.marketingFeatures"),
        value: items.filter((feature) => feature.isMarketingOnly).length,
        icon: Megaphone,
        tone: "warning" as const,
      },
    ],
    [items, t]
  );

  return (
    <section className={className ?? "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"}>
      {stats.map(({ label, value, icon, tone }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={icon}
          tone={tone}
          isLoading={loading}
        />
      ))}
    </section>
  );
}
