"use client";

import { useAppStore } from "@core/store/useAppStore";
import { useInstalledViewModel } from "../viewmodels/useInstalledViewModel";
import { Skeleton } from "@core/ui/skeleton";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { PackageCheck } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { InstalledPluginRow } from "../components/InstalledPluginRow";

/**
 * Presentation UI component rendering the installed plugins view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
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
          <Skeleton key={i} className="h-20 rounded-nx-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorMessage
        message={t("plugins.installedError")}
        onRetry={() => refetch()}
        className="py-20"
      />
    );
  }

  if (installations.length === 0) {
    return (
      <EmptyState
        size="lg"
        icon={PackageCheck}
        title={t("plugins.installedEmpty")}
        className="m-6"
      />
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
