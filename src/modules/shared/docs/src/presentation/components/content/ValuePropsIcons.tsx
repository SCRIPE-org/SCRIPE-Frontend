/**
 * ValuePropsIcons — Vector icons, color palettes, and grid dimension constants for the ValuePropsBlock bento grid.
 */

import React from "react";

/**
 * Curated SVG glyphs symbolizing architecture, security, velocity, global reach, analytics, and collaboration.
 */
export const ICONS: React.ReactNode[] = [
  <svg
    key="mod"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>,
  <svg
    key="shield"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>,
  <svg
    key="rocket"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
  </svg>,
  <svg
    key="globe"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>,
  <svg
    key="chart"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>,
  <svg
    key="users"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
];

/**
 * Text accent hues cycled across bento cards.
 */
export const ICON_COLORS: string[] = [
  "var(--com-violet)",
  "var(--com-emerald)",
  "var(--com-amber)",
  "var(--com-violet)",
  "var(--com-emerald)",
  "var(--com-amber)",
];

/**
 * Background tint washes paired with icon accent hues.
 */
export const ICON_BG_COLORS: string[] = [
  "oklch(0.91 0.24 128 / 0.14)",
  "oklch(0.79 0.17 160 / 0.12)",
  "oklch(0.82 0.155 80 / 0.12)",
  "oklch(0.91 0.24 128 / 0.14)",
  "oklch(0.79 0.17 160 / 0.12)",
  "oklch(0.82 0.155 80 / 0.12)",
];

/**
 * Relative percentage bar heights for simulated performance sparklines.
 */
export const BAR_DATA: number[][] = [
  [62, 78, 54, 88, 72, 95, 80],
  [82, 66, 90, 74, 58, 86, 92],
  [72, 86, 80, 92, 70, 68, 88],
  [54, 72, 88, 80, 96, 76, 84],
  [76, 82, 64, 90, 84, 78, 66],
  [68, 84, 88, 76, 92, 62, 80],
];

/**
 * Bento grid layout span classes per card index.
 */
export const CELL_SIZES: string[] = ["w3", "w3", "w2", "w2", "w2", "w4"];
