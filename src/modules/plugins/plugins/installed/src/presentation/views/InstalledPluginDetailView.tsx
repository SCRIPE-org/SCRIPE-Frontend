"use client";

import Link from "next/link";
import { PluginFrame } from "@core/plugins/plugin-sdk/PluginFrame";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Separator } from "@core/ui/separator";
import {
  AlertTriangle,
  ArrowLeft,
  Settings,
  Activity,
  Puzzle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { PluginHealthBadge } from "../components/PluginHealthBadge";
import { PluginStatusBadge } from "../components/PluginStatusBadge";
import { useInstalledPluginDetailViewModel } from "../viewmodels/useInstalledPluginDetailViewModel";
import { formatUtc, formatDateTimeUtc } from "@core/common/utils";

interface InstalledPluginDetailViewProps {
  /** The PluginInstallation ID from the route segment [installationId]. */
  installationId: string;
}

/**
 * InstalledPluginDetailView (H-07)
 *
 * Full-page detail view for an installed plugin.
 * Embeds the plugin's own UI via PluginFrame SDK (postMessage bridge).
 *
 * Layout:
 *   ┌─ Back navigation
 *   ├─ Plugin header (icon, name, status, health)
 *   ├─ Plugin metadata card (key, install date, version)
 *   ├─ Action bar (Settings, Logs)
 *   └─ PluginFrame ← the plugin's own UI via sandbox iframe
 *
 * All state and API calls are delegated to useInstalledPluginDetailViewModel.
 */
export function InstalledPluginDetailView({ installationId }: InstalledPluginDetailViewProps) {
  const { t, language } = useI18n();
  const { installation, isLoading, isError, refetch } =
    useInstalledPluginDetailViewModel(installationId);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (isError || !installation) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{t("plugins.installedError")}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          {t("plugins.retry")}
        </Button>
      </div>
    );
  }

  const displayName =
    language === "ar"
      ? installation.pluginNameAr || installation.pluginName
      : installation.pluginName;

  // iconUrl = plugin branding logo. frontendUrl = plugin's embedded web app base URL.
  // These are distinct — only frontendUrl is used by PluginFrame.
  const hasFrontendUrl = !!installation.frontendUrl;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      {/* ── Back navigation ── */}
      <Link
        href="/plugins/installed"
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("plugins.backToInstalled")}
      </Link>

      {/* ── Plugin header card ── */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          {/* Plugin icon / initials */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
            {installation.iconUrl ? (
              <img
                src={installation.iconUrl}
                alt={displayName}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <Puzzle className="h-7 w-7 text-muted-foreground" />
            )}
          </div>

          {/* Name + metadata */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold">{displayName}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{installation.pluginKey}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PluginStatusBadge installation={installation} />
              <PluginHealthBadge
                passing={installation.healthCheckPassing}
                lastCheckedAt={installation.lastHealthCheckAt}
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Link href={`/plugins/${installationId}/settings`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="h-4 w-4" />
                {t("plugins.settings")}
              </Button>
            </Link>
            <Link href={`/plugins/${installationId}/logs`}>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Activity className="h-4 w-4" />
                {t("plugins.logs")}
              </Button>
            </Link>
          </div>
        </CardHeader>

        <Separator />

        {/* Plugin metadata */}
        <CardContent className="pt-4">
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="mb-1 text-xs text-muted-foreground">
                {t("plugins.installedAtLabel")}
              </dt>
              <dd className="font-medium">{formatUtc(installation.installedAt, "MMM d, yyyy")}</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs text-muted-foreground">{t("plugins.healthCheck")}</dt>
              <dd className="flex items-center gap-1 font-medium">
                {installation.healthCheckPassing ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                {installation.healthCheckPassing ? t("plugins.healthy") : t("plugins.unhealthy")}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-xs text-muted-foreground">{t("plugins.status")}</dt>
              <dd>
                <Badge variant={installation.isActive ? "default" : "outline"}>
                  {installation.isActive ? t("plugins.active") : t("plugins.inactive")}
                </Badge>
              </dd>
            </div>
            {installation.lastHealthCheckAt && (
              <div>
                <dt className="mb-1 text-xs text-muted-foreground">{t("plugins.lastChecked")}</dt>
                <dd className="text-xs font-medium">
                  {formatDateTimeUtc(installation.lastHealthCheckAt)}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* ── Plugin Frame (H-07 core) ── */}
      {hasFrontendUrl ? (
        <PluginFrame
          pluginKey={installation.pluginKey}
          frontendUrl={installation.frontendUrl as string}
          installationId={installationId}
          className="min-h-[500px] rounded-xl border"
        />
      ) : (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Puzzle className="h-10 w-10" />
          <p className="text-sm">{t("plugins.noFrontendUrl")}</p>
          <p className="text-xs">{t("plugins.noFrontendUrlHint")}</p>
        </Card>
      )}
    </div>
  );
}
