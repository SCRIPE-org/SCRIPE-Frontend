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

import { useEffect, useRef, useState, useCallback } from "react";
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
import { getDefaultComponentsForPage } from "../../domain/entities/CanvasComponent";
import { DragOverlayItem } from "../components/builder/DraggableCanvasItem";
import { useBuilderStore } from "../viewmodels/useBuilderStore";
import { Loader2, Building2, LayoutGrid } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { SaveAsThemeModal } from "../components/SaveAsThemeModal";

export function CustomizerStudioView() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [showSaveAsTheme, setShowSaveAsTheme] = useState(false);
  const handleSaveAsTheme = useCallback(() => setShowSaveAsTheme(true), []);

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

  // ── SYNC 1: Initialize builder store from draft on load ──
  // When draft loads from backend, seed the builder store so it has the right components
  const hasInitializedBuilder = useRef(false);
  useEffect(() => {
    if (hasInitializedBuilder.current) return;
    if (!vm.draft || !vm.draft.canvasComponents) return;
    // Deep copy to ensure new references (avoid same-ref equality issues)
    const componentsCopy = vm.draft.canvasComponents.map(c => ({ ...c, props: { ...c.props } }));
    builderStore.initialize(
      componentsCopy,
      vm.draft.canvasGridRows,
      vm.draft.canvasBackground ? { ...vm.draft.canvasBackground } : { type: 'inherit' as const, value: '' },
    );
    builderStore.setPositionMode(vm.draft.canvasPositionMode || 'absolute');
    hasInitializedBuilder.current = true;
  }, [vm.draft]);

  // ── SYNC 2: Builder → Draft (push canvas state PER PAGE) ──
  // Login page's canvas → global draft fields.
  // Non-login page's canvas → pageOverrides[activeAuthPage].
  // This ensures each page's builder canvas is fully isolated.
  useEffect(() => {
    if (!isBuilderMode) return;

    if (vm.activeAuthPage === 'login') {
      // Login page: push to global draft fields
      vm.batchUpdateDraft({
        canvasComponents: builderStore.components,
        canvasGridRows: builderStore.canvasGridRows,
        canvasBackground: builderStore.canvasBackground,
        canvasPositionMode: builderStore.positionMode,
      });
    } else {
      // Non-login page: push to pageOverrides (isolated per page)
      const existing = vm.draft.pageOverrides[vm.activeAuthPage] || {
        layout: 'centered', headline: '', subtitle: '', inheritBackground: true,
      };
      vm.batchUpdateDraft({
        pageOverrides: {
          ...vm.draft.pageOverrides,
          [vm.activeAuthPage]: {
            ...existing,
            canvasComponents: builderStore.components.map(c => ({ ...c, props: { ...c.props } })),
            canvasGridRows: builderStore.canvasGridRows,
            canvasBackground: { ...builderStore.canvasBackground },
            canvasPositionMode: builderStore.positionMode,
          },
        },
      });
    }
  }, [isBuilderMode, builderStore.components, builderStore.canvasGridRows, builderStore.canvasBackground, builderStore.positionMode, vm.activeAuthPage]);

  // ── SYNC 3: Per-page canvas — FULLY ISOLATED save/restore on auth page switch ──
  // Each auth page has its OWN canvas state. Login → global draft, others → pageOverrides.
  // When switching pages while in builder mode:
  //   1. Save current builder state to the OLD page's storage
  //   2. Load the NEW page's canvas (or that page's default if no prior data)
  // CRITICAL: Non-login pages NEVER fall back to login's canvas.
  const lastAuthPage = useRef(vm.activeAuthPage);
  useEffect(() => {
    if (!isBuilderMode) { lastAuthPage.current = vm.activeAuthPage; return; }
    if (lastAuthPage.current === vm.activeAuthPage) return;
    
    // 1. Save current builder state to the OLD page's storage
    const oldPage = lastAuthPage.current;
    if (oldPage === 'login') {
      // Login page: save to global draft fields
      vm.batchUpdateDraft({
        canvasComponents: builderStore.components.map(c => ({ ...c, props: { ...c.props } })),
        canvasGridRows: builderStore.canvasGridRows,
        canvasBackground: { ...builderStore.canvasBackground },
        canvasPositionMode: builderStore.positionMode,
      });
    } else if (oldPage) {
      // Non-login page: save to pageOverrides[oldPage]
      const existingOverride = vm.draft.pageOverrides[oldPage] || {
        layout: 'centered', headline: '', subtitle: '', inheritBackground: true,
      };
      vm.batchUpdateDraft({
        pageOverrides: {
          ...vm.draft.pageOverrides,
          [oldPage]: {
            ...existingOverride,
            canvasComponents: builderStore.components.map(c => ({ ...c, props: { ...c.props } })),
            canvasGridRows: builderStore.canvasGridRows,
            canvasBackground: { ...builderStore.canvasBackground },
            canvasPositionMode: builderStore.positionMode,
          },
        },
      });
    }
    
    // 2. Load NEW page's canvas from its own storage
    const newPage = vm.activeAuthPage;
    if (newPage === 'login') {
      // Login page: load from global draft fields
      const globalCopy = vm.draft.canvasComponents.map(c => ({ ...c, props: { ...c.props } }));
      builderStore.initialize(
        globalCopy,
        vm.draft.canvasGridRows,
        vm.draft.canvasBackground || { type: 'inherit' as const, value: '' },
      );
      builderStore.setPositionMode(vm.draft.canvasPositionMode || 'absolute');
    } else {
      // Non-login page: load from pageOverrides (NEVER fallback to login's canvas)
      const pageOverride = vm.draft.pageOverrides[newPage];
      if (pageOverride?.canvasComponents && pageOverride.canvasComponents.length > 0) {
        const pageCopy = pageOverride.canvasComponents.map(c => ({ ...c, props: { ...c.props } }));
        builderStore.initialize(
          pageCopy,
          pageOverride.canvasGridRows || 8,
          pageOverride.canvasBackground || { type: 'inherit' as const, value: '' },
        );
        builderStore.setPositionMode(pageOverride.canvasPositionMode || 'absolute');
      } else {
        // No prior data: use THIS page's own default components
        const pageDefaults = getDefaultComponentsForPage(newPage as any);
        builderStore.initialize(
          pageDefaults,
          8,
          { type: 'inherit' as const, value: '' },
        );
        builderStore.setPositionMode('absolute');
      }
    }
    
    lastAuthPage.current = vm.activeAuthPage;
  }, [vm.activeAuthPage, isBuilderMode]);

  // ── Send draft to iframe whenever draft changes ──
  // This MUST fire even in builder mode so the preview receives canvas data.
  // When user switches from builder to layout, the preview needs the latest canvas JSON.
  useEffect(() => {
    const draftJson = vm.buildDraftJson();
    const slotJson = vm.buildSlotConfigJson();
    bridge.sendDraft({
      loginBrandingJson: draftJson,
      slotConfigJson: slotJson,
      activeAuthPage: vm.activeAuthPage,
    });
  }, [vm.draft, vm.activeAuthPage, bridge.sendDraft, vm.buildDraftJson, vm.buildSlotConfigJson]);

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
            positionMode={builderStore.positionMode}
            zoom={builderStore.zoom}
            overlappingIds={builderDnd.overlappingIds}
            onSelectComponent={builderStore.selectComponent}
            onSetPositionMode={builderStore.setPositionMode}
            onSetZoom={builderStore.setZoom}
            onSetSnapToGrid={builderStore.setSnapToGrid}
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
          activeAuthPage={vm.activeAuthPage}
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

      {/* Auth Page Tabs -- switch between Login / Forgot Password / Reset Password */}
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
        onSaveAsTheme={handleSaveAsTheme}
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
            {builderStore.positionMode === 'absolute' ? '⟐ Free-form' : '⊞ Grid'} | {builderStore.components.length} components | {builderStore.zoom}%
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

      {/* Save as Theme Modal */}
      <SaveAsThemeModal
        isOpen={showSaveAsTheme}
        onClose={() => setShowSaveAsTheme(false)}
        getDraftJson={vm.buildDraftJson}
      />
    </div>
  );
}
