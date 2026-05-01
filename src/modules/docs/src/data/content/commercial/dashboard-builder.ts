import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.dashboardBuilder.intro" },

  // ─── Business Value ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dashboardBuilder.valueTitle",
    id: "business-value",
  },
  { type: "paragraph", contentKey: "commercial.dashboardBuilder.valueIntro" },
  {
    type: "table",
    headers: ["Capability", "Business Impact", "User Benefit"],
    rows: [
      [
        "61+ Customizable Settings",
        "White-label ready for any industry",
        "Users personalize their workspace to their exact preferences",
      ],
      [
        "Cross-Device Persistence",
        "Roaming profiles — settings follow the user everywhere",
        "No reconfiguration when switching devices or browsers",
      ],
      [
        "Tenant-Level Branding",
        "Enforce corporate brand standards across all users",
        "Consistent, professional experience for every team member",
      ],
      [
        "Admin Override Control",
        "IT teams control what users can customize",
        "Security-compliant customization with guardrails",
      ],
      [
        "Preset Marketplace",
        "Pre-built themes reduce setup time from hours to seconds",
        "One-click professional themes that just work",
      ],
      [
        "Edition-Based Gating",
        "Monetize advanced customization features by tier",
        "Clear upgrade path drives subscription revenue",
      ],
    ],
  },

  // ─── How It Works ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dashboardBuilder.howItWorksTitle",
    id: "how-it-works",
  },
  { type: "paragraph", contentKey: "commercial.dashboardBuilder.howItWorksIntro" },
  {
    type: "flowchart",
    title: "Settings Resolution Chain",
    direction: "horizontal",
    nodes: [
      { id: "platform", label: "Platform Defaults", type: "default" },
      { id: "tenant", label: "Tenant Branding", type: "info" },
      { id: "admin", label: "Admin Preferences", type: "warning" },
      { id: "render", label: "Rendered Dashboard", type: "success" },
    ],
    connections: [
      { from: "platform", to: "tenant", label: "Overridden by" },
      { from: "tenant", to: "admin", label: "Overridden by" },
      { from: "admin", to: "render", label: "Applied" },
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.dashboardBuilder.howItWorksTip",
  },

  // ─── Customization Categories ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dashboardBuilder.categoriesTitle",
    id: "categories",
  },
  { type: "paragraph", contentKey: "commercial.dashboardBuilder.categoriesIntro" },
  {
    type: "table",
    headers: ["Category", "Settings Count", "Examples"],
    rows: [
      ["Layout & Structure", "7", "50+ layout templates, sidebar position, header style"],
      ["Colors & Theme", "16", "Color themes, gradient backgrounds, custom hex colors"],
      ["Typography & Spacing", "5", "Font size, border radius, spacing density"],
      ["Component Styles", "16", "Buttons, inputs, tables, badges, avatars (10+ variants each)"],
      ["Logo & Branding", "5", "Logo type (sparkle/shield/image), animation, size"],
      ["Navigation & UX", "9", "Navigation style, breadcrumbs, sticky header"],
      ["Toast & Effects", "5", "Toast style, hover effects, animation intensity"],
      ["Accessibility", "3", "High contrast, reduced motion, compact mode"],
    ],
  },

  // ─── Enterprise Features ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dashboardBuilder.enterpriseTitle",
    id: "enterprise",
  },
  { type: "paragraph", contentKey: "commercial.dashboardBuilder.enterpriseIntro" },
  {
    type: "table",
    headers: ["Feature", "Free", "Standard", "Enterprise"],
    rows: [
      ["Basic Layout & Colors", "✅", "✅", "✅"],
      ["50+ Layout Templates", "✅", "✅", "✅"],
      ["Gradient Backgrounds", "❌", "✅", "✅"],
      ["Component Styles (Button, Input, Table, etc.)", "❌", "✅", "✅"],
      ["Hover Effects", "❌", "✅", "✅"],
      ["Custom Hex Colors", "❌", "❌", "✅"],
      ["Logo Customization (Type, Animation, Text)", "❌", "❌", "✅"],
      ["Admin Override Control (Lock/Unlock Settings)", "❌", "❌", "✅"],
      ["Per-Setting Whitelist (Path-Level Control)", "❌", "❌", "✅"],
      ["Custom Theme Presets", "❌", "❌", "✅"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "commercial.dashboardBuilder.enterpriseNote",
  },

  // ─── Cross-Device Sync ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dashboardBuilder.syncTitle",
    id: "cross-device-sync",
  },
  { type: "paragraph", contentKey: "commercial.dashboardBuilder.syncIntro" },
  {
    type: "table",
    headers: ["Scenario", "Behavior"],
    rows: [
      ["Admin opens laptop at office", "Settings loaded from server → applied instantly"],
      ["Admin changes theme on phone", "Saved to server → syncs to laptop in background"],
      ["Admin closes tab mid-change", "Unsaved changes preserved via keepalive fetch"],
      [
        "Two sessions edit simultaneously",
        "Conflict resolved with field-level merge (no data loss)",
      ],
      ["Network goes down temporarily", "Changes cached locally → synced when connection restores"],
    ],
  },

  // ─── Admin Override Control ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dashboardBuilder.overrideTitle",
    id: "override-control",
  },
  { type: "paragraph", contentKey: "commercial.dashboardBuilder.overrideIntro" },
  {
    type: "flowchart",
    title: "Override Control Flow",
    direction: "vertical",
    nodes: [
      { id: "tenant-admin", label: "Tenant Admin (IT)", type: "default" },
      { id: "toggle", label: "Enable/Disable Overrides", type: "info" },
      { id: "whitelist", label: "Select Allowed Settings", type: "warning" },
      { id: "user", label: "Regular Admin Experience", type: "success" },
    ],
    connections: [
      { from: "tenant-admin", to: "toggle" },
      { from: "toggle", to: "whitelist", label: "If enabled" },
      { from: "whitelist", to: "user", label: "Path-filtered" },
    ],
  },

  // ─── Security ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dashboardBuilder.securityTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "commercial.dashboardBuilder.securityIntro" },
  {
    type: "table",
    headers: ["Security Feature", "Protection"],
    rows: [
      ["Data Isolation", "All settings wiped on logout — no cross-admin leakage"],
      ["Payload Validation", "8KB client-side limit prevents database overflow"],
      [
        "Server-Side Enforcement",
        "AdminSettingsJson validated against AllowedAdminSettingsJson whitelist",
      ],
      ["Concurrency Safety", "409 conflict resolution with field-level merge"],
      ["Tab-Close Protection", "Keepalive fetch + deferred flush prevent data loss"],
      ["CSRF Protection", "All mutations require X-CSRF-Token header"],
    ],
  },

  // ─── Integration ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dashboardBuilder.integrationTitle",
    id: "integration",
  },
  { type: "paragraph", contentKey: "commercial.dashboardBuilder.integrationIntro" },
  {
    type: "table",
    headers: ["Integration Point", "Description"],
    rows: [
      [
        "Login Customizer",
        "Dashboard builder coexists with login page customizer in the same Studio",
      ],
      ["Theme Marketplace", "Pre-built themes can include both login page and dashboard settings"],
      ["Entitlements Module", "Feature flags control which edition gets which customization tier"],
      ["Multi-Tenancy", "Each tenant can set default dashboard appearance for all their admins"],
      ["Audit System", "All settings changes logged in the audit trail"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.dashboardBuilder.integrationTip",
  },
];

registerPage({
  slug: "commercial/dashboard-builder",
  titleKey: "commercial.dashboardBuilder.title",
  descriptionKey: "commercial.dashboardBuilder.description",
  category: "commercial",
  order: 10,
  sections,
  relatedSlugs: [
    "commercial/login-customizer",
    "commercial/theme-marketplace",
    "commercial/page-builder",
  ],
  lastUpdated: "2026-04-05",
});
