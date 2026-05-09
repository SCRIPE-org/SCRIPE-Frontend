export function useNexusPalette(isDark: boolean, accentColor: string) {
  // Use slightly lighter/different shades for the secondary rail to create depth
  // between primary (darkest) and secondary (slightly less dark/blurrier)
  return {
    railBg: isDark ? "rgba(14, 20, 36, 0.65)" : "rgba(248, 250, 252, 0.75)",
    railBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    headerLabel: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(15, 23, 42, 0.45)",
    headerTitle: isDark ? "#F8FAFC" : "#0F172A",
    dotDefault: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.2)",
    dotActive: accentColor,
    itemBgActive: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)",
    itemBgHover: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.03)",
    textActive: isDark ? "#F8FAFC" : "#0F172A",
    textMuted: isDark ? "#94A3B8" : "#64748B",
    scrollbarTrack: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.05)",
    chevronColor: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(15, 23, 42, 0.3)",
    groupLabelColor: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(15, 23, 42, 0.4)",
    isDark,
    accent: accentColor,
  };
}
