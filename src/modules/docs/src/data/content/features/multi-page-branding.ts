import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.multiPageBranding.intro" },

      // ─── Supported Pages ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiPageBranding.pagesTitle", id: "supported-pages",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.pagesIntro" },
      {
            type: "table",
            headers: ["Page", "Purpose", "Key Messages"],
            rows: [
                  ["Login", "Primary authentication entry", "First impression, strong brand statement"],
                  ["Forgot Password", "Password recovery", "Reassuring messaging, trust-building visuals"],
                  ["Reset Password", "New password creation", "Action-oriented, minimal distractions"],
            ],
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.pageLogin" },
      { type: "paragraph", contentKey: "features.multiPageBranding.pageForgot" },
      { type: "paragraph", contentKey: "features.multiPageBranding.pageReset" },
      {
            type: "info",
            variant: "note",
            contentKey: "features.multiPageBranding.pagesNote",
      },

      // ─── State Isolation Model ────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiPageBranding.stateTitle", id: "state-isolation",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.stateIntro" },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.stateGlobalTitle", id: "global-layer",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.stateGlobalIntro" },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.stateOverrideTitle", id: "override-layer",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.stateOverrideIntro" },
      {
            type: "flowchart",
            title: "Settings Resolution Chain",
            direction: "vertical",
            nodes: [
                  { id: "global", label: "Global Settings (50+ tokens)", type: "default" },
                  { id: "override", label: "Per-Page Overrides (pages.forgotPassword.*)", type: "info" },
                  { id: "merged", label: "Merged Result (global + override)", type: "success" },
            ],
            connections: [
                  { from: "global", to: "merged", label: "Base" },
                  { from: "override", to: "merged", label: "Override" },
            ],
      },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.stateMergeTitle", id: "merge-strategy",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.stateMergeIntro" },
      {
            type: "info",
            variant: "warning",
            contentKey: "features.multiPageBranding.stateMergeNote",
      },

      // ─── Studio Integration ───────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiPageBranding.studioTitle", id: "studio-integration",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.studioIntro" },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.studioTabsTitle", id: "page-tabs",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.studioTabsIntro" },
      {
            type: "table",
            headers: ["Tab", "Key", "Default Active"],
            rows: [
                  ["Login", "login", "✅ Yes (default)"],
                  ["Forgot Password", "forgotPassword", "No"],
                  ["Reset Password", "resetPassword", "No"],
            ],
      },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.studioSwitchTitle", id: "switch-flow",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.studioSwitchIntro" },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.studioEditTitle", id: "edit-flow",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.studioEditIntro" },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.studioResetTitle", id: "reset-flow",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.studioResetIntro" },

      // ─── Theme Import ─────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiPageBranding.themeTitle", id: "theme-import",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.themeIntro" },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.themeImportTitle", id: "import-flow",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.themeImportIntro" },
      {
            type: "flowchart",
            title: "Theme Import with Per-Page Merge",
            direction: "vertical",
            nodes: [
                  { id: "apply", label: "Apply Theme (from marketplace)", type: "default" },
                  { id: "global2", label: "Merge 50+ global tokens to draft", type: "info" },
                  { id: "pages", label: "Check theme.pages for overrides", type: "warning" },
                  { id: "merge", label: "Merge each page's overrides to draft", type: "success" },
            ],
            connections: [
                  { from: "apply", to: "global2" },
                  { from: "global2", to: "pages" },
                  { from: "pages", to: "merge" },
            ],
      },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.themeCompatTitle", id: "backward-compat",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.themeCompatIntro" },

      // ─── Serialization ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiPageBranding.serializationTitle", id: "serialization",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.serializationIntro" },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.serializationSchemaTitle", id: "schema",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.serializationSchemaIntro" },
      {
            type: "code",
            language: "json",
            filename: "Per-Page Override Structure",
            code: `{
  "version": "2.0",
  "selectedLayout": "split-right",
  "primaryColor": "#1e40af",
  "fontFamily": "Inter",
  "pageOverrides": {
    "login": {
      "panelHeadline": "Welcome Back",
      "panelSubtitle": "Sign in to continue"
    },
    "forgotPassword": {
      "selectedLayout": "centered",
      "panelHeadline": "Password Recovery",
      "panelSubtitle": "We'll help you get back in",
      "overlayColor": "rgba(30, 64, 175, 0.3)"
    },
    "resetPassword": {
      "panelHeadline": "Create New Password",
      "panelSubtitle": "Choose a strong password"
    }
  }
}`,
      },

      // ─── Preview Architecture ─────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiPageBranding.previewTitle", id: "preview",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.previewIntro" },
      {
            type: "heading", level: 3,
            titleKey: "features.multiPageBranding.previewIsolationTitle", id: "preview-isolation",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.previewIsolationIntro" },

      // ─── Conflict Prevention ──────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiPageBranding.conflictTitle", id: "conflict-prevention",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.conflictIntro" },
      {
            type: "info",
            variant: "warning",
            contentKey: "features.multiPageBranding.conflictWarning",
      },

      // ─── Source Files ─────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiPageBranding.sourceTitle", id: "source-files",
      },
      { type: "paragraph", contentKey: "features.multiPageBranding.sourceStudio" },
      { type: "paragraph", contentKey: "features.multiPageBranding.sourceComponents" },
      { type: "paragraph", contentKey: "features.multiPageBranding.sourceTypes" },
      { type: "paragraph", contentKey: "features.multiPageBranding.sourceSeeder" },
];

registerPage({
      slug: "features/multi-page-branding",
      titleKey: "features.multiPageBranding.title",
      descriptionKey: "features.multiPageBranding.description",
      category: "features",
      order: 17,
      sections,
      relatedSlugs: ["features/theme-marketplace", "features/login-customizer", "features/login-page-builder"],
      lastUpdated: "2026-04-02",
});
