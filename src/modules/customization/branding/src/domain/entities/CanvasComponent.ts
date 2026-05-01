/**
 * CanvasComponent — Domain entity for the Login Page Builder canvas
 *
 * Each component placed on the builder canvas is a positioned block
 * on a 12-column CSS Grid. The builder serializes these into the
 * LoginBrandingJson alongside existing layout/token data.
 *
 * @module customization/domain
 */

// ── Component Types ──────────────────────────────────────
export type CanvasComponentType =
  | "logo"
  | "loginForm"
  | "forgotForm"
  | "resetForm"
  | "heading"
  | "subtitle"
  | "socialLogin"
  | "featureList"
  | "testimonial"
  | "image"
  | "ctaButton"
  | "divider"
  | "footer"
  | "copyright"
  | "customHtml"
  | "videoBg";

// ── Grid Alignment ───────────────────────────────────────
export type GridAlignment = "start" | "center" | "end";

// ── Position Mode ────────────────────────────────────────
export type PositionMode = "absolute" | "grid";

// ── Canvas Component ─────────────────────────────────────
export interface CanvasComponent {
  /** Unique identifier (uuid) */
  id: string;
  /** Component type — determines which React component renders */
  type: CanvasComponentType;

  // ── Grid mode fields (backward-compatible) ──
  /** CSS grid-column placement, e.g. "1 / 7" (columns 1-6 of 12) */
  gridColumn: string;
  /** CSS grid-row placement, e.g. "1 / 2" */
  gridRow: string;
  /** Horizontal alignment within grid cell */
  alignment: GridAlignment;
  /** Vertical alignment within grid cell */
  verticalAlignment: GridAlignment;

  // ── Free-form (absolute) mode fields ──
  /** Pixel X position (free-form mode) */
  x: number;
  /** Pixel Y position (free-form mode) */
  y: number;
  /** Pixel width (free-form mode, 0 = auto) */
  width: number;
  /** Pixel height (free-form mode, 0 = auto) */
  height: number;
  /** Prevent drag/resize when true */
  locked: boolean;

  /** Component-specific configuration props */
  props: Record<string, unknown>;
  /** Z-index for layering overlapping components */
  zIndex: number;
  /** Show/hide without deleting — hidden components preserved in storage */
  visible: boolean;
}

// ── Canvas Mode ──────────────────────────────────────────
export type CanvasMode = "layout" | "builder";

// ── Canvas Background ────────────────────────────────────
export interface CanvasBackground {
  type: "inherit" | "solid" | "gradient" | "image";
  value: string;
}

// ── Component Catalog Entry ──────────────────────────────
export interface ComponentCatalogEntry {
  type: CanvasComponentType;
  labelKey: string;
  icon: string; // Lucide icon name
  descriptionKey: string;
  defaultProps: Record<string, unknown>;
  /** Default grid span when first dropped */
  defaultGridColumn: string;
  defaultGridRow: string;
  /** Default width in free-form mode (px) */
  defaultWidth: number;
  /** Default height in free-form mode (px, 0 = auto) */
  defaultHeight: number;
  /** Minimum width the component can be resized to */
  minWidth: number;
  /** Minimum height the component can be resized to */
  minHeight: number;
  /** Whether this component can only appear once */
  singleton: boolean;
  /** Whether this component is required (cannot be removed) */
  required: boolean;
  /** Minimum edition required (null = all editions) */
  requiredEdition: string | null;
}

