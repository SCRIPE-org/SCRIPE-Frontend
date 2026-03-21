/**
 * BlockPanel — Full-featured slot/block editor
 * HTML5 drag-drop reorder, inline editing for all 6 block types,
 * slot-layout filtering, maxItems enforcement, block duplication.
 * All labels localized via t()
 */
"use client";

import { useState, useRef, useCallback } from "react";
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronRight, Copy,
  GripVertical, Type, Image as ImageIcon, List, MessageSquareQuote,
  MousePointer, Minus, X, Check, AlertTriangle,
} from "lucide-react";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@core/ui/select";
import type { StudioDraft } from "../viewmodels/useStudioViewModel";
import type { LoginSlotId, LoginLayout, ContentBlock, BlockType } from "@modules/auth/signin/src/types/login-branding-types";
import { isValidCtaUrl } from "@modules/auth/signin/src/types/login-branding-types";

interface BlockPanelProps {
  t: (key: string) => string;
  draft: StudioDraft;
  addBlock: (slotId: LoginSlotId, block: ContentBlock) => void;
  removeBlock: (slotId: LoginSlotId, index: number) => void;
  moveBlock: (slotId: LoginSlotId, fromIndex: number, direction: "up" | "down") => void;
  updateBlock: (slotId: LoginSlotId, index: number, block: ContentBlock) => void;
}

// ─── Slot definitions with maxItems ──────────────────
const SLOTS: { id: LoginSlotId; labelKey: string; descKey: string; maxItems: number; isSidebar: boolean }[] = [
  { id: "login.sidebar.top",     labelKey: "studio.slot.sidebarTop",     descKey: "studio.slot.sidebarTopDesc",     maxItems: 3, isSidebar: true },
  { id: "login.sidebar.content", labelKey: "studio.slot.sidebarContent", descKey: "studio.slot.sidebarContentDesc", maxItems: 6, isSidebar: true },
  { id: "login.sidebar.bottom",  labelKey: "studio.slot.sidebarBottom",  descKey: "studio.slot.sidebarBottomDesc",  maxItems: 3, isSidebar: true },
  { id: "login.form.above",      labelKey: "studio.slot.aboveForm",      descKey: "studio.slot.aboveFormDesc",      maxItems: 2, isSidebar: false },
  { id: "login.form.below",      labelKey: "studio.slot.belowForm",      descKey: "studio.slot.belowFormDesc",      maxItems: 3, isSidebar: false },
  { id: "login.footer",          labelKey: "studio.slot.footer",         descKey: "studio.slot.footerDesc",         maxItems: 2, isSidebar: false },
];

// ─── Layouts that DO have a sidebar ────────────────
const LAYOUTS_WITH_SIDEBAR: LoginLayout[] = [
  "split-right", "split-left", "magazine", "stacked", "asymmetric",
  "sidebar-compact", "carousel", "split-diagonal", "dual-panel",
  "immersive", "corner-card",
];

const BLOCK_TYPES: { type: BlockType; icon: typeof Type; labelKey: string }[] = [
  { type: "text",        icon: Type,              labelKey: "studio.block.text" },
  { type: "image",       icon: ImageIcon,         labelKey: "studio.block.image" },
  { type: "featureList", icon: List,              labelKey: "studio.block.featureList" },
  { type: "testimonial", icon: MessageSquareQuote, labelKey: "studio.block.testimonial" },
  { type: "ctaButton",   icon: MousePointer,      labelKey: "studio.block.ctaButton" },
  { type: "divider",     icon: Minus,             labelKey: "studio.block.divider" },
];

function createDefaultBlock(type: BlockType): ContentBlock {
  switch (type) {
    case "text": return { type: "text", props: { content: "Welcome to our platform" } };
    case "image": return { type: "image", props: { src: "", alt: "Image" } };
    case "featureList": return { type: "featureList", props: { items: [{ icon: "🔒", title: "Secure", description: "Enterprise-grade security" }] } };
    case "testimonial": return { type: "testimonial", props: { quote: "Great platform!", author: "John Doe", role: "CEO" } };
    case "ctaButton": return { type: "ctaButton", props: { label: "Learn More", url: "https://", variant: "default" } };
    case "divider": return { type: "divider", props: { style: "line" } };
  }
}

