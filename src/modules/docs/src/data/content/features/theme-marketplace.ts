// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.themeMarketplace.intro" },

  // ─── Marketplace Architecture ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.archTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.archIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.archDataFlowTitle",
    id: "data-flow",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.archDataFlowIntro" },
  {
    type: "flowchart",
    title: "Theme Marketplace Pipeline",
    direction: "horizontal",
    nodes: [
      { id: "seeder", label: "LoginThemeSeeder (40 themes)", type: "default" },
      { id: "db", label: "LoginTheme Table (ThemeDataJson)", type: "info" },
      { id: "api", label: "Themes API (list/detail/apply)", type: "warning" },
      { id: "gallery", label: "ThemeGalleryView (browse + filter)", type: "success" },
      { id: "draft", label: "DraftBrandingJson (copy-on-apply)", type: "danger" },
    ],
    connections: [
      { from: "seeder", to: "db" },
      { from: "db", to: "api" },
      { from: "api", to: "gallery" },
      { from: "gallery", to: "draft", label: "Apply" },
    ],
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.archLayersTitle",
    id: "clean-architecture",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.archLayersIntro" },
  {
    type: "code",
    language: "text",
    filename: "Theme Marketplace Module Structure",
    code: `src/modules/system/customization/
├── src/
│   ├── domain/
│   │   ├── entities/ThemeDetail.ts         # Rich domain entity
│   │   └── interfaces/
│   │       ├── IThemeMarketplaceService.ts  # HTTP service contract
│   │       └── IThemeMarketplaceRepository.ts
│   ├── data/
│   │   ├── models/ThemeMarketplaceTypes.ts  # Raw DTOs
│   │   ├── services/ThemeMarketplaceService.ts
│   │   ├── repositories/ThemeMarketplaceRepository.ts
│   │   └── mappers/ThemeMarketplaceMapper.ts
│   └── presentation/
│       ├── views/
│       │   ├── ThemeGalleryView.tsx       # 26KB — Full-page marketplace
│       │   └── ThemeManagementView.tsx    # 12KB — Admin CRUD
│       ├── components/
│       │   ├── ThemeDetailModal.tsx       # 28KB — Detail + preview
│       │   └── ThemeCard.tsx             # Gallery card
│       └── hooks/
│           └── useThemeMarketplace.ts    # ViewModel hook`,
  },

  // ─── Data Model ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.entityTitle",
    id: "data-model",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.entityIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.entityFieldsTitle",
    id: "entity-fields",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Name", "string (unique)", "Human-readable theme name (e.g., 'Midnight Aurora')"],
      ["Category", "enum", "corporate, creative, dark, elegant, luxury, minimal, nature"],
      ["Description", "string", "Marketing-quality description of the visual identity"],
      ["ThumbnailUrl", "string?", "Preview image URL for gallery cards"],
      ["PreviewUrl", "string?", "Full-size preview for the detail modal"],
      ["ThemeDataJson", "JSON", "Complete design specification (50+ tokens)"],
      ["Tier", "enum", "Free, Starter, Professional, Enterprise, StandaloneAddon"],
      ["IsSystemTheme", "bool", "System themes are seeded and cannot be deleted"],
      ["IsActive", "bool", "Inactive themes hidden from gallery"],
      ["Tags", "string?", "Comma-separated search tags"],
      ["Version", "string", "Semantic version (e.g., '1.0.0')"],
      ["Author", "string", "Creator identifier"],
      ["LikesCount", "int", "Engagement: how many tenants favorited"],
      ["AppliedCount", "int", "Usage: how many tenants applied"],
    ],
  },

  // ─── ThemeDataJson Schema ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.schemaTitle",
    id: "theme-schema",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.schemaIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.schemaLayoutTitle",
    id: "schema-layout",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.schemaLayoutIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.schemaColorsTitle",
    id: "schema-colors",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.schemaColorsIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.schemaDarkTitle",
    id: "schema-dark",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.schemaDarkIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.schemaTypographyTitle",
    id: "schema-typography",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.schemaTypographyIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.schemaSpacingTitle",
    id: "schema-spacing",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.schemaSpacingIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.schemaOverlayTitle",
    id: "schema-overlay",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.schemaOverlayIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.schemaPanelTitle",
    id: "schema-panel",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.schemaPanelIntro" },
  {
    type: "table",
    headers: ["Section", "Token Count", "CSS Prefix", "Controlled By"],
    rows: [
      ["Layout", "6", "--login-layout-*", "Layout selector tab"],
      ["Colors (Light)", "16", "--login-*", "Color picker tab"],
      ["Colors (Dark)", "10", "--login-dark-*", "Dark mode panel"],
      ["Typography", "8", "--login-font-*", "Typography tab"],
      ["Spacing", "6", "--login-spacing-*", "Spacing controls"],
      ["Overlay", "8", "--login-overlay-*", "Overlay panel"],
      ["Branding Panel", "12", "--login-panel-*", "Branding settings"],
    ],
  },

  // ─── Per-Page Branding ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.perPageTitle",
    id: "per-page-branding",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.perPageIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.perPageStructTitle",
    id: "page-structure",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.perPageStructIntro" },
  {
    type: "code",
    language: "json",
    filename: "Per-Page Override Structure",
    code: `{
  "version": "2.0",
  "selectedLayout": "split-right",
  "primaryColor": "#1e40af",
  "fontFamily": "Inter",
  // ... 50+ global tokens ...
  "pages": {
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
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.perPageMergeTitle",
    id: "merge-strategy",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.perPageMergeIntro" },
  {
    type: "info",
    variant: "note",
    contentKey: "features.themeMarketplace.perPageIsolationNote",
  },

  // ─── 40-Theme Catalog ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.catalogTitle",
    id: "catalog",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.catalogIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.catalogDiversityTitle",
    id: "diversity",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.catalogDiversityIntro" },
  {
    type: "table",
    headers: ["Layout Family", "Theme Count", "Percentage"],
    rows: [
      ["T1 Split (split-right, split-left, magazine, etc.)", "16", "40%"],
      ["T2 Full-Page (branded-full, overlay, immersive)", "12", "30%"],
      ["T3 Centered (centered, floating-card)", "6", "15%"],
      ["T4 Special (glass-morphism, corner-card)", "6", "15%"],
    ],
  },

  // ─── 5-Tier Pricing ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.tierTitle",
    id: "tiers",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.tierIntro" },
  {
    type: "table",
    headers: ["Tier", "Themes", "Font Complexity", "Design Level"],
    rows: [
      ["Free", "8", "Standard (Inter, Poppins)", "Clean, professional"],
      ["Starter", "8", "Premium (Outfit, Nunito Sans)", "Rich palettes, gradients"],
      ["Professional", "10", "Editorial (DM Serif, Sora)", "Glass-morphism, multi-tone"],
      ["Enterprise", "8", "Luxury (Cormorant, Italiana)", "Cinematic, exclusive dark"],
      ["Standalone Add-on", "6", "Display (Cinzel Decorative)", "Botanical, Art Deco, Brutalist"],
    ],
  },

  // ─── 7 Categories ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.categoriesTitle",
    id: "categories",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.categoriesIntro" },
  {
    type: "table",
    headers: ["Category", "Count", "Target Market", "Design DNA"],
    rows: [
      [
        "Corporate",
        "8",
        "Finance, consulting, law",
        "Serif/sans-serif pairs, navy/gray, subtle gradients",
      ],
      [
        "Creative",
        "6",
        "Agencies, startups, tech",
        "Vibrant colors, Poppins/Quicksand, animated gradients",
      ],
      [
        "Dark",
        "6",
        "Dev tools, media, gaming",
        "Deep backgrounds, cyan/amber accents, glass effects",
      ],
      ["Minimal", "5", "Productivity, SaaS", "Monochromatic, whitespace, thin borders"],
      [
        "Elegant",
        "5",
        "Beauty, fashion, hospitality",
        "Rose gold, Playfair Display, delicate overlays",
      ],
      ["Luxury", "5", "High-end, private banking", "Black/gold, Italiana, full-bleed imagery"],
      ["Nature", "5", "Sustainability, wellness", "Forest greens, terracotta, rounded shapes"],
    ],
  },

  // ─── Frontend Components ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.componentsTitle",
    id: "components",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.componentsIntro" },
  {
    type: "table",
    headers: ["Component", "Size", "Purpose"],
    rows: [
      ["ThemeGalleryView", "26KB", "Full-page marketplace — hero, filters, grid/list, pagination"],
      ["ThemeManagementView", "12KB", "Admin CRUD — DataTable with bulk operations"],
      ["ThemeDetailModal", "28KB", "Detail preview — feature matrix, apply, like/favorite"],
      ["ThemeCard", "~5KB", "Gallery card — palette strip, font preview, engagement"],
      ["ThemeMarketplacePanel", "~4KB", "Inline studio panel with quick-apply"],
    ],
  },

  // ─── Apply Flow ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.applyTitle",
    id: "apply-flow",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.applyIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.copyOnApplyTitle",
    id: "copy-on-apply",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.copyOnApplyIntro" },
  {
    type: "info",
    variant: "warning",
    contentKey: "features.themeMarketplace.copyOnApplyNote",
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.previewFlowTitle",
    id: "preview-flow",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.previewFlowIntro" },
  {
    type: "flowchart",
    title: "Theme Apply Flow",
    direction: "vertical",
    nodes: [
      { id: "browse", label: "Browse Gallery", type: "default" },
      { id: "preview", label: "previewTheme() (non-destructive)", type: "info" },
      { id: "confirm", label: "Confirm Apply", type: "warning" },
      { id: "snapshot", label: "Copy ThemeDataJson to DraftBrandingJson", type: "success" },
      { id: "publish", label: "Publish Draft (version++)", type: "danger" },
    ],
    connections: [
      { from: "browse", to: "preview" },
      { from: "preview", to: "confirm" },
      { from: "confirm", to: "snapshot" },
      { from: "snapshot", to: "publish" },
    ],
  },

  // ─── Seeding ──────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.seedingTitle",
    id: "seeding",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.seedingIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.seedHelperTitle",
    id: "build-helper",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.seedHelperIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "LoginThemeSeeder.cs — Build() Helper",
    code: `// ThemeMeta: name, category, tier, description, author, version, tags
// ThemeDesign: 50+ tokens + PageOverrideDesign records

private static LoginTheme Build(ThemeMeta meta, ThemeDesign design)
{
    return new LoginTheme
    {
        Name = meta.Name,
        Category = meta.Category,
        Tier = meta.Tier,
        Description = meta.Description,
        Author = meta.Author,
        Version = meta.Version,
        Tags = meta.Tags,
        IsSystemTheme = true,
        IsActive = true,
        ThemeDataJson = BuildFullThemeJson(design),
    };
}`,
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.themeMarketplace.seedUpsertTitle",
    id: "upsert",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.seedUpsertIntro" },

  // ─── Governance ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.governanceTitle",
    id: "governance",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.governanceIntro" },
  {
    type: "table",
    headers: ["Action", "Required Permission", "Enforcement"],
    rows: [
      ["Browse marketplace", "branding.view", "Frontend visibility"],
      ["Apply theme", "branding.manage", "Backend verification"],
      ["Manage themes (CRUD)", "themes.manage", "System Admin only"],
      ["Like/favorite", "branding.view", "Per-admin tracking"],
    ],
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.endpointsIntro" },
  {
    type: "table",
    headers: ["Method", "Endpoint", "Description"],
    rows: [
      ["GET", "/api/v1/themes", "Paginated list with category, tier, search filters"],
      ["GET", "/api/v1/themes/{id}", "Full detail including ThemeDataJson + counters"],
      ["POST", "/api/v1/themes/{id}/apply", "Apply to current tenant's draft settings"],
      ["POST", "/api/v1/themes/{id}/like", "Toggle like/favorite for current admin"],
      ["POST", "/api/v1/themes", "Create new theme (System Admin)"],
      ["PUT", "/api/v1/themes/{id}", "Update theme (System Admin)"],
      ["DELETE", "/api/v1/themes/{id}", "Soft-delete theme (System Admin)"],
    ],
  },

  // ─── Source Files ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.themeMarketplace.sourceTitle",
    id: "source-files",
  },
  { type: "paragraph", contentKey: "features.themeMarketplace.sourceBackend" },
  { type: "paragraph", contentKey: "features.themeMarketplace.sourceFrontend" },
  { type: "paragraph", contentKey: "features.themeMarketplace.sourceData" },
  { type: "paragraph", contentKey: "features.themeMarketplace.sourceDomain" },
  { type: "paragraph", contentKey: "features.themeMarketplace.sourceViewModel" },
];

registerPage({
  slug: "features/theme-marketplace",
  titleKey: "features.themeMarketplace.title",
  descriptionKey: "features.themeMarketplace.description",
  category: "features",
  order: 16,
  sections,
  relatedSlugs: [
    "features/login-customizer",
    "features/multi-page-branding",
    "features/login-page-builder",
  ],
  lastUpdated: "2026-04-02",
});
