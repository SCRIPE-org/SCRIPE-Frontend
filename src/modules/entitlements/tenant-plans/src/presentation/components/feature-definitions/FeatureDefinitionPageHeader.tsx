/**
 * FeatureDefinitionPageHeader — Title + description for the Feature Catalog page.
 */
"use client";

import { Badge } from "@core/ui/badge";
import { Zap } from "lucide-react";

interface FeatureDefinitionPageHeaderProps {
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the feature definition page header.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function FeatureDefinitionPageHeader({ t }: FeatureDefinitionPageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Zap className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("entitlements.featureDefinitions.title") || "Feature Catalog"}
          </h1>
          <Badge variant="outline" className="text-xs">
            {t("entitlements.featureDefinitions.tier2Badge") || "Tier 2"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("entitlements.featureDefinitions.description") ||
            "Define reusable features that can be assigned to your plans."}
        </p>
      </div>
    </div>
  );
}
