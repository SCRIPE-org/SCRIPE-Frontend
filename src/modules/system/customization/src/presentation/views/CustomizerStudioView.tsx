/**
 * CustomizerStudioView — Main studio layout (Ultimate Redesign)
 *
 * Split-pane: left = 9-tab control sidebar, right = sandboxed iframe preview
 * All changes are draft. Preview updates via postMessage. No live mutation.
 * Localized via t(). Security: sandbox iframe, origin-validated postMessage.
 *
 * Supports drilldown mode: ?tenantId=xxx&tenantName=xxx
 * Super admin can customize a specific tenant's login page.
 */
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useStudioViewModel } from "../viewmodels/useStudioViewModel";
import { useStudioBridge } from "../hooks/useStudioBridge";
import { PublishBar } from "../components/PublishBar";
import { StudioSidebar } from "../components/StudioSidebar";
import { StudioPreview } from "../components/StudioPreview";
import { Loader2, Building2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";

export function CustomizerStudioView() {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  // Drilldown: read target tenant from URL params
  const targetTenantId = searchParams?.get("tenantId") || undefined;
  const targetTenantName = searchParams?.get("tenantName") || undefined;

  const vm = useStudioViewModel({
    targetTenantId,
    targetTenantName,
  });
  const bridge = useStudioBridge();

  // Send draft to iframe whenever draft changes
  useEffect(() => {
    const draftJson = vm.buildDraftJson();
    const slotJson = vm.buildSlotConfigJson();
    bridge.sendDraft({
      loginBrandingJson: draftJson,
      slotConfigJson: slotJson,
    });
  }, [vm.draft, bridge.sendDraft, vm.buildDraftJson, vm.buildSlotConfigJson]);

  // Loading state — waiting for branding query to resolve
  if (vm.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("studio.loading") || "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* System Defaults Banner */}
      {vm.mode === "system" && (
        <div className="flex items-center gap-2 bg-violet-600 px-4 py-2 text-white text-sm font-medium">
          <Building2 className="h-4 w-4" />
          <span>{t("studio.systemDefaultsBanner") || "Editing System Defaults — applied to all tenants without custom branding"}</span>
        </div>
      )}

      {/* Tenant Drilldown Banner */}
      {vm.mode === "tenant" && vm.targetTenantName && (
        <div className="flex items-center gap-2 bg-cyan-600 px-4 py-2 text-white text-sm font-medium">
          <Building2 className="h-4 w-4" />
          <span>{t("studio.customizingTenant") || "Customizing:"} {vm.targetTenantName}</span>
        </div>
      )}

      {/* Top Bar */}
      <PublishBar
        t={vm.t}
        isDirty={vm.isDirty}
        isPublishing={vm.isPublishing}
        isDiscarding={vm.isDiscarding}
        isSavingDraft={vm.isSavingDraft}
        isResetting={vm.isResetting}
        isPreviewingTheme={vm.isPreviewingTheme}
        lastSavedAt={vm.lastSavedAt}
        deviceSize={vm.deviceSize}
        setDeviceSize={vm.setDeviceSize}
        onPublish={vm.publish}
        onDiscard={vm.discard}
        onSaveDraft={vm.saveDraft}
        onReset={vm.resetBranding}
        onExitPreview={vm.exitThemePreview}
        onRefresh={vm.refreshDraft}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Control Panels */}
        <StudioSidebar
          t={vm.t}
          activePanel={vm.activePanel}
          setActivePanel={vm.setActivePanel}
          draft={vm.draft}
          updateDraft={vm.updateDraft}
          batchUpdateDraft={vm.batchUpdateDraft}
          addBlock={vm.addBlock}
          removeBlock={vm.removeBlock}
          moveBlock={vm.moveBlock}
          updateBlock={vm.updateBlock}
          onThemeApplied={() => vm.refreshDraft()}
          onPreviewTheme={(json) => vm.previewTheme(json)}
          onExitPreview={() => vm.exitThemePreview()}
        />

        {/* Right: Preview */}
        <StudioPreview
          iframeRef={bridge.iframeRef}
          isPreviewReady={bridge.isPreviewReady}
          deviceSize={vm.deviceSize}
          setDeviceSize={vm.setDeviceSize}
          onIframeLoad={bridge.handleIframeLoad}
        />
      </div>

      {/* Discard Confirmation Dialog */}
      <ConfirmationDialog
        open={vm.showDiscardConfirm}
        onOpenChange={(open) => !open && vm.cancelDiscard()}
        variant="warning"
        title={t("studio.discardConfirmTitle")}
        description={t("studio.discardConfirmDesc")}
        confirmText={t("studio.discardConfirmAction")}
        cancelText={t("common.cancel")}
        onConfirm={vm.confirmDiscard}
        onCancel={vm.cancelDiscard}
        isLoading={vm.isDiscarding}
      />
    </div>
  );
}
