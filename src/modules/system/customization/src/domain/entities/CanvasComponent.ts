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
  | 'logo'
  | 'loginForm'
  | 'heading'
  | 'subtitle'
  | 'socialLogin'
  | 'featureList'
  | 'testimonial'
  | 'image'
  | 'ctaButton'
  | 'divider'
  | 'footer'
  | 'copyright'
  | 'customHtml'
  | 'videoBg';

// ── Grid Alignment ───────────────────────────────────────
export type GridAlignment = 'start' | 'center' | 'end';

// ── Canvas Component ─────────────────────────────────────
export interface CanvasComponent {
  /** Unique identifier (uuid) */
  id: string;
  /** Component type — determines which React component renders */
  type: CanvasComponentType;
  /** CSS grid-column placement, e.g. "1 / 7" (columns 1-6 of 12) */
  gridColumn: string;
  /** CSS grid-row placement, e.g. "1 / 2" */
  gridRow: string;
  /** Horizontal alignment within grid cell */
  alignment: GridAlignment;
  /** Vertical alignment within grid cell */
  verticalAlignment: GridAlignment;
  /** Component-specific configuration props */
  props: Record<string, unknown>;
  /** Z-index for layering overlapping components */
  zIndex: number;
  /** Show/hide without deleting — hidden components preserved in storage */
  visible: boolean;
}

// ── Canvas Mode ──────────────────────────────────────────
export type CanvasMode = 'layout' | 'builder';

// ── Canvas Background ────────────────────────────────────
export interface CanvasBackground {
  type: 'inherit' | 'solid' | 'gradient' | 'image';
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
    type: 'logo',
    labelKey: 'studio.builder.comp.logo',
    icon: 'Image',
    descriptionKey: 'studio.builder.comp.logoDesc',
    defaultProps: { maxWidth: 200, shape: 'auto' },
    defaultGridColumn: '5 / 9',
    defaultGridRow: 'auto',
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'loginForm',
    labelKey: 'studio.builder.comp.loginForm',
    icon: 'LogIn',
    descriptionKey: 'studio.builder.comp.loginFormDesc',
    defaultProps: { showSocial: true, showRemember: true, showForgot: true, showRegister: false },
    defaultGridColumn: '4 / 10',
    defaultGridRow: 'auto',
    singleton: true,
    required: true,
    requiredEdition: null,
  },
  {
    type: 'heading',
    labelKey: 'studio.builder.comp.heading',
    icon: 'Type',
    descriptionKey: 'studio.builder.comp.headingDesc',
    defaultProps: { text: '', fontSize: 32, fontWeight: 700, color: 'inherit' },
    defaultGridColumn: '3 / 11',
    defaultGridRow: 'auto',
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'subtitle',
    labelKey: 'studio.builder.comp.subtitle',
    icon: 'AlignLeft',
    descriptionKey: 'studio.builder.comp.subtitleDesc',
    defaultProps: { text: '', fontSize: 16, color: 'inherit' },
    defaultGridColumn: '3 / 11',
    defaultGridRow: 'auto',
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'socialLogin',
    labelKey: 'studio.builder.comp.socialLogin',
    icon: 'Share2',
    descriptionKey: 'studio.builder.comp.socialLoginDesc',
    defaultProps: { providers: ['google', 'microsoft'], layout: 'row' },
    defaultGridColumn: '4 / 10',
    defaultGridRow: 'auto',
    singleton: true,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'featureList',
    labelKey: 'studio.builder.comp.featureList',
    icon: 'ListChecks',
    descriptionKey: 'studio.builder.comp.featureListDesc',
    defaultProps: { items: [], maxItems: 6, iconSize: 20, variant: 'list' },
    defaultGridColumn: '1 / 5',
    defaultGridRow: 'auto',
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'testimonial',
    labelKey: 'studio.builder.comp.testimonial',
    icon: 'Quote',
    descriptionKey: 'studio.builder.comp.testimonialDesc',
    defaultProps: { quote: '', author: '', role: '', avatar: '' },
    defaultGridColumn: '1 / 5',
    defaultGridRow: 'auto',
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'image',
    labelKey: 'studio.builder.comp.image',
    icon: 'ImageIcon',
    descriptionKey: 'studio.builder.comp.imageDesc',
    defaultProps: { src: '', alt: '', objectFit: 'cover', maxWidth: '100%', borderRadius: 8 },
    defaultGridColumn: '1 / 7',
    defaultGridRow: 'auto',
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'ctaButton',
    labelKey: 'studio.builder.comp.ctaButton',
    icon: 'MousePointerClick',
    descriptionKey: 'studio.builder.comp.ctaButtonDesc',
    defaultProps: { label: 'Get Started', url: '', variant: 'default', size: 'md' },
    defaultGridColumn: '4 / 10',
    defaultGridRow: 'auto',
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'divider',
    labelKey: 'studio.builder.comp.divider',
    icon: 'Minus',
    descriptionKey: 'studio.builder.comp.dividerDesc',
    defaultProps: { style: 'line', color: 'inherit' },
    defaultGridColumn: '1 / 13',
    defaultGridRow: 'auto',
    singleton: false,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'footer',
    labelKey: 'studio.builder.comp.footer',
    icon: 'PanelBottom',
    descriptionKey: 'studio.builder.comp.footerDesc',
    defaultProps: { links: [] },
    defaultGridColumn: '1 / 13',
    defaultGridRow: 'auto',
    singleton: true,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'copyright',
    labelKey: 'studio.builder.comp.copyright',
    icon: 'Copyright',
    descriptionKey: 'studio.builder.comp.copyrightDesc',
    defaultProps: { text: '', year: 'auto', poweredBy: true },
    defaultGridColumn: '1 / 13',
    defaultGridRow: 'auto',
    singleton: true,
    required: false,
    requiredEdition: null,
  },
  {
    type: 'customHtml',
    labelKey: 'studio.builder.comp.customHtml',
    icon: 'Code',
    descriptionKey: 'studio.builder.comp.customHtmlDesc',
    defaultProps: { content: '' },
    defaultGridColumn: '1 / 13',
    defaultGridRow: 'auto',
    singleton: false,
    required: false,
    requiredEdition: 'enterprise',
  },
  {
    type: 'videoBg',
    labelKey: 'studio.builder.comp.videoBg',
    icon: 'Video',
    descriptionKey: 'studio.builder.comp.videoBgDesc',
    defaultProps: { src: '', poster: '', autoplay: true, muted: true },
    defaultGridColumn: '1 / 13',
    defaultGridRow: '1 / -1',
    singleton: true,
    required: false,
    requiredEdition: 'enterprise',
  },
];

