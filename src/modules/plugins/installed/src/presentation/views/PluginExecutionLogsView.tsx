"use client";

import { ScrollText, ArrowRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { useAppStore } from "@core/store/useAppStore";
import { pluginsContainer } from "@modules/plugins/di";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

/**
 * Global Execution Logs index — lists all active installations and links
 * to their per-installation log pages (/plugins/[installationId]/logs).
 * Full tenant-wide log aggregation is Phase 18 (BI Analytics).
 */
export function PluginExecutionLogsView() {
  const { t } = useI18n();
  const { user } = useAppStore();
  const tenantId = user?.tenantId ?? "";

  const { data: installations, isLoading } = useQuery({
    queryKey: ["installed-plugins-for-logs", tenantId],
    queryFn: () => pluginsContainer.installedRepository.getInstalled(tenantId),
    enabled: !!tenantId,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!installations || installations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <ScrollText className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("plugins.logsEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{t("plugins.executionLogsTitle")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("plugins.selectInstallationForLogs")}
        </p>
      </div>

      {installations.map((inst) => (
        <Link
          key={inst.id}
          href={`/plugins/${inst.id}/logs`}
          className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:bg-accent/40"
        >
          <ScrollText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{inst.pluginName}</p>
            <p className="font-mono text-xs text-muted-foreground">{inst.pluginKey}</p>
          </div>
          <Badge variant={inst.isActive ? "default" : "secondary"} className="shrink-0 text-[10px]">
            {inst.isActive ? t("plugins.active") : t("plugins.inactive")}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      ))}
    </div>
  );
}
