"use client";

import Link from "next/link";
import { PluginFrame } from "@core/plugins/plugin-sdk/PluginFrame";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Separator } from "@core/ui/separator";
import { DetailRow } from "@core/ui/detail-row";
import { ArrowLeft, Settings, Activity, Puzzle, CheckCircle2, XCircle } from "lucide-react";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
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
        <Skeleton className="h-8 w-48 rounded-nx-sm" />
        <Skeleton className="h-24 rounded-nx-lg" />
        <Skeleton className="h-[500px] rounded-nx-lg" />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (isError || !installation) {
    return (
      <ErrorMessage
        message={t("plugins.installedError")}
        onRetry={() => refetch()}
        className="py-24"
      />
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
        className="flex w-fit items-center gap-2 text-sm text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:text-nx-ink"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        {t("plugins.backToInstalled")}
      </Link>

      {/* ── Plugin header card ── */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          {/* Plugin icon / initials */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-nx-md border border-nx-line bg-nx-raised"
            aria-hidden="true"
          >
            {installation.iconUrl ? (
              <img
                src={installation.iconUrl}
                alt=""
                className="h-full w-full rounded-nx-md object-cover"
              />
            ) : (
              <Puzzle className="h-7 w-7 text-nx-ink-3" />
            )}
          </div>

          {/* Name + metadata */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold text-nx-ink">{displayName}</h1>
            <p className="mt-0.5 truncate text-sm text-nx-ink-2">{installation.pluginKey}</p>
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
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href={`/plugins/${installationId}/settings`}>
                <Settings className="h-4 w-4" aria-hidden="true" />
                {t("plugins.settings")}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
              <Link href={`/plugins/${installationId}/logs`}>
                <Activity className="h-4 w-4" aria-hidden="true" />
                {t("plugins.logs")}
              </Link>
            </Button>
          </div>
        </CardHeader>

        <Separator />

        {/* Plugin metadata */}
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 rounded-nx-md border border-nx-line bg-nx-raised p-3 sm:grid-cols-4">
            <DetailRow
              layout="stacked"
              label={t("plugins.installedAtLabel")}
              value={formatUtc(installation.installedAt, "MMM d, yyyy")}
            />
            <DetailRow
              layout="stacked"
              label={t("plugins.healthCheck")}
              value={
                <span className="inline-flex items-center gap-1.5">
                  {installation.healthCheckPassing ? (
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                  )}
                  {installation.healthCheckPassing ? t("plugins.healthy") : t("plugins.unhealthy")}
                </span>
              }
            />
            <DetailRow
              layout="stacked"
              label={t("plugins.status")}
              value={
                <Badge variant={installation.isActive ? "default" : "outline"}>
                  {installation.isActive ? t("plugins.active") : t("plugins.inactive")}
                </Badge>
              }
            />
            {installation.lastHealthCheckAt && (
              <DetailRow
                layout="stacked"
                label={t("plugins.lastChecked")}
                value={formatDateTimeUtc(installation.lastHealthCheckAt)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Plugin Frame (H-07 core) ── */}
      {hasFrontendUrl ? (
        <PluginFrame
          pluginKey={installation.pluginKey}
          frontendUrl={installation.frontendUrl as string}
          installationId={installationId}
          className="min-h-[500px] rounded-nx-lg border border-nx-line"
        />
      ) : (
        <EmptyState
          icon={Puzzle}
          title={t("plugins.noFrontendUrl")}
          description={t("plugins.noFrontendUrlHint")}
        />
      )}
    </div>
  );
}
