"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import type { ReactNode } from "react";

/**
 * Wave C: only the surviving loading styles are offered — spinner, dots and
 * pulse. The loading-spinner component maps stored legacy styles (bars, wave,
 * orbit, gradient, matrix, helix, quantum, morphing, ripple) onto these
 * survivors, and the merge-engine migration rewrites persisted settings the
 * same way.
 */
export function LoadingStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const loadingStyles: (StyleOption & { component: ReactNode })[] = [
    {
      value: "spinner",
      name: t("settings.loadingStyle.options.spinner.name"),
      description: t("settings.loadingStyle.options.spinner.description"),
      component: (
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent motion-safe:animate-spin" />
      ),
    },
    {
      value: "dots",
      name: t("settings.loadingStyle.options.dots.name"),
      description: t("settings.loadingStyle.options.dots.description"),
      // Mirrors the shipped dots loader: nx-dot keyframes with inline
      // animation-delay stagger (delay-* classes set transition-delay).
      component: (
        <div className="flex items-center gap-1">
          {[0, 160, 320].map((delay) => (
            <div
              key={delay}
              className="h-2 w-2 rounded-full bg-primary motion-safe:animate-nx-dot"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      ),
    },
    {
      value: "pulse",
      name: t("settings.loadingStyle.options.pulse.name"),
      description: t("settings.loadingStyle.options.pulse.description"),
      component: <div className="h-6 w-6 rounded bg-primary motion-safe:animate-pulse" />,
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.loadingStyle.title")}
      description={t("settings.loadingStyle.description")}
      options={loadingStyles}
      selected={settings.loadingStyle}
      onSelect={(v) => settings.setLoadingStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-3"
      renderPreview={(option) => (
        <div className="flex justify-center">{(option as any).component}</div>
      )}
    />
  );
}
