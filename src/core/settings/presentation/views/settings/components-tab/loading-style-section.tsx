"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import type { ReactNode } from "react";

export function LoadingStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const loadingStyles: (StyleOption & { component: ReactNode })[] = [
    { value: "spinner", name: t("settings.loadingStyle.options.spinner.name"), description: t("settings.loadingStyle.options.spinner.description"), component: <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /> },
    { value: "dots", name: t("settings.loadingStyle.options.dots.name"), description: t("settings.loadingStyle.options.dots.description"), component: <div className="flex space-x-1"><div className="h-2 w-2 animate-bounce rounded-full bg-primary" /><div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-100" /><div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-200" /></div> },
    { value: "bars", name: t("settings.loadingStyle.options.bars.name"), description: t("settings.loadingStyle.options.bars.description"), component: <div className="flex space-x-1"><div className="h-6 w-1 animate-pulse bg-primary" /><div className="h-6 w-1 animate-pulse bg-primary delay-100" /><div className="h-6 w-1 animate-pulse bg-primary delay-200" /></div> },
    { value: "pulse", name: t("settings.loadingStyle.options.pulse.name"), description: t("settings.loadingStyle.options.pulse.description"), component: <div className="h-6 w-6 animate-pulse rounded bg-primary" /> },
    { value: "wave", name: t("settings.loadingStyle.options.wave.name"), description: t("settings.loadingStyle.options.wave.description"), component: <div className="flex items-end space-x-1"><div className="h-3 w-1 animate-pulse rounded-full bg-primary" /><div className="h-4 w-1 animate-pulse rounded-full bg-primary delay-75" /><div className="h-6 w-1 animate-pulse rounded-full bg-primary delay-150" /><div className="delay-225 h-4 w-1 animate-pulse rounded-full bg-primary" /><div className="h-3 w-1 animate-pulse rounded-full bg-primary delay-300" /></div> },
    { value: "orbit", name: t("settings.loadingStyle.options.orbit.name"), description: t("settings.loadingStyle.options.orbit.description"), component: <div className="relative h-6 w-6"><div className="absolute inset-0 rounded-full border border-primary/20" /><div className="-ml-0.75 -mt-0.75 absolute left-1/2 top-0 h-1.5 w-1.5 origin-[0_12px] animate-spin rounded-full bg-primary" /></div> },
    { value: "ripple", name: t("settings.loadingStyle.options.ripple.name"), description: t("settings.loadingStyle.options.ripple.description"), component: <div className="relative h-6 w-6"><div className="absolute inset-0 animate-ping rounded-full border border-primary" /><div className="absolute inset-0 animate-ping rounded-full border border-primary delay-150" /></div> },
    { value: "gradient", name: t("settings.loadingStyle.options.gradient.name"), description: t("settings.loadingStyle.options.gradient.description"), component: <div className="h-6 w-6 animate-spin rounded-full bg-gradient-to-r from-primary via-primary/50 to-transparent" /> },
    { value: "matrix", name: t("settings.loadingStyle.options.matrix.name"), description: t("settings.loadingStyle.options.matrix.description"), component: <div className="grid grid-cols-4 gap-0.5"><div className="h-4 w-1 animate-pulse bg-primary opacity-100" /><div className="h-5 w-1 animate-pulse bg-primary opacity-75 delay-100" /><div className="h-3 w-1 animate-pulse bg-primary opacity-50 delay-200" /><div className="h-4 w-1 animate-pulse bg-primary opacity-75 delay-300" /><div className="h-3 w-1 animate-pulse bg-primary opacity-60 delay-75" /><div className="delay-175 h-5 w-1 animate-pulse bg-primary opacity-90" /><div className="delay-250 h-4 w-1 animate-pulse bg-primary opacity-70" /><div className="delay-325 h-3 w-1 animate-pulse bg-primary opacity-80" /></div> },
    { value: "helix", name: t("settings.loadingStyle.options.helix.name"), description: t("settings.loadingStyle.options.helix.description"), component: <div className="relative h-6 w-6"><div className="absolute h-2 w-2 animate-spin rounded-full bg-primary" style={{ animation: "spin 1.5s linear infinite", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} /><div className="absolute h-1.5 w-1.5 animate-spin rounded-full bg-primary/70" style={{ animation: "spin 1.5s linear infinite reverse", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} /></div> },
    { value: "quantum", name: t("settings.loadingStyle.options.quantum.name"), description: t("settings.loadingStyle.options.quantum.description"), component: <div className="relative h-6 w-6"><div className="absolute inset-0 animate-pulse rounded-full border border-primary/20" /><div className="absolute inset-1 animate-pulse rounded-full border border-primary/40 delay-200" /><div className="delay-400 absolute inset-2 animate-pulse rounded-full border border-primary/60" /><div className="delay-600 absolute inset-3 animate-pulse rounded-full bg-primary" /></div> },
    { value: "morphing", name: t("settings.loadingStyle.options.morphing.name"), description: t("settings.loadingStyle.options.morphing.description"), component: <div className="relative h-6 w-6"><div className="absolute inset-0 animate-pulse bg-primary" style={{ animation: "morphShape 3s ease-in-out infinite", borderRadius: "50%" }} /><div className="absolute inset-1 animate-pulse bg-primary/70" style={{ animation: "morphShape 3s ease-in-out infinite reverse", borderRadius: "20%" }} /></div> },
  ];

  return (
    <StyleCardPicker
      title={t("settings.loadingStyle.title")}
      description={t("settings.loadingStyle.description")}
      options={loadingStyles}
      selected={settings.loadingStyle}
      onSelect={(v) => settings.setLoadingStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-4"
      renderPreview={(option) => (
        <div className="flex justify-center">{(option as any).component}</div>
      )}
    />
  );
}
