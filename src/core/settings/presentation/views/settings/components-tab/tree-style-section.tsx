"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import type { ReactNode } from "react";

export function TreeStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const treeStyles: (StyleOption & { preview: ReactNode })[] = [
    {
      value: "lines", name: t("settings.treeStyle.options.lines.name"), description: t("settings.treeStyle.options.lines.description"),
      preview: (<div className="p-3"><div className="mb-2 h-2 w-24 rounded bg-muted" /><div className="ml-4 space-y-2 border-l border-muted-foreground/30 pl-3"><div className="h-2 w-20 rounded bg-muted" /><div className="h-2 w-16 rounded bg-muted" /></div></div>),
    },
    {
      value: "cards", name: t("settings.treeStyle.options.cards.name"), description: t("settings.treeStyle.options.cards.description"),
      preview: (<div className="space-y-2 p-3"><div className="h-6 w-28 rounded border bg-card shadow-sm" /><div className="space-y-2 pl-6"><div className="h-6 w-24 rounded border bg-card shadow-sm" /><div className="h-6 w-20 rounded border bg-card shadow-sm" /></div></div>),
    },
    {
      value: "minimal", name: t("settings.treeStyle.options.minimal.name"), description: t("settings.treeStyle.options.minimal.description"),
      preview: (<div className="p-3"><div className="mb-2 h-2 w-24 rounded bg-muted" /><div className="ml-4 space-y-2 border-l border-dashed border-muted-foreground/30 pl-3"><div className="h-2 w-20 rounded bg-muted" /><div className="h-2 w-16 rounded bg-muted" /></div></div>),
    },
    {
      value: "bubble", name: t("settings.treeStyle.options.bubble.name"), description: t("settings.treeStyle.options.bubble.description"),
      preview: (<div className="p-3"><div className="inline-flex flex-wrap gap-2"><div className="rounded-full bg-primary/10 px-2 py-1 text-[10px] text-primary">{t("settings.treeStyle.sample.parent")}</div><div className="rounded-full bg-primary/10 px-2 py-1 text-[10px] text-primary">{t("settings.treeStyle.sample.child1")}</div><div className="rounded-full bg-primary/10 px-2 py-1 text-[10px] text-primary">{t("settings.treeStyle.sample.child2")}</div></div></div>),
    },
    {
      value: "modern", name: t("settings.treeStyle.options.modern.name"), description: t("settings.treeStyle.options.modern.description"),
      preview: (<div className="space-y-1 p-3"><div className="h-6 w-28 rounded border border-border/50 bg-gradient-to-r from-background via-background/95 to-background/90 shadow-sm" /><div className="space-y-1 pl-8"><div className="h-6 w-24 rounded border border-border/50 bg-gradient-to-r from-background via-background/95 to-background/90 shadow-sm" /><div className="h-6 w-20 rounded border border-border/50 bg-gradient-to-r from-background via-background/95 to-background/90 shadow-sm" /></div></div>),
    },
    {
      value: "glass", name: t("settings.treeStyle.options.glass.name"), description: t("settings.treeStyle.options.glass.description"),
      preview: (<div className="space-y-3 p-3"><div className="h-6 w-28 rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm" /><div className="space-y-3 pl-6"><div className="h-6 w-24 rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm" /><div className="h-6 w-20 rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm" /></div></div>),
    },
    {
      value: "elegant", name: t("settings.treeStyle.options.elegant.name"), description: t("settings.treeStyle.options.elegant.description"),
      preview: (<div className="space-y-1 p-3"><div className="via-background/98 h-6 w-28 rounded-r-lg border-y border-l-4 border-r border-border/30 border-l-primary/60 bg-gradient-to-br from-background to-muted/30 shadow-sm" /><div className="space-y-1 pl-6"><div className="via-background/98 h-6 w-24 rounded-r-lg border-y border-l-4 border-r border-border/30 border-l-primary/60 bg-gradient-to-br from-background to-muted/30 shadow-sm" /><div className="via-background/98 h-6 w-20 rounded-r-lg border-y border-l-4 border-r border-border/30 border-l-primary/60 bg-gradient-to-br from-background to-muted/30 shadow-sm" /></div></div>),
    },
    {
      value: "professional", name: t("settings.treeStyle.options.professional.name"), description: t("settings.treeStyle.options.professional.description"),
      preview: (<div className="space-y-1 p-3"><div className="relative h-6 w-28 overflow-hidden rounded-md border border-l-4 border-border border-l-primary/60 bg-card shadow-sm" /><div className="space-y-1 pl-8"><div className="h-6 w-24 rounded-md border border-border bg-card shadow-sm" /><div className="h-6 w-20 rounded-md border border-border bg-card shadow-sm" /></div></div>),
    },
    {
      value: "gradient", name: t("settings.treeStyle.options.gradient.name"), description: t("settings.treeStyle.options.gradient.description"),
      preview: (<div className="space-y-2 p-3"><div className="h-6 w-28 rounded border border-transparent bg-gradient-to-r from-primary/20 via-background to-secondary/20 shadow-md" /><div className="space-y-2 pl-8"><div className="h-6 w-24 rounded border border-transparent bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-md" /><div className="h-6 w-20 rounded border border-transparent bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-md" /></div></div>),
    },
    {
      value: "neon", name: t("settings.treeStyle.options.neon.name"), description: t("settings.treeStyle.options.neon.description"),
      preview: (<div className="space-y-2 p-3"><div className="h-6 w-28 rounded-lg border border-primary/50 bg-background/90 font-bold text-primary shadow-lg shadow-primary/20" /><div className="space-y-2 pl-8"><div className="h-6 w-24 rounded-lg border border-primary/30 bg-background/90 shadow-md shadow-primary/10" /><div className="h-6 w-20 rounded-lg border border-primary/30 bg-background/90 shadow-md shadow-primary/10" /></div></div>),
    },
    {
      value: "organic", name: t("settings.treeStyle.options.organic.name"), description: t("settings.treeStyle.options.organic.description"),
      preview: (<div className="space-y-3 p-3"><div className="h-6 w-28 rotate-1 transform rounded-2xl border border-green-200/30 bg-gradient-to-br from-green-50/50 via-background to-blue-50/50 shadow-sm" /><div className="space-y-3 pl-10"><div className="h-6 w-24 rounded-2xl border border-green-200/30 bg-gradient-to-br from-green-50/50 via-background to-blue-50/50 shadow-sm" /><div className="h-6 w-20 rounded-2xl border border-green-200/30 bg-gradient-to-br from-green-50/50 via-background to-blue-50/50 shadow-sm" /></div></div>),
    },
    {
      value: "corporate", name: t("settings.treeStyle.options.corporate.name"), description: t("settings.treeStyle.options.corporate.description"),
      preview: (<div className="space-y-1 p-3"><div className="h-6 w-28 rounded-r-md border-y border-l-8 border-r border-slate-200 border-l-blue-600 bg-slate-50/50 font-bold text-slate-900" /><div className="space-y-1 pl-6"><div className="h-6 w-24 rounded-r-md border-y border-l-4 border-r border-slate-200 border-l-blue-600 bg-slate-50/50 text-slate-700" /><div className="h-6 w-20 rounded-r-md border-y border-l-4 border-r border-slate-200 border-l-blue-600 bg-slate-50/50 text-slate-700" /></div></div>),
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.treeStyle.title")}
      description={t("settings.treeStyle.description")}
      options={treeStyles}
      selected={settings.treeStyle}
      onSelect={(v) => settings.setTreeStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-4"
      renderPreview={(option) => (
        <div className="rounded bg-muted/30">{(option as any).preview}</div>
      )}
    />
  );
}