export function BlockPanel({ t, draft, addBlock, removeBlock, moveBlock, updateBlock }: BlockPanelProps) {
  const [expandedSlot, setExpandedSlot] = useState<LoginSlotId | null>(null);
  const [addingToSlot, setAddingToSlot] = useState<LoginSlotId | null>(null);
  const [editingBlock, setEditingBlock] = useState<{ slotId: LoginSlotId; index: number } | null>(null);

  // ─── Drag-Drop State ───
  const [dragState, setDragState] = useState<{ slotId: LoginSlotId; fromIndex: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((slotId: LoginSlotId, index: number) => {
    setDragState({ slotId, fromIndex: index });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((slotId: LoginSlotId, toIndex: number) => {
    if (!dragState || dragState.slotId !== slotId) return;
    const from = dragState.fromIndex;
    if (from === toIndex) return;
    // Move via sequential up/down to reach destination
    const direction = from < toIndex ? "down" : "up";
    const steps = Math.abs(from - toIndex);
    let currentIndex = from;
    for (let i = 0; i < steps; i++) {
      moveBlock(slotId, currentIndex, direction);
      currentIndex = direction === "down" ? currentIndex + 1 : currentIndex - 1;
    }
    setDragState(null);
    setDragOverIndex(null);
  }, [dragState, moveBlock]);

  const handleDragEnd = useCallback(() => {
    setDragState(null);
    setDragOverIndex(null);
  }, []);

  // ─── Filter slots by layout ───
  const hasSidebar = LAYOUTS_WITH_SIDEBAR.includes(draft.layout);
  const visibleSlots = SLOTS.filter(s => !s.isSidebar || hasSidebar);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t("studio.blocks.description")}</p>

      {!hasSidebar && (
        <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[10px] text-amber-600 dark:text-amber-400">
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
          <div key={slot.id} className="rounded-xl border border-border overflow-hidden">
            {/* Slot Header */}
            <button
              onClick={() => setExpandedSlot(isExpanded ? null : slot.id)}
              className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                <span className="text-xs font-semibold text-foreground">{t(slot.labelKey)}</span>
                {blocks.length > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[9px] font-bold text-primary">
                    {blocks.length}/{slot.maxItems}
                  </span>
                )}
              </div>
              {isFull && <span className="text-[9px] text-amber-500 font-medium">{t("studio.blocks.full")}</span>}
            </button>

            {/* Slot Content */}
            {isExpanded && (
              <div className="border-t border-border px-3 py-2 space-y-1.5">
                <p className="text-[10px] text-muted-foreground">{t(slot.descKey)}</p>

                {/* Existing Blocks with drag-drop */}
                {blocks.map((block, i) => {
                  const isEditing = editingBlock?.slotId === slot.id && editingBlock.index === i;
                  const isDragOver = dragOverIndex === i && dragState?.slotId === slot.id;
                  const BlockIcon = BLOCK_TYPES.find(bt => bt.type === block.type)?.icon || Type;

                  return (
                    <div key={i}>
                      {/* Drop indicator line */}
                      {isDragOver && dragState?.fromIndex !== i && (
                        <div className="h-0.5 w-full rounded-full bg-primary mb-1" />
                      )}
                      <div
                        draggable
                        onDragStart={() => handleDragStart(slot.id, i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDrop={() => handleDrop(slot.id, i)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-lg border ${isEditing ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"} transition-all`}
                      >
                        {/* Block Header Row */}
                        <div className="flex items-center gap-1 px-2 py-1.5">
                          <GripVertical className="h-3 w-3 text-muted-foreground/50 cursor-grab shrink-0" />
                          <BlockIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                          <button
                            onClick={() => setEditingBlock(isEditing ? null : { slotId: slot.id, index: i })}
                            className="flex-1 text-start text-[11px] font-medium text-foreground capitalize hover:text-primary transition-colors"
                          >
                            {t(`studio.block.${block.type}`)}
                          </button>
                          <button onClick={() => moveBlock(slot.id, i, "up")} disabled={i === 0} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronUp className="h-3 w-3" /></button>
                          <button onClick={() => moveBlock(slot.id, i, "down")} disabled={i === blocks.length - 1} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronDown className="h-3 w-3" /></button>
                          <button onClick={() => { addBlock(slot.id, { ...block, props: { ...block.props } } as ContentBlock); }} disabled={isFull} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20" title={t("studio.blocks.duplicate")}><Copy className="h-3 w-3" /></button>
                          <button onClick={() => { removeBlock(slot.id, i); if (isEditing) setEditingBlock(null); }} className="p-0.5 text-destructive/70 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                        </div>

                        {/* Inline Editor */}
                        {isEditing && (
                          <div className="border-t border-border/50 px-2 py-2 space-y-2">
                            <InlineEditor
                              t={t}
                              block={block}
                              onChange={(updated) => updateBlock(slot.id, i, updated)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Block Picker */}
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
                          className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[11px] text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-muted/30 transition-all"
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
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-1.5 text-[11px] text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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

// ═══════════════════════════════════════════════════════
// INLINE EDITORS — One per block type
// ═══════════════════════════════════════════════════════

function InlineEditor({ t, block, onChange }: { t: (key: string) => string; block: ContentBlock; onChange: (block: ContentBlock) => void }) {
  switch (block.type) {
    case "text":
      return <TextEditor t={t} block={block} onChange={onChange} />;
    case "image":
      return <ImageEditor t={t} block={block} onChange={onChange} />;
    case "featureList":
      return <FeatureListEditor t={t} block={block} onChange={onChange} />;
    case "testimonial":
      return <TestimonialEditor t={t} block={block} onChange={onChange} />;
    case "ctaButton":
      return <CtaEditor t={t} block={block} onChange={onChange} />;
    case "divider":
      return <DividerEditor t={t} block={block} onChange={onChange} />;
    default:
      return null;
  }
}

// ── Text Block Editor ──
function TextEditor({ t, block, onChange }: { t: (key: string) => string; block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  if (block.type !== "text") return null;
  const content = block.props.content;
  const charCount = content.length;
  const isOver = charCount > 500;
  return (
    <div className="space-y-1">
      <textarea
        value={content}
        onChange={(e) => onChange({ type: "text", props: { content: e.target.value.slice(0, 500) } })}
        rows={3}
        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground resize-y focus:border-primary focus:outline-none"
        placeholder={t("studio.block.textPlaceholder")}
      />
      <p className={`text-[10px] ${isOver ? "text-destructive" : "text-muted-foreground"}`}>
        {charCount}/500
      </p>
    </div>
  );
}

// ── Image Block Editor ──
function ImageEditor({ t, block, onChange }: { t: (key: string) => string; block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  if (block.type !== "image") return null;
  return (
    <div className="space-y-1.5">
      <div className="space-y-0.5">
        <label className="text-[10px] text-muted-foreground">{t("studio.block.imageUrl")}</label>
        <Input value={block.props.src} onChange={(e) => onChange({ ...block, props: { ...block.props, src: e.target.value } })} className="h-7 text-xs" placeholder="https://..." />
      </div>
      <div className="space-y-0.5">
        <label className="text-[10px] text-muted-foreground">{t("studio.block.imageAlt")}</label>
        <Input value={block.props.alt} onChange={(e) => onChange({ ...block, props: { ...block.props, alt: e.target.value } })} className="h-7 text-xs" placeholder="Alt text" />
      </div>
    </div>
  );
}

// ── Feature List Editor ──
function FeatureListEditor({ t, block, onChange }: { t: (key: string) => string; block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  if (block.type !== "featureList") return null;
  const items = block.props.items;
  const canAdd = items.length < 6;
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1">
          <Input value={item.icon} onChange={(e) => { const u = [...items]; u[i] = { ...u[i], icon: e.target.value }; onChange({ ...block, props: { items: u } }); }} className="h-7 w-10 text-xs text-center px-0" placeholder="🔒" />
          <div className="flex-1 space-y-0.5">
            <Input value={item.title} onChange={(e) => { const u = [...items]; u[i] = { ...u[i], title: e.target.value }; onChange({ ...block, props: { items: u } }); }} className="h-7 text-xs" placeholder={t("studio.block.featureTitle")} />
            <Input value={item.description} onChange={(e) => { const u = [...items]; u[i] = { ...u[i], description: e.target.value }; onChange({ ...block, props: { items: u } }); }} className="h-7 text-xs" placeholder={t("studio.block.featureDesc")} />
          </div>
          <button onClick={() => { const u = items.filter((_, j) => j !== i); onChange({ ...block, props: { items: u } }); }} className="mt-1 p-0.5 text-destructive/60 hover:text-destructive"><X className="h-3 w-3" /></button>
        </div>
      ))}
      {canAdd && (
        <button onClick={() => onChange({ ...block, props: { items: [...items, { icon: "✨", title: "", description: "" }] } })} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
          <Plus className="h-3 w-3" />{t("studio.block.addFeature")}
        </button>
      )}
      <p className="text-[10px] text-muted-foreground">{items.length}/6 {t("studio.block.items")}</p>
    </div>
  );
}

// ── Testimonial Editor ──
function TestimonialEditor({ t, block, onChange }: { t: (key: string) => string; block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  if (block.type !== "testimonial") return null;
  return (
    <div className="space-y-1.5">
      <div className="space-y-0.5">
        <label className="text-[10px] text-muted-foreground">{t("studio.block.quote")}</label>
        <textarea value={block.props.quote} onChange={(e) => onChange({ ...block, props: { ...block.props, quote: e.target.value } })} rows={2} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs resize-y focus:border-primary focus:outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground">{t("studio.block.author")}</label>
          <Input value={block.props.author} onChange={(e) => onChange({ ...block, props: { ...block.props, author: e.target.value } })} className="h-7 text-xs" />
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground">{t("studio.block.role")}</label>
          <Input value={block.props.role || ""} onChange={(e) => onChange({ ...block, props: { ...block.props, role: e.target.value } })} className="h-7 text-xs" />
        </div>
      </div>
      <div className="space-y-0.5">
        <label className="text-[10px] text-muted-foreground">{t("studio.block.avatarUrl")}</label>
        <Input value={block.props.avatar || ""} onChange={(e) => onChange({ ...block, props: { ...block.props, avatar: e.target.value } })} className="h-7 text-xs" placeholder="https://..." />
      </div>
    </div>
  );
}

// ── CTA Button Editor ──
function CtaEditor({ t, block, onChange }: { t: (key: string) => string; block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  if (block.type !== "ctaButton") return null;
  const isUrlValid = !block.props.url || isValidCtaUrl(block.props.url);
  return (
    <div className="space-y-1.5">
      <div className="space-y-0.5">
        <label className="text-[10px] text-muted-foreground">{t("studio.block.ctaLabel")}</label>
        <Input value={block.props.label} onChange={(e) => onChange({ ...block, props: { ...block.props, label: e.target.value } })} className="h-7 text-xs" />
      </div>
      <div className="space-y-0.5">
        <label className="text-[10px] text-muted-foreground">{t("studio.block.ctaUrl")}</label>
        <Input value={block.props.url} onChange={(e) => onChange({ ...block, props: { ...block.props, url: e.target.value } })} className={`h-7 text-xs ${!isUrlValid ? "border-destructive" : ""}`} placeholder="https://..." />
        {!isUrlValid && <p className="text-[9px] text-destructive">{t("studio.block.ctaUrlInvalid")}</p>}
      </div>
      <div className="space-y-0.5">
        <label className="text-[10px] text-muted-foreground">{t("studio.block.ctaVariant")}</label>
        <Select value={block.props.variant || "default"} onValueChange={(v) => onChange({ ...block, props: { ...block.props, variant: v as "default" | "outline" | "ghost" } })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{t("studio.block.variantDefault")}</SelectItem>
            <SelectItem value="outline">{t("studio.block.variantOutline")}</SelectItem>
            <SelectItem value="ghost">{t("studio.block.variantGhost")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ── Divider Editor ──
function DividerEditor({ t, block, onChange }: { t: (key: string) => string; block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  if (block.type !== "divider") return null;
  return (
    <div className="space-y-0.5">
      <label className="text-[10px] text-muted-foreground">{t("studio.block.dividerStyle")}</label>
      <Select value={block.props.style || "line"} onValueChange={(v) => onChange({ ...block, props: { style: v as "line" | "space" | "dots" } })}>
        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="line">{t("studio.block.styleLine")}</SelectItem>
          <SelectItem value="space">{t("studio.block.styleSpace")}</SelectItem>
          <SelectItem value="dots">{t("studio.block.styleDots")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
