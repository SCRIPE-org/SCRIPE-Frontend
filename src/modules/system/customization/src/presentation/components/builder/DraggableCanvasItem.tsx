/**
 * DraggableCanvasItem — Sortable/draggable wrapper for canvas components
 *
 * Dual-mode component:
 *   - **Absolute**: Positioned via x/y, draggable anywhere, 8 resize handles
 *   - **Grid**: CSS Grid placement with sortable reordering
 *
 * Shows: grab handle, selection state, visibility badge, lock indicator,
 * overlap warning, type icon, and WYSIWYG preview via ComponentRenderer.
 */
"use client";
// UI-EXCEPTION: compact studio layout — native elements used for resize handles
// and compact drag handles where @core/ui sizing conflicts with precision layout.

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/core/common/utils";
import {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video, GripVertical, EyeOff, Lock,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { CanvasComponent, PositionMode } from "../../../domain/entities/CanvasComponent";
import { COMPONENT_CATALOG } from "../../../domain/entities/CanvasComponent";
import { ComponentRenderer } from "./ComponentRenderer";
import { useCallback, useRef, useState } from "react";
import { useBuilderStore } from "../../viewmodels/useBuilderStore";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video,
};

interface DraggableCanvasItemProps {
  component: CanvasComponent;
  isSelected: boolean;
  isOverlapping?: boolean;
  positionMode: PositionMode;
  onSelect: () => void;
}

/** Resize handle positions */
const RESIZE_HANDLES = [
  { position: 'top-left', cursor: 'nwse-resize', className: '-top-1 -start-1' },
  { position: 'top-right', cursor: 'nesw-resize', className: '-top-1 -end-1' },
  { position: 'bottom-left', cursor: 'nesw-resize', className: '-bottom-1 -start-1' },
  { position: 'bottom-right', cursor: 'nwse-resize', className: '-bottom-1 -end-1' },
  { position: 'top', cursor: 'ns-resize', className: '-top-1 start-1/2 -translate-x-1/2' },
  { position: 'bottom', cursor: 'ns-resize', className: '-bottom-1 start-1/2 -translate-x-1/2' },
  { position: 'left', cursor: 'ew-resize', className: 'top-1/2 -start-1 -translate-y-1/2' },
  { position: 'right', cursor: 'ew-resize', className: 'top-1/2 -end-1 -translate-y-1/2' },
] as const;

