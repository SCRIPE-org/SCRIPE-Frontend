"use client";

import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { Clock, Sparkles, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ComingSoonViewProps {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  featuresKeys: Record<string, string>;
  accentColor?: string;
}

export function ComingSoonView({
  icon: Icon,
  titleKey,
  descriptionKey,
  featuresKeys,
  accentColor = "primary",
}: ComingSoonViewProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${accentColor}/10`}>
            <Icon className={`h-5 w-5 text-${accentColor}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t(titleKey)}</h1>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400">
          <Clock className="h-3 w-3" />
          {t("common.comingSoon") || "Coming Soon"}
        </Badge>
      </div>

      {/* Main Card */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10">
              <Icon className="h-10 w-10 text-primary/60" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2">{t(titleKey)}</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            {t(descriptionKey)}
          </p>

          {/* Feature Preview */}
          <div className="grid gap-3 text-start max-w-lg w-full">
            {Object.entries(featuresKeys).map(([key, localeKey]) => (
              <div
                key={key}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
              >
                <Check className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                <span className="text-sm text-foreground/80">{t(localeKey)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
