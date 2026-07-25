"use client";

import { ScrollText, ArrowRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import Link from "next/link";
import { usePluginExecutionLogsViewModel } from "../viewmodels/usePluginExecutionLogsViewModel";

/**
 * PluginExecutionLogsView Component
 *
 * Renders list of installed plugins for log navigation.
 * Adheres to MVVM by consuming the usePluginExecutionLogsViewModel hook.
 */
export function PluginExecutionLogsView() {
  const { t } = useI18n();
  const { installations, isLoading } = usePluginExecutionLogsViewModel();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-nx-md" />
        ))}
      </div>
    );
  }

  if (!installations || installations.length === 0) {
    return (
      <EmptyState size="lg" icon={ScrollText} title={t("plugins.logsEmpty")} className="m-6" />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-nx-ink">{t("plugins.executionLogsTitle")}</h2>
        <p className="mt-1 text-xs text-nx-ink-3">{t("plugins.selectInstallationForLogs")}</p>
      </div>

      {installations.map((inst) => (
        <Link
          key={inst.id}
          href={`/plugins/${inst.id}/logs`}
          className="group flex items-center gap-3 rounded-nx-md border border-nx-line bg-nx-surface p-3 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi hover:bg-nx-hover motion-reduce:transition-none"
        >
          <ScrollText className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-nx-ink">{inst.pluginName}</p>
            <p className="truncate font-mono text-xs text-nx-ink-3">{inst.pluginKey}</p>
          </div>
          <Badge variant={inst.isActive ? "default" : "secondary"} className="shrink-0 text-[10px]">
            {inst.isActive ? t("plugins.active") : t("plugins.inactive")}
          </Badge>
          {/* Decorative: the whole row already navigates, so this is a hint,
              not a second control. */}
          <ArrowRight
            className="h-3.5 w-3.5 shrink-0 text-nx-ink-3 opacity-0 transition-opacity duration-nx-micro ease-nx-enter group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none rtl:rotate-180"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  );
}
