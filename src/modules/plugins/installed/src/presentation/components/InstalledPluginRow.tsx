"use client";

import Link from "next/link";
import { Button } from "@core/ui/button";
import { Puzzle, Settings, Activity } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { PluginHealthBadge } from "./PluginHealthBadge";
import { PluginStatusBadge } from "./PluginStatusBadge";
import type { PluginInstallation } from "../../domain/entities/PluginInstallation";

interface InstalledPluginRowProps {
  installation: PluginInstallation;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onUninstall: (id: string) => void;
  isMutating: boolean;
}

/**
 * Presentation UI component rendering the installed plugin row.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function InstalledPluginRow({
  installation,
  onActivate,
  onDeactivate,
  onUninstall,
  isMutating,
}: InstalledPluginRowProps) {
  const { t, language } = useI18n();
  const displayName =
    language === "ar"
      ? installation.pluginNameAr || installation.pluginName
      : installation.pluginName;

  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Puzzle className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{installation.pluginKey}</p>
          <p className="text-xs text-muted-foreground">
            {t("plugins.installedAt", { date: installation.installedAt.toLocaleDateString() })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PluginHealthBadge
          passing={installation.healthCheckPassing}
          lastCheckedAt={installation.lastHealthCheckAt}
        />
        <PluginStatusBadge installation={installation} />

        <Link href={`/plugins/${installation.id}/logs`}>
          <Button size="sm" variant="ghost" aria-label={t("plugins.viewLogs")}>
            <Activity className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/plugins/${installation.id}/settings`}>
          <Button size="sm" variant="ghost" aria-label={t("plugins.viewSettings")}>
            <Settings className="h-4 w-4" />
          </Button>
        </Link>

        {installation.isActive ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isMutating}
            onClick={() => onDeactivate(installation.id)}
          >
            {t("plugins.deactivate")}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            disabled={isMutating}
            onClick={() => onActivate(installation.id)}
          >
            {t("plugins.activate")}
          </Button>
        )}

        <Button
          size="sm"
          variant="destructive"
          disabled={isMutating}
          onClick={() => onUninstall(installation.id)}
        >
          {t("plugins.uninstall")}
        </Button>
      </div>
    </div>
  );
}
