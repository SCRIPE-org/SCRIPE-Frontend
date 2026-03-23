/**
 * CustomizerStudioView — Main studio layout (Ultimate Redesign)
 *
 * Split-pane: left = 8-tab control sidebar, right = sandboxed iframe preview
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
import { useStudioBridge } from "../../hooks/useStudioBridge";
import { PublishBar } from "../components/PublishBar";
import { StudioSidebar } from "../components/StudioSidebar";
import { StudioPreview } from "../components/StudioPreview";
import { Loader2, Building2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

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

  // Reset preview when discarding
  useEffect(() => {
    if (!vm.isDirty && bridge.isPreviewReady) {
      bridge.resetPreview();
    }
  }, [vm.isDirty, bridge.isPreviewReady, bridge.resetPreview]);

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

  // Superadmin guard — requires tenant context (but drilldown mode bypasses this)
  if (!vm.isTenantContext) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">{t("studio.noTenantTitle") || "Tenant Required"}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("studio.noTenantDesc") || "The login customizer is tenant-specific. Please select a tenant first to customize their login page."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Drilldown Banner */}
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
        lastSavedAt={vm.lastSavedAt}
        deviceSize={vm.deviceSize}
        setDeviceSize={vm.setDeviceSize}
        onPublish={vm.publish}
        onDiscard={vm.discard}
        onSaveDraft={vm.saveDraft}
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
    </div>
  );
}
