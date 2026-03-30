/**
 * BuilderPanel — Main panel for the DnD page builder
 *
 * Combines: palette, canvas, props panel, undo/redo, canvas settings.
 * This is shown when the "builder" tab is active AND canvasMode === 'builder'.
 * Wraps everything in a DndContext from @dnd-kit.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { cn } from "@/core/common/utils";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Undo2, Redo2, RotateCcw, Rows3, Grid3X3, LayoutTemplate, ChevronDown } from "lucide-react";
import { useBuilderStore } from "../../viewmodels/useBuilderStore";
import { BuilderPalette } from "./BuilderPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { BuilderPropsPanel } from "./BuilderPropsPanel";
import type { CanvasComponentType } from "../../../domain/entities/CanvasComponent";
import { layoutToTemplate, getAllLayoutTemplates } from "../../../domain/entities/LayoutTemplates";

interface BuilderPanelProps {
  t: (key: string) => string;
  draft: {
    canvasComponents: import("../../../domain/entities/CanvasComponent").CanvasComponent[];
    canvasGridRows: number;
    canvasBackground: import("../../../domain/entities/CanvasComponent").CanvasBackground;
  };
  updateDraft: (field: any, value: any) => void;
}

export function BuilderPanel({ t, draft, updateDraft }: BuilderPanelProps) {
  const store = useBuilderStore();
  const initializedRef = useRef(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // ── Initialize builder store from draft on first render ──
  useEffect(() => {
    if (!initializedRef.current && draft) {
      store.initialize(draft.canvasComponents, draft.canvasGridRows, draft.canvasBackground);
      initializedRef.current = true;
    }
  }, [draft, store]);

  // ── Sync builder store changes back to draft ──
  useEffect(() => {
    if (!initializedRef.current) return;
    updateDraft('canvasComponents', store.components);
    updateDraft('canvasGridRows', store.canvasGridRows);
    updateDraft('canvasBackground', store.canvasBackground);
  }, [store.components, store.canvasGridRows, store.canvasBackground, updateDraft]);

  // ── DnD Sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  // ── DnD Handlers ──
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id !== 'builder-canvas') return;

    // Dragged from palette
    const data = active.data.current;
    if (data?.source === 'palette' && data?.type) {
      store.addComponent(data.type as CanvasComponentType);
    }
  }, [store]);

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }
      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        store.redo();
      }
      // Delete selected component
      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedComponentId) {
        // Don't delete if user is typing in an input
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
        e.preventDefault();
        store.removeComponent(store.selectedComponentId);
      }
      // Deselect on Escape
      if (e.key === 'Escape') {
        store.selectComponent(null);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  // Quick add from palette
  const handleQuickAdd = useCallback((type: CanvasComponentType) => {
    store.addComponent(type);
  }, [store]);

  // Selected component
  const selectedComponent = store.selectedComponentId
    ? store.components.find(c => c.id === store.selectedComponentId) || null
    : null;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* Toolbar: Undo/Redo + Canvas Settings */}
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={!store.canUndo}
            onClick={store.undo}
            title={`${t('studio.builder.undo') || 'Undo'} (Ctrl+Z)`}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={!store.canRedo}
            onClick={store.redo}
            title={`${t('studio.builder.redo') || 'Redo'} (Ctrl+Shift+Z)`}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          <div className="flex-1" />

          {/* Snap to grid toggle */}
          <Button
            variant={store.snapToGrid ? "default" : "outline"}
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => store.setSnapToGrid(!store.snapToGrid)}
            title={t('studio.builder.canvas.snap') || 'Snap to Grid'}
          >
            <Grid3X3 className="h-3 w-3" />
          </Button>

          {/* Reset */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={store.reset}
            title={t('studio.builder.reset') || 'Reset'}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Canvas Grid Rows */}
        <div className="flex items-center gap-2">
          <Rows3 className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-[10px] text-muted-foreground flex-1">
            {t('studio.builder.canvas.rows') || 'Grid Rows'}
          </Label>
          <Input
            type="number"
            min={4}
            max={20}
            value={store.canvasGridRows}
            onChange={(e) => store.setCanvasGridRows(parseInt(e.target.value, 10) || 8)}
            className="h-7 w-16 text-xs text-center"
          />
        </div>

        {/* Canvas Preview */}
        <BuilderCanvas
          t={t}
          components={store.components}
          selectedComponentId={store.selectedComponentId}
          canvasGridRows={store.canvasGridRows}
          snapToGrid={store.snapToGrid}
          onSelectComponent={store.selectComponent}
        />

        {/* Start from Template */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 gap-1.5 text-xs"
            onClick={() => setShowTemplates(p => !p)}
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            {t('studio.builder.fromTemplate') || 'Start from Template'}
            <ChevronDown className={cn("h-3 w-3 ml-auto transition-transform", showTemplates && "rotate-180")} />
          </Button>
          {showTemplates && (
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2">
              {getAllLayoutTemplates().map(({ layout, label }) => (
                <button
                  key={layout}
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-[10px] font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors text-left truncate"
                  onClick={() => {
                    const tmpl = layoutToTemplate(layout);
                    store.initialize(tmpl.components, tmpl.gridRows, tmpl.background);
                    setShowTemplates(false);
                  }}
                >
                  {t(`studio.layout.${label.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`) || label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Component Palette */}
        <BuilderPalette
          t={t}
          components={store.components}
          onQuickAdd={handleQuickAdd}
        />

        {/* Selected Component Props */}
        {selectedComponent && (
          <BuilderPropsPanel
            t={t}
            component={selectedComponent}
            onUpdate={(id, updates) => store.updateComponent(id, updates)}
            onUpdateProps={(id, props) => {
              const comp = store.components.find(c => c.id === id);
              if (comp) {
                store.updateComponent(id, { props: { ...comp.props, ...props } });
              }
            }}
            onRemove={store.removeComponent}
            onDuplicate={store.duplicateComponent}
            onToggleVisibility={store.toggleVisibility}
            onReorderZ={store.reorderZ}
          />
        )}
      </div>
    </DndContext>
  );
}
