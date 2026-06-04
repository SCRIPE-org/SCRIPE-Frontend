import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.marketplace.submissions.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplace.submissions.controllerTitle",
    id: "submissions-controllers",
  },
  { type: "paragraph", contentKey: "modules.marketplace.submissions.controllerIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/marketplace/developers/profile",
        descriptionKey: "modules.marketplace.submissions.apiCreateProfile",
        auth: "AdminOnly",
        permission: "marketplace.developers.profile",
      },
      {
        method: "POST",
        path: "/api/v1/marketplace/submissions",
        descriptionKey: "modules.marketplace.submissions.apiCreateSubmission",
        auth: "AdminOnly",
        permission: "marketplace.listings.create",
      },
      {
        method: "GET",
        path: "/api/v1/marketplace/submissions",
        descriptionKey: "modules.marketplace.submissions.apiListSubmissions",
        auth: "AdminOnly",
        permission: "marketplace.listings.view",
      },
      {
        method: "POST",
        path: "/api/v1/marketplace/submissions/{id}/approve",
        descriptionKey: "modules.marketplace.submissions.apiApprove",
        auth: "AdminOnly",
        permission: "marketplace.listings.approve",
      },
      {
        method: "POST",
        path: "/api/v1/marketplace/submissions/{id}/reject",
        descriptionKey: "modules.marketplace.submissions.apiReject",
        auth: "AdminOnly",
        permission: "marketplace.listings.approve",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplace.submissions.workflowTitle",
    id: "workflow",
  },
  { type: "paragraph", contentKey: "modules.marketplace.submissions.workflowIntro" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "modules.marketplace.submissions.step1Title",
        contentKey: "modules.marketplace.submissions.step1Content",
      },
      {
        titleKey: "modules.marketplace.submissions.step2Title",
        contentKey: "modules.marketplace.submissions.step2Content",
      },
      {
        titleKey: "modules.marketplace.submissions.step3Title",
        contentKey: "modules.marketplace.submissions.step3Content",
      },
      {
        titleKey: "modules.marketplace.submissions.step4Title",
        contentKey: "modules.marketplace.submissions.step4Content",
      },
    ],
  },
];

registerPage({
  slug: "modules/marketplace-submissions",
  titleKey: "modules.marketplace.submissions.title",
  descriptionKey: "modules.marketplace.submissions.description",
  category: "modules",
  order: 4,
  sections,
  relatedSlugs: [
    "modules/marketplace-overview",
    "modules/marketplace-catalog",
    "modules/marketplace-financials",
  ],
  lastUpdated: "2026-06-04",
});
