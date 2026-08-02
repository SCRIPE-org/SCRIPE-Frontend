/**
 * FeatureDefinitionPageHeader — Title + description for the Feature Catalog page.
 *
 * A thin wrapper around the shared `PageHeader` primitive rather than a
 * second hand-rolled header — this and the list view's own header were the
 * two places the same title/description/badge anatomy got reinvented.
 */
"use client";

import { PageHeader } from "@core/ui/page-header";
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
    <PageHeader
      icon={Zap}
      title={t("entitlements.featureDefinitions.title")}
      badges={
        <Badge variant="outline" className="text-xs">
          {t("entitlements.featureDefinitions.tier2Badge")}
        </Badge>
      }
      description={t("entitlements.featureDefinitions.description")}
    />
  );
}