// ── Default Canvas State ─────────────────────────────────
export const DEFAULT_CANVAS_COMPONENTS: CanvasComponent[] = [
  {
    id: 'default-logo',
    type: 'logo',
    gridColumn: '5 / 9',
    gridRow: '2 / 3',
    alignment: 'center',
    verticalAlignment: 'center',
    props: { maxWidth: 180 },
    zIndex: 1,
    visible: true,
  },
  {
    id: 'default-heading',
    type: 'heading',
    gridColumn: '4 / 10',
    gridRow: '3 / 4',
    alignment: 'center',
    verticalAlignment: 'end',
    props: { text: 'Welcome Back', fontSize: 28, fontWeight: 700, color: 'inherit' },
    zIndex: 1,
    visible: true,
  },
  {
    id: 'default-loginForm',
    type: 'loginForm',
    gridColumn: '4 / 10',
    gridRow: '4 / 7',
    alignment: 'center',
    verticalAlignment: 'start',
    props: { showSocial: true, showRemember: true, showForgot: true, showRegister: false },
    zIndex: 1,
    visible: true,
  },
  {
    id: 'default-copyright',
    type: 'copyright',
    gridColumn: '4 / 10',
    gridRow: '8 / 9',
    alignment: 'center',
    verticalAlignment: 'end',
    props: { text: '', year: 'auto', poweredBy: false },
    zIndex: 1,
    visible: true,
  },
];

export const DEFAULT_CANVAS_GRID_ROWS = 8;
export const DEFAULT_CANVAS_BACKGROUND: CanvasBackground = { type: 'inherit', value: '' };
export const CANVAS_GRID_COLUMNS = 12;

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

/** Check if a singleton component already exists on canvas */
export function hasSingletonComponent(components: CanvasComponent[], type: CanvasComponentType): boolean {
  return components.some(c => c.type === type);
}

/** Get catalog entry for a component type */
export function getCatalogEntry(type: CanvasComponentType): ComponentCatalogEntry | undefined {
  return COMPONENT_CATALOG.find(c => c.type === type);
}
