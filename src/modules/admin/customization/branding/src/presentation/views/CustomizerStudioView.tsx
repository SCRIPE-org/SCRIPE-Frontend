// FILE-EXCEPTION: file length
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
import { DashboardLayoutPreview } from "../components/DashboardLayoutPreview";
import { type CanvasComponent } from "../../domain/entities/CanvasComponent";
import { DragOverlayItem } from "../components/builder/DraggableCanvasItem";
import { useBuilderStore } from "../viewmodels/useBuilderStore";
import { Building2, LayoutGrid } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { SaveAsThemeModal } from "../components/SaveAsThemeModal";

/**
 * Presentation UI component rendering the customizer studio view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CustomizerStudioView() {
  useModuleLocales(() => import("@modules/customization/studio/locales"), "customization-studio");
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
  const isDashboardMode = vm.activePanel === "dashboard";
  const draft = vm.draft;
  const activeAuthPage = vm.activeAuthPage;
  const batchUpdateDraft = vm.batchUpdateDraft;
  const buildDraftJson = vm.buildDraftJson;
  const buildSlotConfigJson = vm.buildSlotConfigJson;
  const sendDraft = bridge.sendDraft;

  // ── SYNC 1: Initialize builder store from draft on first load ──
  // Seeds the builder store with login page data from the server.
  // Only runs ONCE. The store's internal per-page state handles the rest.
  const hasInitializedBuilder = useRef(false);
  useEffect(() => {
    if (hasInitializedBuilder.current) return;
    if (!draft || !draft.canvasComponents) return;

    // Build per-page components from draft's pageOverrides
    const pageComps: Record<string, CanvasComponent[]> = {};
    for (const [pageId, override] of Object.entries(draft.pageOverrides || {})) {
      if (override?.canvasComponents && override.canvasComponents.length > 0) {
        pageComps[
          pageId === "forgot-password"
            ? "forgotPassword"
            : pageId === "reset-password"
              ? "resetPassword"
              : pageId
        ] = override.canvasComponents.map((c: any) => ({ ...c, props: { ...c.props } }));
      }
    }

    // Deep copy to ensure new references
    const componentsCopy = draft.canvasComponents.map((c: any) => ({
      ...c,
      props: { ...c.props },
    }));
    builderStore.initialize(
      componentsCopy,
      draft.canvasGridRows,
      draft.canvasBackground
        ? { ...draft.canvasBackground }
        : { type: "inherit" as const, value: "" },
      pageComps.forgotPassword || pageComps.resetPassword ? (pageComps as any) : undefined
    );
    builderStore.setPositionMode(draft.canvasPositionMode || "absolute");
    hasInitializedBuilder.current = true;
  }, [draft]);

  // ── SYNC 2: Page switch → use builder store's own per-page management ──
  // The builder store has `setActivePage()` which saves current page's components
  // and loads the target page's components. This is the SINGLE source of truth
  // for page switching — no external save/restore needed.
  const lastSyncedPage = useRef(activeAuthPage);
  useEffect(() => {
    if (lastSyncedPage.current === activeAuthPage) return;
    lastSyncedPage.current = activeAuthPage;

    // Map the studio's page ID to the builder store's page ID format
    const storePageId =
      activeAuthPage === "forgot-password"
        ? "forgotPassword"
        : activeAuthPage === "reset-password"
          ? "resetPassword"
          : "login";

    // The store's setActivePage saves current components and loads target page
    builderStore.setActivePage(storePageId as any);
  }, [activeAuthPage]);

  // ── SYNC 3: Push builder state → draft (for preview & persistence) ──
  // When builder content changes, push it to the draft so the preview can render it.
  // Login → global draft fields, non-login → pageOverrides.
  // Uses a page-change guard to avoid writing stale data during page transitions.
  // CRITICAL: Also flushes when LEAVING builder mode so the preview gets latest data.
  const sync3PageRef = useRef(activeAuthPage);
  const skipNextSync3 = useRef(false);
  const wasBuilderMode = useRef(isBuilderMode);

  const storeComponents = builderStore.components;
  const storeCanvasGridRows = builderStore.canvasGridRows;
  const storeCanvasBackground = builderStore.canvasBackground;
  const storePositionMode = builderStore.positionMode;
  const pageOverrides = draft?.pageOverrides;

  // Helper: flush current builder state to the correct draft location
  const flushBuilderToDraft = useCallback(() => {
    if (activeAuthPage === "login") {
      batchUpdateDraft({
        canvasComponents: storeComponents.map((c) => ({ ...c, props: { ...c.props } })),
        canvasGridRows: storeCanvasGridRows,
        canvasBackground: { ...storeCanvasBackground },
        canvasPositionMode: storePositionMode,
      });
    } else {
      const existing = pageOverrides?.[activeAuthPage] || {
        layout: "centered",
        headline: "",
        subtitle: "",
        inheritBackground: true,
      };
      batchUpdateDraft({
        pageOverrides: {
          ...pageOverrides,
          [activeAuthPage]: {
            ...existing,
            canvasComponents: storeComponents.map((c) => ({ ...c, props: { ...c.props } })),
            canvasGridRows: storeCanvasGridRows,
            canvasBackground: { ...storeCanvasBackground },
            canvasPositionMode: storePositionMode,
          },
        },
      });
    }
  }, [
    activeAuthPage,
    pageOverrides,
    storeComponents,
    storeCanvasGridRows,
    storeCanvasBackground,
    storePositionMode,
    batchUpdateDraft,
  ]);

  useEffect(() => {
    // Detect builder → non-builder transition: flush state so preview gets latest
    if (wasBuilderMode.current && !isBuilderMode) {
      wasBuilderMode.current = false;
      flushBuilderToDraft();
      return;
    }
    wasBuilderMode.current = isBuilderMode;

    if (!isBuilderMode) return;

    // Guard: skip if page just changed (setActivePage triggers component changes)
    if (sync3PageRef.current !== activeAuthPage) {
      sync3PageRef.current = activeAuthPage;
      skipNextSync3.current = true;
      return;
    }
    if (skipNextSync3.current) {
      skipNextSync3.current = false;
      return;
    }

    flushBuilderToDraft();
  }, [
    isBuilderMode,
    storeComponents,
    storeCanvasGridRows,
    storeCanvasBackground,
    storePositionMode,
    activeAuthPage,
    flushBuilderToDraft,
  ]);

  // ── Send draft to iframe whenever draft changes ──
  // This MUST fire even in builder mode so the preview receives canvas data.
  // When user switches from builder to layout, the preview needs the latest canvas JSON.
  useEffect(() => {
    const draftJson = buildDraftJson();
    const slotJson = buildSlotConfigJson();
    sendDraft({
      loginBrandingJson: draftJson,
      slotConfigJson: slotJson,
      activeAuthPage,
    });
  }, [draft, activeAuthPage, sendDraft, buildDraftJson, buildSlotConfigJson]);

  // Loading state -- waiting for branding query to resolve
  if (vm.isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-nx-ground">
        <LoadingSpinner size="md" />
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

      {/* Right: Preview OR Builder Canvas OR Dashboard Preview */}
      {isBuilderMode ? (
        /* Full-width Builder Canvas */
        <div className="relative flex-1 overflow-auto bg-nx-ground p-6">
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
      ) : isDashboardMode ? (
        /* Full Dashboard Layout Preview */
        <div className="relative flex-1 overflow-hidden bg-nx-ground">
          <DashboardLayoutPreview settings={vm.draft.dashboardSettings} />
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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-nx-ground">
      {/* System Defaults Banner */}
      {vm.mode === "system" && (
        <div className="flex items-center gap-2 bg-nx-accent-fill px-4 py-2 text-sm font-medium text-nx-on-fill">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          <span>{t("studio.systemDefaultsBanner")}</span>
        </div>
      )}

      {/* Tenant Drilldown Banner */}
      {vm.mode === "tenant" && vm.targetTenantName && (
        <div className="flex items-center gap-2 bg-info px-4 py-2 text-sm font-medium text-info-foreground">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          <span>
            {t("studio.customizingTenant")} {vm.targetTenantName}
          </span>
        </div>
      )}

      {/* Auth Page Tabs -- switch between Login / Forgot Password / Reset Password */}
      {!isDashboardMode && (
        <AuthPageTabs activePageId={vm.activeAuthPage} onPageChange={vm.setActiveAuthPage} />
      )}

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
        <div className="flex items-center gap-2 border-b border-nx-line bg-nx-accent-wash px-4 py-1.5">
          <LayoutGrid className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
          <span className="text-xs font-medium text-nx-accent">
            {t("studio.builder.modeActive")} —{" "}
            <span className="font-normal text-nx-ink-2">{t("studio.builder.modeHint")}</span>
          </span>
          <div className="flex-1" />
          <span className="font-mono text-[10px] text-nx-ink-3">
            {builderStore.positionMode === "absolute"
              ? `⟐ ${t("studio.builder.freeForm")}`
              : `⊞ ${t("studio.builder.grid")}`}{" "}
            | {t("studio.builder.componentsCount", { count: builderStore.components.length })} |{" "}
            {builderStore.zoom}%
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
              <div className="flex min-w-[180px] items-center gap-2 rounded-nx-md border-2 border-nx-accent bg-nx-accent-wash px-3 py-2 shadow-nx-popover">
                <span className="text-xs font-semibold text-nx-accent">
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
        onSaveTheme={vm.saveTheme}
        customFieldConfigs={vm.themeCustomFieldConfigs}
        customFieldsLoading={vm.themeCustomFieldsLoading}
        customFieldValues={vm.themeCustomFieldValues}
        onCustomFieldChange={vm.updateThemeCustomFieldValue}
        onCustomFieldsCreated={() => void vm.refetchThemeCustomFields()}
      />
    </div>
  );
}
