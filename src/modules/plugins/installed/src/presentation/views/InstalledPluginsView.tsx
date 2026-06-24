"use client";

import { useAppStore } from "@core/store/useAppStore";
import { useInstalledViewModel } from "../viewmodels/useInstalledViewModel";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { AlertTriangle, PackageCheck, RefreshCw } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { InstalledPluginRow } from "../components/InstalledPluginRow";

/**
 * React presentation component representing the installed plugins view UI element.
 */
export function InstalledPluginsView() {
  const { user } = useAppStore();
  const { t } = useI18n();
  const tenantId = user?.tenantId ?? "";

  const {
    installations,
    isLoading,
    isError,
    refetch,
    activate,
    deactivate,
    uninstall,
    isMutating,
  } = useInstalledViewModel(tenantId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{t("plugins.installedError")}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="me-2 h-4 w-4" />
          {t("plugins.retry")}
        </Button>
      </div>
    );
  }

  if (installations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <PackageCheck className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("plugins.installedEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-6">
      {installations.map((inst) => (
        <InstalledPluginRow
          key={inst.id}
          installation={inst}
          onActivate={activate}
          onDeactivate={deactivate}
          onUninstall={uninstall}
          isMutating={isMutating}
        />
      ))}
    </div>
  );
}
