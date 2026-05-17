"use client";

import { Card, CardContent } from "@core/ui/card";
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
 * Pure presentational component.
 */
export function AppListingsStats({ stats, isLoading }: AppListingsStatsProps) {
  const cards = [
    { label: "Total Listings", value: stats.total, icon: Package, color: "text-blue-500" },
    { label: "Published", value: stats.published, icon: Globe, color: "text-green-500" },
    { label: "Featured", value: stats.featured, icon: Star, color: "text-yellow-500" },
    { label: "Drafts", value: stats.drafts, icon: FileEdit, color: "text-slate-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`p-2 rounded-lg bg-muted ${color}`}>
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              {isLoading ? (
                <div className="h-5 w-8 bg-muted animate-pulse rounded mt-0.5" />
              ) : (
                <p className="text-lg font-semibold leading-none">{value}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
