"use client";

import { useSettingsViewModel } from "../viewmodels/useSettingsViewModel";
import { useAppStore } from "@core/store/useAppStore";
import { PluginFrame } from "@core/plugins/plugin-sdk/PluginFrame";
import { Skeleton } from "@core/ui/skeleton";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { Settings } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

interface PluginSettingsViewProps {
  installationId: string;
}

/**
 * Presentation UI component rendering the plugin settings view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
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
    return <ErrorMessage size="sm" message={t("plugins.settingsError")} className="p-6" />;
  }

  if (!installation.frontendUrl) {
    return <EmptyState icon={Settings} title={t("plugins.settingsNoUi")} className="m-6" />;
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