// ── Component Catalog ────────────────────────────────────
export const COMPONENT_CATALOG: ComponentCatalogEntry[] = [
  {
    type: "logo",
    labelKey: "studio.builder.comp.logo",
    icon: "Image",
    descriptionKey: "studio.builder.comp.logoDesc",
    defaultProps: { maxWidth: 200, shape: "auto" },
    defaultGridColumn: "5 / 9",
    defaultGridRow: "auto",
    defaultWidth: 200,
    defaultHeight: 80,
    minWidth: 60,
    minHeight: 40,
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: "loginForm",
    labelKey: "studio.builder.comp.loginForm",
    icon: "LogIn",
    descriptionKey: "studio.builder.comp.loginFormDesc",
    defaultProps: { showSocial: true, showRemember: true, showForgot: true, showRegister: false },
    defaultGridColumn: "4 / 10",
    defaultGridRow: "auto",
    defaultWidth: 380,
    defaultHeight: 420,
    minWidth: 280,
    minHeight: 300,
    singleton: true,
    required: true,
    requiredEdition: null,
  },
  {
    type: "heading",
    labelKey: "studio.builder.comp.heading",
    icon: "Type",
    descriptionKey: "studio.builder.comp.headingDesc",
    defaultProps: { text: "", fontSize: 32, fontWeight: 700, color: "inherit" },
    defaultGridColumn: "3 / 11",
    defaultGridRow: "auto",
    defaultWidth: 400,
    defaultHeight: 0,
    minWidth: 120,
    minHeight: 30,
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: "subtitle",
    labelKey: "studio.builder.comp.subtitle",
    icon: "AlignLeft",
    descriptionKey: "studio.builder.comp.subtitleDesc",
    defaultProps: { text: "", fontSize: 16, color: "inherit" },
    defaultGridColumn: "3 / 11",
    defaultGridRow: "auto",
    defaultWidth: 400,
    defaultHeight: 0,
    minWidth: 100,
    minHeight: 24,
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: "socialLogin",
    labelKey: "studio.builder.comp.socialLogin",
    icon: "Share2",
    descriptionKey: "studio.builder.comp.socialLoginDesc",
    defaultProps: { providers: ["google", "microsoft"], layout: "row" },
    defaultGridColumn: "4 / 10",
    defaultGridRow: "auto",
    defaultWidth: 380,
    defaultHeight: 48,
    minWidth: 200,
    minHeight: 40,
    singleton: true,
    required: false,
    requiredEdition: null,
  },
  {
    type: "featureList",
    labelKey: "studio.builder.comp.featureList",
    icon: "ListChecks",
    descriptionKey: "studio.builder.comp.featureListDesc",
    defaultProps: { items: [], maxItems: 6, iconSize: 20, variant: "list" },
    defaultGridColumn: "1 / 5",
    defaultGridRow: "auto",
    defaultWidth: 320,
    defaultHeight: 200,
    minWidth: 200,
    minHeight: 100,
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: "testimonial",
    labelKey: "studio.builder.comp.testimonial",
    icon: "Quote",
    descriptionKey: "studio.builder.comp.testimonialDesc",
    defaultProps: { quote: "", author: "", role: "", avatar: "" },
    defaultGridColumn: "1 / 5",
    defaultGridRow: "auto",
    defaultWidth: 320,
    defaultHeight: 180,
    minWidth: 200,
    minHeight: 120,
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: "image",
    labelKey: "studio.builder.comp.image",
    icon: "ImageIcon",
    descriptionKey: "studio.builder.comp.imageDesc",
    defaultProps: { src: "", alt: "", objectFit: "cover", maxWidth: "100%", borderRadius: 8 },
    defaultGridColumn: "1 / 7",
    defaultGridRow: "auto",
    defaultWidth: 400,
    defaultHeight: 240,
    minWidth: 60,
    minHeight: 60,
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: "ctaButton",
    labelKey: "studio.builder.comp.ctaButton",
    icon: "MousePointerClick",
    descriptionKey: "studio.builder.comp.ctaButtonDesc",
    defaultProps: { label: "Get Started", url: "", variant: "default", size: "md" },
    defaultGridColumn: "4 / 10",
    defaultGridRow: "auto",
    defaultWidth: 200,
    defaultHeight: 44,
    minWidth: 80,
    minHeight: 32,
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: "divider",
    labelKey: "studio.builder.comp.divider",
    icon: "Minus",
    descriptionKey: "studio.builder.comp.dividerDesc",
    defaultProps: { style: "line", color: "inherit" },
    defaultGridColumn: "1 / 13",
    defaultGridRow: "auto",
    defaultWidth: 600,
    defaultHeight: 2,
    minWidth: 60,
    minHeight: 2,
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: "footer",
    labelKey: "studio.builder.comp.footer",
    icon: "PanelBottom",
    descriptionKey: "studio.builder.comp.footerDesc",
    defaultProps: { links: [] },
    defaultGridColumn: "1 / 13",
    defaultGridRow: "auto",
    defaultWidth: 500,
    defaultHeight: 40,
    minWidth: 200,
    minHeight: 30,
    singleton: true,
    required: false,
    requiredEdition: null,
  },
  {
    type: "copyright",
    labelKey: "studio.builder.comp.copyright",
    icon: "Copyright",
    descriptionKey: "studio.builder.comp.copyrightDesc",
    defaultProps: { text: "", year: "auto", poweredBy: true },
    defaultGridColumn: "1 / 13",
    defaultGridRow: "auto",
    defaultWidth: 300,
    defaultHeight: 32,
    minWidth: 120,
    minHeight: 20,
    singleton: true,
    required: false,
    requiredEdition: null,
  },
  {
    type: "customHtml",
    labelKey: "studio.builder.comp.customHtml",
    icon: "Code",
    descriptionKey: "studio.builder.comp.customHtmlDesc",
    defaultProps: {
      content:
        '<div class="welcome-banner">\n  <h1>Welcome to Our Platform</h1>\n  <p>Build something <strong>amazing</strong> today.</p>\n  <a href="#">Learn More →</a>\n</div>',
      css: ".welcome-banner {\n  text-align: center;\n  padding: 2rem;\n  border-radius: 1rem;\n  background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1));\n  border: 1px solid rgba(99,102,241,0.2);\n}\n.welcome-banner h1 {\n  color: #818cf8;\n  margin-bottom: 0.5rem;\n}\n.welcome-banner p {\n  color: #94a3b8;\n}\n.welcome-banner a {\n  color: #a78bfa;\n  font-weight: 600;\n}",
    },
    defaultGridColumn: "1 / 13",
    defaultGridRow: "auto",
    defaultWidth: 500,
    defaultHeight: 200,
    minWidth: 100,
    minHeight: 50,
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: "videoBg",
    labelKey: "studio.builder.comp.videoBg",
    icon: "Video",
    descriptionKey: "studio.builder.comp.videoBgDesc",
    defaultProps: { src: "", poster: "", autoplay: true, muted: true },
    defaultGridColumn: "1 / 13",
    defaultGridRow: "1 / -1",
    defaultWidth: 800,
    defaultHeight: 600,
    minWidth: 200,
    minHeight: 150,
    singleton: true,
    required: false,
    requiredEdition: null,
  },
  {
    type: "forgotForm",
    labelKey: "studio.builder.comp.forgotForm",
    icon: "KeyRound",
    descriptionKey: "studio.builder.comp.forgotFormDesc",
    defaultProps: { showBackToLogin: true },
    defaultGridColumn: "4 / 10",
    defaultGridRow: "auto",
    defaultWidth: 380,
    defaultHeight: 300,
    minWidth: 280,
    minHeight: 200,
    singleton: true,
    required: false,
    requiredEdition: null,
  },
  {
    type: "resetForm",
    labelKey: "studio.builder.comp.resetForm",
    icon: "RotateCcw",
    descriptionKey: "studio.builder.comp.resetFormDesc",
    defaultProps: { showPasswordStrength: true },
    defaultGridColumn: "4 / 10",
    defaultGridRow: "auto",
    defaultWidth: 380,
    defaultHeight: 340,
    minWidth: 280,
    minHeight: 220,
    singleton: true,
    required: false,
    requiredEdition: null,
  },
];

