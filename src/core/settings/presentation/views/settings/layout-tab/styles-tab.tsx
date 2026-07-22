"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

// ────────────────────────────────────────────
// Styles Sub-Tab
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
      {/* ── Dual Layout Options ── */}
      {settings.layoutTemplate === "dual" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.dualLayout.title")}</CardTitle>
            <CardDescription>{t("settings.dualLayout.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t("settings.dualLayout.showPanel")}</label>
                <p className="text-xs text-muted-foreground">
                  {t("settings.dualLayout.showPanelDesc")}
                </p>
              </div>
              <Switch
                checked={settings.showDetailPanel}
                onCheckedChange={settings.setShowDetailPanel}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Header Styles ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.headerStyle.title")}</CardTitle>
          <CardDescription>{t("settings.headerStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {(["default", "compact", "elevated", "transparent"] as const).map((style) => (
              <div
                key={style}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  settings.headerStyle === style
                    ? "border-primary bg-primary/[0.03] ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                )}
                onClick={() => settings.setHeaderStyle(style)}
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    {t(`settings.headerStyle.options.${style}.name`)}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t(`settings.headerStyle.options.${style}.description`)}
                  </p>
                  <div
                    className={cn(
                      "h-8 rounded-md bg-muted transition-all",
                      style === "compact" && "h-6",
                      style === "elevated" && "shadow-md",
                      style === "transparent" && "border border-muted bg-transparent"
                    )}
                  />
                </div>
                {settings.headerStyle === style && (
                  <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-lg">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Sidebar Styles ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.sidebarStyle.title")}</CardTitle>
          <CardDescription>{t("settings.sidebarStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {(["default", "compact", "floating", "minimal"] as const).map((style) => (
              <div
                key={style}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  settings.sidebarStyle === style
                    ? "border-primary bg-primary/[0.03] ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                )}
                onClick={() => settings.setSidebarStyle(style)}
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    {t(`settings.sidebarStyle.options.${style}.name`)}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t(`settings.sidebarStyle.options.${style}.description`)}
                  </p>
                  <div className="flex gap-1">
                    <div
                      className={cn(
                        "h-8 rounded bg-muted",
                        style === "compact" && "w-8",
                        style === "floating" && "w-12 rounded-lg shadow-md",
                        style === "minimal" && "w-10 border border-muted bg-transparent",
                        style === "default" && "w-12"
                      )}
                    />
                    <div className="h-8 flex-1 rounded bg-muted/50" />
                  </div>
                </div>
                {settings.sidebarStyle === style && (
                  <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-lg">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Card Styles ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.cardStyle.title")}</CardTitle>
          <CardDescription>{t("settings.cardStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {cardStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  settings.cardStyle === style.value
                    ? "border-primary bg-primary/[0.03] ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                )}
                onClick={() => settings.setCardStyle(style.value as any)}
              >
                <div className="space-y-3">
                  <div className={cn("h-12 rounded-md p-2", style.class)}>
                    <div className="mb-1 h-2 rounded bg-current opacity-20" />
                    <div className="h-2 w-2/3 rounded bg-current opacity-20" />
                  </div>
                  <p className="text-center text-sm font-medium">{style.name}</p>
                </div>
                {settings.cardStyle === style.value && (
                  <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-lg">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
