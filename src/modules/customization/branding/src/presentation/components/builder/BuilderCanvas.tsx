/**
 * BuilderCanvas — The main DnD canvas for the page builder
 *
 * Dual-mode canvas supporting both:
 *   - **Absolute (free-form)**: Components positioned via x/y pixel coordinates (DEFAULT)
 *   - **Grid**: Components positioned via CSS Grid columns/rows (fallback)
 *
 * Features:
 *   - Snap grid overlay (8px, toggleable)
 *   - Zoom controls (50% → 200%)
 *   - Drop zones for palette → canvas drag
 *   - Position mode toggle
 *   - Overlap detection warnings
 *
 * This is the STUDIO-SIDE canvas (not the preview iframe).
 */
"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Grid3X3, Move, ZoomIn, ZoomOut, Magnet, AlertTriangle } from "lucide-react";
import type { CanvasComponent, PositionMode } from "../../../domain/entities/CanvasComponent";
import {
  CANVAS_GRID_COLUMNS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  SNAP_GRID_SIZE,
} from "../../../domain/entities/CanvasComponent";
import { GridOverlay } from "./GridOverlay";
import { DraggableCanvasItem } from "./DraggableCanvasItem";

/** Parse "N / M" grid string → starting position number */
function parseGridStart(span: string): number {
  const match = span.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Sort components by grid position (row first, then column) for grid mode.
 * This ensures SortableContext items match the visual DOM order,
 * which is critical for dnd-kit's rectSortingStrategy to work correctly.
 */
function sortByGridPosition(components: CanvasComponent[]): CanvasComponent[] {
  return [...components].sort((a, b) => {
    const rowA = parseGridStart(a.gridRow);
    const rowB = parseGridStart(b.gridRow);
    if (rowA !== rowB) return rowA - rowB;
    const colA = parseGridStart(a.gridColumn);
    const colB = parseGridStart(b.gridColumn);
    return colA - colB;
  });
}

interface BuilderCanvasProps {
  components: CanvasComponent[];
  selectedComponentId: string | null;
  canvasGridRows: number;
  snapToGrid: boolean;
  positionMode: PositionMode;
  zoom: number;
  overlappingIds: Set<string>;
  onSelectComponent: (id: string | null) => void;
  onSetPositionMode: (mode: PositionMode) => void;
  onSetZoom: (zoom: number) => void;
  onSetSnapToGrid: (snap: boolean) => void;
  /** When true, renders at full available width (outside sidebar) */
  fullWidth?: boolean;
}

const ZOOM_STEPS = [50, 75, 100, 125, 150, 200];

export function BuilderCanvas({
  components,
  selectedComponentId,
  canvasGridRows,
  snapToGrid,
  positionMode,
  zoom,
  overlappingIds,
  onSelectComponent,
  onSetPositionMode,
  onSetZoom,
  onSetSnapToGrid,
  fullWidth = false,
}: BuilderCanvasProps) {
  const { t } = useI18n();
  const { setNodeRef, isOver } = useDroppable({ id: "builder-canvas" });
  const scale = zoom / 100;

  const nextZoom = () => {
    const idx = ZOOM_STEPS.indexOf(zoom);
    if (idx < ZOOM_STEPS.length - 1) onSetZoom(ZOOM_STEPS[idx + 1]);
  };
  const prevZoom = () => {
    const idx = ZOOM_STEPS.indexOf(zoom);
    if (idx > 0) onSetZoom(ZOOM_STEPS[idx - 1]);
  };

  const isAbsolute = positionMode === "absolute";

  return (
    <div className={cn("flex flex-col gap-2", fullWidth ? "h-full w-full" : "w-full")}>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Position mode toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-0.5">
          {/* UI-EXCEPTION: compact studio layout */}
          <button
            onClick={() => onSetPositionMode("absolute")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
              isAbsolute
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={t("studio.builder.freeForm") || "Free-form"}
          >
            <Move className="h-3 w-3" />
            <span>{t("studio.builder.freeForm") || "Free-form"}</span>
          </button>
          <button
            onClick={() => onSetPositionMode("grid")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
              !isAbsolute
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={t("studio.builder.grid") || "Grid"}
          >
            <Grid3X3 className="h-3 w-3" />
            <span>{t("studio.builder.grid") || "Grid"}</span>
          </button>
        </div>

        {/* Right controls: snap + zoom */}
        <div className="flex items-center gap-2">
          {/* Snap toggle */}
          <button
            onClick={() => onSetSnapToGrid(!snapToGrid)}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors",
              snapToGrid
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={t("studio.builder.snapToGrid") || "Snap to grid"}
          >
            <Magnet className="h-3 w-3" />
            <span className="hidden sm:inline">{SNAP_GRID_SIZE}px</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 rounded-md bg-muted/30">
            <button
              onClick={prevZoom}
              disabled={zoom <= ZOOM_STEPS[0]}
              className="flex h-6 w-6 items-center justify-center rounded-l-md transition-colors hover:bg-muted disabled:opacity-30"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="w-8 text-center font-mono text-[10px] text-muted-foreground">
              {zoom}%
            </span>
            <button
              onClick={nextZoom}
              disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              className="flex h-6 w-6 items-center justify-center rounded-r-md transition-colors hover:bg-muted disabled:opacity-30"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlap warning */}
      {overlappingIds.size > 0 && (
        <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>
            {overlappingIds.size / 2} overlapping component{overlappingIds.size > 2 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── Canvas container (scrollable + zoomable) ── */}
      <div className="overflow-auto rounded-xl border border-border/30 bg-muted/5">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: isAbsolute ? `${CANVAS_WIDTH}px` : undefined,
            minHeight: isAbsolute ? `${CANVAS_HEIGHT}px` : undefined,
          }}
        >
          <div
            ref={setNodeRef}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 border-dashed transition-all",
              isOver
                ? "border-primary/50 bg-primary/[0.02] shadow-[inset_0_0_40px_rgba(var(--primary-rgb,59,130,246),0.05)]"
                : "border-border/40 bg-muted/10"
            )}
            onClick={(e) => {
              if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasArea) {
                onSelectComponent(null);
              }
            }}
            style={{
              minHeight: isAbsolute ? `${CANVAS_HEIGHT}px` : `${canvasGridRows * 60}px`,
              width: isAbsolute ? `${CANVAS_WIDTH}px` : undefined,
            }}
          >
            {/* Grid Overlay */}
            <GridOverlay gridRows={canvasGridRows} show={snapToGrid && !isAbsolute} />

            {/* Snap grid for free-form mode */}
            {snapToGrid && isAbsolute && (
              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, currentColor 1px, transparent 1px),
                    linear-gradient(to bottom, currentColor 1px, transparent 1px)
                  `,
                  backgroundSize: `${SNAP_GRID_SIZE}px ${SNAP_GRID_SIZE}px`,
                }}
              />
            )}

            {/* Column number labels (top) — grid mode only */}
            {snapToGrid && !isAbsolute && (
              <div
                className="pointer-events-none absolute left-0 right-0 top-0 z-10"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${CANVAS_GRID_COLUMNS}, 1fr)`,
                  padding: "0 8px",
                }}
              >
                {Array.from({ length: CANVAS_GRID_COLUMNS }, (_, i) => (
                  <div
                    key={`col-label-${i}`}
                    className="flex h-5 items-center justify-center font-mono text-[8px] text-muted-foreground/30"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {/* ── Absolute (free-form) mode ── */}
            {isAbsolute ? (
              <div
                className="relative z-20 w-full"
                data-canvas-area="true"
                style={{ minHeight: `${CANVAS_HEIGHT}px` }}
              >
                {components
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map((comp) => (
                    <DraggableCanvasItem
                      key={comp.id}
                      component={comp}
                      isSelected={selectedComponentId === comp.id}
                      isOverlapping={overlappingIds.has(comp.id)}
                      positionMode="absolute"
                      zoom={zoom}
                      onSelect={() => onSelectComponent(comp.id)}
                    />
                  ))}
              </div>
            ) : (
              /* ── Grid mode ── */
              (() => {
                // Sort by grid position (row start, then column start) so
                // the SortableContext items array matches the visual layout.
                const parseStart = (s: string) => parseInt(s.split("/")[0]?.trim(), 10) || 1;
                const gridSorted = [...components].sort((a, b) => {
                  const rowDiff = parseStart(a.gridRow) - parseStart(b.gridRow);
                  if (rowDiff !== 0) return rowDiff;
                  return parseStart(a.gridColumn) - parseStart(b.gridColumn);
                });
                return (
                  <SortableContext
                    items={gridSorted.map((c) => c.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div
                      className="relative z-20 h-full w-full p-2"
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${CANVAS_GRID_COLUMNS}, 1fr)`,
                        gridTemplateRows: `repeat(${canvasGridRows}, minmax(${fullWidth ? "1fr" : "60px"}, 1fr))`,
                        gap: "6px",
                        minHeight: fullWidth ? "100%" : `${canvasGridRows * 60}px`,
                        paddingTop: snapToGrid ? "20px" : "8px",
                      }}
                    >
                      {gridSorted.map((comp) => (
                        <DraggableCanvasItem
                          key={comp.id}
                          component={comp}
                          isSelected={selectedComponentId === comp.id}
                          isOverlapping={overlappingIds.has(comp.id)}
                          positionMode="grid"
                          zoom={zoom}
                          onSelect={() => onSelectComponent(comp.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                );
              })()
            )}

            {/* Empty state */}
            {components.length === 0 && (
              <div className="absolute inset-0 z-30 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40">
                    <svg
                      className="h-6 w-6 text-muted-foreground/50"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">
                    {t("studio.builder.canvas.empty") || "Drop components here"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    {t("studio.builder.canvas.emptyHint") || "Drag from the palette or click +"}
                  </p>
                </div>
              </div>
            )}

            {/* Drop indicator overlay */}
            {isOver && (
              <div className="pointer-events-none absolute inset-0 z-40 rounded-xl">
                <div className="absolute inset-0 rounded-xl border-2 border-primary/40 bg-primary/[0.03]" />
                {/* Animated pulse */}
                <div className="absolute inset-0 animate-pulse rounded-xl border-2 border-primary/20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
