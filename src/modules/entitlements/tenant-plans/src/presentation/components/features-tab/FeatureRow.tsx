/**
 * FeatureRow — A single feature row in the interactive editor.
 *
 * Shows feature name, key, valueType badge, control input, and remove button.
 * Highlights modified/newly added rows.
 */
"use client";

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
 * React presentation component representing the feature row UI element.
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
  const displayName = language === "ar" ? definition.displayNameAr : definition.displayNameEn;

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{displayName}</span>
          <Badge variant="outline" className="text-[10px]">
            {definition.valueType}
          </Badge>
          {isNew && (
            <Badge
              variant="default"
              className="h-4 border-green-200 bg-green-100 text-[10px] text-green-700"
            >
              {t("common.new") || "New"}
            </Badge>
          )}
          {isModified && !isNew && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
              title={t("common.modified") || "Modified"}
            />
          )}
        </div>
        <p className="font-mono text-xs text-muted-foreground">{definition.key}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <FeatureControl valueType={definition.valueType} value={value} onChange={onValueChange} />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          title={t("common.remove") || "Remove"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
