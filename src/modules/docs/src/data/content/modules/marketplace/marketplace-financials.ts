import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.marketplace.financials.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplace.financials.controllerTitle",
    id: "financials-controllers",
  },
  { type: "paragraph", contentKey: "modules.marketplace.financials.controllerIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/marketplace/financials/earnings",
        descriptionKey: "modules.marketplace.financials.apiEarnings",
        auth: "AdminOnly",
        permission: "marketplace.financials.view",
      },
      {
        method: "GET",
        path: "/api/v1/marketplace/financials/payouts",
        descriptionKey: "modules.marketplace.financials.apiPayouts",
        auth: "AdminOnly",
        permission: "marketplace.financials.view",
      },
      {
        method: "POST",
        path: "/api/v1/marketplace/financials/payouts/request",
        descriptionKey: "modules.marketplace.financials.apiPayoutRequest",
        auth: "AdminOnly",
        permission: "marketplace.financials.request_payout",
      },
      {
        method: "POST",
        path: "/api/v1/marketplace/financials/payouts/process",
        descriptionKey: "modules.marketplace.financials.apiPayoutProcess",
        auth: "AdminOnly",
        permission: "marketplace.financials.process_payouts",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplace.financials.payoutTitle",
    id: "payout-flows",
  },
  { type: "paragraph", contentKey: "modules.marketplace.financials.payoutIntro" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "modules.marketplace.financials.step1Title",
        contentKey: "modules.marketplace.financials.step1Content",
      },
      {
        titleKey: "modules.marketplace.financials.step2Title",
        contentKey: "modules.marketplace.financials.step2Content",
      },
      {
        titleKey: "modules.marketplace.financials.step3Title",
        contentKey: "modules.marketplace.financials.step3Content",
      },
    ],
  },
];

registerPage({
  slug: "modules/marketplace-financials",
  titleKey: "modules.marketplace.financials.title",
  descriptionKey: "modules.marketplace.financials.description",
  category: "modules",
  order: 4,
  sections,
  relatedSlugs: [
    "modules/marketplace-overview",
    "modules/marketplace-catalog",
    "modules/marketplace-submissions",
  ],
  lastUpdated: "2026-06-04",
});
