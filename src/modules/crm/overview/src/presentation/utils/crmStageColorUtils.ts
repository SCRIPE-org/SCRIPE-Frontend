import type { CSSProperties } from "react";

export interface CrmCustomHexHarmonicStyles {
  isValidHex: boolean;
  normalizedHex?: string;
  nodeCardStyle?: CSSProperties;
  cardStyle?: CSSProperties;
  badgeStyle?: CSSProperties;
  dotStyle?: CSSProperties;
  headerStyle?: CSSProperties;
  minimapFill?: string;
  minimapStroke?: string;
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6})$/;

/**
 * Generates automatic Dark/Light theme-safe inline CSS styles from any custom `#RRGGBB` hex
 * using CSS `color-mix(in srgb, ...)` against Nexus surface & ink tokens (`--nx-surface`, `--nx-ink`).
 */
export function buildCustomHexHarmonicStyles(hex?: string | null): CrmCustomHexHarmonicStyles {
  if (!hex || !HEX_COLOR_REGEX.test(hex.trim())) {
    return { isValidHex: false };
  }
  const cleanHex = hex.trim().toUpperCase();
  const cardStyle: CSSProperties = {
    borderColor: `color-mix(in srgb, ${cleanHex} 52%, var(--nx-line, #334155))`,
    backgroundColor: `color-mix(in srgb, ${cleanHex} 12%, var(--nx-surface, #0f172a))`,
  };
  return {
    isValidHex: true,
    normalizedHex: cleanHex,
    nodeCardStyle: cardStyle,
    cardStyle,
    headerStyle: {
      borderColor: `color-mix(in srgb, ${cleanHex} 45%, var(--nx-line, #334155))`,
      backgroundColor: `color-mix(in srgb, ${cleanHex} 14%, var(--nx-raised, #1e293b))`,
    },
    badgeStyle: {
      borderColor: `color-mix(in srgb, ${cleanHex} 45%, transparent)`,
      backgroundColor: `color-mix(in srgb, ${cleanHex} 16%, var(--nx-surface, transparent))`,
      color: `color-mix(in srgb, ${cleanHex} 78%, var(--nx-ink, #f8fafc))`,
    },
    dotStyle: {
      backgroundColor: cleanHex,
    },
    minimapFill: `${cleanHex}38`,
    minimapStroke: cleanHex,
  };
}
