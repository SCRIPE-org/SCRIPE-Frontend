// The settings shell surface (Wave J). SettingsView composes the group nav,
// one group panel and the Stage from this barrel; the group panels themselves
// are code-split through the nav registry, not re-exported here.
export { SETTINGS_GROUPS, SETTING_ROWS, ROW, DEFAULT_GROUP_ID, rowAnchorId } from "./settings-map";
export type { GroupId, SettingRowMeta, SettingsGroupMeta, StageSubject } from "./settings-map";

export {
  GroupNav,
  GROUP_PANELS,
  GROUP_COUNTS,
  matchRows,
  rowLabel,
  groupLabel,
} from "./settings-nav";
export { StageHost, useStage } from "./stage-context";
export type { StageAim } from "./stage-context";
export { Stage } from "./stage";
export { Choice, GroupPanel, Preview, Row, StageCaption, ToggleRow } from "./controls";
export type { ChoiceOption } from "./controls";
