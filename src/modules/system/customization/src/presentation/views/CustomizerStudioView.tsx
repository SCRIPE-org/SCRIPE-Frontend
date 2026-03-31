/**
 * CustomizerStudioView -- Main studio layout (Ultimate Redesign)
 *
 * Split-pane: left = 11-tab control sidebar, right = sandboxed iframe preview
 * BUILDER MODE: When builder tab is active, the right pane swaps from
 * the iframe preview to a full-width BuilderCanvas with real DnD.
 *
 * CRITICAL: DndContext wraps BOTH sidebar AND canvas so palette→canvas
 * drag works across the split layout.
 *
 * All changes are draft. Preview updates via postMessage. No live mutation.
 * Localized via t(). Security: sandbox iframe, origin-validated postMessage.
 *
 * Supports drilldown mode: ?tenantId=xxx&tenantName=xxx
 * Super admin can customize a specific tenant's login page.
 */
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { useStudioViewModel } from "../viewmodels/useStudioViewModel";
import { useStudioBridge } from "../hooks/useStudioBridge";
import { useBuilderDnd } from "../hooks/useBuilderDnd";
import { PublishBar } from "../components/PublishBar";
import { StudioSidebar } from "../components/StudioSidebar";
import { StudioPreview } from "../components/StudioPreview";
import { AuthPageTabs } from "../components/AuthPageTabs";
import { BuilderCanvas } from "../components/builder/BuilderCanvas";
import { DragOverlayItem } from "../components/builder/DraggableCanvasItem";
import { useBuilderStore } from "../viewmodels/useBuilderStore";
import { Loader2, Building2, LayoutGrid } from "lucide-react";
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
  const builderStore = useBuilderStore();
  const builderDnd = useBuilderDnd();

  // Determine if we are in builder mode
  const isBuilderMode = vm.activePanel === "builder";

  // Send draft to iframe whenever draft changes (only when NOT in builder mode)
  useEffect(() => {
    if (isBuilderMode) return; // Builder renders its own canvas, no iframe needed
    const draftJson = vm.buildDraftJson();
    const slotJson = vm.buildSlotConfigJson();
    bridge.sendDraft({
      loginBrandingJson: draftJson,
      slotConfigJson: slotJson,
      activeAuthPage: vm.activeAuthPage,
    });
  }, [vm.draft, vm.activeAuthPage, bridge.sendDraft, vm.buildDraftJson, vm.buildSlotConfigJson, isBuilderMode]);

  // Loading state -- waiting for branding query to resolve
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

  // Main content area (sidebar + preview/canvas)
  const mainContent = (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Control Panels */}
      <StudioSidebar
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
        activeAuthPage={vm.activeAuthPage}
        getPageOverride={vm.getPageOverride}
        setPageOverride={vm.setPageOverride}
        isBuilderMode={isBuilderMode}
      />

      {/* Right: Preview OR Builder Canvas */}
      {isBuilderMode ? (
        /* Full-width Builder Canvas */
        <div className="relative flex-1 overflow-auto bg-gradient-to-br from-muted/30 via-background to-muted/20 p-6">
          <BuilderCanvas
            components={builderStore.components}
            selectedComponentId={builderStore.selectedComponentId}
            canvasGridRows={builderStore.canvasGridRows}
            snapToGrid={builderStore.snapToGrid}
            onSelectComponent={builderStore.selectComponent}
            fullWidth
          />
        </div>
      ) : (
        /* Standard iframe Preview */
        <StudioPreview
          iframeRef={bridge.iframeRef}
          isPreviewReady={bridge.isPreviewReady}
          deviceSize={vm.deviceSize}
          setDeviceSize={vm.setDeviceSize}
          onIframeLoad={bridge.handleIframeLoad}
        />
      )}
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* System Defaults Banner */}
      {vm.mode === "system" && (
        <div className="flex items-center gap-2 bg-violet-600 px-4 py-2 text-white text-sm font-medium">
          <Building2 className="h-4 w-4" />
          <span>{t("studio.systemDefaultsBanner") || "Editing System Defaults -- applied to all tenants without custom branding"}</span>
        </div>
      )}

      {/* Tenant Drilldown Banner */}
      {vm.mode === "tenant" && vm.targetTenantName && (
        <div className="flex items-center gap-2 bg-cyan-600 px-4 py-2 text-white text-sm font-medium">
          <Building2 className="h-4 w-4" />
          <span>{t("studio.customizingTenant") || "Customizing:"} {vm.targetTenantName}</span>
        </div>
      )}

      {/* Auth Page Tabs -- switch between Login / Forgot / Reset / Register / Verify / MFA */}
      <AuthPageTabs
        activePageId={vm.activeAuthPage}
        onPageChange={vm.setActiveAuthPage}
      />

      {/* Top Bar */}
      <PublishBar
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

      {/* Builder Mode Indicator */}
      {isBuilderMode && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 via-primary/5 to-indigo-500/10 border-b border-primary/20 px-4 py-1.5">
          <LayoutGrid className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">
            {t("studio.builder.modeActive") || "Builder Mode"} —{" "}
            <span className="text-muted-foreground font-normal">
              {t("studio.builder.modeHint") || "Drag components to arrange your login page layout"}
            </span>
          </span>
          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            {builderStore.components.length} components | {builderStore.canvasGridRows} rows
          </span>
        </div>
      )}

      {/* Main Content — wrapped in DndContext when in builder mode */}
      {isBuilderMode ? (
        <DndContext
          sensors={builderDnd.sensors}
          collisionDetection={closestCenter}
          onDragStart={builderDnd.handleDragStart}
          onDragEnd={builderDnd.handleDragEnd}
        >
          {mainContent}

          {/* Drag Overlay — visible ghost during drag */}
          <DragOverlay dropAnimation={null}>
            {builderDnd.activeComponent ? (
              <DragOverlayItem component={builderDnd.activeComponent} />
            ) : builderDnd.activePaletteType ? (
              <div className="flex items-center gap-2 rounded-lg border-2 border-primary/60 bg-primary/10 px-3 py-2 shadow-xl backdrop-blur-sm min-w-[180px]">
                <span className="text-xs font-semibold text-primary">
                  + {builderDnd.activePaletteType}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        mainContent
      )}

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
