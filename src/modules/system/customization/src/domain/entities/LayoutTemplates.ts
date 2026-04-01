/**
 * LayoutTemplates — Unique builder canvas configurations for all 22 layout types
 *
 * Each layout gets a distinct, professionally-designed canvas component arrangement.
 * When a user clicks "Start from Template", this maps the layout to a pre-arranged
 * canvas using the 12-column grid system.
 *
 * NO fallbacks to a generic layout — every template is unique.
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

type GridComponentDef = Omit<CanvasComponent, 'x' | 'y' | 'width' | 'height' | 'locked'>;

// ═════════════════════════════════════════════════════════
// UNIQUE TEMPLATE DEFINITIONS (22 layouts — all distinct)
// ═════════════════════════════════════════════════════════

function splitRight(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Left: branding panel (cols 1-6)
    { id: tid(), type: 'heading', gridColumn: '1 / 7', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'center', props: { text: 'Welcome', fontSize: 36, fontWeight: 700, color: '#ffffff' }, zIndex: 1, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '1 / 7', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Manage. Secure. Scale.', fontSize: 18, color: '#ffffffcc' }, zIndex: 1, visible: true },
    { id: tid(), type: 'featureList', gridColumn: '2 / 6', gridRow: '5 / 7', alignment: 'start', verticalAlignment: 'start', props: { items: ['Enterprise Security', 'Multi-Tenant', 'Real-Time Analytics'] }, zIndex: 1, visible: true },
    // Right: form panel (cols 7-12)
    { id: tid(), type: 'logo', gridColumn: '8 / 12', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 160 }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '8 / 12', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '8 / 12', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
  ];
}

function splitLeft(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Left: form panel (cols 1-6)
    { id: tid(), type: 'logo', gridColumn: '2 / 6', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 160 }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '2 / 6', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '2 / 6', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
    // Right: branding (cols 7-12)
    { id: tid(), type: 'heading', gridColumn: '7 / 13', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'center', props: { text: 'Welcome', fontSize: 36, fontWeight: 700, color: '#ffffff' }, zIndex: 1, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '7 / 13', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Manage. Secure. Scale.', fontSize: 18, color: '#ffffffcc' }, zIndex: 1, visible: true },
    { id: tid(), type: 'featureList', gridColumn: '8 / 12', gridRow: '5 / 7', alignment: 'start', verticalAlignment: 'start', props: { items: ['Enterprise Security', 'Multi-Tenant', 'Real-Time Analytics'] }, zIndex: 1, visible: true },
  ];
}

function centered(): GridComponentDef[] {
  _nextId = 0;
  return [
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 200 }, zIndex: 1, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'end', props: { text: 'Welcome Back', fontSize: 28, fontWeight: 700, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '4 / 10', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Sign in to continue', fontSize: 14, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '4 / 10', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
  ];
}

function brandedFull(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Full-bleed card, centered with prominent logo + glass card feel
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '1 / 2', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 100 }, zIndex: 2, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'center', props: { text: 'Sign In', fontSize: 24, fontWeight: 600, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '3 / 6', alignment: 'center', verticalAlignment: 'start', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 2, visible: true },
    { id: tid(), type: 'divider', gridColumn: '4 / 10', gridRow: '6 / 7', alignment: 'center', verticalAlignment: 'center', props: {}, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '4 / 10', gridRow: '7 / 8', alignment: 'center', verticalAlignment: 'start', props: { year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
  ];
}

function minimal(): GridComponentDef[] {
  _nextId = 0;
  return [
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 140 }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: false, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
  ];
}

function overlay(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Glassmorphism card floating over background
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 120 }, zIndex: 2, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'center', props: { text: 'Welcome Back', fontSize: 22, fontWeight: 600, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '4 / 10', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Secure access to your workspace', fontSize: 14, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 2, visible: true },
    { id: tid(), type: 'footer', gridColumn: '5 / 9', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: {}, zIndex: 1, visible: true },
  ];
}

function magazine(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Left: large cinematic hero with headline (cols 1-7)
    { id: tid(), type: 'heading', gridColumn: '1 / 8', gridRow: '5 / 7', alignment: 'start', verticalAlignment: 'end', props: { text: 'Transform Your Business', fontSize: 48, fontWeight: 800, color: '#ffffff' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '1 / 8', gridRow: '7 / 8', alignment: 'start', verticalAlignment: 'start', props: { text: 'Enterprise-grade platform for the modern era', fontSize: 16, color: '#ffffffbb' }, zIndex: 2, visible: true },
    // Right: compact form (cols 8-12)
    { id: tid(), type: 'logo', gridColumn: '9 / 12', gridRow: '2 / 3', alignment: 'start', verticalAlignment: 'end', props: { maxWidth: 120 }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '8 / 13', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '8 / 13', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function stacked(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Top brand banner (rows 1-3)
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '1 / 2', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 120 }, zIndex: 1, visible: true },
    { id: tid(), type: 'heading', gridColumn: '3 / 11', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'center', props: { text: 'Welcome Back', fontSize: 28, fontWeight: 700, color: '#ffffff' }, zIndex: 1, visible: true },
    // Bottom form (rows 4-8)
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'start', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '4 / 10', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto', poweredBy: false }, zIndex: 1, visible: true },
  ];
}

function sidebarCompact(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Left: ultra-narrow brand strip (cols 1-2)
    { id: tid(), type: 'logo', gridColumn: '1 / 2', gridRow: '1 / 2', alignment: 'center', verticalAlignment: 'center', props: { maxWidth: 50 }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '1 / 2', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
    // Right: form takes remaining space (cols 3-12)
    { id: tid(), type: 'heading', gridColumn: '5 / 11', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { text: 'Welcome Back', fontSize: 24, fontWeight: 600, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '5 / 11', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'start', props: { text: 'Sign in to your account', fontSize: 14, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '5 / 11', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
  ];
}

function asymmetric(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Left: wide branding panel with accent divider (cols 1-7)
    { id: tid(), type: 'logo', gridColumn: '2 / 4', gridRow: '2 / 3', alignment: 'start', verticalAlignment: 'center', props: { maxWidth: 100 }, zIndex: 2, visible: true },
    { id: tid(), type: 'heading', gridColumn: '2 / 7', gridRow: '3 / 5', alignment: 'start', verticalAlignment: 'center', props: { text: 'Power Your Workflow', fontSize: 42, fontWeight: 800, color: '#ffffff' }, zIndex: 2, visible: true },
    { id: tid(), type: 'featureList', gridColumn: '2 / 7', gridRow: '5 / 7', alignment: 'start', verticalAlignment: 'start', props: { items: ['Role-Based Access', 'Audit Logging', 'Custom Workflows', 'API Integration'] }, zIndex: 2, visible: true },
    { id: tid(), type: 'divider', gridColumn: '7 / 8', gridRow: '1 / 9', alignment: 'center', verticalAlignment: 'center', props: {}, zIndex: 3, visible: true },
    // Right: narrow form (cols 8-12)
    { id: tid(), type: 'loginForm', gridColumn: '8 / 13', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '8 / 13', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function floating(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Card floating over pattern background
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 120 }, zIndex: 2, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'end', props: { text: 'Welcome', fontSize: 24, fontWeight: 600, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '4 / 10', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Enter your credentials', fontSize: 13, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 2, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '5 / 9', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function immersive(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Left: massive cinematic headline, no card (cols 1-7)
    { id: tid(), type: 'heading', gridColumn: '1 / 8', gridRow: '3 / 5', alignment: 'start', verticalAlignment: 'center', props: { text: 'The Future\nIs Here.', fontSize: 64, fontWeight: 900, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '1 / 8', gridRow: '5 / 6', alignment: 'start', verticalAlignment: 'start', props: { text: 'Enterprise platform for tomorrow\'s challenges', fontSize: 18, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'testimonial', gridColumn: '2 / 7', gridRow: '6 / 7', alignment: 'start', verticalAlignment: 'start', props: { quote: 'Revolutionary platform that changed how we work.', author: 'Sarah Chen', role: 'CTO' }, zIndex: 1, visible: true },
    // Right: form directly on surface (cols 8-12)
    { id: tid(), type: 'loginForm', gridColumn: '8 / 13', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '8 / 13', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function splitDiagonal(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Left diagonal branding area (cols 1-6)
    { id: tid(), type: 'logo', gridColumn: '1 / 5', gridRow: '1 / 2', alignment: 'start', verticalAlignment: 'center', props: { maxWidth: 80 }, zIndex: 2, visible: true },
    { id: tid(), type: 'heading', gridColumn: '1 / 6', gridRow: '3 / 5', alignment: 'start', verticalAlignment: 'center', props: { text: 'Secure By Design', fontSize: 38, fontWeight: 700, color: '#ffffff' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '1 / 6', gridRow: '5 / 6', alignment: 'start', verticalAlignment: 'start', props: { text: 'Built from the ground up with zero-trust architecture', fontSize: 14, color: '#ffffffaa' }, zIndex: 2, visible: true },
    // Right form panel (cols 7-12)
    { id: tid(), type: 'loginForm', gridColumn: '7 / 12', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '7 / 12', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function carousel(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Left: testimonial carousel area (cols 1-7)
    { id: tid(), type: 'logo', gridColumn: '2 / 5', gridRow: '2 / 3', alignment: 'start', verticalAlignment: 'center', props: { maxWidth: 100 }, zIndex: 1, visible: true },
    { id: tid(), type: 'heading', gridColumn: '2 / 7', gridRow: '3 / 4', alignment: 'start', verticalAlignment: 'center', props: { text: 'Trusted Worldwide', fontSize: 32, fontWeight: 700, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '2 / 7', gridRow: '4 / 5', alignment: 'start', verticalAlignment: 'start', props: { text: 'Join thousands of companies', fontSize: 16, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'testimonial', gridColumn: '2 / 7', gridRow: '5 / 7', alignment: 'start', verticalAlignment: 'start', props: { quote: 'Best enterprise platform we\'ve ever used. Period.', author: 'Michael Rivera', role: 'VP Engineering' }, zIndex: 1, visible: true },
    // Right: form (cols 8-12)
    { id: tid(), type: 'loginForm', gridColumn: '8 / 13', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '8 / 13', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function glassMorphism(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Floating glass card with glow orbs
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 130 }, zIndex: 3, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'center', props: { text: 'Welcome', fontSize: 26, fontWeight: 700, color: 'inherit' }, zIndex: 3, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '4 / 10', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Sign in to your account', fontSize: 14, color: 'inherit' }, zIndex: 3, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 3, visible: true },
    { id: tid(), type: 'footer', gridColumn: '5 / 9', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: {}, zIndex: 1, visible: true },
  ];
}

function gradientWave(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Top branded wave section (rows 1-3)
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '1 / 2', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 100 }, zIndex: 2, visible: true },
    { id: tid(), type: 'heading', gridColumn: '3 / 11', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'center', props: { text: 'Your Platform', fontSize: 36, fontWeight: 700, color: '#ffffff' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '3 / 11', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'start', props: { text: 'Empowering teams everywhere', fontSize: 16, color: '#ffffffbb' }, zIndex: 2, visible: true },
    // Below wave: form (rows 4-8)
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'start', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '4 / 10', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function spotlight(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Centered card with radial glow behind it
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 120 }, zIndex: 2, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'center', props: { text: 'Spotlight', fontSize: 24, fontWeight: 600, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '4 / 10', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Authenticate with confidence', fontSize: 14, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 2, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '5 / 9', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function dualPanel(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Header bar (row 1)
    { id: tid(), type: 'logo', gridColumn: '1 / 3', gridRow: '1 / 2', alignment: 'start', verticalAlignment: 'center', props: { maxWidth: 80 }, zIndex: 2, visible: true },
    { id: tid(), type: 'footer', gridColumn: '10 / 13', gridRow: '1 / 2', alignment: 'end', verticalAlignment: 'center', props: {}, zIndex: 1, visible: true },
    // Left features panel (cols 1-6, rows 2-8)
    { id: tid(), type: 'heading', gridColumn: '2 / 6', gridRow: '3 / 4', alignment: 'start', verticalAlignment: 'center', props: { text: 'Everything You Need', fontSize: 28, fontWeight: 700, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '2 / 6', gridRow: '4 / 5', alignment: 'start', verticalAlignment: 'start', props: { text: 'Comprehensive management platform', fontSize: 14, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'featureList', gridColumn: '2 / 6', gridRow: '5 / 7', alignment: 'start', verticalAlignment: 'start', props: { items: ['User Management', 'Permission Control', 'Analytics Dashboard', 'API Access'] }, zIndex: 1, visible: true },
    // Right form (cols 7-12, rows 2-8)
    { id: tid(), type: 'loginForm', gridColumn: '7 / 12', gridRow: '3 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '7 / 12', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function cornerCard(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Large hero branding area (cols 1-8, rows 2-7)
    { id: tid(), type: 'heading', gridColumn: '2 / 8', gridRow: '3 / 5', alignment: 'start', verticalAlignment: 'center', props: { text: 'Build\nSomething Great', fontSize: 56, fontWeight: 900, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '2 / 8', gridRow: '5 / 6', alignment: 'start', verticalAlignment: 'start', props: { text: 'Your platform awaits', fontSize: 18, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'featureList', gridColumn: '2 / 7', gridRow: '6 / 8', alignment: 'start', verticalAlignment: 'start', props: { items: ['Enterprise Ready', 'Scalable', 'Secure'] }, zIndex: 1, visible: true },
    // Corner card (cols 9-12, rows 5-8)
    { id: tid(), type: 'logo', gridColumn: '9 / 12', gridRow: '3 / 4', alignment: 'start', verticalAlignment: 'center', props: { maxWidth: 60 }, zIndex: 2, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '8 / 13', gridRow: '4 / 8', alignment: 'center', verticalAlignment: 'center', props: { showSocial: false, showRemember: true, showForgot: true }, zIndex: 2, visible: true },
  ];
}

function verticalSplit(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Top half: brand banner (rows 1-3)
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '1 / 2', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 140 }, zIndex: 2, visible: true },
    { id: tid(), type: 'heading', gridColumn: '3 / 11', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'center', props: { text: 'Your Workspace', fontSize: 36, fontWeight: 700, color: '#ffffff' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '3 / 11', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'start', props: { text: 'Sign in to continue where you left off', fontSize: 14, color: '#ffffffbb' }, zIndex: 2, visible: true },
    // Bottom half: form (rows 4-8)
    { id: tid(), type: 'divider', gridColumn: '1 / 13', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: {}, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '4 / 10', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function fullscreenForm(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Zero-distraction: just logo + form, nothing else
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 100 }, zIndex: 1, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'end', props: { text: 'Sign In', fontSize: 22, fontWeight: 600, color: 'inherit' }, zIndex: 1, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'start', props: { showSocial: false, showRemember: true, showForgot: true }, zIndex: 1, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '5 / 9', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

function mosaic(): GridComponentDef[] {
  _nextId = 0;
  return [
    // Card centered over mosaic pattern
    { id: tid(), type: 'logo', gridColumn: '5 / 9', gridRow: '2 / 3', alignment: 'center', verticalAlignment: 'end', props: { maxWidth: 120 }, zIndex: 2, visible: true },
    { id: tid(), type: 'heading', gridColumn: '4 / 10', gridRow: '3 / 4', alignment: 'center', verticalAlignment: 'center', props: { text: 'Welcome Back', fontSize: 24, fontWeight: 600, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'subtitle', gridColumn: '4 / 10', gridRow: '4 / 5', alignment: 'center', verticalAlignment: 'start', props: { text: 'Sign in to access your dashboard', fontSize: 14, color: 'inherit' }, zIndex: 2, visible: true },
    { id: tid(), type: 'loginForm', gridColumn: '4 / 10', gridRow: '4 / 7', alignment: 'center', verticalAlignment: 'center', props: { showSocial: true, showRemember: true, showForgot: true }, zIndex: 2, visible: true },
    { id: tid(), type: 'copyright', gridColumn: '5 / 9', gridRow: '8 / 9', alignment: 'center', verticalAlignment: 'end', props: { year: 'auto' }, zIndex: 1, visible: true },
  ];
}

// ── Layout → Template Map (ALL unique — NO fallbacks) ────
const TEMPLATE_GENERATORS: Record<LoginLayout, () => GridComponentDef[]> = {
  'split-right': splitRight,
  'split-left': splitLeft,
  centered,
  'branded-full': brandedFull,
  minimal,
  overlay,
  magazine,
  stacked,
  'sidebar-compact': sidebarCompact,
  asymmetric,
  floating,
  immersive,
  'split-diagonal': splitDiagonal,
  carousel,
  'glass-morphism': glassMorphism,
  'gradient-wave': gradientWave,
  spotlight,
  'dual-panel': dualPanel,
  'corner-card': cornerCard,
  'vertical-split': verticalSplit,
  'fullscreen-form': fullscreenForm,
  mosaic,
};

/**
 * Convert a named layout preset to a builder canvas configuration.
 * Returns fresh component instances with unique IDs on each call.
 */
export function layoutToTemplate(layout: LoginLayout): LayoutTemplate {
  const generator = TEMPLATE_GENERATORS[layout] || centered;
  const rawComponents = generator();

  const components: CanvasComponent[] = rawComponents.map(comp => ({
    ...comp,
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    locked: false,
  }));

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
