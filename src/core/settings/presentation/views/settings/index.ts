// Settings shell surface (Wave H). The view composes the rail + one-section
// content pane + live-preview dock from this barrel; individual section pickers
// are code-split through the nav registry, not re-exported here.
export {
  SETTINGS_GROUPS,
  SETTINGS_ITEMS,
  DEFAULT_SETTINGS_ITEM_ID,
} from "./settings-nav";
export type { SettingsGroup, SettingsItem, PreviewKind } from "./settings-nav";
export { SettingsRail, itemLabel } from "./settings-rail";
export { PreviewPanel } from "./preview-panel";
export { BackgroundModeSection } from "./appearance-tab";
