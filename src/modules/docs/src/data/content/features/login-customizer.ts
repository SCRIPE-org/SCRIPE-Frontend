import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.loginCustomizer.intro" },

      // ─── Studio Overview ─────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.studioTitle", id: "studio-overview",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.studioIntro" },
      {
            type: "table",
            headers: ["Component", "Description", "Technology"],
            rows: [
                  ["Configuration Panels", "Tabbed sidebar with Appearance, Colors, Typography, Overlay controls", "React + Zustand"],
                  ["Live Preview", "Sandboxed iframe with real-time CSS variable injection", "iframe + postMessage"],
                  ["Device Toggles", "Desktop / Tablet / Mobile responsive preview", "CSS resize"],
                  ["Draft System", "All changes are draft until explicit publish", "API + optimistic concurrency"],
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "features.loginCustomizer.studioTip",
      },

      // ─── Login Layouts ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.layoutsTitle", id: "login-layouts",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.layoutsIntro" },
      {
            type: "table",
            headers: ["#", "Layout", "Type", "Overlay", "Branding Panel"],
            rows: [
                  ["1", "split-right", "Split", "❌", "✅"],
                  ["2", "split-left", "Split", "❌", "✅"],
                  ["3", "centered", "Full-page", "❌", "❌"],
                  ["4", "branded-full", "Full-page", "✅", "❌"],
                  ["5", "overlay", "Full-page", "✅", "❌"],
                  ["6", "simple", "Full-page", "❌", "❌"],
                  ["7", "magazine", "Split", "❌", "✅"],
                  ["8", "compact-sidebar", "Split", "❌", "✅"],
                  ["9", "floating-card", "Full-page", "❌", "❌"],
                  ["10", "immersive", "Full-page", "✅", "❌"],
                  ["11", "glass-morphism", "Full-page", "✅", "❌"],
                  ["12", "corner-card", "Full-page", "✅", "❌"],
                  ["13", "vertical-split", "Split", "❌", "✅"],
                  ["14", "diagonal-split", "Split", "❌", "✅"],
            ],
      },
      {
            type: "info",
            variant: "note",
            contentKey: "features.loginCustomizer.layoutsNote",
      },

      // ─── Design Tokens ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.tokensTitle", id: "design-tokens",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.tokensIntro" },
      {
            type: "flowchart",
            title: "Token Pipeline",
            direction: "horizontal",
            nodes: [
                  { id: "store", label: "Tenant Settings (JSON)", type: "default" },
                  { id: "tokens", label: "Design Tokens (24)", type: "info" },
                  { id: "css", label: "CSS Variables", type: "warning" },
                  { id: "dom", label: "Live DOM", type: "success" },
            ],
            connections: [
                  { from: "store", to: "tokens" },
                  { from: "tokens", to: "css" },
                  { from: "css", to: "dom" },
            ],
      },
      {
            type: "table",
            headers: ["Token", "CSS Variable", "Default", "Controlled By"],
            rows: [
                  ["color.primary", "--login-primary", "hsl(var(--primary))", "Color picker"],
                  ["color.background", "--login-bg", "hsl(var(--background))", "Background tab"],
                  ["color.surface", "--login-surface", "hsl(var(--card))", "Appearance tab"],
                  ["overlay.opacity", "--login-overlay-opacity", "0.5", "Overlay slider"],
                  ["overlay.color", "--login-overlay-color", "#000000", "Overlay color picker"],
                  ["overlay.blur", "--login-overlay-blur", "0px", "Overlay blur slider"],
                  ["spacing.formWidth", "--login-form-width", "420px", "Spacing controls"],
                  ["spacing.cardPadding", "--login-card-padding", "32px", "Spacing controls"],
                  ["radius.card", "--login-radius-card", "16px", "Radius slider"],
                  ["bg.gradient", "--login-bg-gradient", "none", "Background tab"],
                  ["bg.image", "--login-bg-image", "none", "Background upload"],
            ],
      },

      // ─── Background & Overlay ────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.bgOverlayTitle", id: "background-overlay",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.bgOverlayIntro" },
      {
            type: "table",
            headers: ["Layout Type", "Background Image", "Overlay Support", "Branding Panel"],
            rows: [
                  ["Full-page (centered, branded-full, overlay, etc.)", "On wrapper div", "✅ Where applicable", "❌"],
                  ["Split (split-right, magazine, etc.)", "On branding panel only", "✅ On form + branding sections", "✅ Independent controls"],
            ],
      },
      {
            type: "info",
            variant: "warning",
            contentKey: "features.loginCustomizer.bgOverlayWarning",
      },

      // ─── Light/Dark Theme ────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.themeTitle", id: "light-dark-theme",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.themeIntro" },
      {
            type: "table",
            headers: ["Feature", "Light Mode", "Dark Mode"],
            rows: [
                  ["Color scheme", "Default palette", "Dark panel overrides"],
                  ["Form background", "Light surface", "Dark surface (--login-dark-form-bg)"],
                  ["Text color", "Dark text", "Light text (--login-dark-text)"],
                  ["Input styling", "Standard borders", "Dark input backgrounds"],
                  ["Overlay vars", "Standard panel overlay", "Separate dark panel overlay vars"],
            ],
      },

      // ─── Branding Panel ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.brandingTitle", id: "branding-panel",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.brandingIntro" },
      {
            type: "table",
            headers: ["Setting", "CSS Variable", "Description"],
            rows: [
                  ["Logo URL", "--login-branding-logo", "Tenant logo displayed in branding panel"],
                  ["Company Name", "--login-branding-name", "Company name text"],
                  ["Headline", "--login-branding-headline", "Login page headline text"],
                  ["Subtitle", "--login-branding-subtitle", "Login page subtitle text"],
                  ["Background", "Inherited from bg tokens", "Background image/gradient/color"],
                  ["Overlay", "--login-panel-overlay-*", "Independent overlay on branding panel"],
            ],
      },

      // ─── Draft / Publish / Rollback ──────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.draftTitle", id: "draft-publish",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.draftIntro" },
      {
            type: "flowchart",
            title: "Publish Workflow",
            direction: "vertical",
            nodes: [
                  { id: "edit", label: "Edit in Studio (Draft)", type: "default" },
                  { id: "preview", label: "Live Preview (iframe)", type: "info" },
                  { id: "save", label: "Save Draft (API)", type: "warning" },
                  { id: "publish", label: "Publish (version++)", type: "success" },
                  { id: "rollback", label: "Rollback (any snapshot)", type: "danger" },
            ],
            connections: [
                  { from: "edit", to: "preview" },
                  { from: "preview", to: "save" },
                  { from: "save", to: "publish" },
                  { from: "publish", to: "rollback", label: "If needed" },
            ],
      },
      {
            type: "info",
            variant: "note",
            contentKey: "features.loginCustomizer.draftNote",
      },

      // ─── Safe Mode ───────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.safeModeTitle", id: "safe-mode",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.safeModeIntro" },

      // ─── Access Control ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.accessTitle", id: "access-control",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.accessIntro" },
      {
            type: "table",
            headers: ["Action", "System Admin", "Tenant Admin (perm)", "Regular Admin"],
            rows: [
                  ["Open Customizer Studio", "✅", "✅", "❌"],
                  ["Edit login branding", "✅", "✅", "❌"],
                  ["Publish changes", "✅", "✅", "❌"],
                  ["Rollback settings", "✅", "✅", "❌"],
                  ["Activate safe mode", "✅", "❌", "❌"],
                  ["Toggle dark/light", "✅", "✅", "✅"],
            ],
      },

      // ─── Architecture ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.loginCustomizer.archTitle", id: "architecture",
      },
      { type: "paragraph", contentKey: "features.loginCustomizer.archIntro" },
      {
            type: "code",
            language: "text",
            filename: "Module Structure",
            code: `src/modules/system/customization/
├── src/
│   ├── data/              # API services, repositories
│   ├── domain/            # Entities, types, interfaces
│   └── presentation/
│       ├── components/
│       │   ├── StylePanel.tsx        # Main config panels
│       │   ├── LoginPreviewShell.tsx  # Live preview iframe
│       │   └── ...
│       ├── hooks/
│       │   ├── useLoginBrandingTokens.ts  # Token → CSS pipeline
│       │   └── ...
│       └── views/
│           └── CustomizerView.tsx    # Studio layout`,
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "features.loginCustomizer.archTip",
      },
];

registerPage({
      slug: "features/login-customizer",
      titleKey: "features.loginCustomizer.title",
      descriptionKey: "features.loginCustomizer.description",
      category: "features",
      order: 15,
      sections,
      relatedSlugs: ["features/multi-tenancy", "features/authentication"],
      lastUpdated: "2026-03-24",
});
