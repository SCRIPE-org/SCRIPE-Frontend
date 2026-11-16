"use client";

import { useState } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@core/ui/hover-card";
import type { PatScopeOption } from "../../viewmodels/useIntegrationsFederationViewModel";
import {
  classifyPatScopeAccess,
  getLocalizedPatScopeDescription,
  getLocalizedPatScopeName,
} from "../../utils/patScopeTaxonomy";
import { Check, Copy, Lock, ShieldAlert, Eye } from "lucide-react";

/** Props for PatScopeBadgeWithInspector. */
export interface PatScopeBadgeWithInspectorProps {
  scope: PatScopeOption;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  showCodeInline?: boolean;
}

/**
 * Localized permission scope pill displaying the EN/AR display name while surfacing
 * the description, module taxonomy, and copyable technical key on hover or focus.
 */
export function PatScopeBadgeWithInspector({
  scope,
  language,
  t,
  showCodeInline = false,
}: PatScopeBadgeWithInspectorProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const tier = classifyPatScopeAccess(scope.action || scope.code);
  const localizedName = getLocalizedPatScopeName(scope, language);
  const localizedDesc = getLocalizedPatScopeDescription(scope, language);

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
        : "border-nx-line bg-nx-surface text-nx-ink-2";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(scope.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <HoverCard openDelay={140} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid={`pat-scope-pill-${scope.code}`}
          className={`h-auto inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors hover:border-nx-line-hi ${tierBadgeClass}`}
        >
          {tier === "read" ? (
            <Eye className="h-3 w-3 shrink-0 opacity-75" aria-hidden="true" />
          ) : tier === "sensitive" ? (
            <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
          ) : (
            <Lock className="h-3 w-3 shrink-0 opacity-80" aria-hidden="true" />
          )}
          <span className="truncate max-w-[220px]">{localizedName}</span>
          {showCodeInline && (
            <code
              dir="ltr"
              className="text-[10px] font-mono opacity-75 border-s border-current/20 ps-1.5"
            >
              {scope.code}
            </code>
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="w-80 p-3.5 space-y-2.5 bg-nx-surface border-nx-line">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs font-semibold text-nx-ink leading-snug">{localizedName}</p>
            <p className="text-[11px] text-nx-ink-3">
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

        <div className="pt-1.5 border-t border-nx-line flex items-center justify-between gap-2">
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
            onClick={() => void handleCopyCode()}
            className="h-6 px-2 text-[11px] shrink-0 gap-1"
          >
            {copiedCode ? (
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
      </HoverCardContent>
    </HoverCard>
  );
}
