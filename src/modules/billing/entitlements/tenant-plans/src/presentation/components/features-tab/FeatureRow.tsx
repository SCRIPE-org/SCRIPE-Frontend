/**
 * FeatureRow — A single feature row in the interactive editor.
 *
 * Shows feature name, key, valueType badge, control input, and remove button.
 * Highlights modified/newly added rows.
 */
"use client";

import { resolveBilingualLabel } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Trash2 } from "lucide-react";
import type { TenantFeatureDefinition } from "../../../domain/entities/TenantPlan";
import { FeatureControl } from "./FeatureControl";

interface FeatureRowProps {
  definition: TenantFeatureDefinition;
  value: string;
  isModified: boolean;
  isNew: boolean;
  onValueChange: (value: string) => void;
  onRemove: () => void;
  language: string;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the feature row.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function FeatureRow({
  definition,
  value,
  isModified,
  isNew,
  onValueChange,
  onRemove,
  language,
  t,
}: FeatureRowProps) {
  const displayName = resolveBilingualLabel(definition.displayNameEn, definition.displayNameAr, language);
  const labelId = `feature-row-${definition.id}`;

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span id={labelId} className="text-sm font-medium">
            {displayName}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {definition.valueType}
          </Badge>
          {isNew && (
            <Badge variant="success" className="h-4 text-[10px]">
              {t("common.new")}
            </Badge>
          )}
          {isModified && !isNew && (
            <span
              role="img"
              aria-label={t("common.modified")}
              className="inline-block h-1.5 w-1.5 rounded-full bg-nx-warning"
            />
          )}
        </div>
        <p className="font-mono text-xs text-nx-ink-3">{definition.key}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <FeatureControl
          valueType={definition.valueType}
          value={value}
          onChange={onValueChange}
          labelledBy={labelId}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-nx-ink-2 hover:text-nx-danger"
          onClick={onRemove}
          aria-label={t("common.remove")}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
