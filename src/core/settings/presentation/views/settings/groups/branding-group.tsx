"use client";

/**
 * Branding — the mark, and only the mark.
 *
 * Four rows: what the logo is, how big, whether it moves, and (when it is a
 * wordmark) what it says. Every option chip renders the REAL `Logo`, so the
 * chip is the logo — and the Stage shows the same component inside a header
 * bar, which is where anyone actually sees it.
 */

import { useMemo } from "react";
import { ImageIcon, Shield, Sparkles, Type } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import type { LogoAnimation, LogoSize, LogoType } from "@core/providers/settings-provider";
import { Input } from "@core/ui/input";
import { Logo } from "@core/ui/logo";
import { Choice, GroupPanel, Preview, Row, type ChoiceOption } from "../controls";
import { ROW } from "../settings-map";

const LOGO_TYPES: { value: LogoType; icon: typeof Sparkles; labelKey: string }[] = [
  { value: "sparkles", icon: Sparkles, labelKey: "logoType.sparkles" },
  { value: "shield", icon: Shield, labelKey: "logoType.shield" },
  { value: "image", icon: ImageIcon, labelKey: "logoType.image" },
  { value: "custom", icon: Type, labelKey: "logoType.customText" },
];

const LOGO_SIZES: LogoSize[] = ["xs", "sm", "md", "lg", "xl"];
const LOGO_ANIMATIONS: LogoAnimation[] = ["none", "spin", "pulse", "fancy"];

export function BrandingGroup() {
  const { t } = useI18n();
  const settings = useSettings();

  const typeOptions = useMemo<ChoiceOption<LogoType>[]>(
    () =>
      LOGO_TYPES.map((type) => ({
        value: type.value,
        label: t(type.labelKey),
        sample: (
          <Preview patch={{ logoType: type.value, showLogo: true }}>
            <Logo showText={false} disableLink />
          </Preview>
        ),
      })),
    [t]
  );

  const sizeOptions = useMemo<ChoiceOption<LogoSize>[]>(
    () =>
      LOGO_SIZES.map((size) => ({
        value: size,
        label: t(`settings.logo.sizeOptions.${size}`),
        sample: (
          <Preview patch={{ logoSize: size, showLogo: true }}>
            <Logo showText={false} disableLink />
          </Preview>
        ),
      })),
    [t]
  );

  const animationOptions = useMemo<ChoiceOption<LogoAnimation>[]>(
    () =>
      LOGO_ANIMATIONS.map((animation) => ({
        value: animation,
        label: t(`settings.logo.animationOptions.${animation}.name`),
        description: t(`settings.logo.animationOptions.${animation}.description`),
        sample: (
          <Preview patch={{ logoAnimation: animation, showLogo: true }}>
            <Logo showText={false} disableLink />
          </Preview>
        ),
      })),
    [t]
  );

  return (
    <GroupPanel title={t("settings.logo.title")} description={t("settings.logo.description")}>
      <Row row={ROW["logo-type"]}>
        <Choice
          row={ROW["logo-type"]}
          value={settings.logoType}
          onSelect={(value) => settings.setLogoType(value)}
          options={typeOptions}
          settingKey="logoType"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
        {settings.logoType === "image" && (
          <p className="mt-3 text-sm text-nx-ink-3">{t("settings.logo.imageInfo")}</p>
        )}
      </Row>

      <Row row={ROW["logo-size"]}>
        <Choice
          row={ROW["logo-size"]}
          value={settings.logoSize}
          onSelect={(value) => settings.setLogoSize(value)}
          options={sizeOptions}
          settingKey="logoSize"
          gridClassName="grid-cols-5 sm:grid-cols-5 lg:grid-cols-5"
        />
      </Row>

      <Row row={ROW["logo-animation"]}>
        <Choice
          row={ROW["logo-animation"]}
          value={settings.logoAnimation}
          onSelect={(value) => settings.setLogoAnimation(value)}
          options={animationOptions}
          settingKey="logoAnimation"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>

      {/* The wordmark only exists for the "custom" type; showing an empty text
          field for the other three would be a control that cannot do anything. */}
      {settings.logoType === "custom" && (
        <Row row={ROW["logo-text"]}>
          <Input
            value={settings.logoText}
            onChange={(event) => settings.setLogoText(event.target.value)}
            placeholder={t("settings.logo.textPlaceholder")}
            aria-label={t("settings.logo.textLabel")}
            className="max-w-sm"
          />
        </Row>
      )}
    </GroupPanel>
  );
}
