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
  Image,
  LogIn,
  Type,
  AlignLeft,
  Share2,
  ListChecks,
  Quote,
  ImageIcon,
  MousePointerClick,
  Minus,
  PanelBottom,
  Copyright,
  Code,
  Video,
  GripVertical,
  EyeOff,
  Lock,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { CanvasComponent, PositionMode } from "../../../domain/entities/CanvasComponent";
import { COMPONENT_CATALOG } from "../../../domain/entities/CanvasComponent";
import { ComponentRenderer } from "./ComponentRenderer";
import { useCallback, useRef, useState } from "react";
import { useBuilderStore } from "../../viewmodels/useBuilderStore";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  LogIn,
  Type,
  AlignLeft,
  Share2,
  ListChecks,
  Quote,
  ImageIcon,
  MousePointerClick,
  Minus,
  PanelBottom,
  Copyright,
  Code,
  Video,
};

interface DraggableCanvasItemProps {
  component: CanvasComponent;
  isSelected: boolean;
  isOverlapping?: boolean;
  positionMode: PositionMode;
  zoom: number;
  onSelect: () => void;
}

/** Resize handle positions */
const RESIZE_HANDLES = [
  { position: "top-left", cursor: "nwse-resize", className: "-top-1 -start-1" },
  { position: "top-right", cursor: "nesw-resize", className: "-top-1 -end-1" },
  { position: "bottom-left", cursor: "nesw-resize", className: "-bottom-1 -start-1" },
  { position: "bottom-right", cursor: "nwse-resize", className: "-bottom-1 -end-1" },
  { position: "top", cursor: "ns-resize", className: "-top-1 start-1/2 -translate-x-1/2" },
  { position: "bottom", cursor: "ns-resize", className: "-bottom-1 start-1/2 -translate-x-1/2" },
  { position: "left", cursor: "ew-resize", className: "top-1/2 -start-1 -translate-y-1/2" },
  { position: "right", cursor: "ew-resize", className: "top-1/2 -end-1 -translate-y-1/2" },
] as const;

