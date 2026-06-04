import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.marketplace.catalog.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplace.catalog.controllerTitle",
    id: "catalog-controllers",
  },
  { type: "paragraph", contentKey: "modules.marketplace.catalog.controllerIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/marketplace/catalog",
        descriptionKey: "modules.marketplace.catalog.apiList",
        auth: "AdminOnly",
        permission: "marketplace.catalog.view",
      },
      {
        method: "GET",
        path: "/api/v1/marketplace/catalog/{id}",
        descriptionKey: "modules.marketplace.catalog.apiDetails",
        auth: "AdminOnly",
        permission: "marketplace.catalog.view",
      },
      {
        method: "GET",
        path: "/api/v1/marketplace/categories",
        descriptionKey: "modules.marketplace.catalog.apiCategories",
        auth: "AdminOnly",
        permission: "marketplace.catalog.view",
      },
      {
        method: "POST",
        path: "/api/v1/marketplace/catalog/{id}/install",
        descriptionKey: "modules.marketplace.catalog.apiInstall",
        auth: "AdminOnly",
        permission: "marketplace.catalog.install",
      },
      {
        method: "POST",
        path: "/api/v1/marketplace/catalog/{id}/uninstall",
        descriptionKey: "modules.marketplace.catalog.apiUninstall",
        auth: "AdminOnly",
        permission: "marketplace.catalog.uninstall",
      },
      {
        method: "POST",
        path: "/api/v1/marketplace/catalog/{id}/reviews",
        descriptionKey: "modules.marketplace.catalog.apiReviewCreate",
        auth: "AdminOnly",
        permission: "marketplace.reviews.create",
      },
      {
        method: "POST",
        path: "/api/v1/marketplace/catalog/reviews/{reviewId}/reply",
        descriptionKey: "modules.marketplace.catalog.apiReviewReply",
        auth: "AdminOnly",
        permission: "marketplace.reviews.reply",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplace.catalog.installationTitle",
    id: "installation-workflow",
  },
  { type: "paragraph", contentKey: "modules.marketplace.catalog.installationIntro" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "modules.marketplace.catalog.step1Title",
        contentKey: "modules.marketplace.catalog.step1Content",
      },
      {
        titleKey: "modules.marketplace.catalog.step2Title",
        contentKey: "modules.marketplace.catalog.step2Content",
      },
      {
        titleKey: "modules.marketplace.catalog.step3Title",
        contentKey: "modules.marketplace.catalog.step3Content",
      },
    ],
  },
];

registerPage({
  slug: "modules/marketplace-catalog",
  titleKey: "modules.marketplace.catalog.title",
  descriptionKey: "modules.marketplace.catalog.description",
  category: "modules",
  order: 4,
  sections,
  relatedSlugs: [
    "modules/marketplace-overview",
    "modules/marketplace-submissions",
    "modules/marketplace-financials",
  ],
  lastUpdated: "2026-06-04",
});
