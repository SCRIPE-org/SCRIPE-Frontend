"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

// ────────────────────────────────────────────
// Styles Sub-Tab
//
// Wave C: the header-style and sidebar-style pickers were removed with their
// culled fields — no CSS selector or live component ever read them; the
// merge-engine migration drops any stored copies.
//
// Wave G: the dual-layout detail-panel toggle was dropped with the layout
// picker — the "dual" shell no longer exists (the product collapsed to the
// single nexus shell), so its gate could never fire. Card style is now the
// sole live style control here.
// ────────────────────────────────────────────
export function StylesTab() {
  const { t } = useI18n();
  const settings = useSettings();

  const cardStyles = [
    { value: "default", name: t("cardStyle.default"), class: "border bg-card" },
    {
      value: "glass",
      name: t("cardStyle.glass"),
      class: "bg-white/10 backdrop-blur border border-white/20",
    },
    { value: "solid", name: t("cardStyle.solid"), class: "bg-muted border-0" },
    { value: "bordered", name: t("cardStyle.bordered"), class: "border-2 bg-card" },
    {
      value: "elevated",
      name: t("settings.cardStyleOptions.elevated"),
      class: "shadow-lg bg-card border-0",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Card Styles ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.cardStyle.title")}</CardTitle>
          <CardDescription>{t("settings.cardStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {cardStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-4 text-start transition-transform duration-nx-micro hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:shadow-nx-focus",
                  settings.cardStyle === style.value
                    ? "border-primary bg-primary/[0.03] ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                )}
                onClick={() => settings.setCardStyle(style.value as any)}
              >
                <div className="w-full space-y-3">
                  <div className={cn("h-12 rounded-md p-2", style.class)}>
                    <div className="mb-1 h-2 rounded bg-current opacity-20" />
                    <div className="h-2 w-2/3 rounded bg-current opacity-20" />
                  </div>
                  <p className="text-center text-sm font-medium">{style.name}</p>
                </div>
                {settings.cardStyle === style.value && (
                  <div className="absolute -end-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-lg">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
