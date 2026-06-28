import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.loginPageBuilder.intro" },

  // ─── 3 Canvas Modes ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.modesTitle",
    id: "canvas-modes",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.modesIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.modeFreeformTitle",
    id: "freeform",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.modeFreeformIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.modeGridTitle",
    id: "grid-mode",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.modeGridIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.modeBuilderTitle",
    id: "builder-mode",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.modeBuilderIntro" },
  {
    type: "table",
    headers: ["Mode", "Positioning", "Grid", "Best For"],
    rows: [
      ["Freeform", "Absolute (x, y)", "None", "Pixel-perfect creative layouts"],
      ["Grid", "Row / Column based", "12-column CSS grid", "Responsive enterprise layouts"],
      ["Builder", "Section-based", "Auto-spaced blocks", "Quick structured assembly"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "features.loginPageBuilder.modesNote",
  },

  // ─── 14 Component Types ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.paletteTitle",
    id: "palette",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.paletteIntro" },
  {
    type: "table",
    headers: ["Component", "Type", "Grid Span", "Key Properties"],
    rows: [
      ["Logo", "logo", "2-4", "src, width, height, alignment"],
      ["Heading", "heading", "4-12", "text, level (h1-h6), color, weight"],
      ["Body Text", "text", "4-12", "content, fontSize, lineHeight"],
      ["Login Form", "form", "4-8", "fields, submitLabel, forgotLink"],
      ["Social Login", "social", "4-8", "providers[], layout, separator"],
      ["Image", "image", "2-12", "src, alt, objectFit, borderRadius"],
      ["Button", "button", "2-6", "label, variant, icon, href"],
      ["Card", "card", "4-12", "children[], padding, shadow"],
      ["Divider", "divider", "4-12", "style (line/dotted/gradient)"],
      ["Spacer", "spacer", "12", "height (px)"],
      ["Badge", "badge", "2-4", "text, variant, icon"],
      ["Icon", "icon", "1-2", "name, size, color"],
      ["Footer", "footer", "12", "links[], copyright, alignment"],
      ["Terms Link", "terms", "4-8", "tosUrl, privacyUrl, text"],
    ],
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.compLogo" },
  { type: "paragraph", contentKey: "features.loginPageBuilder.compHeading" },
  { type: "paragraph", contentKey: "features.loginPageBuilder.compForm" },
  { type: "paragraph", contentKey: "features.loginPageBuilder.compSocialLogin" },

  // ─── 12-Column Grid System ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.gridTitle",
    id: "grid-system",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.gridIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.gridPropsTitle",
    id: "grid-props",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.gridPropsIntro" },
  {
    type: "code",
    language: "css",
    filename: "Grid System Implementation",
    code: `.builder-canvas-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--builder-gap, 16px);
  padding: var(--builder-padding, 24px);
}

.grid-item[data-span="4"]  { grid-column: span 4; }
.grid-item[data-span="6"]  { grid-column: span 6; }
.grid-item[data-span="12"] { grid-column: span 12; }

@media (max-width: 768px) {
  .builder-canvas-grid { grid-template-columns: repeat(4, 1fr); }
  .grid-item { grid-column: span 4 !important; }
}

@media (max-width: 480px) {
  .builder-canvas-grid { grid-template-columns: 1fr; }
}`,
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.gridResponsiveTitle",
    id: "breakpoints",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.gridResponsiveIntro" },
  {
    type: "table",
    headers: ["Breakpoint", "Screen", "Columns", "Behavior"],
    rows: [
      ["Desktop (lg)", "≥ 1024px", "12", "Full grid — all spans honored"],
      ["Tablet (md)", "768-1023px", "4", "Components collapse to 4-column spans"],
      ["Mobile (sm)", "< 480px", "1", "Single column — all components full-width"],
    ],
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.gridGapTitle",
    id: "gaps",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.gridGapIntro" },

  // ─── Drag & Drop Architecture ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.dndTitle",
    id: "drag-drop",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.dndIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.dndPaletteTitle",
    id: "palette-flow",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.dndPaletteIntro" },
  {
    type: "flowchart",
    title: "Drag & Drop Component Lifecycle",
    direction: "vertical",
    nodes: [
      { id: "palette2", label: "Component Palette (14 types)", type: "default" },
      { id: "drag", label: "Drag Start (@dnd-kit/core)", type: "info" },
      { id: "canvas", label: "Canvas Drop Zone (collision detection)", type: "warning" },
      { id: "create", label: "Create Component (defaults + auto-ID)", type: "success" },
      { id: "select", label: "Select Component (Properties Panel)", type: "danger" },
    ],
    connections: [
      { from: "palette2", to: "drag" },
      { from: "drag", to: "canvas" },
      { from: "canvas", to: "create" },
      { from: "create", to: "select" },
    ],
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.dndReorderTitle",
    id: "reorder",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.dndReorderIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.dndSelectTitle",
    id: "selection",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.dndSelectIntro" },

  // ─── Properties Panel ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.propsTitle",
    id: "properties",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.propsIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.propsContentTitle",
    id: "content-props",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.propsContentIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.propsStyleTitle",
    id: "style-props",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.propsStyleIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.propsGridTitle",
    id: "grid-props-detail",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.propsGridIntro" },
  {
    type: "table",
    headers: ["Property Type", "UI Control", "Example"],
    rows: [
      ["text", "Input field", "Heading text, button label"],
      ["number", "Slider / number input", "Width, height, padding"],
      ["color", "Color picker", "Text color, background"],
      ["select", "Dropdown", "Text alignment, font weight"],
      ["boolean", "Toggle switch", "Show shadow, center align"],
      ["image", "File picker / URL", "Logo src, background image"],
      ["array", "List editor", "Social providers, footer links"],
    ],
  },

  // ─── State Management & Saving ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.stateTitle",
    id: "state",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.stateIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.stateComponentTitle",
    id: "component-schema",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.stateComponentIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "Builder Component State Schema",
    code: `export interface CanvasComponent {
  id: string;                      // Unique identifier (UUID v4)
  type: CanvasComponentType;       // Component type selector
  gridColumn: string;              // CSS Grid Column (e.g. "1 / 7")
  gridRow: string;                 // CSS Grid Row (e.g. "1 / 2")
  alignment: GridAlignment;        // Horizontal alignment (start/center/end)
  verticalAlignment: GridAlignment;// Vertical alignment (start/center/end)
  x: number;                       // Absolute mode X coordinate (px)
  y: number;                       // Absolute mode Y coordinate (px)
  width: number;                   // Absolute mode width (px)
  height: number;                  // Absolute mode height (px)
  locked: boolean;                 // Lock element from modifications
  props: Record<string, unknown>;  // Element specific settings (e.g. src, text)
  zIndex: number;                  // Absolute mode stacking z-index
  visible: boolean;                // Visibility switch
}`,
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.stateUndoTitle",
    id: "undo-redo",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.stateUndoIntro" },

  // ─── Flowchart: State Save & Sync Pipeline ──────────────────
  {
    type: "flowchart",
    title: "Builder State Save & Sync Pipeline",
    direction: "vertical",
    nodes: [
      {
        id: "canvasChange",
        label: "Canvas Interaction (Move / Resize Component)",
        type: "default",
      },
      {
        id: "gridSnap",
        label: "Coordinates Snapped to Grid (8px grid spacing, adjusted by zoom)",
        type: "info",
      },
      { id: "storeUpdate", label: "Zustand Store Updates components array state", type: "info" },
      {
        id: "undoStack",
        label: "Interaction Committed -> History Stack (Max 50)",
        type: "warning",
      },
      {
        id: "postMsg",
        label: "postMessage Broadcasts components schema to Preview Iframe",
        type: "info",
      },
      {
        id: "draftSave",
        label: "Debounced (2s) Save to Server (PUT /api/v1/branding/draft)",
        type: "success",
      },
      {
        id: "promotion",
        label: "Publish Action -> Promotes DraftBrandingJson to LiveBrandingJson",
        type: "success",
      },
    ],
    connections: [
      { from: "canvasChange", to: "gridSnap" },
      { from: "gridSnap", to: "storeUpdate" },
      { from: "storeUpdate", to: "undoStack" },
      { from: "storeUpdate", to: "postMsg" },
      { from: "undoStack", to: "draftSave" },
      { from: "draftSave", to: "promotion" },
    ],
  },

  // ─── Serialization ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.serializationTitle",
    id: "serialization",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.serializationIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.serializationSchemaTitle",
    id: "json-schema",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.serializationSchemaIntro" },
  {
    type: "code",
    language: "json",
    filename: "Builder Canvas JSON",
    code: `{
  "canvasMode": "grid",
  "gridConfig": { "columns": 12, "columnGap": 16, "rowGap": 16 },
  "components": [
    {
      "id": "comp-1",
      "type": "logo",
      "props": { "width": 120, "alignment": "center" },
      "gridPosition": { "colSpan": 4, "colStart": 4, "rowStart": 0 }
    },
    {
      "id": "comp-2",
      "type": "heading",
      "props": { "text": "Welcome", "level": "h1" },
      "gridPosition": { "colSpan": 8, "colStart": 2, "rowStart": 1 }
    }
  ]
}`,
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.serializationSizeTitle",
    id: "size-optimization",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.serializationSizeIntro" },

  // ─── Preview Sync ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.previewTitle",
    id: "preview-sync",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.previewIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.previewSyncTitle",
    id: "two-way-sync",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.previewSyncIntro" },

  // ─── Security ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.securityTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.securityIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.securitySanitizeTitle",
    id: "sanitization",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.securitySanitizeIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.securityIframeTitle",
    id: "iframe-sandbox",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.securityIframeIntro" },
  {
    type: "table",
    headers: ["Threat", "Mitigation"],
    rows: [
      ["XSS via text props", "DOMPurify sanitization — all HTML stripped, plain text only"],
      [
        "Script injection in URLs",
        "Protocol whitelist: https://, http://, / only. Block javascript:, data:",
      ],
      ["Oversized canvas", "Max 50 components per canvas. Max 10KB serialized JSON"],
      ["Cross-tenant access", "Canvas state in TenantSettings.DraftBrandingJson — tenant-scoped"],
      ["Concurrent edits", "Optimistic concurrency (SettingsVersion). 409 Conflict on stale write"],
    ],
  },

  // ─── Dashboard Theming ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.dashboardTitle",
    id: "dashboard-theming",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.dashboardIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.dashboardLayoutsTitle",
    id: "layouts",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.dashboardLayoutsIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.dashboardColorsTitle",
    id: "colors",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.dashboardColorsIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.dashboardStorageTitle",
    id: "dashboard-storage",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.dashboardStorageIntro" },
  {
    type: "table",
    headers: ["Setting", "Options", "Storage"],
    rows: [
      ["Layout Template", "8 templates", "dashboardThemeJson.layoutTemplate"],
      ["Color Theme", "12 palettes", "dashboardThemeJson.colorTheme"],
      ["Theme Mode", "Light / Dark / System", "dashboardThemeJson.theme"],
      ["Language", "EN / AR (RTL auto)", "dashboardThemeJson.language"],
      ["Sidebar", "Expanded / Collapsed", "dashboardThemeJson.sidebarCollapsed"],
    ],
  },

  // ─── Bundle Marketplace ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.bundleTitle",
    id: "bundles",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.bundleIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.bundleComponentsTitle",
    id: "bundle-components",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.bundleComponentsIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "features.loginPageBuilder.bundleTypesTitle",
    id: "bundle-types",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.bundleTypesIntro" },
  {
    type: "table",
    headers: ["Bundle Type", "Includes", "Use Case"],
    rows: [
      ["Login", "Login theme + builder canvas + per-page overrides", "Auth-only branding"],
      ["Dashboard", "Dashboard layout + color theme + mode", "Admin panel theming"],
      [
        "Complete",
        "Everything: login + builder + dashboard + accessibility",
        "Full platform rebrand",
      ],
    ],
  },

  // ─── Architecture ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.loginPageBuilder.archTitle",
    id: "module-structure",
  },
  { type: "paragraph", contentKey: "features.loginPageBuilder.archIntro" },
  {
    type: "code",
    language: "text",
    filename: "Login Page Builder Components",
    code: `src/modules/customization/branding/src/presentation/
├── components/
│   ├── builder/
│   │   ├── BuilderCanvas.tsx          # Main canvas — absolute/grid positioning
│   │   ├── BuilderPanel.tsx           # Side palette controller
│   │   ├── GridOverlay.tsx            # CSS Grid layout helper lines
│   │   └── DraggableCanvasItem.tsx    # Draggable item wrapper
│   └── views/
│       └── CustomizerStudioView.tsx   # Customizer workspace frame
├── hooks/
│   └── useBuilderDnd.ts               # @dnd-kit/core sensor integrations
└── viewmodels/
    ├── useBuilderStore.ts             # Zustand state manager & snap calculation
    └── useStudioViewModel.ts          # Studio logic bridge & debounced HTTP saves`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "features.loginPageBuilder.archTip",
  },
];

registerPage({
  slug: "features/login-page-builder",
  titleKey: "features.loginPageBuilder.title",
  descriptionKey: "features.loginPageBuilder.description",
  category: "features",
  order: 18,
  sections,
  relatedSlugs: [
    "features/login-customizer",
    "features/theme-marketplace",
    "features/multi-page-branding",
  ],
  lastUpdated: "2026-06-28",
});
