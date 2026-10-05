import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "tutorials.ujPricingFinance.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "tutorials.ujPricingFinance.infoTitle",
    contentKey: "tutorials.ujPricingFinance.infoContent",
  },

  // ─── Step 1: Catalogs & Price Books ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujPricingFinance.step1Title",
    id: "step-1-catalogs-pricebooks",
  },
  { type: "paragraph", contentKey: "tutorials.ujPricingFinance.step1Desc" },

  // ─── Step 2: Rate Cards & Dynamic Surcharges ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujPricingFinance.step2Title",
    id: "step-2-rate-cards",
  },
  { type: "paragraph", contentKey: "tutorials.ujPricingFinance.step2Desc" },
  {
    type: "code",
    language: "json",
    filename: "Rate Card Definition (POST /api/v1/pricing/rate-cards)",
    code: `{
  "name": "Standard Prime-Time Rate Card",
  "resourceKind": "Court.Tennis",
  "baseHourlyRate": 75.00,
  "currency": "USD",
  "modifiers": [
    {
      "name": "Peak Evening Surcharge",
      "type": "Percentage",
      "value": 25.0,
      "conditions": {
        "daysOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
        "startTime": "18:00",
        "endTime": "22:00"
      }
    },
    {
      "name": "Member Tier Discount",
      "type": "Percentage",
      "value": -15.0,
      "conditions": {
        "customerTier": "GoldMember"
      }
    }
  ]
}`,
  },

  // ─── Step 3: Cryptographically Sealed Price Quotes ────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujPricingFinance.step3Title",
    id: "step-3-sealed-quotes",
  },
  { type: "paragraph", contentKey: "tutorials.ujPricingFinance.step3Desc" },

  // ─── Step 4: Generating Invoices & Payment Recording ──────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujPricingFinance.step4Title",
    id: "step-4-invoices-payments",
  },
  { type: "paragraph", contentKey: "tutorials.ujPricingFinance.step4Desc" },

  // ─── Step 5: Double-Entry General Ledger Balancing ────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujPricingFinance.step5Title",
    id: "step-5-ledger-reconciliation",
  },
  { type: "paragraph", contentKey: "tutorials.ujPricingFinance.step5Desc" },
  {
    type: "code",
    language: "text",
    filename: "Double-Entry Transaction Balance Sheet",
    code: `Transaction: TX-2026-8812 (Reservation Confirmation)
├── Debit:  Accounts Receivable (Asset 1100)        \$93.75
└── Credit: Venue Booking Revenue (Revenue 4100)    \$85.23
└── Credit: Sales Tax Payable (Liability 2200)       \$8.52
─────────────────────────────────────────────────────────────
SUM DEBITS = \$93.75 | SUM CREDITS = \$93.75 (BALANCED: OK)`,
  },
];

registerPage({
  slug: "tutorials/user-journey-pricing-finance",
  titleKey: "tutorials.ujPricingFinance.title",
  descriptionKey: "tutorials.ujPricingFinance.description",
  category: "tutorials",
  order: 3,
  sections,
  relatedSlugs: [
    "modules/catalog-pricing-overview",
    "modules/finance-overview",
    "tutorials/user-journey-venue-booking",
  ],
  lastUpdated: "2026-10-03",
});
