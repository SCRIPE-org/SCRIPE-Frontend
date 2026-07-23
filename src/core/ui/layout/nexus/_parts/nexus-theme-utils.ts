/**
 * Nexus palette — token-backed.
 *
 * Every entry resolves to a --nx-* custom property from globals.css, where
 * light/dark is decided by the CSS cascade (`:root[data-layout="nexus"]` +
 * its `:not(.dark)` arm). Components therefore never branch on the theme:
 * the same style object is correct in both. Contrast floors for these
 * tokens are WCAG-measured and documented in the globals.css block header —
 * do not re-derive them here.
 *
 * The `isDark` / `accentColor` parameters are kept only for call-site
 * compatibility (topbar + both rails still pass them); neither influences
 * the returned colours any more. `accent` is deliberately `var(--nx-accent)`
 * rather than the raw workspace colour string: --nx-accent applies the
 * verified lightness law (L0.68 dark / L0.46 light) to the workspace hue,
 * so accent-as-text always clears its contrast floor.
 */
export function useNexusPalette(isDark: boolean, _accentColor?: string) {
  return {
    /* translucent surface — the secondary rail sits behind a backdrop blur */
    railBg: "color-mix(in oklch, var(--nx-surface) 75%, transparent)",
    railBorder: "var(--nx-line)",
    headerLabel: "var(--nx-ink-3)",
    headerTitle: "var(--nx-ink)",
    dotDefault: "var(--nx-line-hi)",
    dotActive: "var(--nx-accent)",
    itemBgActive: "var(--nx-raised-2)",
    itemBgHover: "var(--nx-raised)",
    textActive: "var(--nx-ink)",
    textMuted: "var(--nx-ink-2)",
    scrollbarTrack: "var(--nx-line)",
    chevronColor: "var(--nx-ink-3)",
    groupLabelColor: "var(--nx-ink-3)",
    isDark,
    accent: "var(--nx-accent)",
  };
}