// ── Default Position Mode for NEW canvases ───────────────
export const DEFAULT_POSITION_MODE: PositionMode = "absolute";

// ── Default Canvas State ─────────────────────────────────
export const DEFAULT_CANVAS_COMPONENTS: CanvasComponent[] = [
  {
    id: "default-logo",
    type: "logo",
    gridColumn: "5 / 9",
    gridRow: "2 / 3",
    alignment: "center",
    verticalAlignment: "center",
    x: 300,
    y: 40,
    width: 200,
    height: 80,
    locked: false,
    props: { maxWidth: 180 },
    zIndex: 1,
    visible: true,
  },
  {
    id: "default-heading",
    type: "heading",
    gridColumn: "4 / 10",
    gridRow: "3 / 4",
    alignment: "center",
    verticalAlignment: "end",
    x: 200,
    y: 140,
    width: 400,
    height: 0,
    locked: false,
    props: { text: "Welcome Back", fontSize: 28, fontWeight: 700, color: "inherit" },
    zIndex: 2,
    visible: true,
  },
  {
    id: "default-loginForm",
    type: "loginForm",
    gridColumn: "4 / 10",
    gridRow: "4 / 7",
    alignment: "center",
    verticalAlignment: "start",
    x: 210,
    y: 200,
    width: 380,
    height: 420,
    locked: false,
    props: { showSocial: true, showRemember: true, showForgot: true, showRegister: false },
    zIndex: 3,
    visible: true,
  },
  {
    id: "default-copyright",
    type: "copyright",
    gridColumn: "4 / 10",
    gridRow: "8 / 9",
    alignment: "center",
    verticalAlignment: "end",
    x: 250,
    y: 660,
    width: 300,
    height: 32,
    locked: false,
    props: { text: "", year: "auto", poweredBy: false },
    zIndex: 4,
    visible: true,
  },
];

