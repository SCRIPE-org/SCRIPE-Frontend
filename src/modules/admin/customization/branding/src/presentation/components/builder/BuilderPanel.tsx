// UI-EXCEPTION: compact studio layout
/**
 * BuilderPanel — Main panel for the DnD page builder
 *
 * REBUILT: Canvas is now rendered OUTSIDE the sidebar (in CustomizerStudioView).
 * This panel only contains: toolbar, palette, layer list, and props panel.
 * DndContext wraps the entire builder experience (set in CustomizerStudioView).
 * DragOverlay + onDragEnd handlers are defined here but rendered at the
 * CustomizerStudioView level so palette→canvas drag works across the split.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/core/common/utils";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@core/ui/dialog";
import { Badge } from "@core/ui/badge";
import {
  Undo2,
  Redo2,
  RotateCcw,
  Rows3,
  Grid3X3,
  LayoutTemplate,
  ChevronDown,
  Save,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useBuilderStore } from "../../viewmodels/useBuilderStore";
import { BuilderPalette } from "./BuilderPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { BuilderPropsPanel } from "./BuilderPropsPanel";
import { ComponentOrderList } from "./ComponentOrderList";
import type {
  CanvasComponent,
  CanvasComponentType,
  CanvasBackground,
} from "../../../domain/entities/CanvasComponent";
import { layoutToTemplate, getAllLayoutTemplates } from "../../../domain/entities/LayoutTemplates";

// ── Grid Overlap Detection ──────────────────────────────
function parseGridRange(span: string): [number, number] {
  const parts = span.split("/").map((s) => parseInt(s.trim(), 10));
  return [parts[0] || 1, parts[1] || (parts[0] || 1) + 1];
}

interface OverlapWarning {
  a: string;
  b: string;
}

function detectOverlaps(components: CanvasComponent[]): OverlapWarning[] {
  const visible = components.filter((c) => c.visible);
  const warnings: OverlapWarning[] = [];
  for (let i = 0; i < visible.length; i++) {
    for (let j = i + 1; j < visible.length; j++) {
      const a = visible[i],
        b = visible[j];
      const [ac1, ac2] = parseGridRange(a.gridColumn);
      const [ar1, ar2] = parseGridRange(a.gridRow);
      const [bc1, bc2] = parseGridRange(b.gridColumn);
      const [br1, br2] = parseGridRange(b.gridRow);
      if (ac1 < bc2 && bc1 < ac2 && ar1 < br2 && br1 < ar2) {
        warnings.push({ a: a.type, b: b.type });
      }
    }
  }
  return warnings;
}

interface BuilderPanelProps {
  draft: {
    canvasComponents: CanvasComponent[];
    canvasGridRows: number;
    canvasBackground: CanvasBackground;
  };
  updateDraft: (field: any, value: any) => void;
  /** When true, only render sidebar content (palette/props/layers) — canvas is rendered externally */
  sidebarOnly?: boolean;
  /** Currently active auth page tab */
  activeAuthPage?: string;
}

