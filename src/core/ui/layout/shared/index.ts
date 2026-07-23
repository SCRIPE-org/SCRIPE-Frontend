// Shared Layout Infrastructure — Barrel Export
// All shared components used across the 12 layout variants

export { NavRenderer } from "./nav-renderer";
export type { NavRendererProps, NavVariant } from "./nav-renderer";
export { UserCard } from "./user-card";
export { CommandPalette } from "./command-palette";
export { LogoutButton } from "./logout-button";
export { Footer } from "./footer";
export { useLayoutStyles } from "./use-layout-styles";
export type { LayoutStyleHelpers } from "./use-layout-styles";

// Re-export common components that were previously in layout/common/
export { LanguageSwitcher } from "../common/language-switcher";
export { ThemeSwitcher } from "../common/theme-switcher";
export { HeaderSearch } from "../common/search-input";
