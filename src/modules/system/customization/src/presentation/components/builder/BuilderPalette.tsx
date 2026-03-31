/**
 * BuilderPalette — Draggable component list with collapsible groups
 *
 * REBUILT: Components are organized into 4 collapsible groups:
 * Core, Content, Media, Structure. Drag from here to canvas.
 * Singleton components show a "used" badge if already on canvas.
 * Enterprise-only components show a lock badge.
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/core/common/utils";
import {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video, GripVertical, Lock, Check, ChevronDown,
  Layout, FileText, Film, Layers,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { COMPONENT_CATALOG, hasSingletonComponent } from "../../../domain/entities/CanvasComponent";
import type { CanvasComponent, CanvasComponentType } from "../../../domain/entities/CanvasComponent";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, LogIn, Type, AlignLeft, Share2, ListChecks, Quote,
  ImageIcon, MousePointerClick, Minus, PanelBottom, Copyright,
  Code, Video,
};

// ── Component Groups ──────────────────────────────────────
interface ComponentGroup {
  id: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  types: CanvasComponentType[];
}

const COMPONENT_GROUPS: ComponentGroup[] = [
  {
    id: "core",
    labelKey: "studio.builder.group.core",
    icon: Layout,
    types: ["logo", "loginForm", "socialLogin"],
  },
  {
    id: "content",
    labelKey: "studio.builder.group.content",
    icon: FileText,
    types: ["heading", "subtitle", "featureList", "testimonial", "ctaButton"],
  },
  {
    id: "media",
    labelKey: "studio.builder.group.media",
    icon: Film,
    types: ["image", "videoBg"],
  },
  {
    id: "structure",
    labelKey: "studio.builder.group.structure",
    icon: Layers,
    types: ["divider", "footer", "copyright", "customHtml"],
  },
];

interface BuilderPaletteProps {
  components: CanvasComponent[];
  onQuickAdd: (type: CanvasComponentType) => void;
}

function DraggablePaletteItem({
  type,
  labelKey,
  icon,
  descriptionKey,
  singleton,
  requiredEdition,
  isUsed,
  onQuickAdd,
}: {
  type: CanvasComponentType;
  labelKey: string;
  icon: string;
  descriptionKey: string;
  singleton: boolean;
  requiredEdition: string | null;
  isUsed: boolean;
  onQuickAdd: (type: CanvasComponentType) => void;
}) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: "palette" },
    disabled: (singleton && isUsed) || requiredEdition === "enterprise",
  });

  const Icon = ICON_MAP[icon] || Image;
  const isDisabled = (singleton && isUsed) || requiredEdition === "enterprise";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 scale-95 border-primary shadow-lg ring-1 ring-primary/30",
        isDisabled
          ? "opacity-50 cursor-not-allowed border-border/30 bg-muted/10"
          : "border-border/50 bg-card/80 hover:border-primary/40 hover:bg-accent/20 hover:shadow-sm",
      )}
      title={t(descriptionKey)}
    >
      <GripVertical className="h-3 w-3 text-muted-foreground/30 shrink-0" />
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-foreground truncate">{t(labelKey)}</p>
      </div>
      {/* Badges */}
      {requiredEdition === "enterprise" && (
        <Lock className="h-3 w-3 text-amber-500 shrink-0" />
      )}
      {singleton && isUsed && (
        <Check className="h-3 w-3 text-green-500 shrink-0" />
      )}
      {!isDisabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(type);
          }}
          className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary/20 shrink-0 transition-colors"
          title={t("studio.builder.palette.quickAdd") || "Quick add"}
        >
          <span className="text-[10px] font-bold">+</span>
        </button>
      )}
    </div>
  );
}

export function BuilderPalette({ components, onQuickAdd }: BuilderPaletteProps) {
  const { t } = useI18n();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    core: true,
    content: true,
    media: true,
    structure: true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {t("studio.builder.palette.title") || "Components"}
      </p>
      <p className="text-[10px] text-muted-foreground/70 mb-3">
        {t("studio.builder.palette.dragHint") || "Drag to add or click +"}
      </p>

      <div className="space-y-1.5">
        {COMPONENT_GROUPS.map(group => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups[group.id] ?? true;
          const groupCatalogItems = COMPONENT_CATALOG.filter(c =>
            group.types.includes(c.type)
          );

          // Count used singletons for badge
          const usedCount = groupCatalogItems.filter(
            c => c.singleton && hasSingletonComponent(components, c.type)
          ).length;

          return (
            <div key={group.id} className="rounded-lg border border-border/40 overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors",
                  isExpanded ? "bg-muted/30" : "bg-transparent hover:bg-muted/20",
                )}
              >
                <GroupIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-foreground flex-1">
                  {t(group.labelKey) || group.id}
                </span>
                {usedCount > 0 && (
                  <span className="text-[9px] font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                    {usedCount} used
                  </span>
                )}
                <span className="text-[9px] text-muted-foreground/50">
                  {groupCatalogItems.length}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-muted-foreground/50 transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>

              {/* Group Items */}
              {isExpanded && (
                <div className="space-y-0.5 p-1.5 pt-0.5">
                  {groupCatalogItems.map(entry => (
                    <DraggablePaletteItem
                      key={entry.type}
                      {...entry}
                      isUsed={hasSingletonComponent(components, entry.type)}
                      onQuickAdd={onQuickAdd}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
