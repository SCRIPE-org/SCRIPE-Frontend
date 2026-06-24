"use client";

import { useSettingsViewModel } from "../viewmodels/useSettingsViewModel";
import { useAppStore } from "@core/store/useAppStore";
import { PluginFrame } from "@core/plugins/plugin-sdk/PluginFrame";
import { Skeleton } from "@core/ui/skeleton";
import { AlertTriangle, Settings } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

interface PluginSettingsViewProps {
  installationId: string;
}

/**
 * React presentation component representing the plugin settings view UI element.
 */
export function PluginSettingsView({ installationId }: PluginSettingsViewProps) {
  const { user } = useAppStore();
  const { t } = useI18n();
  const tenantId = user?.tenantId ?? "";

  const { installation, isLoading, isError } = useSettingsViewModel(installationId, tenantId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (isError || !installation) {
    return (
      <div className="flex items-center gap-2 p-6 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <span className="text-sm">{t("plugins.settingsError")}</span>
      </div>
    );
  }

  if (!installation.frontendUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Settings className="h-10 w-10" />
        <p className="text-sm">{t("plugins.settingsNoUi")}</p>
      </div>
    );
  }

  return (
    <PluginFrame
      pluginKey={installation.pluginKey}
      frontendUrl={`${installation.frontendUrl}/settings`}
      installationId={installationId}
      className="min-h-[500px]"
    />
  );
}
