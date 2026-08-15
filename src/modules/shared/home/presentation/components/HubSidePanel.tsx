"use client";

/**
 * HubSidePanel — Right-side panel with Today activity card + Recent items.
 *
 * The Today figure composes the core StatCard (built-in skeleton, trend arrow
 * vs. yesterday) and the Recent list sits on the core Card with the shared
 * EmptyState for its empty case — the panel never draws a number itself.
 * Accepts real activity data via props (from useHubActivity hook in parent).
 */

import React from "react";
import { Activity, History } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { StatCard } from "@core/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface HubSidePanelProps {
  todayCount: number;
  moduleCount: number;
  trendPercent: number;
  recentItems: Array<{
    icon: string;
    label: string;
    meta: string;
    accent: string;
  }>;
  isLoading?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HubSidePanel({
  todayCount,
  moduleCount,
  trendPercent,
  recentItems,
  isLoading = false,
}: HubSidePanelProps) {
  const { t } = useI18n();

  const modulesLabel =
    moduleCount === 1
      ? t("workspaceHub.today.modules_one")
      : t("workspaceHub.today.modules_other", { count: moduleCount });

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4">
      {/* Today activity — rising activity is good news, so no invertTrend. */}
      <StatCard
        label={t("workspaceHub.today.title")}
        value={todayCount.toLocaleString()}
        icon={Activity}
        tone="info"
        isLoading={isLoading}
        trend={{ value: trendPercent, label: t("workspaceHub.today.vsYesterday") }}
        subtitle={`${t("workspaceHub.today.actions")} ${modulesLabel}`}
      />

      {/* Recent items card */}
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-nx-ink-2">
            {t("workspaceHub.recent.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {recentItems.length === 0 && !isLoading && (
            <EmptyState size="sm" bare icon={History} title={t("workspaceHub.recent.empty")} />
          )}
          {recentItems.map((item, i) => (
            <RecentRow key={i} {...item} />
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}

// ── Recent row component ─────────────────────────────────────────────────────

function RecentRow({
  icon,
  label,
  meta,
  accent,
}: {
  icon: string;
  label: string;
  meta: string;
  accent: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-2.5 rounded-nx-md border border-transparent px-2.5 py-2 text-start transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
    >
      {/* Event chip keeps its data-driven tint — colour follows the audit
          event category via the shared chart-slot palette (@core/ui/chart),
          same wash+ink idiom as StatCard's tone tile. */}
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-nx-sm"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
          color: accent,
        }}
      >
        <DynamicIcon name={icon} size={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-nx-ink">{label}</span>
        <span className="text-[11px] text-nx-ink-3">{meta}</span>
      </span>
    </button>
  );
}