export const DEFAULT_CANVAS_GRID_ROWS = 8;
export const DEFAULT_CANVAS_BACKGROUND: CanvasBackground = { type: "inherit", value: "" };
export const CANVAS_GRID_COLUMNS = 12;
export const SNAP_GRID_SIZE = 8; // 8px snap grid for free-form mode
export const CANVAS_WIDTH = 800; // Default canvas width in absolute mode
export const CANVAS_HEIGHT = 900; // Default canvas height in absolute mode

// ── Auth Page IDs ────────────────────────────────────────
export type AuthPageId = "login" | "forgotPassword" | "resetPassword";

// ── Default Components per Auth Page ─────────────────────
export const DEFAULT_FORGOT_COMPONENTS: CanvasComponent[] = [
  {
    id: "default-forgot-logo",
    type: "logo",
    gridColumn: "5 / 9",
    gridRow: "2 / 3",
    alignment: "center",
    verticalAlignment: "center",
    x: 300,
    y: 40,
    width: 200,
    height: 80,
    locked: false,
    props: { maxWidth: 180 },
    zIndex: 1,
    visible: true,
  },
  {
    id: "default-forgot-heading",
    type: "heading",
    gridColumn: "4 / 10",
    gridRow: "3 / 4",
    alignment: "center",
    verticalAlignment: "end",
    x: 200,
    y: 140,
    width: 400,
    height: 0,
    locked: false,
    props: { text: "Forgot Password", fontSize: 28, fontWeight: 700, color: "inherit" },
    zIndex: 2,
    visible: true,
  },
  {
    id: "default-forgot-subtitle",
    type: "subtitle",
    gridColumn: "4 / 10",
    gridRow: "4 / 5",
    alignment: "center",
    verticalAlignment: "start",
    x: 200,
    y: 180,
    width: 400,
    height: 0,
    locked: false,
    props: {
      text: "Enter your email address and we'll send you a reset link.",
      fontSize: 14,
      color: "inherit",
    },
    zIndex: 3,
    visible: true,
  },
  {
    id: "default-forgotForm",
    type: "forgotForm",
    gridColumn: "4 / 10",
    gridRow: "5 / 7",
    alignment: "center",
    verticalAlignment: "start",
    x: 210,
    y: 230,
    width: 380,
    height: 300,
    locked: false,
    props: { showBackToLogin: true },
    zIndex: 4,
    visible: true,
  },
  {
    id: "default-forgot-copyright",
    type: "copyright",
    gridColumn: "4 / 10",
    gridRow: "8 / 9",
    alignment: "center",
    verticalAlignment: "end",
    x: 250,
    y: 660,
    width: 300,
    height: 32,
    locked: false,
    props: { text: "", year: "auto", poweredBy: false },
    zIndex: 5,
    visible: true,
  },
];

