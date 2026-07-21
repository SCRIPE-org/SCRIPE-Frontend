/**
 * SCRIPE (EDGE) Layout Dimension Constants
 *
 * Single source of truth for the shell geometry, propagated as CSS custom
 * properties by scripe-layout.tsx.
 *
 * Values intentionally match the nexus shell so a tenant switching layouts
 * keeps their spatial muscle memory — the skin changes, the geometry does not.
 */

/** Width of the primary icon rail in pixels. */
export const SCRIPE_RAIL_W = 64;

/** Width of the secondary navigation panel in pixels. */
export const SCRIPE_PANEL_W = 240;

/** Height of the topbar in pixels. */
export const SCRIPE_TOPBAR_H = 56;

/** Breakpoint (px) below which the panel collapses into a drawer. */
export const SCRIPE_PANEL_BREAKPOINT = 900;
