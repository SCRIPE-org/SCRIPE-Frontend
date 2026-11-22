"use client";

import { useId } from "react";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import type { PatScopeOption } from "../../viewmodels/useIntegrationsFederationViewModel";
import {
  getLocalizedPatScopeDescription,
  getLocalizedPatScopeName,
} from "../../utils/patScopeTaxonomy";
import { PatScopeInfoInspector, getPatScopeTierMeta } from "./PatScopeBadgeWithInspector";

/** Props for PatPermissionRow. */
export interface PatPermissionRowProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  scope: PatScopeOption;
  selected: boolean;
  showTechnicalKeys: boolean;
  onToggle: () => void;
}

/**
 * Interactive permission scope row rendering the localized bilingual EN/AR name,
 * always-visible 1-line description, optional technical key chip, and an `(i)`
 * inspector button (hover preview + click-to-pin with 1-click key copy).
 */
export function PatPermissionRow({
  t,
  language,
  scope,
  selected,
  showTechnicalKeys,
  onToggle,
}: PatPermissionRowProps) {
  const checkboxId = useId();
  const localizedName = getLocalizedPatScopeName(scope, language);
  const localizedDesc = getLocalizedPatScopeDescription(scope, language);
  const { tierLabel, tierBadgeClass } = getPatScopeTierMeta(scope, t);

  return (
    <div
      data-testid={`pat-scope-row-${scope.code}`}
      className={
        selected
          ? "rounded-xl border border-nx-accent/50 bg-nx-accent-wash/25 hover:border-nx-line-hi focus-within:border-nx-line-hi px-3.5 py-2.5 flex items-start gap-3 transition-colors"
          : "rounded-xl border border-nx-line bg-nx-surface hover:border-nx-line-hi focus-within:border-nx-line-hi px-3.5 py-2.5 flex items-start gap-3 transition-colors"
      }
    >
      <Checkbox
        id={checkboxId}
        data-testid={`pat-scope-checkbox-${scope.code}`}
        checked={selected}
        onCheckedChange={onToggle}
        aria-label={localizedName}
        className="mt-0.5 shrink-0"
      />

      <Label
        htmlFor={checkboxId}
        className="block flex-1 min-w-0 text-start space-y-1 cursor-pointer font-normal leading-normal text-nx-ink"
      >
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-semibold text-nx-ink leading-snug">
            {localizedName}
          </span>
          <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${tierBadgeClass}`}>
            {tierLabel}
          </Badge>
          {scope.isPlatformOnly && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1.5 border-nx-accent/35 text-nx-accent"
            >
              {t("profile.integrations.platformScopeBadge")}
            </Badge>
          )}
          {showTechnicalKeys && (
            <code
              dir="ltr"
              className="text-[11px] font-mono text-nx-ink-3 bg-nx-ground border border-nx-line rounded px-1.5 py-0.5"
            >
              {scope.code}
            </code>
          )}
        </span>
        {localizedDesc && (
          <span className="block text-xs text-nx-ink-2 line-clamp-2 leading-relaxed">
            {localizedDesc}
          </span>
        )}
      </Label>

      <PatScopeInfoInspector
        scope={scope}
        language={language}
        t={t}
        align="end"
        side="top"
        testId={`pat-scope-info-btn-${scope.code}`}
      />
    </div>
  );
}
