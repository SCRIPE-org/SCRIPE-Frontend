import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.workspaceTours.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Interactive Workspace Tour",
    id: "tour-intro",
  },
  {
    type: "paragraph",
    contentKey: "Welcome to the workspace tour. This guide walks you through the intuitive SCRIPE dashboard interface, displaying real-time analytics, user settings, and developer controls.",
  },
];

registerPage({
  slug: "commercial/workspace-tours",
  titleKey: "commercial.workspaceTours.title",
  descriptionKey: "commercial.workspaceTours.description",
  category: "commercial-why-scripe",
  order: 11,
  sections,
  relatedSlugs: ["commercial/why-scripe-overview", "commercial/business-client-journeys"],
  lastUpdated: "2026-06-28",
});
