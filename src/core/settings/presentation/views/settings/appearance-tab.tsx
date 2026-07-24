"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import type { BackgroundMode } from "@core/providers/settings-provider";
import { ModePicker, type ModeOption } from "@core/settings/components/shared";

// Wave C: the "custom" background mode (and its colour-picker subtab) was
// retired — nothing consumed the custom colour vars. Stored "custom" values
// resolve to "preset" via the merge-engine migration.
//
// Wave H: the six appearance sub-tabs (colors, light-bg, dark-bg, gradients,
// palettes, effects) no longer live behind an inner TabsList here — the
// searchable settings rail renders each subtab as its own destination, so the
// former nested-tabs orchestrator was dropped. What remains that this file
// owns is the one appearance-wide knob that is not itself a subtab: the
// background-mode picker, now exported as a standalone rail section.
const BG_MODES: ModeOption<BackgroundMode>[] = [
  {
    value: "preset",
    icon: "🎨",
    label: "settings.bgMode.preset",
    description: "settings.bgMode.presetDesc",
  },
  {
    value: "gradient",
    icon: "🌈",
    label: "settings.bgMode.gradient",
    description: "settings.bgMode.gradientDesc",
  },
];

export function BackgroundModeSection() {
  const { t } = useI18n();
  const settings = useSettings();

  // Translate the mode options
  const translatedModes: ModeOption<BackgroundMode>[] = BG_MODES.map((m) => ({
    ...m,
    label: t(m.label),
    description: t(m.description),
  }));

  return (
    <ModePicker<BackgroundMode>
      title={t("settings.bgMode.title")}
      description={t("settings.bgMode.description")}
      modes={translatedModes}
      selected={settings.backgroundMode}
      onSelect={settings.setBackgroundMode}
    />
  );
}
