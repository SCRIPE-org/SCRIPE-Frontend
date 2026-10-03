import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.communication.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "99.98%", labelKey: "commercial.communication.statDeliverability" },
      { value: "Omni", labelKey: "commercial.communication.statChannels" },
      { value: "Automatic", labelKey: "commercial.communication.statFailover" },
      { value: "Bilingual", labelKey: "commercial.communication.statTemplates" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.communication.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Radio",
        titleKey: "commercial.communication.featMultiGateway",
        descriptionKey: "commercial.communication.featMultiGatewayDesc",
      },
      {
        icon: "RefreshCw",
        titleKey: "commercial.communication.featIntelligentFailover",
        descriptionKey: "commercial.communication.featIntelligentFailoverDesc",
      },
      {
        icon: "FileCode",
        titleKey: "commercial.communication.featBilingualTemplates",
        descriptionKey: "commercial.communication.featBilingualTemplatesDesc",
      },
      {
        icon: "CheckSquare",
        titleKey: "commercial.communication.featReceiptAuditability",
        descriptionKey: "commercial.communication.featReceiptAuditabilityDesc",
      },
      {
        icon: "Bell",
        titleKey: "commercial.communication.featRealtimePush",
        descriptionKey: "commercial.communication.featRealtimePushDesc",
      },
      {
        icon: "ShieldAlert",
        titleKey: "commercial.communication.featSpamCompliance",
        descriptionKey: "commercial.communication.featSpamComplianceDesc",
      },
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.communication.ctaTitle",
    subtitleKey: "commercial.communication.ctaSubtitle",
    primaryCtaKey: "commercial.communication.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.communication.ctaSecondary",
    secondaryCtaHref: "/docs/modules/communication-overview",
  },
];

registerPage({
  slug: "commercial/omnichannel-communication",
  titleKey: "commercial.communication.title",
  descriptionKey: "commercial.communication.description",
  category: "commercial-modules",
  order: 17,
  sections,
  relatedSlugs: [
    "commercial/email-integration",
    "commercial/webhook-integration",
    "commercial/real-time-capabilities",
  ],
  lastUpdated: "2026-10-03",
});
