"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useKeyManagementViewModel } from "../viewmodels/useKeyManagementViewModel";
import { ActiveKeyCard } from "../components/ActiveKeyCard";
import { PlatformKeyringCard } from "../components/PlatformKeyringCard";
import { MigrationProgressModal } from "../components/MigrationProgressModal";
import { KeyDistributionChart } from "../components/KeyDistributionChart";
import { AuditLogTable } from "../components/AuditLogTable";
import { RotateKeyWizardDialog } from "../components/RotateKeyWizardDialog";

/**
 * Documentation for module export
 */
export function KeyManagementTab() {
  const { t } = useI18n();
  const {
    status,
    isLoadingStatus,
    activeSession,
    auditLogs,
    auditLogsTotal,
    isAuditLogsLoading,
    isRotateOpen,
    setIsRotateOpen,
    initializeKey,
    isInitializing,
    rotateKey,
    isRotating,
    startRewrap,
    isStartingRewrap,
    cancelRewrap,
    isCancellingRewrap,
    revokeKey,
  } = useKeyManagementViewModel();

  const handleRevoke = () => {
    if (!status) return;
    const confirmed = window.confirm(
      `WARNING: Revoking tenant key will permanently disable decryption of confidential records for ${status.tenantCode}. Are you sure?`
    );
    if (confirmed) {
      revokeKey({ reason: "Admin manual revocation", confirmationCode: status.tenantCode });
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const isPlatform = Boolean(status?.isPlatformKeyring);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          {isPlatform
            ? t("customFieldsSecurity.platformTitle")
            : t("customFieldsSecurity.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isPlatform
            ? t("customFieldsSecurity.platformSubtitle")
            : t("customFieldsSecurity.subtitle")}
        </p>
      </div>

      {isPlatform ? (
        <PlatformKeyringCard
          status={status}
          activeSession={activeSession}
          onStartClusterRewrap={() => startRewrap()}
          isStartingRewrap={isStartingRewrap}
          onCancelRewrap={cancelRewrap}
          isCancellingRewrap={isCancellingRewrap}
        />
      ) : (
        <>
          <ActiveKeyCard
            status={status}
            onInitialize={() => initializeKey()}
            onRotate={() => setIsRotateOpen(true)}
            onRevoke={handleRevoke}
            isInitializing={isInitializing}
          />

          <MigrationProgressModal
            session={activeSession}
            onCancel={cancelRewrap}
            isCancelling={isCancellingRewrap}
          />

          {status?.isInitialized && (
            <KeyDistributionChart
              status={status}
              onStartRewrap={() => startRewrap()}
              isStartingRewrap={isStartingRewrap}
            />
          )}

          {status?.isInitialized && (
            <AuditLogTable
              logs={auditLogs}
              totalCount={auditLogsTotal}
              isLoading={isAuditLogsLoading}
            />
          )}

          <RotateKeyWizardDialog
            open={isRotateOpen}
            onOpenChange={setIsRotateOpen}
            onConfirm={rotateKey}
            isLoading={isRotating}
          />
        </>
      )}
    </div>
  );
}
