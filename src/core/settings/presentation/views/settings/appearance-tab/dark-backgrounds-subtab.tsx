"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { DarkBackgroundTheme } from "@core/providers/settings-provider";

const DARK_BACKGROUNDS: {
  value: DarkBackgroundTheme;
  gradient: string;
  category: "mid" | "dark" | "deep" | "abyss";
}[] = [
  // Mid-dark (lighter darks)
  { value: "graphite", gradient: "bg-gradient-to-br from-zinc-800 to-zinc-700", category: "mid" },
  {
    value: "charcoal",
    gradient: "bg-gradient-to-br from-neutral-900 to-neutral-800",
    category: "mid",
  },
  { value: "slate", gradient: "bg-gradient-to-br from-slate-900 to-slate-800", category: "mid" },
  // Dark (colored darks)
  { value: "navy", gradient: "bg-gradient-to-br from-blue-950 to-sky-950", category: "dark" },
  {
    value: "forest",
    gradient: "bg-gradient-to-br from-green-950 to-emerald-950",
    category: "dark",
  },
  { value: "ocean", gradient: "bg-gradient-to-br from-blue-950 to-cyan-950", category: "dark" },
  {
    value: "purple-dark",
    gradient: "bg-gradient-to-br from-purple-950 to-indigo-950",
    category: "dark",
  },
  { value: "crimson", gradient: "bg-gradient-to-br from-red-950 to-rose-950", category: "dark" },
  {
    value: "warm-dark",
    gradient: "bg-gradient-to-br from-orange-950 to-red-950",
    category: "dark",
  },
  { value: "volcanic", gradient: "bg-gradient-to-br from-red-950 to-orange-950", category: "dark" },
  // Deep (very dark)
  { value: "default", gradient: "bg-gradient-to-br from-gray-900 to-gray-800", category: "deep" },
  {
    value: "midnight",
    gradient: "bg-gradient-to-br from-blue-950 to-indigo-950",
    category: "deep",
  },
  {
    value: "obsidian",
    gradient: "bg-gradient-to-br from-violet-950 to-purple-950",
    category: "deep",
  },
  // Abyss (near-black to pure black)
  { value: "darker", gradient: "bg-gradient-to-br from-gray-950 to-gray-900", category: "abyss" },
  { value: "onyx", gradient: "bg-gradient-to-br from-black to-neutral-950", category: "abyss" },
  { value: "pitch", gradient: "bg-gradient-to-br from-black to-gray-950", category: "abyss" },
];

const CATEGORY_LABELS: Record<string, string> = {
  mid: "settings.darkBgCategories.mid",
  dark: "settings.darkBgCategories.dark",
  deep: "settings.darkBgCategories.deep",
  abyss: "settings.darkBgCategories.abyss",
};

export function DarkBackgroundsSubtab() {
  const { t } = useI18n();
  const settings = useSettings();

  const categories = ["mid", "dark", "deep", "abyss"] as const;

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const items = DARK_BACKGROUNDS.filter((b) => b.category === cat);
        return (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="text-base">{t(CATEGORY_LABELS[cat])}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((bg) => (
                  <button
                    key={bg.value}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all hover:scale-[1.03]",
                      settings.darkBackgroundTheme === bg.value
                        ? "border-primary shadow-md ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/20"
                    )}
                    onClick={() => settings.setDarkBackgroundTheme(bg.value)}
                  >
                    <div
                      className={cn(
                        "relative h-12 w-full rounded-lg border border-gray-700/40",
                        bg.gradient
                      )}
                    >
                      {settings.darkBackgroundTheme === bg.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {t(
                        `settings.darkBg.${bg.value === "purple-dark" ? "purpleDark" : bg.value === "warm-dark" ? "warmDark" : bg.value}`
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
