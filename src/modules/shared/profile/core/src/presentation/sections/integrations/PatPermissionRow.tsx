"use client";

import { useState } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@core/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import type { PatScopeOption } from "../../viewmodels/useIntegrationsFederationViewModel";
import {
  classifyPatScopeAccess,
  getLocalizedPatScopeDescription,
  getLocalizedPatScopeName,
} from "../../utils/patScopeTaxonomy";
import { Check, Copy, Info } from "lucide-react";

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
 * always-visible 1-line description (touch-friendly), optional technical key chip,
 * and hover/click inspector card with 1-click key copy.
 */
export function PatPermissionRow({
  t,
  language,
  scope,
  selected,
  showTechnicalKeys,
  onToggle,
}: PatPermissionRowProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const localizedName = getLocalizedPatScopeName(scope, language);
  const localizedDesc = getLocalizedPatScopeDescription(scope, language);
  const tier = classifyPatScopeAccess(scope.action || scope.code);

  const tierLabel =
    tier === "read"
      ? t("profile.integrations.tierReadOnly")
      : tier === "sensitive"
        ? t("profile.integrations.tierSensitive")
        : t("profile.integrations.tierWrite");

  const tierBadgeClass =
    tier === "sensitive"
      ? "border-destructive/35 bg-destructive/10 text-destructive"
      : tier === "write"
        ? "border-warning-strong/35 bg-warning/10 text-warning-strong"
        : "border-nx-line bg-nx-ground text-nx-ink-2";

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(scope.code);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1600);
    } catch {
      // Clipboard API unavailable
    }
  };

  const inspectorBody = (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-nx-ink leading-snug">{localizedName}</p>
          <p className="text-[11px] text-nx-ink-3 mt-0.5">
            {scope.moduleKey} • {scope.category}
          </p>
        </div>
        <Badge variant="outline" className={`text-[10px] shrink-0 ${tierBadgeClass}`}>
          {tierLabel}
        </Badge>
      </div>
      <p className="text-xs text-nx-ink-2 leading-relaxed">
        {localizedDesc || t("profile.integrations.noScopeDescription")}
      </p>
      <div className="pt-2 border-t border-nx-line flex items-center justify-between gap-2">
        <code
          dir="ltr"
          className="text-[11px] font-mono text-nx-ink-2 bg-nx-ground px-1.5 py-0.5 rounded border border-nx-line truncate"
        >
          {scope.code}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void handleCopyKey()}
          className="h-6 px-2 text-[11px] shrink-0 gap-1"
        >
          {copiedKey ? (
            <>
              <Check className="h-3 w-3 text-success" aria-hidden="true" />
              <span>{t("profile.common.copied")}</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden="true" />
              <span>{t("profile.common.copy")}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div
      data-testid={`pat-scope-row-${scope.code}`}
      className={
        selected
          ? "rounded-xl border border-nx-accent/50 bg-nx-accent-wash/25 px-3.5 py-2.5 flex items-start gap-3 transition-colors"
          : "rounded-xl border border-nx-line bg-nx-surface hover:border-nx-line-hi px-3.5 py-2.5 flex items-start gap-3 transition-colors"
      }
    >
      <Checkbox
        data-testid={`pat-scope-checkbox-${scope.code}`}
        checked={selected}
        onCheckedChange={onToggle}
        aria-label={localizedName}
        className="mt-0.5 shrink-0"
      />

      <HoverCard openDelay={180} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div
            onClick={onToggle}
            className="flex-1 min-w-0 text-start space-y-1 cursor-pointer"
          >
            <div className="flex flex-wrap items-center gap-1.5">
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
            </div>
            {localizedDesc && (
              <p className="text-xs text-nx-ink-2 line-clamp-2 leading-relaxed">{localizedDesc}</p>
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          align="start"
          className="w-80 p-3.5 bg-nx-surface border-nx-line"
        >
          {inspectorBody}
        </HoverCardContent>
      </HoverCard>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t("profile.integrations.inspectScopeAria", { name: localizedName })}
            className="h-7 w-7 p-0 shrink-0 text-nx-ink-3 hover:text-nx-ink"
          >
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-80 p-3.5 bg-nx-surface border-nx-line"
        >
          {inspectorBody}
        </PopoverContent>
      </Popover>
    </div>
  );
}
