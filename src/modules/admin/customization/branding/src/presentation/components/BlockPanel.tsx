// FILE-EXCEPTION: file length
/**
 * BlockPanel — Full-featured slot/block editor (21 block types)
 * HTML5 drag-drop reorder, inline editing, slot-layout filtering,
 * maxItems enforcement, block duplication. Labels localized via t()
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Copy,
  GripVertical,
  Type,
  Image as ImageIcon,
  List,
  MessageSquareQuote,
  MousePointer,
  Minus,
  AlertTriangle,
  Heading,
  Award,
  ArrowUpDown,
  Bell,
  BarChart3,
  Share2,
  Grid2X2,
  Star,
  Zap,
  PlayCircle,
  Timer,
  ChevronDown as Accordion,
  Footprints,
  Users,
  Sparkles,
} from "lucide-react";
import type { StudioDraftProps as StudioDraft } from "../../domain/entities/StudioDraft";
import type {
  LoginSlotId,
  LoginLayout,
  ContentBlock,
  BlockType,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { InlineEditor } from "./BlockEditors";
import { useI18n } from "@core/providers/i18n-provider";

interface BlockPanelProps {
  draft: StudioDraft;
  addBlock: (slotId: LoginSlotId, block: ContentBlock) => void;
  removeBlock: (slotId: LoginSlotId, index: number) => void;
  moveBlock: (slotId: LoginSlotId, fromIndex: number, direction: "up" | "down") => void;
  updateBlock: (slotId: LoginSlotId, index: number, block: ContentBlock) => void;
}

const SLOTS: {
  id: LoginSlotId;
  labelKey: string;
  descKey: string;
  maxItems: number;
  isSidebar: boolean;
}[] = [
  {
    id: "login.sidebar.top",
    labelKey: "studio.slot.sidebarTop",
    descKey: "studio.slot.sidebarTopDesc",
    maxItems: 3,
    isSidebar: true,
  },
  {
    id: "login.sidebar.content",
    labelKey: "studio.slot.sidebarContent",
    descKey: "studio.slot.sidebarContentDesc",
    maxItems: 6,
    isSidebar: true,
  },
  {
    id: "login.sidebar.bottom",
    labelKey: "studio.slot.sidebarBottom",
    descKey: "studio.slot.sidebarBottomDesc",
    maxItems: 3,
    isSidebar: true,
  },
  {
    id: "login.form.above",
    labelKey: "studio.slot.aboveForm",
    descKey: "studio.slot.aboveFormDesc",
    maxItems: 2,
    isSidebar: false,
  },
  {
    id: "login.form.below",
    labelKey: "studio.slot.belowForm",
    descKey: "studio.slot.belowFormDesc",
    maxItems: 3,
    isSidebar: false,
  },
  {
    id: "login.footer",
    labelKey: "studio.slot.footer",
    descKey: "studio.slot.footerDesc",
    maxItems: 2,
    isSidebar: false,
  },
];

const LAYOUTS_WITH_SIDEBAR: LoginLayout[] = [
  "split-right",
  "split-left",
  "magazine",
  "stacked",
  "asymmetric",
  "sidebar-compact",
  "carousel",
  "split-diagonal",
  "dual-panel",
  "immersive",
  "corner-card",
];

const BLOCK_TYPES: { type: BlockType; icon: typeof Type; labelKey: string }[] = [
  // Existing
  { type: "text", icon: Type, labelKey: "studio.block.text" },
  { type: "image", icon: ImageIcon, labelKey: "studio.block.image" },
  { type: "featureList", icon: List, labelKey: "studio.block.featureList" },
  { type: "testimonial", icon: MessageSquareQuote, labelKey: "studio.block.testimonial" },
  { type: "ctaButton", icon: MousePointer, labelKey: "studio.block.ctaButton" },
  { type: "divider", icon: Minus, labelKey: "studio.block.divider" },
  // New
  { type: "heading", icon: Heading, labelKey: "studio.block.heading" },
  { type: "badge", icon: Award, labelKey: "studio.block.badge" },
  { type: "spacer", icon: ArrowUpDown, labelKey: "studio.block.spacer" },
  { type: "alert", icon: Bell, labelKey: "studio.block.alert" },
  { type: "statsRow", icon: BarChart3, labelKey: "studio.block.statsRow" },
  { type: "socialLinks", icon: Share2, labelKey: "studio.block.socialLinks" },
  { type: "logoCloud", icon: Grid2X2, labelKey: "studio.block.logoCloud" },
  { type: "rating", icon: Star, labelKey: "studio.block.rating" },
  { type: "iconRow", icon: Zap, labelKey: "studio.block.iconRow" },
  { type: "video", icon: PlayCircle, labelKey: "studio.block.video" },
  { type: "countdown", icon: Timer, labelKey: "studio.block.countdown" },
  { type: "accordion", icon: Accordion, labelKey: "studio.block.accordion" },
  { type: "progressSteps", icon: Footprints, labelKey: "studio.block.progressSteps" },
  { type: "avatarStack", icon: Users, labelKey: "studio.block.avatarStack" },
  { type: "gradientText", icon: Sparkles, labelKey: "studio.block.gradientText" },
];

function createDefaultBlock(type: BlockType): ContentBlock {
  switch (type) {
    case "text":
      return { type: "text", props: { content: "Welcome to our platform" } };
    case "image":
      return { type: "image", props: { src: "", alt: "Image" } };
    case "featureList":
      return {
        type: "featureList",
        props: {
          items: [{ icon: "🔒", title: "Secure", description: "Enterprise-grade security" }],
        },
      };
    case "testimonial":
      return {
        type: "testimonial",
        props: { quote: "Great platform!", author: "John Doe", role: "CEO" },
      };
    case "ctaButton":
      return {
        type: "ctaButton",
        props: { label: "Learn More", url: "https://", variant: "default" },
      };
    case "divider":
      return { type: "divider", props: { style: "line" } };
    case "heading":
      return { type: "heading", props: { text: "Welcome", level: "h3" } };
    case "badge":
      return { type: "badge", props: { label: "New", variant: "info" } };
    case "spacer":
      return { type: "spacer", props: { height: 24 } };
    case "alert":
      return { type: "alert", props: { message: "Important information", variant: "info" } };
    case "statsRow":
      return {
        type: "statsRow",
        props: { items: [{ value: "10K+", label: "Users", icon: "👥" }] },
      };
    case "socialLinks":
      return {
        type: "socialLinks",
        props: { items: [{ platform: "Twitter", url: "https://twitter.com" }] },
      };
    case "logoCloud":
      return { type: "logoCloud", props: { items: [{ src: "", alt: "Partner" }] } };
    case "rating":
      return { type: "rating", props: { value: 4.5, style: "stars" } };
    case "iconRow":
      return { type: "iconRow", props: { items: [{ icon: "🔗", label: "Link" }] } };
    case "video":
      return { type: "video", props: { url: "" } };
    case "countdown":
      return {
        type: "countdown",
        props: { targetDate: new Date(Date.now() + 7 * 86400000).toISOString(), style: "simple" },
      };
    case "accordion":
      return {
        type: "accordion",
        props: { items: [{ title: "Question?", content: "Answer here." }] },
      };
    case "progressSteps":
      return {
        type: "progressSteps",
        props: {
          items: [{ label: "Sign Up" }, { label: "Verify" }, { label: "Done" }],
          activeStep: 0,
        },
      };
    case "avatarStack":
      return { type: "avatarStack", props: { avatarUrls: [], totalCount: "500+" } };
    case "gradientText":
      return {
        type: "gradientText",
        props: { text: "Amazing Platform", fromColor: "#6366f1", toColor: "#ec4899" },
      };
  }
}

/**
 * Presentation UI component rendering the block panel.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BlockPanel({
  draft,
  addBlock,
  removeBlock,
  moveBlock,
  updateBlock,
}: BlockPanelProps) {
  const { t } = useI18n();
  const [expandedSlot, setExpandedSlot] = useState<LoginSlotId | null>(null);
  const [addingToSlot, setAddingToSlot] = useState<LoginSlotId | null>(null);
  const [editingBlock, setEditingBlock] = useState<{ slotId: LoginSlotId; index: number } | null>(
    null
  );
  const [dragState, setDragState] = useState<{ slotId: LoginSlotId; fromIndex: number } | null>(
    null
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((slotId: LoginSlotId, index: number) => {
    setDragState({ slotId, fromIndex: index });
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);
  const handleDrop = useCallback(
    (slotId: LoginSlotId, toIndex: number) => {
      if (!dragState || dragState.slotId !== slotId) return;
      const from = dragState.fromIndex;
      if (from === toIndex) return;
      const direction = from < toIndex ? "down" : "up";
      const steps = Math.abs(from - toIndex);
      let currentIndex = from;
      for (let i = 0; i < steps; i++) {
        moveBlock(slotId, currentIndex, direction);
        currentIndex = direction === "down" ? currentIndex + 1 : currentIndex - 1;
      }
      setDragState(null);
      setDragOverIndex(null);
    },
    [dragState, moveBlock]
  );
  const handleDragEnd = useCallback(() => {
    setDragState(null);
    setDragOverIndex(null);
  }, []);

  const hasSidebar = LAYOUTS_WITH_SIDEBAR.includes(draft.layout);
  const visibleSlots = SLOTS.filter((s) => !s.isSidebar || hasSidebar);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t("studio.blocks.description")}</p>
      {!hasSidebar && (
        <div className="flex items-center gap-1.5 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[10px] text-warning">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {t("studio.blocks.noSidebarWarning")}
        </div>
      )}

      {visibleSlots.map((slot) => {
        const blocks = draft.slotConfig.slots[slot.id] || [];
        const isExpanded = expandedSlot === slot.id;
        const isAdding = addingToSlot === slot.id;
        const isFull = blocks.length >= slot.maxItems;
        return (
          <div key={slot.id} className="overflow-hidden rounded-xl border border-border">
            <button
              onClick={() => setExpandedSlot(isExpanded ? null : slot.id)}
              className="flex w-full items-center justify-between px-3 py-2.5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                />
                <span className="text-xs font-semibold text-foreground">{t(slot.labelKey)}</span>
                {blocks.length > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[9px] font-bold text-primary">
                    {blocks.length}/{slot.maxItems}
                  </span>
                )}
              </div>
              {isFull && (
                <span className="text-[9px] font-medium text-warning">
                  {t("studio.blocks.full")}
                </span>
              )}
            </button>
            {isExpanded && (
              <div className="space-y-1.5 border-t border-border px-3 py-2">
                <p className="text-[10px] text-muted-foreground">{t(slot.descKey)}</p>
                {blocks.map((block, i) => {
                  const isEditing = editingBlock?.slotId === slot.id && editingBlock.index === i;
                  const isDragOver = dragOverIndex === i && dragState?.slotId === slot.id;
                  const BlockIcon = BLOCK_TYPES.find((bt) => bt.type === block.type)?.icon || Type;
                  return (
                    <div key={i}>
                      {isDragOver && dragState?.fromIndex !== i && (
                        <div className="mb-1 h-0.5 w-full rounded-full bg-primary" />
                      )}
                      <div
                        draggable
                        onDragStart={() => handleDragStart(slot.id, i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDrop={() => handleDrop(slot.id, i)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-lg border ${isEditing ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"} transition-all`}
                      >
                        <div className="flex items-center gap-1 px-2 py-1.5">
                          <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-muted-foreground/50" />
                          <BlockIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <button
                            onClick={() =>
                              setEditingBlock(isEditing ? null : { slotId: slot.id, index: i })
                            }
                            className="flex-1 text-start text-[11px] font-medium capitalize text-foreground transition-colors hover:text-primary"
                          >
                            {t(`studio.block.${block.type}`)}
                          </button>
                          <button
                            onClick={() => moveBlock(slot.id, i, "up")}
                            disabled={i === 0}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => moveBlock(slot.id, i, "down")}
                            disabled={i === blocks.length - 1}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              addBlock(slot.id, {
                                ...block,
                                props: { ...block.props },
                              } as ContentBlock);
                            }}
                            disabled={isFull}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                            title={t("studio.blocks.duplicate")}
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              removeBlock(slot.id, i);
                              if (isEditing) setEditingBlock(null);
                            }}
                            className="p-0.5 text-destructive/70 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {isEditing && (
                          <div className="space-y-2 border-t border-border/50 px-2 py-2">
                            <InlineEditor
                              block={block}
                              onChange={(updated) => updateBlock(slot.id, i, updated)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isAdding ? (
                  <div className="grid grid-cols-2 gap-1 pt-1">
                    {BLOCK_TYPES.map((bt) => {
                      const Icon = bt.icon;
                      return (
                        <button
                          key={bt.type}
                          onClick={() => {
                            addBlock(slot.id, createDefaultBlock(bt.type));
                            setAddingToSlot(null);
                          }}
                          className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[11px] text-muted-foreground transition-all hover:border-primary/30 hover:bg-muted/30 hover:text-foreground"
                        >
                          <Icon className="h-3 w-3" />
                          {t(bt.labelKey)}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setAddingToSlot(null)}
                      className="col-span-2 rounded-md border border-dashed border-border px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToSlot(slot.id)}
                    disabled={isFull}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-1.5 text-[11px] text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                    {isFull ? t("studio.blocks.slotFull") : t("studio.blocks.addBlock")}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
