"use client";

import { PlanCard } from "./PlanCard";
import type { PlanPickerEdition } from "../../viewmodels/usePlanPicker";

// ═══════════════════════════════════════════════════════════════════════════
// PlanGrid — responsive 1 / 2 / 4 column grid of plan cards.
//
// EQUAL-HEIGHT GUARANTEE (structural, not visual):
//   The grid declares a shared 5-track ROW template via `grid-rows-[...]` and
//   each card opts into it with `grid-rows-subgrid [grid-row:span_5]`. That
//   means badge / header+price / divider / feature-list / CTA are aligned on
//   SHARED tracks across every card in the row — the feature-list track (1fr)
//   absorbs all the slack, so cards are exactly equal height and CTAs sit on a
//   single baseline regardless of how many features each plan lists.
//
// Pure UI — data comes from the viewmodel; selection bubbles up via onSelect.
// ═══════════════════════════════════════════════════════════════════════════

interface PlanGridProps {
  editions: PlanPickerEdition[];
  billingCycle: "monthly" | "annual";
  currency: string;
  locale: string;
  isFxConverted: boolean;
  /** Recommendation reasons — passed to the recommended card for its reason line. */
  reasons: string[];
  onSelect: (edition: PlanPickerEdition, billingCycle: "monthly" | "annual") => void;
}

/**
 * Presentation UI component rendering the plan grid.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PlanGrid({
  editions,
  billingCycle,
  currency,
  locale,
  isFxConverted,
  reasons,
  onSelect,
}: PlanGridProps) {
  const desktopCols =
    editions.length >= 4
      ? "lg:grid-cols-4"
      : editions.length === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-2";

  return (
    <div
      className={`mx-auto grid w-full max-w-[1400px] grid-cols-1 sm:grid-cols-2 ${desktopCols} items-stretch gap-6 px-4`}
    >
      {editions.map((edition, index) => (
        <div key={edition.id} className="grid [grid-template-rows:auto_auto_auto_1fr_auto]">
          <PlanCard
            edition={edition}
            billingCycle={billingCycle}
            currency={currency}
            locale={locale}
            isFxConverted={isFxConverted}
            reasons={reasons}
            index={index}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
