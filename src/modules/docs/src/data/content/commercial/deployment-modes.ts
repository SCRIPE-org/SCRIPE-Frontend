import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/deployment-modes",
  titleKey: "commercial.deploymentModes.title",
  category: "commercial-platform",
  order: 4,
  sections: buildLocalizedDocSections("commercial.deploymentModes", "commercial/deployment-modes"),
  relatedSlugs: ["commercial/platform-architecture", "commercial/system-requirements"],
  lastUpdated: "2026-06-09",
});
