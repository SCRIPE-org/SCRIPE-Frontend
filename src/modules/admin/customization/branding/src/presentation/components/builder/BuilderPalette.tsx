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
  Lock,
  Check,
  ChevronDown,
  Layout,
  FileText,
  Film,
  Layers,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { COMPONENT_CATALOG, hasSingletonComponent } from "../../../domain/entities/CanvasComponent";
import type {
  CanvasComponent,
  CanvasComponentType,
} from "../../../domain/entities/CanvasComponent";

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
  KeyRound,
  RotateCcw,
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
    // loginForm, forgotForm, resetForm are mutually exclusive based on page
    types: ["logo", "loginForm", "forgotForm", "resetForm", "socialLogin"],
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

/** Filter palette components based on which auth page tab is active */
function getFilteredGroups(activeAuthPage?: string): ComponentGroup[] {
  // Map auth page → which form component is relevant
  // Support both kebab-case (StudioDraft) and camelCase (CanvasComponent) IDs
  const formForPage: Record<string, CanvasComponentType> = {
    login: "loginForm",
    forgotPassword: "forgotForm",
    "forgot-password": "forgotForm",
    resetPassword: "resetForm",
    "reset-password": "resetForm",
  };
  const activeForm = formForPage[activeAuthPage || "login"] || "loginForm";
  const excludedForms = (["loginForm", "forgotForm", "resetForm"] as CanvasComponentType[]).filter(
    (f) => f !== activeForm
  );

  return COMPONENT_GROUPS.map((group) => ({
    ...group,
    types: group.types.filter((t) => !excludedForms.includes(t)),
  }));
}

interface BuilderPaletteProps {
  components: CanvasComponent[];
  onQuickAdd: (type: CanvasComponentType) => void;
  /** Currently active auth page — used to highlight the contextual form component */
  activeAuthPage?: string;
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
  const { isSuperAdmin } = usePermissions();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: "palette" },
    // Super Admins bypass all edition gating. For non-super-admins,
    // requiredEdition is checked (currently all null, but future-proofed
    // for when backend dynamically sets edition requirements).
    disabled: (singleton && isUsed) || (!isSuperAdmin && requiredEdition != null),
  });

  const Icon = ICON_MAP[icon] || Image;
  const isDisabled = (singleton && isUsed) || (!isSuperAdmin && requiredEdition != null);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      aria-label={t(labelKey)}
      className={cn(
        "group flex cursor-grab items-center gap-2.5 rounded-nx-control border px-2.5 py-2 transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none active:cursor-grabbing focus-visible:outline-none focus-visible:shadow-nx-focus",
        isDragging && "scale-95 border-nx-accent opacity-50 ring-1 ring-nx-accent-wash",
        isDisabled
          ? "cursor-not-allowed border-nx-line bg-nx-raised opacity-50"
          : "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-hover"
      )}
      title={t(descriptionKey)}
    >
      <GripVertical className="h-3 w-3 shrink-0 text-nx-ink-3" aria-hidden="true" />
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-nx-sm bg-nx-accent-wash text-nx-accent">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-nx-ink">{t(labelKey)}</p>
      </div>
      {/* Badges */}
      {!isSuperAdmin && requiredEdition != null && (
        <Lock
          role="img"
          className="h-3 w-3 shrink-0 text-warning"
          aria-label={t("studio.builder.enterpriseOnly")}
        />
      )}
      {singleton && isUsed && (
        <Check className="h-3 w-3 shrink-0 text-success" aria-hidden="true" />
      )}
      {!isDisabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(type);
          }}
          className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-nx-sm bg-nx-accent-wash text-nx-accent transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-accent-wash group-hover:flex focus-visible:outline-none focus-visible:shadow-nx-focus"
          title={t("studio.builder.palette.quickAdd")}
          aria-label={t("studio.builder.palette.quickAdd")}
        >
          <span className="text-[10px] font-bold" aria-hidden="true">
            +
          </span>
        </button>
      )}
    </div>
  );
}

export function BuilderPalette({ components, onQuickAdd, activeAuthPage }: BuilderPaletteProps) {
  const { t } = useI18n();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    core: true,
    content: true,
    media: true,
    structure: true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="space-y-1">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
        {t("studio.builder.palette.title")}
      </p>
      <p className="mb-3 text-[10px] text-nx-ink-3">{t("studio.builder.palette.dragHint")}</p>

      <div className="space-y-1.5">
        {getFilteredGroups(activeAuthPage).map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups[group.id] ?? true;
          const groupCatalogItems = COMPONENT_CATALOG.filter((c) => group.types.includes(c.type));

          // Count used singletons for badge
          const usedCount = groupCatalogItems.filter(
            (c) => c.singleton && hasSingletonComponent(components, c.type)
          ).length;

          return (
            <div key={group.id} className="overflow-hidden rounded-nx-lg border border-nx-line">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isExpanded}
                className={cn(
                  "flex w-full items-center gap-2 px-2.5 py-2 text-start transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
                  isExpanded ? "bg-nx-raised" : "bg-transparent hover:bg-nx-hover"
                )}
              >
                <GroupIcon className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                <span className="flex-1 text-[11px] font-semibold text-nx-ink">
                  {t(group.labelKey) || group.id}
                </span>
                {usedCount > 0 && (
                  <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[9px] font-medium tabular-nums text-success">
                    {t("studio.builder.palette.usedCount", { count: usedCount })}
                  </span>
                )}
                <span className="text-[9px] tabular-nums text-nx-ink-3">
                  {groupCatalogItems.length}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    isExpanded && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* Group Items */}
              {isExpanded && (
                <div className="space-y-0.5 p-1.5 pt-0.5">
                  {groupCatalogItems.map((entry) => (
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
