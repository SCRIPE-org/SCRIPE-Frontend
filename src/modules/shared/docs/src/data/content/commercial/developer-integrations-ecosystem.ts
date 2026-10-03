import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.integrationsEcosystem.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "RESTful", labelKey: "commercial.integrationsEcosystem.statApi" },
      { value: "SHA-256", labelKey: "commercial.integrationsEcosystem.statSecurity" },
      { value: "Sub-ms", labelKey: "commercial.integrationsEcosystem.statAuthLatency" },
      { value: "Self-Serve", labelKey: "commercial.integrationsEcosystem.statPortal" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.integrationsEcosystem.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Key",
        titleKey: "commercial.integrationsEcosystem.featKeyManagement",
        descriptionKey: "commercial.integrationsEcosystem.featKeyManagementDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "commercial.integrationsEcosystem.featScopeDelegation",
        descriptionKey: "commercial.integrationsEcosystem.featScopeDelegationDesc",
      },
      {
        icon: "Activity",
        titleKey: "commercial.integrationsEcosystem.featQuotaEnforcement",
        descriptionKey: "commercial.integrationsEcosystem.featQuotaEnforcementDesc",
      },
      {
        icon: "BarChart2",
        titleKey: "commercial.integrationsEcosystem.featApiTelemetry",
        descriptionKey: "commercial.integrationsEcosystem.featApiTelemetryDesc",
      },
      {
        icon: "Cpu",
        titleKey: "commercial.integrationsEcosystem.featPartnerEcosystem",
        descriptionKey: "commercial.integrationsEcosystem.featPartnerEcosystemDesc",
      },
      {
        icon: "Lock",
        titleKey: "commercial.integrationsEcosystem.featIpWhitelisting",
        descriptionKey: "commercial.integrationsEcosystem.featIpWhitelistingDesc",
      },
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.integrationsEcosystem.ctaTitle",
    subtitleKey: "commercial.integrationsEcosystem.ctaSubtitle",
    primaryCtaKey: "commercial.integrationsEcosystem.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.integrationsEcosystem.ctaSecondary",
    secondaryCtaHref: "/docs/modules/integrations-overview",
  },
];

registerPage({
  slug: "commercial/developer-integrations-ecosystem",
  titleKey: "commercial.integrationsEcosystem.title",
  descriptionKey: "commercial.integrationsEcosystem.description",
  category: "commercial-modules",
  order: 18,
  sections,
  relatedSlugs: [
    "commercial/webhook-integration",
    "commercial/rest-api-overview",
    "commercial/cli-tooling",
  ],
  lastUpdated: "2026-10-03",
});
