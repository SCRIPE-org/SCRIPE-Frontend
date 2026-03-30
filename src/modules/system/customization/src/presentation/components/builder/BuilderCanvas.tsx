/**
 * BuilderCanvas — The main DnD canvas for the page builder
 *
 * Renders placed components as a visual 12-column grid representation.
 * Components can be selected by clicking. The canvas shows a grid overlay
 * and droppable zones for new components from the palette.
 *
 * This is the STUDIO-SIDE canvas (not the preview iframe).
 * It shows a compact representation of components with selection outlines.
 */
"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/core/common/utils";
import {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video, GripVertical, Eye, EyeOff,
} from "lucide-react";
import type { CanvasComponent } from "../../../domain/entities/CanvasComponent";
import { CANVAS_GRID_COLUMNS, COMPONENT_CATALOG } from "../../../domain/entities/CanvasComponent";
import { GridOverlay } from "./GridOverlay";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video,
};

interface BuilderCanvasProps {
  t: (key: string) => string;
  components: CanvasComponent[];
  selectedComponentId: string | null;
  canvasGridRows: number;
  snapToGrid: boolean;
  onSelectComponent: (id: string | null) => void;
}

function CanvasComponentCard({
  component,
  isSelected,
  onSelect,
  t,
}: {
  component: CanvasComponent;
  isSelected: boolean;
  onSelect: () => void;
  t: (key: string) => string;
}) {
  const catalog = COMPONENT_CATALOG.find(c => c.type === component.type);
  const Icon = ICON_MAP[catalog?.icon || 'Image'] || Image;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={cn(
        "relative flex items-center gap-2 rounded-lg border-2 px-3 py-2 cursor-pointer transition-all group min-h-[48px]",
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
          : "border-border/60 bg-card/80 hover:border-primary/40 hover:bg-accent/20",
        !component.visible && "opacity-40",
      )}
      style={{
        gridColumn: component.gridColumn,
        gridRow: component.gridRow,
        zIndex: component.zIndex + 10,
        alignSelf: component.verticalAlignment === 'start' ? 'start' : component.verticalAlignment === 'end' ? 'end' : 'center',
        justifySelf: component.alignment,
      }}
    >
      {/* Drag handle */}
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 cursor-grab" />

      {/* Icon */}
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
        isSelected ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground",
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Label */}
      <span className="text-[11px] font-medium text-foreground truncate flex-1">
        {t(catalog?.labelKey || '') || component.type}
      </span>

      {/* Visibility indicator */}
      {!component.visible && (
        <EyeOff className="h-3 w-3 text-muted-foreground/50 shrink-0" />
      )}

      {/* Selection indicator dot */}
      {isSelected && (
        <div className="absolute -top-1 -end-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
      )}

      {/* Resize handle (visual only — position via props panel) */}
      {isSelected && (
        <div className="absolute -bottom-1 -end-1 h-3 w-3 rounded-sm bg-primary/60 border border-background cursor-se-resize" />
      )}
    </div>
  );
}

export function BuilderCanvas({
  t, components, selectedComponentId, canvasGridRows, snapToGrid, onSelectComponent,
}: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'builder-canvas' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative w-full rounded-xl border-2 border-dashed transition-colors overflow-hidden",
        isOver ? "border-primary/50 bg-primary/[0.02]" : "border-border/40 bg-muted/10",
      )}
      onClick={() => onSelectComponent(null)}
      style={{ minHeight: `${canvasGridRows * 60}px` }}
    >
      {/* Grid Overlay */}
      <GridOverlay gridRows={canvasGridRows} show={snapToGrid} />

      {/* The CSS Grid container */}
      <div
        className="relative z-20 w-full h-full p-2"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${CANVAS_GRID_COLUMNS}, 1fr)`,
          gridTemplateRows: `repeat(${canvasGridRows}, minmax(60px, 1fr))`,
          gap: '4px',
          minHeight: `${canvasGridRows * 60}px`,
        }}
      >
        {components
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((comp) => (
            <CanvasComponentCard
              key={comp.id}
              component={comp}
              isSelected={selectedComponentId === comp.id}
              onSelect={() => onSelectComponent(comp.id)}
              t={t}
            />
          ))}
      </div>

      {/* Empty state */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-center text-muted-foreground">
            <p className="text-sm font-medium">{t('studio.builder.canvas.empty') || 'Drop components here'}</p>
            <p className="text-xs mt-1">{t('studio.builder.canvas.emptyHint') || 'Drag from the palette or click +'}</p>
          </div>
        </div>
      )}

      {/* Drop indicator */}
      {isOver && (
        <div className="absolute inset-0 z-40 pointer-events-none border-2 border-primary/40 rounded-xl bg-primary/[0.03]" />
      )}
    </div>
  );
}
