"use client";

import { useState } from "react";
import { useAppStore } from "@core/store/useAppStore";
import { useCatalogViewModel } from "../viewmodels/useCatalogViewModel";
import { Skeleton } from "@core/ui/skeleton";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { Store } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { PluginCard } from "../components/PluginCard";
import { PluginInstallDialog } from "../components/PluginInstallDialog";
import type { PluginCatalogItem } from "../../domain/entities/PluginCatalogItem";

/**
 * Presentation UI component rendering the plugin catalog view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PluginCatalogView() {
  const { user } = useAppStore();
  const { t } = useI18n();
  const tenantId = user?.tenantId ?? "";
  const userId = user?.id ?? "";

  const { plugins, isLoading, isError, refetch, install, isInstalling } =
    useCatalogViewModel(tenantId);

  const [selectedPlugin, setSelectedPlugin] = useState<PluginCatalogItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleInstallRequest = (plugin: PluginCatalogItem) => {
    setSelectedPlugin(plugin);
    setDialogOpen(true);
  };

  const handleConfirmInstall = async (plugin: PluginCatalogItem) => {
    if (!tenantId || !userId) return;
    await install({ pluginDefinitionId: plugin.id, tenantId, installedByUserId: userId });
    setDialogOpen(false);
    setSelectedPlugin(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-nx-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorMessage
        message={t("plugins.catalogError")}
        onRetry={() => refetch()}
        className="py-20"
      />
    );
  }

  if (plugins.length === 0) {
    return <EmptyState size="lg" icon={Store} title={t("plugins.catalogEmpty")} className="m-6" />;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {plugins.map((plugin) => (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            onInstall={() => handleInstallRequest(plugin)}
            isInstalling={isInstalling && selectedPlugin?.id === plugin.id}
          />
        ))}
      </div>

      <PluginInstallDialog
        plugin={selectedPlugin}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmInstall}
        isInstalling={isInstalling}
      />
    </>
  );
}
