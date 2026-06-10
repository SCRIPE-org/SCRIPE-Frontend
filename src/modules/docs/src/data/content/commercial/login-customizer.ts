import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.loginCustomizer.intro" },

  // ─── Brand Identity ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.loginCustomizer.brandTitle",
    id: "brand-identity",
  },
  { type: "paragraph", contentKey: "commercial.loginCustomizer.brandContent" },
  {
    type: "table",
    headers: ["Capability", "Description"],
    rows: [
      [
        "Custom Logo & Favicon",
        "Upload your corporate identity assets with automatic optimization",
      ],
      ["Color System", "Configure primary, secondary, accent colors with live preview"],
      ["Typography", "Choose from Google Fonts library with instant rendering"],
      ["Background Media", "Solid colors, gradients, uploaded images, or video backgrounds"],
      ["Overlay Effects", "Blur, color overlay, and opacity controls for premium aesthetics"],
    ],
  },

  // ─── Visual Studio ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.loginCustomizer.studioTitle",
    id: "visual-studio",
  },
  { type: "paragraph", contentKey: "commercial.loginCustomizer.studioContent" },

  // ─── 14 Layouts ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.loginCustomizer.layoutsTitle",
    id: "layouts",
  },
  { type: "paragraph", contentKey: "commercial.loginCustomizer.layoutsContent" },
  {
    type: "table",
    headers: ["Layout Category", "Layouts Included", "Best For"],
    rows: [
      [
        "Split Layouts (6)",
        "split-right, split-left, magazine, compact-sidebar, vertical-split, diagonal-split",
        "Corporate & enterprise branding with dedicated branding panel",
      ],
      [
        "Full-Page Layouts (8)",
        "centered, branded-full, overlay, simple, floating-card, immersive, glass-morphism, corner-card",
        "Modern, immersive login experiences with full-screen backgrounds",
      ],
    ],
  },

  // ─── Dark/Light Theme ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.loginCustomizer.themeTitle",
    id: "theme",
  },
  { type: "paragraph", contentKey: "commercial.loginCustomizer.themeContent" },

  // ─── Enterprise Safety ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.loginCustomizer.safetyTitle",
    id: "safety",
  },
  { type: "paragraph", contentKey: "commercial.loginCustomizer.safetyContent" },
  {
    type: "table",
    headers: ["Safety Feature", "Description"],
    rows: [
      ["Draft → Preview → Publish", "No changes go live without explicit admin approval"],
      ["Version History", "Every publish creates a snapshot for instant rollback"],
      ["Optimistic Concurrency", "Prevents conflicting edits between multiple admins"],
      ["Safe Mode", "One-click emergency bypass restores platform defaults"],
      ["Sandboxed Preview", "Login preview runs in isolated iframe — zero production risk"],
      ["Audit Trail", "Every change is logged with who, when, and before/after snapshots"],
    ],
  },

  // ─── Multi-Tenant ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.loginCustomizer.tenantTitle",
    id: "multi-tenant",
  },
  { type: "paragraph", contentKey: "commercial.loginCustomizer.tenantContent" },

  // ─── Zero Code ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.loginCustomizer.zeroCodeTitle",
    id: "zero-code",
  },
  { type: "paragraph", contentKey: "commercial.loginCustomizer.zeroCodeContent" },
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.loginCustomizer.zeroCodeTip",
  },
];

registerPage({
  slug: "commercial/login-customizer",
  titleKey: "commercial.loginCustomizer.title",
  descriptionKey: "commercial.loginCustomizer.description",
  category: "commercial-enterprise",
  order: 7,
  sections,
  relatedSlugs: [
    "commercial/multi-tenancy",
    "commercial/authentication-security",
    "commercial/theme-marketplace",
    "commercial/page-builder",
  ],
  lastUpdated: "2026-04-02",
});
