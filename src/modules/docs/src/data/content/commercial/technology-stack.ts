import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/technology-stack",
  titleKey: "commercial.technologyStack.title",
  category: "commercial-platform",
  order: 3,
  sections: buildLocalizedDocSections("commercial.technologyStack", "commercial/technology-stack"),
  relatedSlugs: ["commercial/platform-architecture", "commercial/system-requirements"],
  lastUpdated: "2026-06-09",
});
