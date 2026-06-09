import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/gateway-deployment",
  titleKey: "infrastructure.gatewayDeployment.title",
  category: "infrastructure",
  order: 5,
  sections: buildLocalizedDocSections(
    "infrastructure.gatewayDeployment",
    "infrastructure/gateway-deployment"
  ),
  relatedSlugs: [
    "architecture/dependency-injection",
    "architecture/backend",
    "infrastructure/resilience",
  ],
  lastUpdated: "2026-06-09",
});
