/**
 * DashboardBuilderPanel — Full drag-and-drop builder panel for dashboard (M11)
 *
 * Contains widget palette, droppable canvas, props panel, and undo/redo.
 * Integrates with DashboardStudioPanel as a new "Builder" tab.
 *
 * @module dashboard/presentation/components
 */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { ScrollArea } from "@core/ui/scroll-area";
import { Separator } from "@core/ui/separator";
import { Badge } from "@core/ui/badge";
import {
  Undo2, Redo2, RotateCcw, Plus, Trash2,
  Eye, EyeOff, Copy, ArrowUp, ArrowDown,
  TrendingUp, BarChart3, Table2, Zap, Activity, CalendarDays,
  Bell, Megaphone, Code, Minus as MinusIcon, PlusIcon,
} from "lucide-react";
import { useDashboardBuilderStore } from "../../viewmodels/useDashboardBuilderStore";
import {
  WIDGET_CATALOG,
  type DashboardWidgetType,
  type DashboardBuilderCanvas,
} from "../../../domain/entities/DashboardWidget";
import { WidgetRenderer } from "./widgets";

// ── Icon resolver ─────────────────────────────────────────
const LUCIDE_MAP: Record<string, React.ElementType> = {
  TrendingUp, BarChart3, Table2, Zap, Activity,
  CalendarDays, Bell, Megaphone, Code,
};

function resolveIcon(name: string): React.ElementType {
  return LUCIDE_MAP[name] || BarChart3;
}

