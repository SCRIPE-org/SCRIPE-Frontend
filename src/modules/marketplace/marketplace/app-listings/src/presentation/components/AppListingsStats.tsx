"use client";

import { StatCard, type StatTone } from "@core/ui/stat-card";
import { useI18n } from "@core/providers/i18n-provider";
import { Package, Globe, Star, FileEdit } from "lucide-react";

interface AppListingsStatsProps {
  stats: {
    total: number;
    published: number;
    featured: number;
    drafts: number;
  };
  isLoading: boolean;
}

/**
 * AppListingsStats
 *
 * Displays 4 key metrics for the app listings dashboard strip.
 * Pure presentational component — each figure rides the shared StatCard
 * anatomy (skeleton included) instead of a bespoke card.
 */
export function AppListingsStats({ stats, isLoading }: AppListingsStatsProps) {
  const { t } = useI18n();

  const cards: { label: string; value: number; icon: typeof Package; tone: StatTone }[] = [
    { label: t("marketplace.statsTotalListings"), value: stats.total, icon: Package, tone: "info" },
    {
      label: t("marketplace.statsPublished"),
      value: stats.published,
      icon: Globe,
      tone: "success",
    },
    {
      label: t("marketplace.listingsFeaturedBadge"),
      value: stats.featured,
      icon: Star,
      tone: "warning",
    },
    { label: t("marketplace.statsDrafts"), value: stats.drafts, icon: FileEdit, tone: "neutral" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, icon, tone }) => (
        <StatCard
          key={label}
          label={label}
          value={value.toLocaleString()}
          icon={icon}
          tone={tone}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