export function DraggableCanvasItem({
  component,
  isSelected,
  isOverlapping = false,
  positionMode,
  zoom = 100,
  onSelect,
}: DraggableCanvasItemProps) {
  const { t, direction } = useI18n();
  const isRTL = direction === "rtl";
  const catalog = COMPONENT_CATALOG.find((c) => c.type === component.type);
  const Icon = ICON_MAP[catalog?.icon || "Image"] || Image;
  const isAbsolute = positionMode === "absolute";
  const store = useBuilderStore();

  // Drag state for absolute mode
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null
  );
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    origX: number;
    origY: number;
    handle: string;
  } | null>(null);
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
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
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
          dragRef.current.origY + dy
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
    },
    [isAbsolute, component.locked, component.id, component.x, component.y, store, onSelect, isRTL]
  );

  // ── Absolute mode: resize handles ──
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
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
        if (h.includes("right")) {
          newW += dx;
        }
        if (h.includes("left")) {
          newW -= dx;
          newX += dx;
        }
        if (h.includes("bottom")) {
          newH += dy;
        }
        if (h.includes("top")) {
          newH -= dy;
          newY += dy;
        }

        store.resizeComponent(component.id, Math.max(40, newW), Math.max(20, newH));
        if (h.includes("left") || h.includes("top")) {
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
    },
    [
      isAbsolute,
      component.locked,
      component.id,
      component.width,
      component.height,
      component.x,
      component.y,
      store,
      isRTL,
    ]
  );

  // ── Style computation ──
  const absoluteStyle: React.CSSProperties = isAbsolute
    ? {
        position: "absolute",
        insetInlineStart: `${component.x}px`,
        top: `${component.y}px`,
        width: component.width ? `${component.width}px` : "auto",
        height: component.height ? `${component.height}px` : "auto",
        zIndex: isDraggingLocal ? 999 : component.zIndex + 10,
      }
    : {};

  // Scale-compensated transform: dnd-kit calculates pixel deltas at screen level,
  // but the canvas container applies CSS scale(zoom/100). Without compensation,
  // the dragged item appears to fly away at any zoom != 100%.
  const scale = zoom / 100;
  const scaledTransform = transform
    ? { ...transform, x: transform.x / scale, y: transform.y / scale }
    : null;

  const gridStyle: React.CSSProperties = !isAbsolute
    ? {
        gridColumn: component.gridColumn,
        gridRow: component.gridRow,
        zIndex: isSortableDragging ? 999 : component.zIndex + 10,
        alignSelf:
          component.verticalAlignment === "start"
            ? "start"
            : component.verticalAlignment === "end"
              ? "end"
              : "center",
        justifySelf: component.alignment,
        transform: CSS.Transform.toString(scaledTransform),
        transition: transition || undefined,
        opacity: isSortableDragging ? 0.4 : 1,
      }
    : {};

  const isDragging = isAbsolute ? isDraggingLocal : isSortableDragging;

  const nodeRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!isAbsolute) {
        setSortableRef(node);
      }
    },
    [isAbsolute, setSortableRef]
  );

  const componentLabel = t(catalog?.labelKey || "") || component.type;

  return (
    <div
      ref={nodeRef}
      style={{ ...absoluteStyle, ...gridStyle }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={componentLabel}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      onMouseDown={isAbsolute ? handleMouseDown : undefined}
      className={cn(
        "group relative transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
        // Absolute mode: direct component rendering
        isAbsolute
          ? cn(
              "rounded-nx-lg border-2",
              isDragging && "opacity-60 ring-2 ring-nx-accent-wash",
              isSelected
                ? "border-nx-accent ring-2 ring-nx-accent-wash"
                : "border-transparent hover:border-nx-line-hi",
              isOverlapping && !isSelected && "border-destructive/50 ring-1 ring-destructive/20",
              component.locked && "cursor-not-allowed opacity-80",
              !component.locked && "cursor-move"
            )
          : // Grid mode: card-like appearance
            cn(
              "flex min-h-[52px] cursor-pointer items-center gap-2.5 rounded-nx-lg border-2 px-3 py-2.5",
              isDragging && "z-50 scale-[0.98] opacity-40 ring-2 ring-nx-accent-wash",
              isSelected
                ? "border-nx-accent bg-nx-accent-wash ring-2 ring-nx-accent-wash"
                : "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-hover"
            ),
        !component.visible && "opacity-40"
      )}
    >
      {/* ── Absolute mode: WYSIWYG component preview ── */}
      {isAbsolute ? (
        <div className="pointer-events-none h-full w-full overflow-hidden rounded-nx-md">
          <ComponentRenderer type={component.type} props={component.props} />
        </div>
      ) : (
        /* ── Grid mode: icon + label card ── */
        <>
          {/* Drag Handle — ONLY this triggers drag */}
          <div
            {...attributes}
            {...listeners}
            aria-label={t("studio.builder.dragHandle")}
            className={cn(
              "flex cursor-grab items-center justify-center rounded-nx-sm p-0.5 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none active:cursor-grabbing focus-visible:outline-none focus-visible:shadow-nx-focus",
              isDragging
                ? "text-nx-accent"
                : "text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink-2"
            )}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </div>

          {/* Icon */}
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-nx-lg",
              isSelected ? "bg-nx-accent-wash text-nx-accent" : "bg-nx-raised text-nx-ink-2"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>

          {/* Label */}
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-nx-ink">
              {componentLabel}
            </span>
            <span className="font-mono text-[9px] tabular-nums text-nx-ink-3">
              {component.gridColumn} / {component.gridRow}
            </span>
          </div>

          {/* Visibility indicator */}
          {!component.visible && (
            <EyeOff className="h-3 w-3 shrink-0 text-nx-ink-3" aria-hidden="true" />
          )}
        </>
      )}

      {/* Lock indicator (both modes) */}
      {component.locked && (
        <div className="absolute end-1 top-1 rounded-nx-sm bg-nx-raised-2 p-0.5">
          <Lock className="h-3 w-3 text-nx-ink-2" aria-hidden="true" />
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
                aria-hidden="true"
                className={cn(
                  "absolute z-50 h-2.5 w-2.5 rounded-full border-2 border-nx-ground bg-nx-accent",
                  handleClass
                )}
                style={{ cursor }}
              />
            ))
          ) : (
            /* Static corners (grid mode) */
            <>
              <div
                aria-hidden="true"
                className="absolute -start-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-nx-ground bg-nx-accent"
              />
              <div
                aria-hidden="true"
                className="absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-nx-ground bg-nx-accent"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-1 -start-1 h-2.5 w-2.5 rounded-full border-2 border-nx-ground bg-nx-accent"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-1 -end-1 h-2.5 w-2.5 rounded-full border-2 border-nx-ground bg-nx-accent"
              />
            </>
          )}
        </>
      )}

      {/* Type badge on selected */}
      {isSelected && (
        <div
          aria-hidden="true"
          className="absolute -top-3 start-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-nx-accent-fill px-2 py-0.5 text-[9px] font-semibold text-nx-on-fill shadow-nx-sm"
        >
          {componentLabel}
          {isAbsolute && component.width
            ? ` · ${component.width}×${component.height || "auto"}`
            : ""}
        </div>
      )}

      {/* Overlap warning badge */}
      {isOverlapping && !isSelected && (
        <div
          aria-hidden="true"
          className="absolute -end-2 -top-2 z-50 flex h-4 w-4 items-center justify-center rounded-full bg-destructive"
        >
          <span className="text-[8px] font-bold text-destructive-foreground">!</span>
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
  const catalog = COMPONENT_CATALOG.find((c) => c.type === component.type);
  const Icon = ICON_MAP[catalog?.icon || "Image"] || Image;

  return (
    <div className="flex min-h-[52px] min-w-[200px] cursor-grabbing items-center gap-2.5 rounded-nx-lg border-2 border-nx-accent bg-nx-accent-wash px-3 py-2.5 shadow-nx-popover">
      <GripVertical className="h-4 w-4 text-nx-accent" aria-hidden="true" />
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-nx-lg bg-nx-accent-wash text-nx-accent">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <span className="truncate text-xs font-semibold text-nx-accent">
        {t(catalog?.labelKey || "") || component.type}
      </span>
    </div>
  );
}
