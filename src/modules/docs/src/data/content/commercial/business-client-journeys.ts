import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.businessClientJourneys.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "SaaS Workspace Journey",
    id: "saas-workspace",
  },
  {
    type: "paragraph",
    contentKey: "From initial signup to fully scaled workspace. Learn how SCRIPE automates the onboarding path for business clients, enabling self-service configuration and instant access.",
  },
];

registerPage({
  slug: "commercial/business-client-journeys",
  titleKey: "commercial.businessClientJourneys.title",
  descriptionKey: "commercial.businessClientJourneys.description",
  category: "commercial-why-scripe",
  order: 10,
  sections,
  relatedSlugs: ["commercial/why-scripe-overview", "commercial/workspace-tours"],
  lastUpdated: "2026-06-28",
});
