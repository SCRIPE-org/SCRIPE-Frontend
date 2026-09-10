"use client";

import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { INTEGRATIONS_PERMISSIONS } from "@modules/integrations/permission-constants";
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

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");

  const vm = useApiKeyDetailViewModel(id);

  // Backend enforcement was always intact (every mutating endpoint carries the matching
  // [PermissionRequired(...)]); this page's Update/Rotate/Revoke/Delete controls previously
  // rendered and were enabled purely off local UI state, with zero permission gating of their
  // own — a low-privilege viewer (holds apikeys.view only) would see fully-interactive
  // controls that only failed with a 403 when actually clicked. Computed once here and passed
  // down, matching the requiredPermission/usePermission convention used elsewhere (e.g. the
  // Hrms list views' row actions, compliance's PolicyCard).
  const canUpdate = usePermission(INTEGRATIONS_PERMISSIONS.API_KEYS_UPDATE);
  const canDelete = usePermission(INTEGRATIONS_PERMISSIONS.API_KEYS_DELETE);

  const handleRevoke = async () => {
    try {
      await vm.revokeKey();
      toast.success({
        title: t("apikeys.revokeToast.successMsg"),
      });
    } catch (err: any) {
      toast.error({
        title: err.message || t("apikeys.revokeToast.errorMsg"),
      });
    }
  };

  const handleDelete = async () => {
    try {
      await vm.deleteKey();
      toast.success({
        title: t("apikeys.deleteToast.successMsg"),
      });
      router.push("/integrations/apikeys");
    } catch (err: any) {
      toast.error({
        title: err.message || t("apikeys.deleteToast.errorMsg"),
      });
    }
  };

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
        onRevoke={vm.revoke}
        canRotate={canUpdate}
        canRevoke={canDelete}
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
              onRefresh={vm.refetchActivity}
            />
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <ApiKeySettingsPanel
              detail={vm.detail}
              isUpdating={vm.isUpdating}
              onUpdate={handleUpdateSettings}
              canUpdate={canUpdate}
            />

            <ApiKeyScopesPanel
              detail={vm.detail}
              isUpdating={vm.isUpdating}
              onUpdateScopes={handleUpdateScopes}
              canUpdate={canUpdate}
              permissions={vm.permissions}
              isLoading={vm.isPermissionsLoading}
            />

            <ApiKeyDangerZone
              detail={vm.detail}
              onRevoke={handleRevoke}
              onDeletePermanently={handleDelete}
              isRevoking={vm.isRevoking}
              canRevoke={canDelete}
              canDeletePermanently={canDelete}
            />
          </div>
        </div>
      </div>

      <RotateKeyDialog rotatedKey={vm.rotatedKey} onClose={vm.clearRotatedKey} />
    </div>
  );
}
