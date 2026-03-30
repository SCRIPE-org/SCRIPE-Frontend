/**
 * BuilderPanel — Main panel for the DnD page builder
 *
 * Combines: palette, canvas, props panel, undo/redo, canvas settings.
 * This is shown when the "builder" tab is active AND canvasMode === 'builder'.
 * Wraps everything in a DndContext from @dnd-kit.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { cn } from "@/core/common/utils";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@core/ui/dialog";
import { Badge } from "@core/ui/badge";
import { Undo2, Redo2, RotateCcw, Rows3, Grid3X3, LayoutTemplate, ChevronDown, Save, AlertTriangle, Trash2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useBuilderStore } from "../../viewmodels/useBuilderStore";
import { BuilderPalette } from "./BuilderPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { BuilderPropsPanel } from "./BuilderPropsPanel";
import type { CanvasComponent, CanvasComponentType, CanvasBackground } from "../../../domain/entities/CanvasComponent";
import type { SavedTemplate } from "../../../domain/entities/SavedTemplate";
import { layoutToTemplate, getAllLayoutTemplates } from "../../../domain/entities/LayoutTemplates";

function loadSavedTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUILDER_TEMPLATES);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSavedTemplates(templates: SavedTemplate[]) {
  localStorage.setItem(STORAGE_KEYS.BUILDER_TEMPLATES, JSON.stringify(templates));
}

// ── Grid Overlap Detection ──────────────────────────────
function parseGridRange(span: string): [number, number] {
  const parts = span.split('/').map(s => parseInt(s.trim(), 10));
  return [parts[0] || 1, parts[1] || (parts[0] || 1) + 1];
}

function detectOverlaps(components: CanvasComponent[]): string[] {
  const visible = components.filter(c => c.visible);
  const warnings: string[] = [];
  for (let i = 0; i < visible.length; i++) {
    for (let j = i + 1; j < visible.length; j++) {
      const a = visible[i], b = visible[j];
      const [ac1, ac2] = parseGridRange(a.gridColumn);
      const [ar1, ar2] = parseGridRange(a.gridRow);
      const [bc1, bc2] = parseGridRange(b.gridColumn);
      const [br1, br2] = parseGridRange(b.gridRow);
      const colOverlap = ac1 < bc2 && bc1 < ac2;
      const rowOverlap = ar1 < br2 && br1 < ar2;
      if (colOverlap && rowOverlap) {
        warnings.push(`"${a.type}" and "${b.type}" overlap at grid area`);
      }
    }
  }
  return warnings;
}

interface BuilderPanelProps {
  draft: {
    canvasComponents: import("../../../domain/entities/CanvasComponent").CanvasComponent[];
    canvasGridRows: number;
    canvasBackground: import("../../../domain/entities/CanvasComponent").CanvasBackground;
  };
  updateDraft: (field: any, value: any) => void;
}

export function BuilderPanel({ draft, updateDraft }: BuilderPanelProps) {
  const { t } = useI18n();
  const store = useBuilderStore();
  const initializedRef = useRef(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  // Load saved templates on mount
  useEffect(() => { setSavedTemplates(loadSavedTemplates()); }, []);

  // Overlap detection
  const overlapWarnings = useMemo(() => detectOverlaps(store.components), [store.components]);

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

        {/* Save as Template + Saved Templates */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            onClick={() => { setTemplateName(''); setSaveDialogOpen(true); }}
            disabled={store.components.length === 0}
          >
            <Save className="h-3.5 w-3.5" />
            {t('studio.builder.saveTemplate') || 'Save as Template'}
          </Button>
          {savedTemplates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setShowSaved(p => !p)}
            >
              {savedTemplates.length}
              <ChevronDown className={cn("h-3 w-3 ml-0.5 transition-transform", showSaved && "rotate-180")} />
            </Button>
          )}
        </div>

        {/* Saved Templates List */}
        {showSaved && savedTemplates.length > 0 && (
          <div className="space-y-1 max-h-36 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2">
            {savedTemplates.map(tmpl => (
              <div key={tmpl.id} className="flex items-center gap-2">
                <button
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-[10px] font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors text-left truncate"
                  onClick={() => {
                    store.initialize(tmpl.components, tmpl.gridRows, tmpl.background);
                    setShowSaved(false);
                  }}
                >
                  {tmpl.name}
                </button>
                <button
                  className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => {
                    const updated = savedTemplates.filter(t => t.id !== tmpl.id);
                    setSavedTemplates(updated);
                    saveSavedTemplates(updated);
                  }}
                  title="Delete template"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Save Template Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t('studio.builder.saveTemplate') || 'Save as Template'}</DialogTitle>
              <DialogDescription>
                {t('studio.builder.saveTemplateDesc') || 'Save the current canvas layout as a reusable template.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="template-name" className="text-xs">
                {t('studio.builder.templateName') || 'Template Name'}
              </Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder={t('studio.builder.templateNamePlaceholder') || 'My Custom Template'}
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button
                size="sm"
                disabled={!templateName.trim()}
                onClick={() => {
                  const newTemplate: SavedTemplate = {
                    id: `tmpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    name: templateName.trim(),
                    components: structuredClone(store.components),
                    gridRows: store.canvasGridRows,
                    background: structuredClone(store.canvasBackground),
                    createdAt: new Date().toISOString(),
                  };
                  const updated = [...savedTemplates, newTemplate];
                  setSavedTemplates(updated);
                  saveSavedTemplates(updated);
                  setSaveDialogOpen(false);
                }}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {t('common.save') || 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Responsive Validation Warnings */}
        {overlapWarnings.length > 0 && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">
                {t('studio.builder.validationWarnings') || 'Layout Warnings'}
              </span>
              <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1 border-yellow-500/30">
                {overlapWarnings.length}
              </Badge>
            </div>
            {overlapWarnings.map((w, i) => (
              <p key={i} className="text-[10px] text-yellow-600/80 dark:text-yellow-400/80 pl-5">
                {w}
              </p>
            ))}
          </div>
        )}

        {/* Component Palette */}
        <BuilderPalette
          components={store.components}
          onQuickAdd={handleQuickAdd}
        />

        {/* Selected Component Props */}
        {selectedComponent && (
          <BuilderPropsPanel
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
