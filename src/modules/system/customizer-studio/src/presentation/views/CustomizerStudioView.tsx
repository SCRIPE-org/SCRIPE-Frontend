/**
 * CustomizerStudioView — Main studio layout (Ultimate Redesign)
 *
 * Split-pane: left = 8-tab control sidebar, right = sandboxed iframe preview
 * All changes are draft. Preview updates via postMessage. No live mutation.
 * Localized via t(). Security: sandbox iframe, origin-validated postMessage.
 */
"use client";

import { useEffect } from "react";
import { useStudioViewModel } from "../viewmodels/useStudioViewModel";
import { useStudioBridge } from "../../hooks/useStudioBridge";
import { PublishBar } from "../components/PublishBar";
import { StudioSidebar } from "../components/StudioSidebar";
import { StudioPreview } from "../components/StudioPreview";
import { Loader2 } from "lucide-react";

export function CustomizerStudioView() {
  const vm = useStudioViewModel();
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

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{vm.t("studio.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <PublishBar
        t={vm.t}
        isDirty={vm.isDirty}
        isPublishing={vm.isPublishing}
        isDiscarding={vm.isDiscarding}
        deviceSize={vm.deviceSize}
        setDeviceSize={vm.setDeviceSize}
        onPublish={vm.publish}
        onDiscard={vm.discard}
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
