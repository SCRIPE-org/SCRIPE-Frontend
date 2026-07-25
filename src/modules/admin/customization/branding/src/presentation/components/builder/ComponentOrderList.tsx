// UI-EXCEPTION: compact studio layout
/**
 * ComponentOrderList — Sortable layer list for z-order management
 *
 * Displays all canvas components in a vertical list with drag handles
 * for reordering. Shows icons, names, visibility toggles, and selection.
 * Drag within this list reorders components' z-index.
 */
"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { CanvasComponent } from "../../../domain/entities/CanvasComponent";
import { COMPONENT_CATALOG } from "../../../domain/entities/CanvasComponent";

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

interface ComponentOrderListProps {
  components: CanvasComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
}

function SortableLayerItem({
  component,
  index,
  isSelected,
  onSelect,
  onToggleVisibility,
}: {
  component: CanvasComponent;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
}) {
  const { t } = useI18n();
  const catalog = COMPONENT_CATALOG.find((c) => c.type === component.type);
  const Icon = ICON_MAP[catalog?.icon || "Image"] || Image;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `layer-${component.id}`,
    data: { source: "layer-list", componentId: component.id, index },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  const componentLabel = t(catalog?.labelKey || "") || component.type;
  const visibilityLabel = t("studio.builder.visibility");

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={componentLabel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-nx-sm px-2 py-1.5 transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
        isDragging && "bg-nx-accent-wash opacity-50 ring-1 ring-nx-accent-wash",
        isSelected
          ? "border border-nx-accent bg-nx-accent-wash"
          : "border border-transparent hover:bg-nx-hover",
        !component.visible && "opacity-50"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        aria-label={t("studio.builder.dragHandle")}
        className="cursor-grab p-0.5 text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:text-nx-ink-2 active:cursor-grabbing focus-visible:outline-none focus-visible:shadow-nx-focus"
      >
        <GripVertical className="h-3 w-3" aria-hidden="true" />
      </div>

      {/* Index number */}
      <span className="w-3 shrink-0 text-center font-mono text-[9px] tabular-nums text-nx-ink-3">
        {index + 1}
      </span>

      {/* Icon */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-nx-sm",
          isSelected ? "bg-nx-accent-wash text-nx-accent" : "bg-nx-raised text-nx-ink-2"
        )}
      >
        <Icon className="h-3 w-3" aria-hidden="true" />
      </div>

      {/* Label */}
      <span className="flex-1 truncate text-[10px] font-medium text-nx-ink">
        {componentLabel}
      </span>

      {/* Visibility toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className={cn(
          "rounded-nx-sm p-0.5 opacity-0 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-nx-focus",
          component.visible
            ? "text-nx-ink-3 hover:text-nx-ink"
            : "text-nx-ink-3 opacity-100 hover:text-nx-ink"
        )}
        title={visibilityLabel}
        aria-label={visibilityLabel}
      >
        {component.visible ? (
          <Eye className="h-3 w-3" aria-hidden="true" />
        ) : (
          <EyeOff className="h-3 w-3" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export function ComponentOrderList({
  components,
  selectedComponentId,
  onSelectComponent,
  onToggleVisibility,
}: ComponentOrderListProps) {
  const { t } = useI18n();

  // Sort by z-index for display (highest first = top of visual stack)
  const sortedComponents = [...components].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
        {t("studio.builder.layers")}
      </p>
      <p className="mb-1 text-[10px] text-nx-ink-3">{t("studio.builder.layersHint")}</p>

      <SortableContext
        items={sortedComponents.map((c) => `layer-${c.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0.5 rounded-nx-lg border border-nx-line bg-nx-raised p-1.5">
          {sortedComponents.length === 0 ? (
            <p className="py-3 text-center text-[10px] italic text-nx-ink-3">
              {t("studio.builder.noLayers")}
            </p>
          ) : (
            sortedComponents.map((comp, index) => (
              <SortableLayerItem
                key={comp.id}
                component={comp}
                index={index}
                isSelected={selectedComponentId === comp.id}
                onSelect={() => onSelectComponent(comp.id)}
                onToggleVisibility={() => onToggleVisibility(comp.id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
