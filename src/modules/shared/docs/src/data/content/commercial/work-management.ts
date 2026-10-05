import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.workManagement.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "Cross-Mod", labelKey: "commercial.workManagement.statCrossModule" },
      { value: "SLA-Driven", labelKey: "commercial.workManagement.statSla" },
      { value: "Polymorphic", labelKey: "commercial.workManagement.statPolymorphic" },
      { value: "Real-time", labelKey: "commercial.workManagement.statRealtime" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.workManagement.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "CheckSquare",
        titleKey: "commercial.workManagement.featPolymorphicTasks",
        descriptionKey: "commercial.workManagement.featPolymorphicTasksDesc",
      },
      {
        icon: "Clock",
        titleKey: "commercial.workManagement.featSlaTracking",
        descriptionKey: "commercial.workManagement.featSlaTrackingDesc",
      },
      {
        icon: "Users",
        titleKey: "commercial.workManagement.featTeamAssignment",
        descriptionKey: "commercial.workManagement.featTeamAssignmentDesc",
      },
      {
        icon: "AlertCircle",
        titleKey: "commercial.workManagement.featPriorityEscalation",
        descriptionKey: "commercial.workManagement.featPriorityEscalationDesc",
      },
      {
        icon: "Activity",
        titleKey: "commercial.workManagement.featLifecycleStates",
        descriptionKey: "commercial.workManagement.featLifecycleStatesDesc",
      },
      {
        icon: "BarChart",
        titleKey: "commercial.workManagement.featWorkloadMetrics",
        descriptionKey: "commercial.workManagement.featWorkloadMetricsDesc",
      },
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.workManagement.ctaTitle",
    subtitleKey: "commercial.workManagement.ctaSubtitle",
    primaryCtaKey: "commercial.workManagement.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.workManagement.ctaSecondary",
    secondaryCtaHref: "/docs/modules/work-management-overview",
  },
];

registerPage({
  slug: "commercial/work-management",
  titleKey: "commercial.workManagement.title",
  descriptionKey: "commercial.workManagement.description",
  category: "commercial-modules",
  order: 20,
  sections,
  relatedSlugs: [
    "commercial/workforce-hrms",
    "commercial/custom-fields",
    "commercial/venue-operations",
  ],
  lastUpdated: "2026-10-03",
});
