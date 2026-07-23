"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { SettingToggle, SettingSection } from "@core/settings/components/shared";

/**
 * Behavior settings tab — boolean toggle settings for UX preferences.
 *
 * REFACTORED: Uses SettingToggle shared primitive (was 224 lines of repeating
 * Switch + Label + Separator patterns, now ~85 lines via data-driven rendering).
 *
 * Wave C: the compact-mode toggle was removed with its culled field — the
 * class it toggled had zero CSS rules, and the merge-engine migration drops
 * any stored copy.
 */

interface BehaviorSetting {
  key: string;
  labelKey: string;
  descKey: string;
  getValue: () => boolean;
  setValue: (v: boolean) => void;
}

export function BehaviorTab() {
  const { t, direction } = useI18n();
  const settings = useSettings();

  const behaviorSettings: BehaviorSetting[] = [
    {
      key: "breadcrumbs",
      labelKey: "settings.behavior.breadcrumbs.label",
      descKey: "settings.behavior.breadcrumbs.description",
      getValue: () => settings.showBreadcrumbs,
      setValue: settings.setShowBreadcrumbs,
    },
    {
      key: "userAvatar",
      labelKey: "settings.behavior.userAvatar.label",
      descKey: "settings.behavior.userAvatar.description",
      getValue: () => settings.showUserAvatar,
      setValue: settings.setShowUserAvatar,
    },
    {
      key: "notifications",
      labelKey: "settings.behavior.notifications.label",
      descKey: "settings.behavior.notifications.description",
      getValue: () => settings.showNotifications,
      setValue: settings.setShowNotifications,
    },
    {
      key: "logo",
      labelKey: "settings.behavior.logo.label",
      descKey: "settings.behavior.logo.description",
      getValue: () => settings.showLogo,
      setValue: settings.setShowLogo,
    },
    {
      key: "contrast",
      labelKey: "settings.behavior.contrast.label",
      descKey: "settings.behavior.contrast.description",
      getValue: () => settings.highContrast,
      setValue: settings.setHighContrast,
    },
    {
      key: "motion",
      labelKey: "settings.behavior.motion.label",
      descKey: "settings.behavior.motion.description",
      getValue: () => settings.reducedMotion,
      setValue: settings.setReducedMotion,
    },
    {
      key: "sticky",
      labelKey: "settings.behavior.sticky.label",
      descKey: "settings.behavior.sticky.description",
      getValue: () => settings.stickyHeader,
      setValue: settings.setStickyHeader,
    },
    {
      key: "sidebar",
      labelKey: "settings.behavior.sidebar.label",
      descKey: "settings.behavior.sidebar.description",
      getValue: () => settings.collapsibleSidebar,
      setValue: settings.setCollapsibleSidebar,
    },
    {
      key: "footer",
      labelKey: "settings.behavior.footer.label",
      descKey: "settings.behavior.footer.description",
      getValue: () => settings.showFooter,
      setValue: settings.setShowFooter,
    },
    {
      key: "autoSave",
      labelKey: "settings.behavior.autoSave.label",
      descKey: "settings.behavior.autoSave.description",
      getValue: () => settings.autoSave,
      setValue: settings.setAutoSave,
    },
  ];

  return (
    <SettingSection
      title={t("settings.behavior.title")}
      description={t("settings.behavior.description")}
    >
      <div className="space-y-6">
        {behaviorSettings.map((setting, index) => (
          <SettingToggle
            key={setting.key}
            label={t(setting.labelKey)}
            description={t(setting.descKey)}
            checked={setting.getValue()}
            onCheckedChange={setting.setValue}
            direction={direction}
            showSeparator={index < behaviorSettings.length - 1}
          />
        ))}
      </div>
    </SettingSection>
  );
}
