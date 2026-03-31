/**
 * DraggableCanvasItem — Sortable/draggable wrapper for canvas components
 *
 * Uses @dnd-kit/sortable to make each placed component reorderable.
 * Provides: grab handle, selection state, visibility badge, type icon.
 * This replaces the old static CanvasComponentCard.
 */
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/core/common/utils";
import {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video, GripVertical, EyeOff,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { CanvasComponent } from "../../../domain/entities/CanvasComponent";
import { COMPONENT_CATALOG } from "../../../domain/entities/CanvasComponent";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video,
};

interface DraggableCanvasItemProps {
  component: CanvasComponent;
  isSelected: boolean;
  onSelect: () => void;
}

export function DraggableCanvasItem({ component, isSelected, onSelect }: DraggableCanvasItemProps) {
  const { t } = useI18n();
  const catalog = COMPONENT_CATALOG.find(c => c.type === component.type);
  const Icon = ICON_MAP[catalog?.icon || "Image"] || Image;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    data: {
      type: component.type,
      source: "canvas",
      component,
    },
  });

  const style: React.CSSProperties = {
    gridColumn: component.gridColumn,
    gridRow: component.gridRow,
    zIndex: isDragging ? 999 : component.zIndex + 10,
    alignSelf:
      component.verticalAlignment === "start"
        ? "start"
        : component.verticalAlignment === "end"
          ? "end"
          : "center",
    justifySelf: component.alignment,
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 cursor-pointer transition-all group min-h-[52px]",
        isDragging && "opacity-40 scale-[0.98] ring-2 ring-primary/30 shadow-2xl z-50",
        isSelected
          ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
          : "border-border/60 bg-card/90 hover:border-primary/40 hover:bg-accent/20 hover:shadow-sm",
        !component.visible && "opacity-40",
      )}
    >
      {/* Drag Handle — ONLY this triggers drag */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "flex items-center justify-center rounded-md p-0.5 cursor-grab active:cursor-grabbing transition-colors",
          isDragging
            ? "text-primary"
            : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/60",
        )}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isSelected
            ? "bg-primary/15 text-primary"
            : "bg-muted/60 text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-foreground truncate block">
          {t(catalog?.labelKey || "") || component.type}
        </span>
        {/* Show grid position hint */}
        <span className="text-[9px] text-muted-foreground/60 font-mono">
          {component.gridColumn} / {component.gridRow}
        </span>
      </div>

      {/* Visibility indicator */}
      {!component.visible && (
        <EyeOff className="h-3 w-3 text-muted-foreground/50 shrink-0" />
      )}

      {/* Selection indicator corners */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -start-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
          <div className="absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
          <div className="absolute -bottom-1 -start-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
          <div className="absolute -bottom-1 -end-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
        </>
      )}

      {/* Type badge on selected */}
      {isSelected && (
        <div className="absolute -top-2.5 start-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold whitespace-nowrap shadow-sm">
          {t(catalog?.labelKey || "") || component.type}
        </div>
      )}
    </div>
  );
}

/**
 * DragOverlayItem — Rendered inside DragOverlay during dragging
 * Shows a simplified ghost of the component being dragged.
 */
export function DragOverlayItem({ component }: { component: CanvasComponent }) {
  const { t } = useI18n();
  const catalog = COMPONENT_CATALOG.find(c => c.type === component.type);
  const Icon = ICON_MAP[catalog?.icon || "Image"] || Image;

  return (
    <div className="flex items-center gap-2.5 rounded-lg border-2 border-primary bg-primary/10 px-3 py-2.5 shadow-2xl backdrop-blur-sm min-h-[52px] min-w-[200px] cursor-grabbing">
      <GripVertical className="h-4 w-4 text-primary" />
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xs font-semibold text-primary truncate">
        {t(catalog?.labelKey || "") || component.type}
      </span>
    </div>
  );
}
