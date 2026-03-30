/**
 * LayoutTemplates — Convert existing 22 layouts into builder canvas configurations
 *
 * When a user clicks "Start from Template", this maps each fixed layout
 * to a pre-arranged canvas component set that visually approximates
 * the layout's structure using the 12-column grid system.
 *
 * @module customization/domain
 */

import type { CanvasComponent, CanvasBackground } from "./CanvasComponent";
import type { LoginLayout } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

// ── Template Structure ───────────────────────────────────
export interface LayoutTemplate {
  layout: LoginLayout;
  label: string;
  components: CanvasComponent[];
  gridRows: number;
  background: CanvasBackground;
}

// ── Helper: stable IDs per template ──────────────────────
let _nextId = 0;
function tid(): string {
  return `tmpl_${++_nextId}`;
}

// ── Template Definitions ─────────────────────────────────

function splitRight(): CanvasComponent[] {
  _nextId = 0;
  return [
    // Left branding panel (columns 1-6)
    { id: tid(), type: 'heading', gridColumn: '1 / 7', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'center', props: { text: 'Welcome', fontSize: 36, fontWeight: 700, color: '#ffffff' }, zIndex: 1, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '1 / 7', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Manage. Secure. Scale.', fontSize: 18, color: '#ffffffcc' }, zIndex: 1, visible: true },
    { id: tid(), type: 'featureList', gridColumn: '2 / 6', gridRow: '5 / 7', alignment: 'start', verticalAlignment: 'start', props: { items: ['Enterprise Security', 'Multi-Tenant', 'Real-Time Analytics'] }, zIndex: 1, visible: true },
    // Right form panel (columns 7-12)
    { id: tid(), type: 'logo', gridColumn: '8 / 12', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 160 }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '8 / 12', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '8 / 12', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
  ];
}

function splitLeft(): CanvasComponent[] {
  _nextId = 0;
  return [
    // Left form panel (columns 1-6)
    { id: tid(), type: 'logo', gridColumn: '2 / 6', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 160 }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '2 / 6', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '2 / 6', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
    // Right branding panel (columns 7-12)
    { id: tid(), type: 'heading', gridColumn: '7 / 13', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'center', props: { text: 'Welcome', fontSize: 36, fontWeight: 700, color: '#ffffff' }, zIndex: 1, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '7 / 13', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Manage. Secure. Scale.', fontSize: 18, color: '#ffffffcc' }, zIndex: 1, visible: true },
    { id: tid(), type: 'featureList', gridColumn: '8 / 12', gridRow: '5 / 7', alignment: 'start', verticalAlignment: 'start', props: { items: ['Enterprise Security', 'Multi-Tenant', 'Real-Time Analytics'] }, zIndex: 1, visible: true },
  ];
}

function centered(): CanvasComponent[] {
  _nextId = 0;
  return [
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 200 }, zIndex: 1, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'end', props: { text: 'Welcome Back', fontSize: 28, fontWeight: 700, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '4 / 10', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Sign in to continue', fontSize: 14, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '4 / 10', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
  ];
}

function minimal(): CanvasComponent[] {
  _nextId = 0;
  return [
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 140 }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: false, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
  ];
}

function stacked(): CanvasComponent[] {
  _nextId = 0;
  return [
    // Top brand area (rows 1-3)
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '1 / 2', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 120 }, zIndex: 1, visible: true },
    { id: tid(), type: 'heading', gridColumn: '3 / 11', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'center', props: { text: 'Welcome Back', fontSize: 28, fontWeight: 700, color: '#ffffff' }, zIndex: 1, visible: true },
    // Bottom form area (rows 4-8)
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'start', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '4 / 10', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
  ];
}

// ── Common fallback for complex layouts ──────────────────
function defaultCentered(): CanvasComponent[] {
  _nextId = 0;
  return [
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'center', props: { maxWidth: 180 }, zIndex: 1, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'end', props: { text: 'Welcome Back', fontSize: 28, fontWeight: 700, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'start', props: { showSocial: true, showRemember: true, showForgot: true, showRegister: false }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '4 / 10', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { text: '', year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
  ];
}

// ── Layout → Template Map ────────────────────────────────
const TEMPLATE_GENERATORS: Record<LoginLayout, () => CanvasComponent[]> = {
  'split-right': splitRight,
  'split-left': splitLeft,
  centered,
  'branded-full': defaultCentered,
  minimal,
  overlay: defaultCentered,
  magazine: splitRight,
  stacked,
  'sidebar-compact': splitLeft,
  asymmetric: splitRight,
  floating: defaultCentered,
  immersive: defaultCentered,
  'split-diagonal': splitRight,
  carousel: splitRight,
  'glass-morphism': defaultCentered,
  'gradient-wave': stacked,
  spotlight: defaultCentered,
  'dual-panel': splitRight,
  'corner-card': defaultCentered,
  'vertical-split': stacked,
  'fullscreen-form': minimal,
  mosaic: defaultCentered,
};

/**
 * Convert a named layout preset to a builder canvas configuration.
 * Returns fresh component instances with unique IDs on each call.
 */
export function layoutToTemplate(layout: LoginLayout): LayoutTemplate {
  const generator = TEMPLATE_GENERATORS[layout] || defaultCentered;
  // Each call generates fresh IDs
  const components = generator();
  return {
    layout,
    label: layout,
    components,
    gridRows: 8,
    background: { type: 'inherit', value: '' },
  };
}

/**
 * Get all available layout templates for the "Start from Template" picker.
 */
export function getAllLayoutTemplates(): { layout: LoginLayout; label: string }[] {
  return Object.keys(TEMPLATE_GENERATORS).map(layout => ({
    layout: layout as LoginLayout,
    label: layout,
  }));
}
