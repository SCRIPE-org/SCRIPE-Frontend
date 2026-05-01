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

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-all",
        isDragging && "bg-primary/10 opacity-50 shadow-lg ring-1 ring-primary/30",
        isSelected
          ? "border border-primary/30 bg-primary/10"
          : "border border-transparent hover:bg-muted/60",
        !component.visible && "opacity-50"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-0.5 text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3" />
      </div>

      {/* Index number */}
      <span className="w-3 shrink-0 text-center font-mono text-[9px] text-muted-foreground/50">
        {index + 1}
      </span>

      {/* Icon */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded",
          isSelected ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground"
        )}
      >
        <Icon className="h-3 w-3" />
      </div>

      {/* Label */}
      <span className="flex-1 truncate text-[10px] font-medium text-foreground">
        {t(catalog?.labelKey || "") || component.type}
      </span>

      {/* Visibility toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className={cn(
          "rounded p-0.5 opacity-0 transition-colors group-hover:opacity-100",
          component.visible
            ? "text-muted-foreground/40 hover:text-foreground"
            : "text-muted-foreground/60 opacity-100 hover:text-foreground"
        )}
        title={component.visible ? "Hide" : "Show"}
      >
        {component.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
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
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {t("studio.builder.layers") || "Layers"}
      </p>
      <p className="mb-1 text-[10px] text-muted-foreground/70">
        {t("studio.builder.layersHint") || "Drag to reorder layer stack"}
      </p>

      <SortableContext
        items={sortedComponents.map((c) => `layer-${c.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0.5 rounded-lg border border-border/60 bg-muted/10 p-1.5">
          {sortedComponents.length === 0 ? (
            <p className="py-3 text-center text-[10px] italic text-muted-foreground/50">
              {t("studio.builder.noLayers") || "No components yet"}
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
