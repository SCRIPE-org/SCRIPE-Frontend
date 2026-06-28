import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.workspaceTours.intro" },

  // ─── Your SCRIPE Dashboard ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.workspaceTours.dashboardTitle",
    id: "dashboard",
  },
  { type: "paragraph", contentKey: "commercial.workspaceTours.dashboardContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "bar-chart-2",
        titleKey: "commercial.workspaceTours.featMetrics",
        descriptionKey: "commercial.workspaceTours.featMetricsDesc",
      },
      {
        icon: "bell",
        titleKey: "commercial.workspaceTours.featNotifications",
        descriptionKey: "commercial.workspaceTours.featNotificationsDesc",
      },
      {
        icon: "activity",
        titleKey: "commercial.workspaceTours.featActivity",
        descriptionKey: "commercial.workspaceTours.featActivityDesc",
      },
    ],
  },

  // ─── Your Team & Users ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.workspaceTours.teamTitle",
    id: "team-management",
  },
  { type: "paragraph", contentKey: "commercial.workspaceTours.teamContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "users",
        titleKey: "commercial.workspaceTours.featInvite",
        descriptionKey: "commercial.workspaceTours.featInviteDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.workspaceTours.featRoles",
        descriptionKey: "commercial.workspaceTours.featRolesDesc",
      },
      {
        icon: "layout",
        titleKey: "commercial.workspaceTours.featGroups",
        descriptionKey: "commercial.workspaceTours.featGroupsDesc",
      },
      {
        icon: "lock",
        titleKey: "commercial.workspaceTours.featPermissions",
        descriptionKey: "commercial.workspaceTours.featPermissionsDesc",
      },
    ],
  },

  // ─── Your Business Modules ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.workspaceTours.modulesTitle",
    id: "business-modules",
  },
  { type: "paragraph", contentKey: "commercial.workspaceTours.modulesContent" },
  {
    type: "table",
    headers: [
      "commercial.workspaceTours.tblModulesHeader1",
      "commercial.workspaceTours.tblModulesHeader2",
      "commercial.workspaceTours.tblModulesHeader3",
    ],
    rows: [
      [
        "commercial.workspaceTours.tblModR1C1",
        "commercial.workspaceTours.tblModR1C2",
        "commercial.workspaceTours.tblModR1C3",
      ],
      [
        "commercial.workspaceTours.tblModR2C1",
        "commercial.workspaceTours.tblModR2C2",
        "commercial.workspaceTours.tblModR2C3",
      ],
      [
        "commercial.workspaceTours.tblModR3C1",
        "commercial.workspaceTours.tblModR3C2",
        "commercial.workspaceTours.tblModR3C3",
      ],
      [
        "commercial.workspaceTours.tblModR4C1",
        "commercial.workspaceTours.tblModR4C2",
        "commercial.workspaceTours.tblModR4C3",
      ],
      [
        "commercial.workspaceTours.tblModR5C1",
        "commercial.workspaceTours.tblModR5C2",
        "commercial.workspaceTours.tblModR5C3",
      ],
    ],
  },

  // ─── Your Workspace Settings ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.workspaceTours.settingsTitle",
    id: "settings",
  },
  { type: "paragraph", contentKey: "commercial.workspaceTours.settingsContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "image",
        titleKey: "commercial.workspaceTours.featBranding",
        descriptionKey: "commercial.workspaceTours.featBrandingDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.workspaceTours.featLanguage",
        descriptionKey: "commercial.workspaceTours.featLanguageDesc",
      },
      {
        icon: "mail",
        titleKey: "commercial.workspaceTours.featEmail",
        descriptionKey: "commercial.workspaceTours.featEmailDesc",
      },
    ],
  },

  // ─── Getting Started Journey ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.workspaceTours.journeyTitle",
    id: "getting-started",
  },
  {
    type: "flowchart",
    title: "Your SCRIPE Onboarding Journey",
    direction: "vertical",
    nodes: [
      { id: "signup", label: "Sign Up & Choose Plan", type: "primary" },
      { id: "invite", label: "Invite Your Team", type: "default" },
      { id: "modules", label: "Activate Modules", type: "info" },
      { id: "roles", label: "Set Up Roles & Permissions", type: "default" },
      { id: "live", label: "Go Live — Operations Start", type: "success" },
    ],
    connections: [
      { from: "signup", to: "invite" },
      { from: "invite", to: "modules" },
      { from: "modules", to: "roles" },
      { from: "roles", to: "live" },
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.workspaceTours.onboardingTip" },
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
