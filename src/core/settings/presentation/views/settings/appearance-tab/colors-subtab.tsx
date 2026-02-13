"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { ColorTheme, SecondaryColorTheme } from "@core/providers/settings-provider";

const COLOR_LIST: { value: ColorTheme; color: string; accent: string }[] = [
      { value: "purple", color: "bg-purple-500", accent: "bg-purple-100" },
      { value: "blue", color: "bg-blue-500", accent: "bg-blue-100" },
      { value: "green", color: "bg-green-500", accent: "bg-green-100" },
      { value: "orange", color: "bg-orange-500", accent: "bg-orange-100" },
      { value: "red", color: "bg-red-500", accent: "bg-red-100" },
      { value: "teal", color: "bg-teal-500", accent: "bg-teal-100" },
      { value: "pink", color: "bg-pink-500", accent: "bg-pink-100" },
      { value: "indigo", color: "bg-indigo-500", accent: "bg-indigo-100" },
      { value: "cyan", color: "bg-cyan-500", accent: "bg-cyan-100" },
      { value: "amber", color: "bg-amber-500", accent: "bg-amber-100" },
      { value: "yellow", color: "bg-yellow-400", accent: "bg-yellow-100" },
      { value: "lime", color: "bg-lime-500", accent: "bg-lime-100" },
      { value: "emerald", color: "bg-emerald-500", accent: "bg-emerald-100" },
      { value: "sky", color: "bg-sky-500", accent: "bg-sky-100" },
      { value: "violet", color: "bg-violet-500", accent: "bg-violet-100" },
      { value: "fuchsia", color: "bg-fuchsia-500", accent: "bg-fuchsia-100" },
      { value: "rose", color: "bg-rose-500", accent: "bg-rose-100" },
      { value: "slate", color: "bg-slate-500", accent: "bg-slate-100" },
      { value: "zinc", color: "bg-zinc-500", accent: "bg-zinc-100" },
      { value: "stone", color: "bg-stone-500", accent: "bg-stone-100" },
      { value: "gold", color: "bg-yellow-500", accent: "bg-yellow-200" },
      { value: "coral", color: "bg-orange-400", accent: "bg-orange-100" },
];

function ColorGrid({
      title,
      description,
      colors,
      selected,
      onSelect,
      t,
}: {
      title: string;
      description: string;
      colors: typeof COLOR_LIST;
      selected: string;
      onSelect: (v: string) => void;
      t: (key: string) => string;
}) {
      return (
            <Card>
                  <CardHeader>
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3">
                              {colors.map((c) => (
                                    <button
                                          key={c.value}
                                          className={cn(
                                                "flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all hover:scale-105",
                                                selected === c.value
                                                      ? "border-primary bg-primary/5 shadow-md"
                                                      : "border-transparent hover:border-muted-foreground/20"
                                          )}
                                          onClick={() => onSelect(c.value)}
                                    >
                                          <div
                                                className={cn(
                                                      "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                                                      c.color
                                                )}
                                          >
                                                {selected === c.value && (
                                                      <Check className="w-4 h-4 text-white" />
                                                )}
                                          </div>
                                          <span className="text-[10px] font-medium text-muted-foreground truncate max-w-full">
                                                {t(`settings.colors.${c.value}`)}
                                          </span>
                                    </button>
                              ))}
                        </div>
                  </CardContent>
            </Card>
      );
}

export function ColorsSubtab() {
      const { t } = useI18n();
      const settings = useSettings();

      return (
            <div className="space-y-6">
                  <ColorGrid
                        title={t("settings.appearanceSettings.primaryColor")}
                        description={t("settings.appearanceSettings.primaryColorDesc")}
                        colors={COLOR_LIST}
                        selected={settings.colorTheme}
                        onSelect={(v) => settings.setColorTheme(v as ColorTheme)}
                        t={t}
                  />
                  <ColorGrid
                        title={t("settings.appearanceSettings.secondaryColor")}
                        description={t("settings.appearanceSettings.secondaryColorDesc")}
                        colors={COLOR_LIST}
                        selected={settings.secondaryColorTheme}
                        onSelect={(v) => settings.setSecondaryColorTheme(v as SecondaryColorTheme)}
                        t={t}
                  />
            </div>
      );
}
