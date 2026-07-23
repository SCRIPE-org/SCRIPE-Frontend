"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import { Check } from "lucide-react";
import { cn } from "@core/common/utils";

// Live regression canary for the GenericForm container layer: consecutive
// fields sharing a `section` render as one titled, hairline-ruled group, and
// any `colSpan` in a group switches it to the two-column grid. If grouping or
// the grid regresses, this preview shows it immediately.
const CANARY_FIELDS: FieldConfig[] = [
  { name: "firstName", label: "Name", type: "text", placeholder: "John", section: "Profile", colSpan: 1 },
  { name: "lastName", label: "Last name", type: "text", placeholder: "Doe", section: "Profile", colSpan: 1 },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "john@example.com",
    section: "Profile",
    colSpan: 2,
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    section: "Details",
    colSpan: 1,
    options: [
      { value: "admin", label: "Admin" },
      { value: "member", label: "Member" },
    ],
  },
  { name: "active", label: "Active", type: "switch", section: "Details", colSpan: 1 },
  { name: "notes", label: "Notes", type: "textarea", rows: 3, section: "Details", colSpan: 2 },
];

function FormPreview({ style, isSelected }: { style: string; isSelected?: boolean }) {
  const containerMap: Record<string, string> = {
    compact: "space-y-1.5",
    spacious: "space-y-4 p-4",
    modern: "bg-gradient-to-br from-background to-muted/20 rounded-xl border shadow-sm",
    glass:
      "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl dark:bg-black/20",
    minimal: "bg-transparent border-0",
    card: "bg-card border rounded-lg shadow-md p-4",
    neon: "bg-black/90 border-2 border-cyan-400/50 rounded-xl shadow-lg shadow-cyan-400/20",
    elegant:
      "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl",
    organic:
      "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-3xl shadow-lg",
    retro:
      "bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-lg shadow-lg",
  };

  const inputMap: Record<string, string> = {
    compact: "h-6 px-2 border rounded bg-background",
    spacious: "h-9 px-3 border rounded-lg bg-background shadow-sm",
    inline: "h-7 px-2 border rounded bg-background",
    modern: "h-8 px-3 border-2 border-border/50 rounded-xl bg-background/50 shadow-sm",
    glass:
      "h-8 px-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm dark:bg-black/20",
    minimal: "h-7 px-2 border-0 border-b-2 border-border/30 rounded-none bg-transparent",
    card: "h-8 px-3 border border-border rounded-lg bg-muted/30 shadow-inner",
    neon: "h-8 px-3 border-2 border-cyan-400/50 rounded-xl bg-black/50 text-cyan-100",
    elegant:
      "h-8 px-4 border border-slate-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-800 shadow-inner",
    organic:
      "h-8 px-3 border-2 border-green-300 dark:border-green-600 rounded-full bg-green-50 dark:bg-green-900/20",
    retro:
      "h-8 px-3 border-2 border-orange-400 dark:border-orange-500 rounded bg-orange-50 dark:bg-orange-900/20",
  };

  const base = "p-3 space-y-3";
  const containerClass = containerMap[style] ? cn(base, containerMap[style]) : base;
  const inputClass = cn(
    "w-full text-xs transition-all duration-200",
    inputMap[style] ?? "h-7 px-2 border rounded bg-background"
  );

  return (
    <div className={cn(containerClass, isSelected && "bg-primary/5 ring-2 ring-primary/20")}>
      <div className={style === "inline" ? "flex items-center gap-2" : "space-y-1"}>
        <label className="text-xs font-medium text-muted-foreground">Name</label>
        <input className={inputClass} placeholder="John Doe" readOnly />
      </div>
      <div className={style === "inline" ? "flex items-center gap-2" : "space-y-1"}>
        <label className="text-xs font-medium text-muted-foreground">Email</label>
        <input className={inputClass} placeholder="john@example.com" readOnly />
      </div>
      {style !== "inline" && (
        <div className="pt-1">
          <button className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors">
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export function FormStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const formStyles = [
    {
      value: "default",
      name: t("settings.formStyle.options.default.name"),
      description: t("settings.formStyle.options.default.description"),
    },
    {
      value: "compact",
      name: t("settings.formStyle.options.compact.name"),
      description: t("settings.formStyle.options.compact.description"),
    },
    {
      value: "spacious",
      name: t("settings.formStyle.options.spacious.name"),
      description: t("settings.formStyle.options.spacious.description"),
    },
    {
      value: "inline",
      name: t("settings.formStyle.options.inline.name"),
      description: t("settings.formStyle.options.inline.description"),
    },
    {
      value: "modern",
      name: t("settings.formStyle.options.modern.name"),
      description: t("settings.formStyle.options.modern.description"),
    },
    {
      value: "glass",
      name: t("settings.formStyle.options.glass.name"),
      description: t("settings.formStyle.options.glass.description"),
    },
    {
      value: "minimal",
      name: t("settings.formStyle.options.minimal.name"),
      description: t("settings.formStyle.options.minimal.description"),
    },
    {
      value: "card",
      name: t("settings.formStyle.options.card.name"),
      description: t("settings.formStyle.options.card.description"),
    },
    {
      value: "neon",
      name: t("settings.formStyle.options.neon.name"),
      description: t("settings.formStyle.options.neon.description"),
    },
    {
      value: "elegant",
      name: t("settings.formStyle.options.elegant.name"),
      description: t("settings.formStyle.options.elegant.description"),
    },
    {
      value: "organic",
      name: t("settings.formStyle.options.organic.name"),
      description: t("settings.formStyle.options.organic.description"),
    },
    {
      value: "retro",
      name: t("settings.formStyle.options.retro.name"),
      description: t("settings.formStyle.options.retro.description"),
    },
  ];

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.formStyle.title")}</CardTitle>
        <CardDescription>{t("settings.formStyle.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {formStyles.map((style) => (
            <div
              key={style.value}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 transition-all hover:scale-105",
                settings.formStyle === style.value
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-muted hover:border-muted-foreground/50"
              )}
              onClick={() => settings.setFormStyle(style.value as any)}
            >
              <div className="space-y-3 p-3">
                <div className="text-center">
                  <h4 className="text-sm font-semibold">{style.name}</h4>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </div>
                <div className="origin-center scale-90">
                  <FormPreview
                    style={style.value}
                    isSelected={settings.formStyle === style.value}
                  />
                </div>
              </div>
              {settings.formStyle === style.value && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Live GenericForm canary — the real container component rendering a
        sectioned two-column layout, so the section grouping and colSpan grid
        contracts stay permanently exercised on this page */}
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.formStyle.title")}</CardTitle>
        <CardDescription>{t("settings.formStyle.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GenericForm
          fields={CANARY_FIELDS}
          onSubmit={async () => {}}
          onCancel={() => {}}
        />
      </CardContent>
    </Card>
    </>
  );
}