// ═══════════════════════════════════════════════════════════
// Draggable Palette Item
// ═══════════════════════════════════════════════════════════
function PaletteItem({ type, labelKey, icon, descriptionKey, requiredEdition }: {
  type: DashboardWidgetType;
  labelKey: string;
  icon: string;
  descriptionKey: string;
  requiredEdition: string | null;
}) {
  const { t } = useI18n();
  const Icon = resolveIcon(icon);
  const store = useDashboardBuilderStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette-${type}`, data: { type, source: 'palette' } });
  const isEnterprise = requiredEdition === 'enterprise';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex cursor-grab items-center gap-2.5 rounded-lg border border-border/50 p-2.5 transition-all",
        "hover:border-primary/30 hover:bg-primary/5",
        isDragging && "opacity-40",
        isEnterprise && "opacity-60"
      )}
    >
      <div className="rounded-md bg-primary/10 p-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium">{t(labelKey) || type}</p>
        <p className="truncate text-[10px] text-muted-foreground">{t(descriptionKey) || ""}</p>
      </div>
      {isEnterprise ? (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">ENT</Badge>
      ) : (
        <button
          className="rounded p-1 hover:bg-primary/10 shrink-0"
          onClick={(e) => { e.stopPropagation(); store.addWidget(type); }}
          title="Quick add"
        >
          <Plus className="h-3 w-3 text-primary" />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Droppable Canvas
// ═══════════════════════════════════════════════════════════
function BuilderCanvas({ onSelectWidget }: { onSelectWidget: (id: string | null) => void }) {
  const { t } = useI18n();
  const store = useDashboardBuilderStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'dashboard-canvas' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative min-h-[300px] rounded-xl border-2 border-dashed transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-border/50 bg-muted/20"
      )}
    >
      {store.widgets.length === 0 ? (
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-muted-foreground">
          <BarChart3 className="mb-2 h-8 w-8 opacity-30" />
          <p className="text-xs">{t("dashboard.builder.canvas.empty") || "Drop widgets here"}</p>
        </div>
      ) : (
        <div
          className="grid gap-3 p-3"
          style={{
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: `repeat(${store.gridRows}, minmax(100px, auto))`,
          }}
        >
          {store.widgets.filter(w => w.visible).sort((a, b) => a.zIndex - b.zIndex).map(w => (
            <div
              key={w.id}
              className={cn(
                "relative cursor-pointer rounded-lg ring-2 ring-transparent transition-all",
                store.selectedWidgetId === w.id && "ring-primary ring-offset-2 ring-offset-background"
              )}
              style={{
                gridColumn: w.gridColumn,
                gridRow: w.gridRow,
              }}
              onClick={(e) => { e.stopPropagation(); onSelectWidget(w.id); }}
            >
              <WidgetRenderer type={w.type} props={w.props} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Widget Properties Panel
// ═══════════════════════════════════════════════════════════
function WidgetPropsPanel() {
  const { t } = useI18n();
  const store = useDashboardBuilderStore();
  const widget = store.widgets.find(w => w.id === store.selectedWidgetId);

  if (!widget) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">
        {t("dashboard.builder.props.noSelection") || "Select a widget to edit its properties"}
      </div>
    );
  }

  const catalog = WIDGET_CATALOG.find(c => c.type === widget.type);

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold">{t(catalog?.labelKey || "") || widget.type}</h4>
        <div className="flex items-center gap-1">
          <button
            className="rounded p-1 hover:bg-muted"
            onClick={() => store.toggleVisibility(widget.id)}
            title={t("dashboard.builder.visibility") || "Toggle"}
          >
            {widget.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          <button
            className="rounded p-1 hover:bg-muted"
            onClick={() => store.duplicateWidget(widget.id)}
            title={t("dashboard.builder.duplicate") || "Duplicate"}
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            className="rounded p-1 hover:bg-destructive/10 text-destructive"
            onClick={() => store.removeWidget(widget.id)}
            title={t("dashboard.builder.remove") || "Remove"}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <Separator />

      {/* Grid Placement */}
      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {t("dashboard.builder.props.gridPlacement") || "Grid Placement"}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Column</span>
            <Input
              className="h-7 text-xs"
              value={widget.gridColumn}
              onChange={(e) => store.updateWidget(widget.id, { gridColumn: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Row</span>
            <Input
              className="h-7 text-xs"
              value={widget.gridRow}
              onChange={(e) => store.updateWidget(widget.id, { gridRow: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Z-Order */}
      <div className="flex items-center justify-between">
        <Label className="text-[10px] text-muted-foreground">
          {t("dashboard.builder.props.zIndex") || "Layer"}
        </Label>
        <div className="flex items-center gap-1">
          <button className="rounded p-1 hover:bg-muted" onClick={() => store.reorderZ(widget.id, 'back')}>
            <ArrowDown className="h-3 w-3" />
          </button>
          <span className="min-w-[20px] text-center text-xs">{widget.zIndex}</span>
          <button className="rounded p-1 hover:bg-muted" onClick={() => store.reorderZ(widget.id, 'forward')}>
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>

      <Separator />

      {/* Widget-specific props */}
      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {t("dashboard.builder.props.settings") || "Widget Settings"}
        </Label>
        {widget.type === 'statsCard' && (
          <div className="space-y-2">
            <Input className="h-7 text-xs" placeholder="Title" value={(widget.props.title as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })} />
            <Input className="h-7 text-xs" placeholder="Value" value={(widget.props.value as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, value: e.target.value } })} />
            <Input className="h-7 text-xs" placeholder="Trend" value={(widget.props.trend as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, trend: e.target.value } })} />
          </div>
        )}
        {widget.type === 'chart' && (
          <div className="space-y-2">
            <Input className="h-7 text-xs" placeholder="Title" value={(widget.props.title as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })} />
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Legend</Label>
              <Switch checked={(widget.props.showLegend as boolean) ?? true} onCheckedChange={(v) => store.updateWidget(widget.id, { props: { ...widget.props, showLegend: v } })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Grid</Label>
              <Switch checked={(widget.props.showGrid as boolean) ?? true} onCheckedChange={(v) => store.updateWidget(widget.id, { props: { ...widget.props, showGrid: v } })} />
            </div>
          </div>
        )}
        {widget.type === 'announcement' && (
          <div className="space-y-2">
            <Input className="h-7 text-xs" placeholder="Title" value={(widget.props.title as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })} />
            <Input className="h-7 text-xs" placeholder="Message" value={(widget.props.message as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, message: e.target.value } })} />
          </div>
        )}
        {widget.type === 'customWidget' && (
          <div className="space-y-2">
            <Input className="h-7 text-xs" placeholder="Title" value={(widget.props.title as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })} />
            <Input className="h-7 text-xs" placeholder="URL" value={(widget.props.url as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, url: e.target.value } })} />
          </div>
        )}
        {widget.type === 'activityFeed' && (
          <div className="space-y-2">
            <Input className="h-7 text-xs" placeholder="Title" value={(widget.props.title as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })} />
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Timestamps</Label>
              <Switch checked={(widget.props.showTimestamps as boolean) ?? true} onCheckedChange={(v) => store.updateWidget(widget.id, { props: { ...widget.props, showTimestamps: v } })} />
            </div>
          </div>
        )}
        {widget.type === 'dataTable' && (
          <div className="space-y-2">
            <Input className="h-7 text-xs" placeholder="Title" value={(widget.props.title as string) || ""} onChange={(e) => store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })} />
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Builder Panel
// ═══════════════════════════════════════════════════════════
interface DashboardBuilderPanelProps {
  initialCanvas?: DashboardBuilderCanvas;
  onCanvasChange?: (canvas: DashboardBuilderCanvas) => void;
}

export function DashboardBuilderPanel({ initialCanvas, onCanvasChange }: DashboardBuilderPanelProps) {
  const { t } = useI18n();
  const store = useDashboardBuilderStore();
  const [dragActiveType, setDragActiveType] = useState<DashboardWidgetType | null>(null);

  // Initialize from props
  useEffect(() => {
    if (initialCanvas) {
      store.initialize(initialCanvas);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        store.redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent on changes
  useEffect(() => {
    onCanvasChange?.(store.toCanvas());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.widgets, store.gridRows, store.enabled]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const type = event.active.data.current?.type as DashboardWidgetType;
    if (type) setDragActiveType(type);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDragActiveType(null);
    if (!event.over) return;
    const type = event.active.data.current?.type as DashboardWidgetType;
    const source = event.active.data.current?.source as string;
    if (source === 'palette' && type) {
      store.addWidget(type);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              disabled={!store.canUndo}
              onClick={() => store.undo()}
              title={`${t('dashboard.builder.undo') || 'Undo'} (Ctrl+Z)`}
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              disabled={!store.canRedo}
              onClick={() => store.redo()}
              title={`${t('dashboard.builder.redo') || 'Redo'} (Ctrl+Shift+Z)`}
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={() => store.reset()}
              title={t('dashboard.builder.reset') || 'Reset'}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">{t('dashboard.builder.gridRows') || 'Rows'}</Label>
            <div className="flex items-center gap-1">
              <button className="rounded p-0.5 hover:bg-muted" onClick={() => store.setGridRows(store.gridRows - 1)}>
                <MinusIcon className="h-3 w-3" />
              </button>
              <span className="min-w-[20px] text-center text-xs font-medium">{store.gridRows}</span>
              <button className="rounded p-0.5 hover:bg-muted" onClick={() => store.setGridRows(store.gridRows + 1)}>
                <PlusIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Palette + Props */}
          <div className="w-[220px] flex-shrink-0 border-e border-border">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                <h4 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("dashboard.builder.palette.title") || "Widgets"}
                </h4>
                {WIDGET_CATALOG.map(entry => (
                  <PaletteItem key={entry.type} {...entry} />
                ))}
              </div>
              <Separator />
              <WidgetPropsPanel />
            </ScrollArea>
          </div>

          {/* Right: Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <BuilderCanvas onSelectWidget={(id) => store.selectWidget(id)} />
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {dragActiveType && (
          <div className="rounded-lg border border-primary bg-card px-3 py-2 shadow-lg">
            <span className="text-xs font-medium">{dragActiveType}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
