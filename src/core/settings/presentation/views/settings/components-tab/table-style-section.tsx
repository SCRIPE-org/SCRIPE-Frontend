"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check } from "lucide-react";
import { cn } from "@core/common/utils";

// Table preview — the real generic-table structure in miniature: the
// attribute on the root, the frame as the first `> div` hop. The SAME
// [data-table-style] CSS in globals.css styles this preview, so it can never
// drift from the tables it advertises. The three per-variant class maps that
// used to hand-paint twelve skins here are gone with them.
function TablePreview({ style, t }: { style: string; t: (key: string) => string }) {
  const sampleData = [
    { id: "1", name: t("settings.sampleTable.data.john"), role: "admin", status: "active" },
    { id: "2", name: t("settings.sampleTable.data.jane"), role: "user", status: "pending" },
    { id: "3", name: t("settings.sampleTable.data.bob"), role: "editor", status: "inactive" },
  ];

  return (
    <div data-table-style={style} className="w-full">
      <div className="w-full overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-nx-line-hi bg-nx-hover text-nx-ink-2">
              <th className="px-3 py-2.5 text-start font-semibold">
                {t("settings.sampleTable.name")}
              </th>
              <th className="px-3 py-2.5 text-start font-semibold">
                {t("settings.sampleTable.role")}
              </th>
              <th className="px-3 py-2.5 text-start font-semibold">
                {t("settings.sampleTable.status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row) => (
              <tr key={row.id} className="border-b border-nx-line last:border-0">
                <td className="px-3 py-2.5 font-medium text-nx-ink">{row.name}</td>
                <td className="px-3 py-2.5 text-nx-ink-3">
                  {t(`settings.sampleTable.roles.${row.role}`)}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      row.status === "active" && "bg-success/15 text-success",
                      row.status === "pending" && "bg-warning/15 text-warning",
                      row.status === "inactive" && "bg-destructive/15 text-destructive"
                    )}
                  >
                    {t(`settings.sampleTable.${row.status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TableStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  // The five survivors. The seven retired skins still render — globals.css
  // aliases each to its nearest survivor — they just stop being offered.
  const tableStyles = [
    {
      value: "default",
      name: t("settings.tableStyle.options.default.title"),
      description: t("settings.tableStyle.options.default.description"),
    },
    {
      value: "striped",
      name: t("settings.tableStyle.options.striped.title"),
      description: t("settings.tableStyle.options.striped.description"),
    },
    {
      value: "bordered",
      name: t("settings.tableStyle.options.bordered.title"),
      description: t("settings.tableStyle.options.bordered.description"),
    },
    {
      value: "minimal",
      name: t("settings.tableStyle.options.minimal.title"),
      description: t("settings.tableStyle.options.minimal.description"),
    },
    {
      // No tableStyle.options.compact key exists and locales are frozen this
      // wave, so the card reuses the spacing option's "Compact" and the form
      // style's "Tighter spacing" line — both say exactly what this skin does.
      value: "compact",
      name: t("settings.spacing.options.compact"),
      description: t("settings.formStyle.options.compact.description"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <div className="grid h-4 w-4 grid-cols-3 gap-0.5">
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-[1px]",
                    i < 3 ? "bg-primary/60" : i < 6 ? "bg-primary/40" : "bg-primary/30"
                  )}
                />
              ))}
            </div>
          </div>
          {t("settings.tableStyle.title")}
        </CardTitle>
        <CardDescription>{t("settings.tableStyle.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tableStyles.map((style) => (
            // role="button" card: the preview embeds a real <table>, which
            // must not nest inside a native button element.
            <div
              key={style.value}
              role="button"
              tabIndex={0}
              aria-pressed={settings.tableStyle === style.value}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 p-4 transition-transform duration-nx-micro hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:shadow-nx-focus",
                settings.tableStyle === style.value
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-muted hover:border-muted-foreground/50"
              )}
              onClick={() => settings.setTableStyle(style.value as any)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  settings.setTableStyle(style.value as any);
                }
              }}
            >
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </div>
                <div className="w-full origin-center scale-90">
                  <TablePreview style={style.value} t={t} />
                </div>
              </div>
              {settings.tableStyle === style.value && (
                <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
