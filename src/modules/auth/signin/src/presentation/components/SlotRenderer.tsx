/**
 * SlotRenderer — Renders content blocks in a platform-defined slot
 *
 * v1 login slots (§11): sidebar.top, sidebar.content, sidebar.bottom,
 * form.above, form.below, footer
 *
 * Each slot has maxItems enforcement.
 * Blocks are rendered through ContentBlockRenderer (error-bounded).
 */
"use client";

import { ContentBlockRenderer } from "./ContentBlockRenderer";
import type {
  ContentBlock,
  LoginSlotId,
  SlotConfig,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";

// v1 slot constraints (§11)
const SLOT_MAX_ITEMS: Record<LoginSlotId, number> = {
  "login.sidebar.top": 2,
  "login.sidebar.content": 5,
  "login.sidebar.bottom": 2,
  "login.form.above": 1,
  "login.form.below": 2,
  "login.footer": 1,
};

interface SlotRendererProps {
  slotId: LoginSlotId;
  slotConfig: SlotConfig;
  className?: string;
}

export function SlotRenderer({ slotId, slotConfig, className = "" }: SlotRendererProps) {
  const blocks = slotConfig.slots[slotId];

  // No blocks assigned to this slot
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  // Enforce max items per slot (§11)
  const maxItems = SLOT_MAX_ITEMS[slotId] ?? 3;
  const limitedBlocks: ContentBlock[] = blocks.slice(0, maxItems);

  return (
    <div className={`space-y-4 ${className}`} data-slot={slotId}>
      {limitedBlocks.map((block, index) => (
        <ContentBlockRenderer key={`${slotId}-${index}`} block={block} />
      ))}
    </div>
  );
}
