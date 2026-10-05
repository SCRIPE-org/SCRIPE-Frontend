import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.finance.settlements.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.finance.settlements.infoTitle",
    contentKey: "modules.finance.settlements.infoContent",
  },

  // ─── Split Settlement Calculations ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.settlements.splitTitle",
    id: "split-settlements",
  },
  { type: "paragraph", contentKey: "modules.finance.settlements.splitDesc" },

  // ─── Automated Payout Batches & Merchant Balances ─────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.settlements.payoutsTitle",
    id: "payout-batches",
  },
  { type: "paragraph", contentKey: "modules.finance.settlements.payoutsDesc" },
];

registerPage({
  slug: "modules/finance/multi-party-settlements",
  titleKey: "modules.finance.settlements.title",
  descriptionKey: "modules.finance.settlements.description",
  category: "module-finance",
  order: 4,
  sections,
  relatedSlugs: [
    "modules/finance-overview",
    "modules/finance/double-entry-ledger",
  ],
  lastUpdated: "2026-10-03",
});