export function DraggableCanvasItem({
  component,
  isSelected,
  isOverlapping = false,
  positionMode,
  onSelect,
}: DraggableCanvasItemProps) {
  const { t, direction } = useI18n();
  const isRTL = direction === 'rtl';
  const catalog = COMPONENT_CATALOG.find(c => c.type === component.type);
  const Icon = ICON_MAP[catalog?.icon || "Image"] || Image;
  const isAbsolute = positionMode === 'absolute';
  const store = useBuilderStore();

  // Drag state for absolute mode
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number; origX: number; origY: number; handle: string } | null>(null);
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);

  // Grid mode: use dnd-kit sortable
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: component.id,
    data: {
      type: component.type,
      source: "canvas",
      component,
    },
    disabled: isAbsolute, // Disable sortable in absolute mode
  });

  // ── Absolute mode: mouse-based drag ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isAbsolute || component.locked) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    store.beginInteraction();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: component.x,
      origY: component.y,
    };
    setIsDraggingLocal(true);

    const handleMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      // RTL: invert horizontal direction so visual drag matches movement
      const directedDx = isRTL ? -dx : dx;
      store.moveComponentAbsolute(
        component.id,
        dragRef.current.origX + directedDx,
        dragRef.current.origY + dy,
      );
    };

    const handleUp = () => {
      dragRef.current = null;
      setIsDraggingLocal(false);
      store.commitInteraction();
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [isAbsolute, component.locked, component.id, component.x, component.y, store, onSelect, isRTL]);

  // ── Absolute mode: resize handles ──
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    if (!isAbsolute || component.locked) return;
    e.preventDefault();
    e.stopPropagation();
    store.beginInteraction();

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: component.width || 200,
      origH: component.height || 100,
      origX: component.x,
      origY: component.y,
      handle,
    };

    const handleMove = (me: MouseEvent) => {
      if (!resizeRef.current) return;
      const rawDx = me.clientX - resizeRef.current.startX;
      const dy = me.clientY - resizeRef.current.startY;
      const h = resizeRef.current.handle;

      // Convert physical dx to logical dx.
      // In RTL, insetInlineStart measures from the right edge,
      // so a positive physical dx (rightward) is NEGATIVE in logical coords.
      // The handle names use logical CSS classes (-start/-end which flip in RTL),
      // so handle 'left' is always the inline-start side.
      const dx = isRTL ? -rawDx : rawDx;

      let newW = resizeRef.current.origW;
      let newH = resizeRef.current.origH;
      let newX = resizeRef.current.origX;
      let newY = resizeRef.current.origY;

      // Standard resize math (uses logical dx, so no handle swapping needed)
      if (h.includes('right')) { newW += dx; }
      if (h.includes('left'))  { newW -= dx; newX += dx; }
      if (h.includes('bottom')) { newH += dy; }
      if (h.includes('top'))    { newH -= dy; newY += dy; }

      store.resizeComponent(component.id, Math.max(40, newW), Math.max(20, newH));
      if (h.includes('left') || h.includes('top')) {
        store.moveComponentAbsolute(component.id, newX, newY);
      }
    };

    const handleUp = () => {
      resizeRef.current = null;
      store.commitInteraction();
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [isAbsolute, component.locked, component.id, component.width, component.height, component.x, component.y, store, isRTL]);

  // ── Style computation ──
  const absoluteStyle: React.CSSProperties = isAbsolute ? {
    position: 'absolute',
    insetInlineStart: `${component.x}px`,
    top: `${component.y}px`,
    width: component.width ? `${component.width}px` : 'auto',
    height: component.height ? `${component.height}px` : 'auto',
    zIndex: isDraggingLocal ? 999 : component.zIndex + 10,
  } : {};

  const gridStyle: React.CSSProperties = !isAbsolute ? {
    // During drag, remove grid placement so dnd-kit's transform can move the item freely
    gridColumn: isSortableDragging ? undefined : component.gridColumn,
    gridRow: isSortableDragging ? undefined : component.gridRow,
    zIndex: isSortableDragging ? 999 : component.zIndex + 10,
    alignSelf: component.verticalAlignment === "start" ? "start" : component.verticalAlignment === "end" ? "end" : "center",
    justifySelf: component.alignment,
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  } : {};

  const isDragging = isAbsolute ? isDraggingLocal : isSortableDragging;

  const nodeRef = useCallback((node: HTMLDivElement | null) => {
    if (!isAbsolute) {
      setSortableRef(node);
    }
  }, [isAbsolute, setSortableRef]);

  return (
    <div
      ref={nodeRef}
      style={{ ...absoluteStyle, ...gridStyle }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={isAbsolute ? handleMouseDown : undefined}
      className={cn(
        "relative group transition-all",
        // Absolute mode: direct component rendering
        isAbsolute
          ? cn(
            "rounded-lg border-2",
            isDragging && "opacity-60 ring-2 ring-primary/30 shadow-2xl",
            isSelected
              ? "border-primary/60 ring-2 ring-primary/20 shadow-lg"
              : "border-transparent hover:border-primary/30",
            isOverlapping && !isSelected && "border-destructive/50 ring-1 ring-destructive/20",
            component.locked && "cursor-not-allowed opacity-80",
            !component.locked && "cursor-move",
          )
          // Grid mode: card-like appearance
          : cn(
            "flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 cursor-pointer min-h-[52px]",
            isDragging && "opacity-40 scale-[0.98] ring-2 ring-primary/30 shadow-2xl z-50",
            isSelected
              ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
              : "border-border/60 bg-card/90 hover:border-primary/40 hover:bg-accent/20 hover:shadow-sm",
          ),
        !component.visible && "opacity-40",
      )}
    >
      {/* ── Absolute mode: WYSIWYG component preview ── */}
      {isAbsolute ? (
        <div className="w-full h-full overflow-hidden rounded-md pointer-events-none">
          <ComponentRenderer type={component.type} props={component.props} />
        </div>
      ) : (
        /* ── Grid mode: icon + label card ── */
        <>
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
            <span className="text-[9px] text-muted-foreground/60 font-mono">
              {component.gridColumn} / {component.gridRow}
            </span>
          </div>

          {/* Visibility indicator */}
          {!component.visible && (
            <EyeOff className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          )}
        </>
      )}

      {/* Lock indicator (both modes) */}
      {component.locked && (
        <div className="absolute top-1 end-1 p-0.5 rounded bg-muted/80">
          <Lock className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {/* Selection indicator corners */}
      {isSelected && (
        <>
          {isAbsolute ? (
            /* Resize handles (free-form mode) */
            RESIZE_HANDLES.map(({ position, cursor, className: handleClass }) => (
              <div
                key={position}
                onMouseDown={(e) => handleResizeStart(e, position)}
                className={cn(
                  "absolute h-2.5 w-2.5 rounded-full bg-primary border-2 border-background z-50",
                  handleClass,
                )}
                style={{ cursor }}
              />
            ))
          ) : (
            /* Static corners (grid mode) */
            <>
              <div className="absolute -top-1 -start-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
              <div className="absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
              <div className="absolute -bottom-1 -start-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
              <div className="absolute -bottom-1 -end-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
            </>
          )}
        </>
      )}

      {/* Type badge on selected */}
      {isSelected && (
        <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold whitespace-nowrap shadow-sm z-50">
          {t(catalog?.labelKey || "") || component.type}
          {isAbsolute && component.width ? ` · ${component.width}×${component.height || 'auto'}` : ''}
        </div>
      )}

      {/* Overlap warning badge */}
      {isOverlapping && !isSelected && (
        <div className="absolute -top-2 -end-2 h-4 w-4 rounded-full bg-destructive flex items-center justify-center z-50">
          <span className="text-[8px] text-destructive-foreground font-bold">!</span>
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
