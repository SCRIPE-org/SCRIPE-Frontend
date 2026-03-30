/**
 * BuilderPalette — Draggable component list for the page builder
 *
 * Shows all 14 available component types. Drag from here to canvas.
 * Singleton components show a "used" badge if already on canvas.
 * Enterprise-only components show a lock badge.
 */
"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/core/common/utils";
import {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video, GripVertical, Lock, Check,
} from "lucide-react";
import { COMPONENT_CATALOG, hasSingletonComponent } from "../../../domain/entities/CanvasComponent";
import type { CanvasComponent, CanvasComponentType } from "../../../domain/entities/CanvasComponent";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video,
};

interface BuilderPaletteProps {
  t: (key: string) => string;
  components: CanvasComponent[];
  onQuickAdd: (type: CanvasComponentType) => void;
}

function DraggablePaletteItem({
  type,
  labelKey,
  icon,
  descriptionKey,
  singleton,
  required,
  requiredEdition,
  isUsed,
  t,
  onQuickAdd,
}: {
  type: CanvasComponentType;
  labelKey: string;
  icon: string;
  descriptionKey: string;
  singleton: boolean;
  required: boolean;
  requiredEdition: string | null;
  isUsed: boolean;
  t: (key: string) => string;
  onQuickAdd: (type: CanvasComponentType) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: 'palette' },
    disabled: (singleton && isUsed) || requiredEdition === 'enterprise',
  });

  const Icon = ICON_MAP[icon] || Image;
  const isDisabled = (singleton && isUsed) || requiredEdition === 'enterprise';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 scale-95 border-primary shadow-lg",
        isDisabled
          ? "opacity-50 cursor-not-allowed border-border/50 bg-muted/20"
          : "border-border/60 bg-card hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm",
      )}
      title={t(descriptionKey)}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{t(labelKey)}</p>
      </div>
      {/* Badges */}
      {requiredEdition === 'enterprise' && (
        <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      )}
      {singleton && isUsed && (
        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
      )}
      {!isDisabled && (
        <button
          onClick={(e) => { e.stopPropagation(); onQuickAdd(type); }}
          className="hidden group-hover:flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20 shrink-0 transition-colors"
          title={t('studio.builder.palette.quickAdd') || 'Quick add'}
        >
          <span className="text-xs font-bold">+</span>
        </button>
      )}
    </div>
  );
}

export function BuilderPalette({ t, components, onQuickAdd }: BuilderPaletteProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {t('studio.builder.palette.title') || 'Components'}
      </p>
      <p className="text-[10px] text-muted-foreground/70 mb-3">
        {t('studio.builder.palette.dragHint') || 'Drag to add or click +'}
      </p>
      <div className="space-y-1">
        {COMPONENT_CATALOG.map((entry) => (
          <DraggablePaletteItem
            key={entry.type}
            {...entry}
            isUsed={hasSingletonComponent(components, entry.type)}
            t={t}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </div>
  );
}
