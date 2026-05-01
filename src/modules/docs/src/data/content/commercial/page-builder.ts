import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.pageBuilder.intro" },

  // ─── Login Page Builder ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pageBuilder.builderValueTitle",
    id: "page-builder",
  },
  { type: "paragraph", contentKey: "commercial.pageBuilder.builderValueContent" },

  // ─── 3 Design Modes ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pageBuilder.modesTitle",
    id: "design-modes",
  },
  { type: "paragraph", contentKey: "commercial.pageBuilder.modesContent" },
  {
    type: "table",
    headers: ["Mode", "Description"],
    rows: [
      [
        "Freeform",
        "Absolute positioning with pixel-level control. Desktop publishing for login pages.",
      ],
      ["Grid (Recommended)", "12-column CSS grid. Responsive across desktop, tablet, and mobile."],
      ["Builder", "Structured block-based assembly. Fastest path to polished login page."],
    ],
  },

  // ─── 14 Components ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pageBuilder.componentsTitle",
    id: "components",
  },
  { type: "paragraph", contentKey: "commercial.pageBuilder.componentsContent" },
  {
    type: "table",
    headers: ["Component", "Description"],
    rows: [
      ["Logo", "Tenant logo with sizing, alignment, and link target. Supports SVG, PNG, WebP."],
      [
        "Heading",
        "Display text with configurable size, weight, color. Dynamic tenant name variables.",
      ],
      ["Login Form", "Email/password inputs, submit, remember-me, forgot-password link."],
      ["Social Login", "OAuth buttons for Google, Microsoft, Apple, GitHub."],
      ["Image", "Hero graphics, illustrations, decorative elements with sizing and crop."],
      ["Button", "4 variants (primary, secondary, outline, ghost) with icon support."],
      ["Card Container", "Grouped layout region with background, border, and shadow."],
      ["Footer", "Configurable links, copyright, alignment. Pre-populated Terms/Privacy."],
      ["+ 6 More", "Text paragraphs, dividers, spacers, badges, icons, terms links."],
    ],
  },

  // ─── Multi-Page Branding ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pageBuilder.multiPageTitle",
    id: "multi-page",
  },
  { type: "paragraph", contentKey: "commercial.pageBuilder.multiPageContent" },
  {
    type: "table",
    headers: ["Page", "Purpose", "Key Capability"],
    rows: [
      [
        "Login",
        "Primary brand statement",
        "Full visual control — layout, colors, typography, overlay",
      ],
      [
        "Forgot Password",
        "Trust-building",
        "Independent headline/subtitle for reassuring messaging",
      ],
      ["Reset Password", "Action-oriented", "Clear focused messaging with minimal distractions"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.pageBuilder.multiPageAdvantageDesc",
  },

  // ─── Dashboard Theming ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pageBuilder.dashboardTitle",
    id: "dashboard-theming",
  },
  { type: "paragraph", contentKey: "commercial.pageBuilder.dashboardContent" },
  {
    type: "table",
    headers: ["Setting", "Options"],
    rows: [
      [
        "Layout Templates",
        "8 templates: Default, Navigation, Classic, Compact, Elegant, Floating, Modern, Minimal",
      ],
      [
        "Color Themes",
        "12 palettes: Default, Zinc, Slate, Stone, Neutral, Red, Rose, Orange, Green, Blue, Violet, Yellow",
      ],
      ["Theme Mode", "Light, Dark, or System (respects OS preference)"],
      ["Sidebar", "Default state: expanded or collapsed"],
    ],
  },

  // ─── Bundle Marketplace ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pageBuilder.bundleTitle",
    id: "bundles",
  },
  { type: "paragraph", contentKey: "commercial.pageBuilder.bundleContent" },
  {
    type: "table",
    headers: ["Feature", "Description"],
    rows: [
      ["Save as Bundle", "Capture current studio state as reusable, shareable configuration"],
      ["Browse & Apply", "Filter by type, search, paginate. One-click apply."],
      ["Complete Bundles", "Login + builder + dashboard + accessibility in one click"],
    ],
  },

  // ─── Enterprise Safety ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pageBuilder.safetyTitle",
    id: "safety",
  },
  { type: "paragraph", contentKey: "commercial.pageBuilder.safetyContent" },
  {
    type: "table",
    headers: ["Feature", "Description"],
    rows: [
      [
        "Draft → Preview → Publish",
        "All changes in draft until explicitly published. Preview in sandbox.",
      ],
      ["Optimistic Concurrency", "Concurrent edits detected and rejected (409 Conflict)."],
      ["Emergency Safe Mode", "One-click restore to platform defaults. Guaranteed working login."],
      ["Complete Audit Trail", "Who, what, when, before/after. SOX/HIPAA/ISO 27001 compliance."],
    ],
  },

  // ─── ROI ──────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pageBuilder.roiTitle",
    id: "roi",
  },
  {
    type: "table",
    headers: ["Scenario", "Without NEXORA", "With NEXORA Page Builder"],
    rows: [
      [
        "Custom login page per tenant",
        "1-2 weeks developer time ($5K–$10K)",
        "15 minutes — tenant admin self-service",
      ],
      [
        "Multi-page auth branding",
        "Not available (all pages identical)",
        "Independent branding for login/forgot/reset",
      ],
      [
        "Dashboard visual defaults",
        "Config file changes (deployment required)",
        "Visual studio with live preview",
      ],
      [
        "Complete platform rebrand",
        "4-8 weeks engineering project",
        "1 click — apply a Complete bundle",
      ],
      [
        "Responsive login layouts",
        "Custom CSS + media queries",
        "12-column grid with automatic breakpoints",
      ],
      [
        "Brand configuration backup",
        "Manual database exports",
        "Save as Bundle — instant snapshot + share",
      ],
    ],
  },

  // ─── Competitive Analysis ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pageBuilder.competitiveTitle",
    id: "competitive",
  },
  {
    type: "table",
    headers: ["Feature", "Auth0", "Keycloak", "NEXORA"],
    rows: [
      [
        "Visual page builder",
        "No (code required)",
        "No (FreeMarker templates)",
        "Yes (14 components, 3 modes)",
      ],
      ["Multi-page branding", "No", "No", "Yes (Login + Forgot + Reset)"],
      ["Dashboard theming", "No", "Limited (theme.properties)", "Yes (8 layouts, 12 colors)"],
      [
        "Theme marketplace",
        "No",
        "Community themes (unsupported)",
        "40 premium packages (5 tiers)",
      ],
      ["Configuration bundles", "No", "No", "Yes (save/share/apply bundles)"],
      ["WCAG AA compliance", "Basic", "Manual", "32 settings, 6 profiles, auto-fix audit"],
      ["12-column responsive grid", "No", "No", "Yes (desktop/tablet/mobile breakpoints)"],
      [
        "Draft/Publish safety",
        "No (live-edit)",
        "No (direct deploy)",
        "Yes (concurrency + rollback + safe mode)",
      ],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.pageBuilder.tip",
  },
];

registerPage({
  slug: "commercial/page-builder",
  titleKey: "commercial.pageBuilder.title",
  descriptionKey: "commercial.pageBuilder.description",
  category: "commercial-enterprise",
  order: 9,
  sections,
  relatedSlugs: ["commercial/login-customizer", "commercial/theme-marketplace"],
  lastUpdated: "2026-04-02",
});
