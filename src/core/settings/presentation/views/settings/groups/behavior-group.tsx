"use client";

/**
 * Behaviour — the ten switches that add or remove a piece of the interface.
 *
 * Switches have no "options" to preview, so the Stage does the previewing for
 * the whole group: it holds a small mock of the application chrome whose
 * breadcrumbs, avatar, bell, logo and footer are each gated on the live
 * setting. Pointing at a row already tells you what will appear or vanish.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { GroupPanel, ToggleRow } from "../controls";
import { ROW } from "../settings-map";

export function BehaviorGroup() {
  const { t } = useI18n();
  const settings = useSettings();

  const switches: { rowId: string; checked: boolean; onChange: (value: boolean) => void }[] = [
    {
      rowId: "show-breadcrumbs",
      checked: settings.showBreadcrumbs,
      onChange: settings.setShowBreadcrumbs,
    },
    {
      rowId: "show-user-avatar",
      checked: settings.showUserAvatar,
      onChange: settings.setShowUserAvatar,
    },
    {
      rowId: "show-notifications",
      checked: settings.showNotifications,
      onChange: settings.setShowNotifications,
    },
    { rowId: "show-logo", checked: settings.showLogo, onChange: settings.setShowLogo },
    { rowId: "high-contrast", checked: settings.highContrast, onChange: settings.setHighContrast },
    {
      rowId: "reduced-motion",
      checked: settings.reducedMotion,
      onChange: settings.setReducedMotion,
    },
    { rowId: "sticky-header", checked: settings.stickyHeader, onChange: settings.setStickyHeader },
    {
      rowId: "collapsible-sidebar",
      checked: settings.collapsibleSidebar,
      onChange: settings.setCollapsibleSidebar,
    },
    { rowId: "show-footer", checked: settings.showFooter, onChange: settings.setShowFooter },
    { rowId: "auto-save", checked: settings.autoSave, onChange: settings.setAutoSave },
  ];

  return (
    <GroupPanel
      title={t("settings.tabs.behavior")}
      description={t("settings.behavior.description")}
    >
      {switches.map((entry) => (
        <ToggleRow
          key={entry.rowId}
          row={ROW[entry.rowId]}
          checked={entry.checked}
          onCheckedChange={entry.onChange}
        />
      ))}
    </GroupPanel>
  );
}
