import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.compliance.overview.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.whatIsTitle",
    id: "what-is-compliance",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.whatIsIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.subModulesTitle",
    id: "sub-modules",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.subModulesIntro" },
  {
    type: "flowchart",
    title: "modules.compliance.overview.subModulesTitle",
    direction: "vertical",
    nodes: [
      { id: "dsr", label: "DSR Engine", type: "primary", description: "Handles Subject Requests (Export, Erasure, Rectification)" },
      { id: "consent", label: "Consent Ledger", type: "primary", description: "Immutable tracking of consent states & snapshots" },
      { id: "retention", label: "Retention Jobs", type: "primary", description: "Enforces data destruction policies based on age" },
      { id: "inventory", label: "Data Inventory", type: "warning", description: "Maps sensitive PII locations across modules" },
      { id: "reports", label: "Reporting", type: "success", description: "Generates RoPA and DPIA compliance reports" },
      { id: "identity", label: "Identity Module", type: "default", description: "Provides User/Admin context & Auth" },
      { id: "entitlements", label: "Entitlements Module", type: "default", description: "Feature-gates compliance capabilities" }
    ],
    connections: [
      { from: "identity", to: "dsr", label: "initiates requests" },
      { from: "identity", to: "consent", label: "grants/revokes" },
      { from: "entitlements", to: "retention", label: "gates policies" },
      { from: "inventory", to: "dsr", label: "guides erasure" },
      { from: "inventory", to: "retention", label: "targets data" },
      { from: "dsr", to: "reports", label: "audit trails" },
      { from: "consent", to: "reports", label: "audit trails" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.backendTitle",
    id: "backend-architecture",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.backendIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.frontendTitle",
    id: "frontend-architecture",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.frontendIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.endpointsTitle",
    id: "endpoints",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.endpointsIntro" }
];

registerPage({
  slug: "modules/compliance-overview",
  titleKey: "modules.compliance.overview.title",
  descriptionKey: "modules.compliance.overview.description",
  category: "modules",
  order: 1,
  sections,
  relatedSlugs: [
    "modules/compliance-dsr",
    "modules/compliance-consent",
    "modules/compliance-retention"
  ],
  lastUpdated: "2026-05-03",
});
