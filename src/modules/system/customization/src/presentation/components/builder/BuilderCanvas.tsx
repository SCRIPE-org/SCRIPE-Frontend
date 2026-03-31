/**
 * BuilderCanvas — The main DnD canvas for the page builder
 *
 * REBUILT: Now uses SortableContext with DraggableCanvasItem for real
 * drag-and-drop reordering. Full-width layout when rendered outside sidebar.
 * Shows grid overlay, drop zones, sorted components, and empty state.
 *
 * This is the STUDIO-SIDE canvas (not the preview iframe).
 */
"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { CanvasComponent } from "../../../domain/entities/CanvasComponent";
import { CANVAS_GRID_COLUMNS } from "../../../domain/entities/CanvasComponent";
import { GridOverlay } from "./GridOverlay";
import { DraggableCanvasItem } from "./DraggableCanvasItem";

interface BuilderCanvasProps {
  components: CanvasComponent[];
  selectedComponentId: string | null;
  canvasGridRows: number;
  snapToGrid: boolean;
  onSelectComponent: (id: string | null) => void;
  /** When true, renders at full available width (outside sidebar) */
  fullWidth?: boolean;
}

export function BuilderCanvas({
  components,
  selectedComponentId,
  canvasGridRows,
  snapToGrid,
  onSelectComponent,
  fullWidth = false,
}: BuilderCanvasProps) {
  const { t } = useI18n();
  const { setNodeRef, isOver } = useDroppable({ id: "builder-canvas" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all overflow-hidden",
        isOver
          ? "border-primary/50 bg-primary/[0.02] shadow-[inset_0_0_40px_rgba(var(--primary-rgb,59,130,246),0.05)]"
          : "border-border/40 bg-muted/10",
        fullWidth ? "w-full h-full" : "w-full",
      )}
      onClick={() => onSelectComponent(null)}
      style={{
        minHeight: fullWidth ? "100%" : `${canvasGridRows * 60}px`,
      }}
    >
      {/* Grid Overlay */}
      <GridOverlay gridRows={canvasGridRows} show={snapToGrid} />

      {/* Column number labels (top) */}
      {snapToGrid && (
        <div
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${CANVAS_GRID_COLUMNS}, 1fr)`,
            padding: "0 8px",
          }}
        >
          {Array.from({ length: CANVAS_GRID_COLUMNS }, (_, i) => (
            <div
              key={`col-label-${i}`}
              className="flex items-center justify-center h-5 text-[8px] font-mono text-muted-foreground/30"
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* The CSS Grid container with sortable components */}
      <SortableContext
        items={components.map(c => c.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className="relative z-20 w-full h-full p-2"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${CANVAS_GRID_COLUMNS}, 1fr)`,
            gridTemplateRows: `repeat(${canvasGridRows}, minmax(${fullWidth ? "1fr" : "60px"}, 1fr))`,
            gap: "6px",
            minHeight: fullWidth ? "100%" : `${canvasGridRows * 60}px`,
            paddingTop: snapToGrid ? "20px" : "8px",
          }}
        >
          {components
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((comp) => (
              <DraggableCanvasItem
                key={comp.id}
                component={comp}
                isSelected={selectedComponentId === comp.id}
                onSelect={() => onSelectComponent(comp.id)}
              />
            ))}
        </div>
      </SortableContext>

      {/* Empty state */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-center text-muted-foreground">
            <div className="mb-3 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40">
              <svg className="h-6 w-6 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <p className="text-sm font-medium">
              {t("studio.builder.canvas.empty") || "Drop components here"}
            </p>
            <p className="text-xs mt-1 text-muted-foreground/60">
              {t("studio.builder.canvas.emptyHint") || "Drag from the palette or click +"}
            </p>
          </div>
        </div>
      )}

      {/* Drop indicator overlay */}
      {isOver && (
        <div className="absolute inset-0 z-40 pointer-events-none rounded-xl">
          <div className="absolute inset-0 border-2 border-primary/40 rounded-xl bg-primary/[0.03]" />
          {/* Animated pulse */}
          <div className="absolute inset-0 border-2 border-primary/20 rounded-xl animate-pulse" />
        </div>
      )}
    </div>
  );
}
