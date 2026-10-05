import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.workforceHrms.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "100%", labelKey: "commercial.workforceHrms.statCompliance" },
      { value: "0", labelKey: "commercial.workforceHrms.statExpiredCerts" },
      { value: "Real-time", labelKey: "commercial.workforceHrms.statRosterSync" },
      { value: "-75%", labelKey: "commercial.workforceHrms.statSchedulingLabor" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.workforceHrms.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "UserCheck",
        titleKey: "commercial.workforceHrms.featStaffProfiles",
        descriptionKey: "commercial.workforceHrms.featStaffProfilesDesc",
      },
      {
        icon: "Award",
        titleKey: "commercial.workforceHrms.featCertificationTracking",
        descriptionKey: "commercial.workforceHrms.featCertificationTrackingDesc",
      },
      {
        icon: "Clock",
        titleKey: "commercial.workforceHrms.featAvailabilityEngine",
        descriptionKey: "commercial.workforceHrms.featAvailabilityEngineDesc",
      },
      {
        icon: "Calendar",
        titleKey: "commercial.workforceHrms.featShiftRostering",
        descriptionKey: "commercial.workforceHrms.featShiftRosteringDesc",
      },
      {
        icon: "ShieldAlert",
        titleKey: "commercial.workforceHrms.featComplianceGates",
        descriptionKey: "commercial.workforceHrms.featComplianceGatesDesc",
      },
      {
        icon: "Smartphone",
        titleKey: "commercial.workforceHrms.featCoachAppIntegration",
        descriptionKey: "commercial.workforceHrms.featCoachAppIntegrationDesc",
      },
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.workforceHrms.ctaTitle",
    subtitleKey: "commercial.workforceHrms.ctaSubtitle",
    primaryCtaKey: "commercial.workforceHrms.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.workforceHrms.ctaSecondary",
    secondaryCtaHref: "/docs/modules/hrms-overview",
  },
];

registerPage({
  slug: "commercial/workforce-hrms",
  titleKey: "commercial.workforceHrms.title",
  descriptionKey: "commercial.workforceHrms.description",
  category: "commercial-modules",
  order: 13,
  sections,
  relatedSlugs: [
    "commercial/customer-360-party-kernel",
    "commercial/venue-operations",
    "commercial/multi-branch-organization",
  ],
  lastUpdated: "2026-10-03",
});
