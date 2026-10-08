/**
 * CatalogFeatureCard Component
 *
 * Renders an individual feature entitlement card in the admin feature catalog.
 * Displays category and module badges, value type variants, display names,
 * descriptions, default values, inline marketing toggle, and edit/delete actions.
 */
"use client";

import { Edit3, Trash2 } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import type { Feature, FeatureValueType } from "../../domain/entities/Feature";

/** Visual variant mapping for feature value types. */
export const VALUE_TYPE_VARIANTS: Record<FeatureValueType, "default" | "secondary" | "outline"> = {
  Boolean: "default",
  Numeric: "secondary",
  String: "outline",
};

/**
 * Properties for the CatalogFeatureCard component.
 */
export interface CatalogFeatureCardProps {
  /** The feature entity model to display. */
  feature: Feature;
  /** Whether the current operator possesses permission to update features. */
  canUpdate: boolean;
  /** Whether the current operator possesses permission to delete features. */
  canDelete: boolean;
  /** Whether an update mutation is currently running. */
  isUpdating: boolean;
  /** Active UI locale language code. */
  language: string;
  /** Localization dictionary lookup function. */
  t: (key: string) => string;
  /** Callback fired when the edit button is clicked. */
  onEdit: () => void;
  /** Callback fired when the delete button is clicked. */
  onDelete: () => void;
  /** Callback fired when the marketing-only switch is toggled. */
  onMarketingToggle: (checked: boolean) => void;
}

/**
 * Renders a single feature summary card inside the catalog grid.
 */
export function CatalogFeatureCard({
  feature,
  canUpdate,
  canDelete,
  isUpdating,
  language,
  t,
  onEdit,
  onDelete,
  onMarketingToggle,
}: CatalogFeatureCardProps) {
  return (
    <Card className="flex min-h-44 flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{feature.module}</Badge>
            <Badge variant={VALUE_TYPE_VARIANTS[feature.valueType]}>
              {t(`entitlements.features.${feature.valueType.toLowerCase()}`)}
            </Badge>
            {feature.isSystem && (
              <Badge variant="outline">{t("entitlements.features.systemBadge")}</Badge>
            )}
          </div>
          <h2
            className="truncate font-semibold text-nx-ink"
            title={feature.getDisplayName(language)}
          >
            {feature.getDisplayName(language)}
          </h2>
          <p className="mt-1 truncate font-mono text-xs text-nx-ink-2" title={feature.name}>
            {feature.name}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {canUpdate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              aria-label={`${t("entitlements.features.edit")}: ${feature.getDisplayName(language)}`}
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          {canDelete && !feature.isSystem && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label={`${t("entitlements.features.deleteConfirmTitle")}: ${feature.getDisplayName(language)}`}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-5 text-nx-ink-2">
        {feature.description || t("entitlements.features.noDescription")}
      </p>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-nx-line pt-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("entitlements.features.defaultValue")}
          </p>
          <p
            className="truncate font-mono text-sm font-medium text-nx-ink"
            title={feature.defaultValue}
          >
            {feature.defaultValue || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-nx-ink-3">{t("entitlements.features.marketingOnly")}</span>
          <Switch
            checked={feature.isMarketingOnly}
            onCheckedChange={onMarketingToggle}
            disabled={!canUpdate}
            busy={isUpdating}
            aria-label={`${t("entitlements.features.marketingOnly")}: ${feature.getDisplayName(language)}`}
          />
        </div>
      </div>
    </Card>
  );
}
