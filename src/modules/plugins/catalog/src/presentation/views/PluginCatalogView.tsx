"use client";

import { useState } from "react";
import { useAppStore } from "@core/store/useAppStore";
import { useCatalogViewModel } from "../viewmodels/useCatalogViewModel";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { AlertTriangle, Store, RefreshCw } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { PluginCard } from "../components/PluginCard";
import { PluginInstallDialog } from "../components/PluginInstallDialog";
import type { PluginCatalogItem } from "../../domain/entities/PluginCatalogItem";

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
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{t("plugins.catalogError")}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="me-2 h-4 w-4" />
          {t("plugins.retry")}
        </Button>
      </div>
    );
  }

  if (plugins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Store className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("plugins.catalogEmpty")}</p>
      </div>
    );
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