export function BuilderPanel({
  draft,
  updateDraft,
  sidebarOnly = false,
  activeAuthPage,
}: BuilderPanelProps) {
  const { t } = useI18n();
  const store = useBuilderStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const savedTemplates = store.savedTemplates;
  const [showSaved, setShowSaved] = useState(false);

  // Load saved templates on mount
  useEffect(() => {
    setTimeout(() => {
      store.loadSavedTemplates();
    }, 0);
  }, [store]);

  // Overlap detection
  const overlapWarnings = useMemo(() => detectOverlaps(store.components), [store.components]);

  // ── Note: Builder initialization, page switching, and draft syncing are ALL ──
  // ── handled by CustomizerStudioView's SYNC effects. BuilderPanel is DISPLAY-ONLY. ──
  // ── DO NOT add store.initialize(), store.setActivePage(), or updateDraft() here ──
  // ── as they will conflict with the view's sync logic and cause cross-page leakage. ──

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        store.redo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && store.selectedComponentId) {
        if (
          (e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).tagName === "TEXTAREA"
        )
          return;
        e.preventDefault();
        store.removeComponent(store.selectedComponentId);
      }
      if (e.key === "Escape") {
        store.selectComponent(null);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [store]);

  // Quick add from palette
  const handleQuickAdd = useCallback(
    (type: CanvasComponentType) => {
      store.addComponent(type);
    },
    [store]
  );

  // Selected component
  const selectedComponent = store.selectedComponentId
    ? store.components.find((c) => c.id === store.selectedComponentId) || null
    : null;

  const sidebarContent = (
    <div className="space-y-4">
      {/* Toolbar: Undo/Redo + Canvas Settings */}
      <div className="flex items-center gap-2 border-b border-nx-line pb-3">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={!store.canUndo}
          onClick={store.undo}
          title={`${t("studio.builder.undo")} (Ctrl+Z)`}
          aria-label={t("studio.builder.undo")}
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={!store.canRedo}
          onClick={store.redo}
          title={`${t("studio.builder.redo")} (Ctrl+Shift+Z)`}
          aria-label={t("studio.builder.redo")}
        >
          <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>

        <div className="flex-1" />

        {/* Snap to grid toggle */}
        <Button
          variant={store.snapToGrid ? "default" : "outline"}
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => store.setSnapToGrid(!store.snapToGrid)}
          title={t("studio.builder.canvas.snap")}
          aria-label={t("studio.builder.canvas.snap")}
        >
          <Grid3X3 className="h-3 w-3" aria-hidden="true" />
        </Button>

        {/* Reset */}
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 text-nx-ink-3 hover:text-nx-danger"
          onClick={store.reset}
          title={t("studio.builder.reset")}
          aria-label={t("studio.builder.reset")}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>

      {/* Canvas Grid Rows */}
      <div className="flex items-center gap-2">
        <Rows3 className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
        <Label className="flex-1 text-[10px] text-nx-ink-3">
          {t("studio.builder.canvas.rows")}
        </Label>
        <Input
          type="number"
          min={4}
          max={20}
          value={store.canvasGridRows}
          onChange={(e) => store.setCanvasGridRows(parseInt(e.target.value, 10) || 8)}
          className="h-7 w-16 text-center text-xs"
        />
      </div>

      {/* Inline Canvas (only when not sidebarOnly) */}
      {!sidebarOnly && (
        <BuilderCanvas
          components={store.components}
          selectedComponentId={store.selectedComponentId}
          canvasGridRows={store.canvasGridRows}
          snapToGrid={store.snapToGrid}
          positionMode={store.positionMode}
          zoom={store.zoom}
          overlappingIds={new Set(overlapWarnings.map((_, i) => `overlap_${i}`))} // Quick mock, not actually used here since sidebarOnly=false is rare now
          onSelectComponent={store.selectComponent}
          onSetPositionMode={store.setPositionMode}
          onSetZoom={store.setZoom}
          onSetSnapToGrid={store.setSnapToGrid}
        />
      )}

      {/* Component Order / Layer List */}
      <ComponentOrderList
        components={store.components}
        selectedComponentId={store.selectedComponentId}
        onSelectComponent={store.selectComponent}
        onToggleVisibility={store.toggleVisibility}
      />

      {/* Selected Component Props — shown right after layers for discoverability */}
      {selectedComponent && (
        <BuilderPropsPanel
          component={selectedComponent}
          positionMode={store.positionMode}
          onUpdate={(id, updates) => store.updateComponent(id, updates)}
          onUpdateProps={(id, props) => {
            const comp = store.components.find((c) => c.id === id);
            if (comp) {
              store.updateComponent(id, {
                props: { ...comp.props, ...props },
              });
            }
          }}
          onRemove={store.removeComponent}
          onDuplicate={store.duplicateComponent}
          onToggleVisibility={store.toggleVisibility}
          onReorderZ={store.reorderZ}
          onLock={store.lockComponent}
          onUnlock={store.unlockComponent}
          onResize={store.resizeComponent}
        />
      )}

      {/* Start from Template */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full gap-1.5 text-xs"
          onClick={() => setShowTemplates((p) => !p)}
          aria-expanded={showTemplates}
        >
          <LayoutTemplate className="h-3.5 w-3.5" aria-hidden="true" />
          {t("studio.builder.fromTemplate")}
          <ChevronDown
            className={cn(
              "ms-auto h-3 w-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              showTemplates && "rotate-180"
            )}
            aria-hidden="true"
          />
        </Button>
        {showTemplates && (
          <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto rounded-nx-lg border border-nx-line bg-nx-raised p-2">
            {getAllLayoutTemplates().map(({ layout, label }) => (
              <button
                key={layout}
                className="truncate rounded-nx-sm border border-nx-line bg-nx-ground px-2 py-1.5 text-start text-[10px] font-medium text-nx-ink transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:border-nx-accent hover:bg-nx-accent-wash focus-visible:outline-none focus-visible:shadow-nx-focus"
                onClick={() => {
                  const tmpl = layoutToTemplate(layout);
                  store.loadTemplate(tmpl.components, tmpl.gridRows, tmpl.background);
                  setShowTemplates(false);
                }}
              >
                {t(`studio.layout.${label.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save as Template + Saved Templates */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 gap-1.5 text-xs"
          onClick={() => {
            setTemplateName("");
            setSaveDialogOpen(true);
          }}
          disabled={store.components.length === 0}
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          {t("studio.builder.saveTemplate")}
        </Button>
        {savedTemplates.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => setShowSaved((p) => !p)}
            aria-expanded={showSaved}
            aria-label={t("studio.builder.loadTemplate")}
          >
            <span className="tabular-nums">{savedTemplates.length}</span>
            <ChevronDown
              className={cn(
                "ms-0.5 h-3 w-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                showSaved && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Button>
        )}
      </div>

      {/* Saved Templates List */}
      {showSaved && savedTemplates.length > 0 && (
        <div className="max-h-36 space-y-1 overflow-y-auto rounded-nx-lg border border-nx-line bg-nx-raised p-2">
          {savedTemplates.map((tmpl) => (
            <div key={tmpl.id} className="flex items-center gap-2">
              <button
                className="flex-1 truncate rounded-nx-sm border border-nx-line bg-nx-ground px-2 py-1.5 text-start text-[10px] font-medium text-nx-ink transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:border-nx-accent hover:bg-nx-accent-wash focus-visible:outline-none focus-visible:shadow-nx-focus"
                onClick={() => {
                  store.loadTemplate(tmpl.components, tmpl.gridRows, tmpl.background);
                  setShowSaved(false);
                }}
              >
                {tmpl.name}
              </button>
              <button
                className="rounded-nx-sm p-1 text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:text-nx-danger focus-visible:outline-none focus-visible:shadow-nx-focus"
                onClick={() => {
                  store.deleteTemplate(tmpl.id);
                }}
                title={t("studio.builder.deleteTemplate")}
                aria-label={t("studio.builder.deleteTemplate")}
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("studio.builder.saveTemplate")}</DialogTitle>
            <DialogDescription>{t("studio.builder.saveTemplateDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="template-name" className="text-xs">
              {t("studio.builder.templateName")}
            </Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={t("studio.builder.templateNamePlaceholder")}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              disabled={!templateName.trim()}
              onClick={() => {
                store.saveTemplate(templateName);
                setSaveDialogOpen(false);
              }}
            >
              <Save className="me-1 h-3.5 w-3.5" aria-hidden="true" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Responsive Validation Warnings */}
      {overlapWarnings.length > 0 && (
        <div className="space-y-1.5 rounded-nx-lg border border-warning/30 bg-warning/5 p-2.5">
          <div className="flex items-center gap-1.5 text-warning">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs font-semibold">
              {t("studio.builder.validationWarnings")}
            </span>
            <Badge variant="outline" className="ms-auto h-4 border-warning/30 px-1 text-[10px] tabular-nums">
              {overlapWarnings.length}
            </Badge>
          </div>
          {overlapWarnings.map((w, i) => (
            <p key={i} className="ps-5 text-[10px] text-warning/80">
              {t("studio.builder.overlapPair", { a: w.a, b: w.b })}
            </p>
          ))}
        </div>
      )}

      {/* Component Palette */}
      <BuilderPalette
        components={store.components}
        onQuickAdd={handleQuickAdd}
        activeAuthPage={activeAuthPage}
      />
    </div>
  );

  // DndContext is now at CustomizerStudioView level (wraps both sidebar + canvas)
  return sidebarContent;
}
