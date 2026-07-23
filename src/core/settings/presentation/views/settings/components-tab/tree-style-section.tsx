"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import type { ReactNode } from "react";

/**
 * Wave C: only the surviving tree styles are offered — lines and cards (the
 * C4 collapse). The tree component resolves stored legacy styles onto these
 * survivors, so old persisted values keep rendering.
 */
export function TreeStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const treeStyles: (StyleOption & { preview: ReactNode })[] = [
    {
      value: "lines",
      name: t("settings.treeStyle.options.lines.name"),
      description: t("settings.treeStyle.options.lines.description"),
      preview: (
        <div className="p-3">
          <div className="mb-2 h-2 w-24 rounded bg-muted" />
          <div className="ms-4 space-y-2 border-s border-muted-foreground/30 ps-3">
            <div className="h-2 w-20 rounded bg-muted" />
            <div className="h-2 w-16 rounded bg-muted" />
          </div>
        </div>
      ),
    },
    {
      value: "cards",
      name: t("settings.treeStyle.options.cards.name"),
      description: t("settings.treeStyle.options.cards.description"),
      preview: (
        <div className="space-y-2 p-3">
          <div className="h-6 w-28 rounded border bg-card shadow-sm" />
          <div className="space-y-2 ps-6">
            <div className="h-6 w-24 rounded border bg-card shadow-sm" />
            <div className="h-6 w-20 rounded border bg-card shadow-sm" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.treeStyle.title")}
      description={t("settings.treeStyle.description")}
      options={treeStyles}
      selected={settings.treeStyle}
      onSelect={(v) => settings.setTreeStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-2"
      renderPreview={(option) => (
        <div className="rounded bg-muted/30">{(option as any).preview}</div>
      )}
    />
  );
}
