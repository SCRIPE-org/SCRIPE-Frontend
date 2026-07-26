"use client";

import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { integrationsContainer } from "@modules/integrations/di";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useApiKeyDetailViewModel } from "../viewmodels/useApiKeyDetailViewModel";
import { ApiKeyHeroBand } from "../components/ApiKeyHeroBand";
import { ApiKeyStatsCards } from "../components/ApiKeyStatsCards";
import { ApiKeyChartSection } from "../components/ApiKeyChartSection";
import { ApiKeySettingsPanel } from "../components/ApiKeySettingsPanel";
import { ApiKeyScopesPanel } from "../components/ApiKeyScopesPanel";
import { ApiKeyActivityLog } from "../components/ApiKeyActivityLog";
import { ApiKeyDangerZone } from "../components/ApiKeyDangerZone";
import { RotateKeyDialog } from "../components/RotateKeyDialog";
import { ApiKeyQuickStart } from "../components/ApiKeyQuickStart";
import { Skeleton } from "@core/ui/skeleton";

export default function ApiKeyDetailView() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const toast = useEnhancedToast();
  const qc = useQueryClient();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");

  const vm = useApiKeyDetailViewModel(id);

  // --- Revoke Mutation ---
  const revokeMutation = useMutation({
    mutationFn: () => integrationsContainer.apiKeyRepository.revoke(id),
    onSuccess: () => {
      toast.success({
        title: t("apikeys.revokeToast.successMsg"),
      });
      qc.invalidateQueries({ queryKey: ["apikey-detail", id] });
      qc.invalidateQueries({ queryKey: ["apikeys"] });
    },
    onError: (err: any) => {
      toast.error({
        title: err.message || t("apikeys.revokeToast.errorMsg"),
      });
    },
  });

  // --- Permanent Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: () => integrationsContainer.apiKeyDetailRepository.deletePermanently(id),
    onSuccess: () => {
      toast.success({
        title: t("apikeys.deleteToast.successMsg"),
      });
      qc.invalidateQueries({ queryKey: ["apikeys"] });
      router.push("/integrations/apikeys");
    },
    onError: (err: any) => {
      toast.error({
        title: err.message || t("apikeys.deleteToast.errorMsg"),
      });
    },
  });

  if (vm.isDetailLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-24" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (vm.detailError || !vm.detail) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-8 text-center">
        <div className="font-semibold text-destructive">{t("apikeys.error.notFound")}</div>
        <button onClick={() => router.push("/integrations/apikeys")} className="text-sm underline">
          {t("apikeys.backToList")}
        </button>
      </div>
    );
  }

  const handleUpdateScopes = (scopes: string) => {
    vm.update({ scopes });
    toast.success({
      title: t("apikeys.updateToast.successScopes"),
    });
  };

  const handleUpdateSettings = (req: any) => {
    vm.update(req);
    toast.success({
      title: t("apikeys.updateToast.successSettings"),
    });
  };

  return (
    <div className="flex flex-1 flex-col bg-nx-ground pb-12">
      <ApiKeyHeroBand
        detail={vm.detail}
        isRotating={vm.isRotating}
        onRotate={vm.rotate}
        onRevoke={revokeMutation.mutate}
      />

      <div className="space-y-6 p-6">
        {vm.stats && <ApiKeyStatsCards stats={vm.stats} isLoading={vm.isStatsLoading} />}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Area */}
          <div className="space-y-6 lg:col-span-2">
            {vm.stats && vm.stats.totalHits === 0 ? (
              <ApiKeyQuickStart detail={vm.detail} />
            ) : (
              <ApiKeyChartSection
                data={vm.chartData}
                isLoading={vm.isChartLoading}
                onRangeChange={vm.handleChartRangeChange}
              />
            )}

            <ApiKeyActivityLog
              activity={vm.activity}
              isLoading={vm.isActivityLoading}
              page={vm.activityParams.page}
              pageSize={vm.activityParams.pageSize ?? 50}
              sortBy={vm.activityParams.sortBy}
              sortDesc={vm.activityParams.sortDesc ?? true}
              onPageChange={vm.handleActivityPageChange}
              onFilterChange={vm.handleActivityFilterChange}
              onSortChange={vm.handleActivitySortChange}
              onRefresh={() => qc.invalidateQueries({ queryKey: ["apikey-activity", id] })}
            />
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <ApiKeySettingsPanel
              detail={vm.detail}
              isUpdating={vm.isUpdating}
              onUpdate={handleUpdateSettings}
            />

            <ApiKeyScopesPanel
              detail={vm.detail}
              isUpdating={vm.isUpdating}
              onUpdateScopes={handleUpdateScopes}
            />

            <ApiKeyDangerZone
              detail={vm.detail}
              onRevoke={revokeMutation.mutate}
              onDeletePermanently={deleteMutation.mutate}
              isRevoking={revokeMutation.isPending}
            />
          </div>
        </div>
      </div>

      <RotateKeyDialog rotatedKey={vm.rotatedKey} onClose={vm.clearRotatedKey} />
    </div>
  );
}
