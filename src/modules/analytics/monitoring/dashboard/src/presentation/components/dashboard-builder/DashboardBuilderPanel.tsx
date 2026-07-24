// UI-EXCEPTION: compact studio layout
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
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { ScrollArea } from "@core/ui/scroll-area";
import { Separator } from "@core/ui/separator";
import { Badge } from "@core/ui/badge";
import {
  Undo2,
  Redo2,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  BarChart3,
  Table2,
  Zap,
  Activity,
  CalendarDays,
  Bell,
  Megaphone,
  Code,
  Minus as MinusIcon,
  PlusIcon,
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
  TrendingUp,
  BarChart3,
  Table2,
  Zap,
  Activity,
  CalendarDays,
  Bell,
  Megaphone,
  Code,
};

function resolveIcon(name: string): React.ElementType {
  return LUCIDE_MAP[name] || BarChart3;
}

// The studio's small icon controls, written once so the palette, the toolbar
// and the props panel cannot drift apart.
const ICON_CONTROL =
  "rounded-nx-sm p-1 text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none";

// ═══════════════════════════════════════════════════════════
// Draggable Palette Item
// ═══════════════════════════════════════════════════════════
function PaletteItem({
  type,
  labelKey,
  icon,
  descriptionKey,
  requiredEdition,
}: {
  type: DashboardWidgetType;
  labelKey: string;
  icon: string;
  descriptionKey: string;
  requiredEdition: string | null;
}) {
  const { t } = useI18n();
  const resolvedIconComponent = resolveIcon(icon);
  const store = useDashboardBuilderStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: "palette" },
  });
  const isEnterprise = requiredEdition === "enterprise";

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-nx-control border border-nx-line p-2.5",
        "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        "hover:border-nx-line-hi hover:bg-nx-hover",
        isDragging && "opacity-40",
        isEnterprise && "opacity-60"
      )}
    >
      {/*
        dnd-kit's `listeners` and `attributes` describe ONE node: the sensor
        subscribes through the listeners while the attributes carry the node's
        role and the live drag announcement. Splitting them across two elements
        leaves the sensor without the pointerdown it activates on, and the drag
        silently stops working. They stay together on this button.

        The quick-add control is a SIBLING of the drag handle rather than a
        child, because a <button> inside a <button> is invalid markup and the
        inner one stops being reachable.
      */}
      <button
        type="button"
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="flex min-w-0 flex-1 cursor-grab items-center gap-2.5 rounded-nx-sm text-start focus-visible:outline-none focus-visible:shadow-nx-focus"
      >
        <span className="shrink-0 rounded-nx-md bg-nx-accent-wash p-1.5">
          {React.createElement(resolvedIconComponent, {
            className: "h-3.5 w-3.5 text-nx-accent",
            "aria-hidden": "true",
          })}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-nx-ink">{t(labelKey)}</span>
          <span className="block truncate text-[10px] text-nx-ink-3">{t(descriptionKey)}</span>
        </span>
      </button>
      {isEnterprise ? (
        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
          <span aria-hidden="true">{t("dashboard.builder.enterpriseShort")}</span>
          <span className="sr-only">{t("dashboard.builder.enterpriseOnly")}</span>
        </Badge>
      ) : (
        <button
          type="button"
          aria-label={t("dashboard.builder.quickAdd")}
          className={cn(
            ICON_CONTROL,
            "shrink-0 text-nx-accent hover:bg-nx-accent-wash hover:text-nx-accent"
          )}
          onClick={(e) => {
            e.stopPropagation();
            store.addWidget(type);
          }}
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
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
  const { setNodeRef, isOver } = useDroppable({ id: "dashboard-canvas" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative min-h-[300px] rounded-nx-lg border-2 border-dashed",
        "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        isOver ? "border-nx-accent bg-nx-accent-wash" : "border-nx-line bg-nx-hover"
      )}
    >
      {store.widgets.length === 0 ? (
        <div className="flex h-full min-h-[300px] items-center justify-center">
          <EmptyState
            bare
            size="sm"
            icon={BarChart3}
            title={t("dashboard.builder.canvas.empty")}
          />
        </div>
      ) : (
        <div
          className="grid gap-3 p-3"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            gridTemplateRows: `repeat(${store.gridRows}, minmax(100px, auto))`,
          }}
        >
          {store.widgets
            .filter((w) => w.visible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((w) => {
              const entry = WIDGET_CATALOG.find((c) => c.type === w.type);
              const isSelected = store.selectedWidgetId === w.id;

              return (
                // The tile stays a div because its preview can contain its own
                // link (the custom-widget embed); it wears the sanctioned
                // role/tabIndex/keyboard trio instead (stat-card.tsx L192-201).
                <div
                  key={w.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={t("dashboard.builder.canvas.selectWidget", {
                    name: entry ? t(entry.labelKey) : w.type,
                  })}
                  className={cn(
                    "relative cursor-pointer rounded-nx-lg ring-2 ring-transparent",
                    "transition-[box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:shadow-nx-focus",
                    isSelected && "ring-nx-accent"
                  )}
                  style={{
                    gridColumn: w.gridColumn,
                    gridRow: w.gridRow,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWidget(w.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectWidget(w.id);
                    }
                  }}
                >
                  <WidgetRenderer type={w.type} props={w.props} />
                </div>
              );
            })}
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
  const widget = store.widgets.find((w) => w.id === store.selectedWidgetId);

  if (!widget) {
    return (
      <div className="p-4 text-center text-xs text-nx-ink-3">
        {t("dashboard.builder.props.noSelection")}
      </div>
    );
  }

  const catalog = WIDGET_CATALOG.find((c) => c.type === widget.type);

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="truncate text-xs font-semibold text-nx-ink">
          {catalog ? t(catalog.labelKey) : widget.type}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={ICON_CONTROL}
            aria-label={t("dashboard.builder.visibility")}
            aria-pressed={widget.visible}
            onClick={() => store.toggleVisibility(widget.id)}
          >
            {widget.visible ? (
              <Eye className="h-3 w-3" aria-hidden="true" />
            ) : (
              <EyeOff className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className={ICON_CONTROL}
            aria-label={t("dashboard.builder.duplicate")}
            onClick={() => store.duplicateWidget(widget.id)}
          >
            <Copy className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(
              ICON_CONTROL,
              "text-nx-danger hover:bg-destructive/10 hover:text-nx-danger"
            )}
            aria-label={t("dashboard.builder.remove")}
            onClick={() => store.removeWidget(widget.id)}
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Separator />

      {/* Grid Placement */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-wider text-nx-ink-3">
          {t("dashboard.builder.props.gridPlacement")}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="builder-grid-column" className="text-[10px] text-nx-ink-3">
              {t("dashboard.builder.props.column")}
            </Label>
            <Input
              id="builder-grid-column"
              className="h-7 text-xs"
              value={widget.gridColumn}
              onChange={(e) => store.updateWidget(widget.id, { gridColumn: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="builder-grid-row" className="text-[10px] text-nx-ink-3">
              {t("dashboard.builder.props.row")}
            </Label>
            <Input
              id="builder-grid-row"
              className="h-7 text-xs"
              value={widget.gridRow}
              onChange={(e) => store.updateWidget(widget.id, { gridRow: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Z-Order */}
      <div className="flex items-center justify-between">
        <Label className="text-[10px] text-nx-ink-3">
          {t("dashboard.builder.props.zIndex")}
        </Label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={ICON_CONTROL}
            aria-label={t("dashboard.builder.props.sendBackward")}
            onClick={() => store.reorderZ(widget.id, "back")}
          >
            <ArrowDown className="h-3 w-3" aria-hidden="true" />
          </button>
          <span className="min-w-[20px] text-center text-xs tabular-nums text-nx-ink">
            {widget.zIndex}
          </span>
          <button
            type="button"
            className={ICON_CONTROL}
            aria-label={t("dashboard.builder.props.bringForward")}
            onClick={() => store.reorderZ(widget.id, "forward")}
          >
            <ArrowUp className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Separator />

      {/* Widget-specific props */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-wider text-nx-ink-3">
          {t("dashboard.builder.props.settings")}
        </Label>
        {widget.type === "statsCard" && (
          <div className="space-y-2">
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetTitle")}
              placeholder={t("dashboard.builder.props.widgetTitle")}
              value={(widget.props.title as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })
              }
            />
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetValue")}
              placeholder={t("dashboard.builder.props.widgetValue")}
              value={(widget.props.value as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, { props: { ...widget.props, value: e.target.value } })
              }
            />
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetTrend")}
              placeholder={t("dashboard.builder.props.widgetTrend")}
              value={(widget.props.trend as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, { props: { ...widget.props, trend: e.target.value } })
              }
            />
          </div>
        )}
        {widget.type === "chart" && (
          <div className="space-y-2">
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetTitle")}
              placeholder={t("dashboard.builder.props.widgetTitle")}
              value={(widget.props.title as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })
              }
            />
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="builder-chart-legend" className="text-xs">
                {t("dashboard.builder.props.showLegend")}
              </Label>
              <Switch
                id="builder-chart-legend"
                checked={(widget.props.showLegend as boolean) ?? true}
                onCheckedChange={(v) =>
                  store.updateWidget(widget.id, { props: { ...widget.props, showLegend: v } })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="builder-chart-grid" className="text-xs">
                {t("dashboard.builder.props.showGrid")}
              </Label>
              <Switch
                id="builder-chart-grid"
                checked={(widget.props.showGrid as boolean) ?? true}
                onCheckedChange={(v) =>
                  store.updateWidget(widget.id, { props: { ...widget.props, showGrid: v } })
                }
              />
            </div>
          </div>
        )}
        {widget.type === "announcement" && (
          <div className="space-y-2">
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetTitle")}
              placeholder={t("dashboard.builder.props.widgetTitle")}
              value={(widget.props.title as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })
              }
            />
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetMessage")}
              placeholder={t("dashboard.builder.props.widgetMessage")}
              value={(widget.props.message as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, {
                  props: { ...widget.props, message: e.target.value },
                })
              }
            />
          </div>
        )}
        {widget.type === "customWidget" && (
          <div className="space-y-2">
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetTitle")}
              placeholder={t("dashboard.builder.props.widgetTitle")}
              value={(widget.props.title as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })
              }
            />
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetUrl")}
              placeholder={t("dashboard.builder.props.widgetUrl")}
              value={(widget.props.url as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, { props: { ...widget.props, url: e.target.value } })
              }
            />
          </div>
        )}
        {widget.type === "activityFeed" && (
          <div className="space-y-2">
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetTitle")}
              placeholder={t("dashboard.builder.props.widgetTitle")}
              value={(widget.props.title as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })
              }
            />
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="builder-feed-timestamps" className="text-xs">
                {t("dashboard.builder.props.showTimestamps")}
              </Label>
              <Switch
                id="builder-feed-timestamps"
                checked={(widget.props.showTimestamps as boolean) ?? true}
                onCheckedChange={(v) =>
                  store.updateWidget(widget.id, { props: { ...widget.props, showTimestamps: v } })
                }
              />
            </div>
          </div>
        )}
        {widget.type === "dataTable" && (
          <div className="space-y-2">
            <Input
              className="h-7 text-xs"
              aria-label={t("dashboard.builder.props.widgetTitle")}
              placeholder={t("dashboard.builder.props.widgetTitle")}
              value={(widget.props.title as string) || ""}
              onChange={(e) =>
                store.updateWidget(widget.id, { props: { ...widget.props, title: e.target.value } })
              }
            />
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

export function DashboardBuilderPanel({
  initialCanvas,
  onCanvasChange,
}: DashboardBuilderPanelProps) {
  const { t } = useI18n();
  const store = useDashboardBuilderStore();
  const [dragActiveType, setDragActiveType] = useState<DashboardWidgetType | null>(null);

  // Initialize from props
  useEffect(() => {
    if (initialCanvas) {
      store.initialize(initialCanvas);
    }
  }, []);

  // Keyboard shortcuts
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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Notify parent on changes
  useEffect(() => {
    onCanvasChange?.(store.toCanvas());
  }, [store.widgets, store.gridRows, store.enabled]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const type = event.active.data.current?.type as DashboardWidgetType;
    if (type) setDragActiveType(type);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragActiveType(null);
      if (!event.over) return;
      const type = event.active.data.current?.type as DashboardWidgetType;
      const source = event.active.data.current?.source as string;
      if (source === "palette" && type) {
        store.addWidget(type);
      }
    },
    [store]
  );

  const dragActiveEntry = dragActiveType
    ? WIDGET_CATALOG.find((c) => c.type === dragActiveType)
    : undefined;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-nx-line px-3 py-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={!store.canUndo}
              onClick={() => store.undo()}
              aria-label={t("dashboard.builder.undoShortcut")}
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={!store.canRedo}
              onClick={() => store.redo()}
              aria-label={t("dashboard.builder.redoShortcut")}
            >
              <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => store.reset()}
              aria-label={t("dashboard.builder.reset")}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">{t("dashboard.builder.gridRows")}</Label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={cn(ICON_CONTROL, "p-0.5")}
                aria-label={t("dashboard.builder.fewerRows")}
                onClick={() => store.setGridRows(store.gridRows - 1)}
              >
                <MinusIcon className="h-3 w-3" aria-hidden="true" />
              </button>
              <span className="min-w-[20px] text-center text-xs font-medium tabular-nums text-nx-ink">
                {store.gridRows}
              </span>
              <button
                type="button"
                className={cn(ICON_CONTROL, "p-0.5")}
                aria-label={t("dashboard.builder.moreRows")}
                onClick={() => store.setGridRows(store.gridRows + 1)}
              >
                <PlusIcon className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Palette + Props */}
          <div className="w-[220px] flex-shrink-0 border-e border-nx-line">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                <h4 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
                  {t("dashboard.builder.palette.title")}
                </h4>
                {WIDGET_CATALOG.map((entry) => (
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
          <div className="rounded-nx-control border border-nx-accent bg-nx-popover px-3 py-2 shadow-nx-popover">
            <span className="text-xs font-medium text-nx-ink">
              {dragActiveEntry ? t(dragActiveEntry.labelKey) : dragActiveType}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
