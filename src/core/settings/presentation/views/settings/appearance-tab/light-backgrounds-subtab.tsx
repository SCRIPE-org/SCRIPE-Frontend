"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Check } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { LightBackgroundTheme } from "@core/providers/settings-provider";

const LIGHT_BACKGROUNDS: {
  value: LightBackgroundTheme;
  gradient: string;
  category: "bright" | "tinted" | "warm" | "mid";
}[] = [
  // Bright (near-white)
  { value: "default", gradient: "bg-gradient-to-br from-white to-gray-50", category: "bright" },
  { value: "snow", gradient: "bg-gradient-to-br from-white to-slate-50", category: "bright" },
  { value: "pearl", gradient: "bg-gradient-to-br from-slate-50 to-gray-100", category: "bright" },
  { value: "cloud", gradient: "bg-gradient-to-br from-indigo-50 to-blue-50", category: "bright" },
  // Tinted (subtle color wash)
  { value: "sky", gradient: "bg-gradient-to-br from-sky-50 to-blue-50", category: "tinted" },
  { value: "mint", gradient: "bg-gradient-to-br from-green-50 to-emerald-50", category: "tinted" },
  {
    value: "lavender",
    gradient: "bg-gradient-to-br from-purple-50 to-indigo-50",
    category: "tinted",
  },
  { value: "rose", gradient: "bg-gradient-to-br from-rose-50 to-pink-50", category: "tinted" },
  { value: "ice", gradient: "bg-gradient-to-br from-cyan-50 to-sky-50", category: "tinted" },
  // Warm (warm undertones)
  { value: "cream", gradient: "bg-gradient-to-br from-yellow-50 to-orange-50", category: "warm" },
  { value: "sand", gradient: "bg-gradient-to-br from-amber-50 to-yellow-50", category: "warm" },
  { value: "linen", gradient: "bg-gradient-to-br from-orange-50 to-amber-50", category: "warm" },
  { value: "warm", gradient: "bg-gradient-to-br from-orange-50 to-red-50", category: "warm" },
  // Mid-light (noticeable tint)
  { value: "cool", gradient: "bg-gradient-to-br from-blue-50 to-cyan-50", category: "mid" },
  { value: "neutral", gradient: "bg-gradient-to-br from-gray-50 to-slate-50", category: "mid" },
  { value: "soft", gradient: "bg-gradient-to-br from-pink-50 to-purple-50", category: "mid" },
];

const CATEGORY_LABELS: Record<string, string> = {
  bright: "settings.lightBgCategories.bright",
  tinted: "settings.lightBgCategories.tinted",
  warm: "settings.lightBgCategories.warm",
  mid: "settings.lightBgCategories.mid",
};

export function LightBackgroundsSubtab() {
  const { t } = useI18n();
  const settings = useSettings();

  const categories = ["bright", "tinted", "warm", "mid"] as const;

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const items = LIGHT_BACKGROUNDS.filter((b) => b.category === cat);
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
                      settings.lightBackgroundTheme === bg.value
                        ? "border-primary shadow-md ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/20"
                    )}
                    onClick={() => settings.setLightBackgroundTheme(bg.value)}
                  >
                    <div
                      className={cn(
                        "relative h-12 w-full rounded-lg border border-gray-200/60",
                        bg.gradient
                      )}
                    >
                      {settings.lightBackgroundTheme === bg.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {t(`settings.lightBg.${bg.value}`)}
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