export const DEFAULT_RESET_COMPONENTS: CanvasComponent[] = [
  {
    id: "default-reset-logo",
    type: "logo",
    gridColumn: "5 / 9",
    gridRow: "2 / 3",
    alignment: "center",
    verticalAlignment: "center",
    x: 300,
    y: 40,
    width: 200,
    height: 80,
    locked: false,
    props: { maxWidth: 180 },
    zIndex: 1,
    visible: true,
  },
  {
    id: "default-reset-heading",
    type: "heading",
    gridColumn: "4 / 10",
    gridRow: "3 / 4",
    alignment: "center",
    verticalAlignment: "end",
    x: 200,
    y: 140,
    width: 400,
    height: 0,
    locked: false,
    props: { text: "Reset Password", fontSize: 28, fontWeight: 700, color: "inherit" },
    zIndex: 2,
    visible: true,
  },
  {
    id: "default-resetForm",
    type: "resetForm",
    gridColumn: "4 / 10",
    gridRow: "4 / 7",
    alignment: "center",
    verticalAlignment: "start",
    x: 210,
    y: 200,
    width: 380,
    height: 340,
    locked: false,
    props: { showPasswordStrength: true },
    zIndex: 3,
    visible: true,
  },
  {
    id: "default-reset-copyright",
    type: "copyright",
    gridColumn: "4 / 10",
    gridRow: "8 / 9",
    alignment: "center",
    verticalAlignment: "end",
    x: 250,
    y: 660,
    width: 300,
    height: 32,
    locked: false,
    props: { text: "", year: "auto", poweredBy: false },
    zIndex: 4,
    visible: true,
  },
];

/** Get default components for a given auth page */
export function getDefaultComponentsForPage(page: AuthPageId): CanvasComponent[] {
  switch (page) {
    case "forgotPassword":
      return DEFAULT_FORGOT_COMPONENTS.map((c) => ({ ...c, props: { ...c.props } }));
    case "resetPassword":
      return DEFAULT_RESET_COMPONENTS.map((c) => ({ ...c, props: { ...c.props } }));
    default:
      return DEFAULT_CANVAS_COMPONENTS.map((c) => ({ ...c, props: { ...c.props } }));
  }
}

// ── Helpers ──────────────────────────────────────────────

/** Generate a unique component ID */
export function generateComponentId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/** Find the next available row for a new component */
export function findNextAvailableRow(components: CanvasComponent[]): number {
  if (components.length === 0) return 1;
  let maxRow = 1;
  for (const comp of components) {
    const match = comp.gridRow.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      maxRow = Math.max(maxRow, parseInt(match[2], 10));
    }
  }
  return maxRow;
}

/** Find a non-overlapping Y position for a new free-form component */
export function findNextAvailableY(components: CanvasComponent[]): number {
  if (components.length === 0) return 40;
  let maxBottom = 0;
  for (const comp of components) {
    const bottom = comp.y + (comp.height || 60);
    maxBottom = Math.max(maxBottom, bottom);
  }
  return maxBottom + 16; // 16px gap
}

/** Snap a value to the nearest grid increment */
export function snapToGridValue(value: number, gridSize: number = SNAP_GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

/** Check if two component bounding-boxes overlap */
export function checkOverlap(a: CanvasComponent, b: CanvasComponent): boolean {
  const aW = a.width || 100;
  const aH = a.height || 60;
  const bW = b.width || 100;
  const bH = b.height || 60;
  return a.x < b.x + bW && a.x + aW > b.x && a.y < b.y + bH && a.y + aH > b.y;
}

/** Check if a singleton component already exists on canvas */
export function hasSingletonComponent(
  components: CanvasComponent[],
  type: CanvasComponentType
): boolean {
  return components.some((c) => c.type === type);
}

/** Get catalog entry for a component type */
export function getCatalogEntry(type: CanvasComponentType): ComponentCatalogEntry | undefined {
  return COMPONENT_CATALOG.find((c) => c.type === type);
}
