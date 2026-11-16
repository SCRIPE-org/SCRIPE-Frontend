"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import type { PatScopeOption } from "../../viewmodels/useIntegrationsFederationViewModel";
import {
  classifyPatScopeAccess,
  getLocalizedPatScopeDescription,
  getLocalizedPatScopeName,
  type PatScopeAccessTier,
} from "../../utils/patScopeTaxonomy";
import { Check, Copy, Eye, Info, Lock, ShieldAlert } from "lucide-react";

/** Resolved access tier metadata for a PAT permission scope. */
export interface PatScopeTierMeta {
  tier: PatScopeAccessTier;
  tierLabel: string;
  tierBadgeClass: string;
}

/** Resolves localized access-tier badge label and Nexus semantic border/surface tokens. */
export function getPatScopeTierMeta(
  scope: Pick<PatScopeOption, "action" | "code">,
  t: (key: string, params?: Record<string, string | number>) => string,
  readSurface: "ground" | "surface" = "ground"
): PatScopeTierMeta {
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
        : readSurface === "surface"
          ? "border-nx-line bg-nx-surface text-nx-ink-2"
          : "border-nx-line bg-nx-ground text-nx-ink-2";
  return { tier, tierLabel, tierBadgeClass };
}

/** Resolves a PAT scope code to its rich bilingual catalog metadata or clean fallback. */
export function resolvePatScopeOption(
  code: string,
  catalogByCode: Map<string, PatScopeOption>,
  scopeDetails?: PatScopeOption[]
): PatScopeOption {
  const match =
    scopeDetails?.find((d) => d.code.toLowerCase() === code.toLowerCase()) ??
    catalogByCode.get(code.toLowerCase());
  if (match) return match;
  const mod = code.split(/[.:]/)[0] || "General";
  return {
    code, displayName: code, nameEn: code, nameAr: code, descriptionEn: "", descriptionAr: "",
    moduleKey: mod, category: mod, resource: code, action: code.split(".").pop() || "", isPlatformOnly: false,
  };
}

/** Props for {@link PatScopeInfoInspector}. */
export interface PatScopeInfoInspectorProps {
  scope: PatScopeOption;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  testId?: string;
  inspectorTestId?: string;
  copyTestId?: string;
  triggerClassName?: string;
}

/**
 * Accessible `(i)` trigger & inspector popover: hover previews temporarily;
 * click pins open across mouseleave until outside click, Escape, or re-click.
 */
export function PatScopeInfoInspector({
  scope,
  language,
  t,
  align = "end",
  side = "top",
  testId,
  inspectorTestId,
  copyTestId,
  triggerClassName,
}: PatScopeInfoInspectorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = isPinned || isHovered;
  const isArabic = language.toLowerCase().startsWith("ar");
  const localizedName = getLocalizedPatScopeName(scope, language);
  const localizedDesc = getLocalizedPatScopeDescription(scope, language);
  const { tierLabel, tierBadgeClass } = getPatScopeTierMeta(scope, t);

  const clearHoverCloseTimer = () => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const handlePointerEnterInspector = () => {
    clearHoverCloseTimer();
    setIsHovered(true);
  };

  const handlePointerLeaveInspector = () => {
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = setTimeout(() => {
      hoverCloseTimerRef.current = null;
      setIsHovered(false);
    }, 140);
  };

  useEffect(() => () => {
    clearHoverCloseTimer();
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || triggerRef.current?.contains(target) || contentRef.current?.contains(target)) return;
      clearHoverCloseTimer();
      setIsPinned(false);
      setIsHovered(false);
    };
    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [open]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(scope.code);
      setCopiedCode(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedCode(false), 1600);
    } catch { /* Clipboard API unavailable */ }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) { clearHoverCloseTimer(); setIsPinned(false); setIsHovered(false); }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="icon"
          data-testid={testId ?? `pat-scope-info-btn-${scope.code}`}
          data-pinned={isPinned ? "true" : "false"}
          aria-label={t("profile.integrations.inspectScopeAria", { name: localizedName })}
          onMouseEnter={handlePointerEnterInspector}
          onMouseLeave={handlePointerLeaveInspector}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            clearHoverCloseTimer();
            setIsPinned((prev) => {
              const next = !prev;
              if (!next) setIsHovered(false);
              return next;
            });
          }}
          className={cn(
            "h-6 w-6 rounded-full text-nx-ink-3 hover:text-nx-accent hover:bg-nx-raised shrink-0",
            isPinned && "text-nx-accent bg-nx-accent-wash",
            triggerClassName
          )}
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        side={side}
        align={align}
        dir={isArabic ? "rtl" : "ltr"}
        data-testid={inspectorTestId ?? `pat-scope-inspector-${scope.code}`}
        data-pinned={isPinned ? "true" : "false"}
        onMouseEnter={handlePointerEnterInspector}
        onMouseLeave={handlePointerLeaveInspector}
        onOpenAutoFocus={(e) => { if (!isPinned) e.preventDefault(); }}
        onClick={(e) => e.stopPropagation()}
        className="w-80 p-3.5 space-y-2.5 border-nx-line bg-nx-popover text-nx-ink"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs font-semibold text-nx-ink leading-snug">{localizedName}</p>
            <p className="text-[11px] text-nx-ink-3">{scope.moduleKey} • {scope.category}</p>
          </div>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${tierBadgeClass}`}>{tierLabel}</Badge>
        </div>

        <p className="text-xs text-nx-ink-2 leading-relaxed">
          {localizedDesc || t("profile.integrations.noScopeDescription")}
        </p>

        <div className="pt-2 border-t border-nx-line flex items-center justify-between gap-2">
          <code dir="ltr" className="text-[11px] font-mono text-nx-ink-2 bg-nx-ground px-1.5 py-0.5 rounded border border-nx-line truncate">
            {scope.code}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid={copyTestId ?? `pat-scope-copy-key-${scope.code}`}
            onClick={() => void handleCopyCode()}
            className="h-6 px-2 text-[11px] shrink-0 gap-1"
          >
            {copiedCode ? (
              <><Check className="h-3 w-3 text-success" aria-hidden="true" /><span>{t("profile.common.copied")}</span></>
            ) : (
              <><Copy className="h-3 w-3" aria-hidden="true" /><span>{t("profile.common.copy")}</span></>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Props for PatScopeBadgeWithInspector. */
export interface PatScopeBadgeWithInspectorProps {
  scope: PatScopeOption;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  showCodeInline?: boolean;
}

/**
 * Localized permission scope pill displaying the EN/AR display name with clean border hover
 * styling and an embedded `(i)` inspector trigger for descriptions and copyable technical keys.
 */
export function PatScopeBadgeWithInspector({
  scope,
  language,
  t,
  showCodeInline = false,
}: PatScopeBadgeWithInspectorProps) {
  const { tier, tierBadgeClass } = getPatScopeTierMeta(scope, t, "surface");
  const localizedName = getLocalizedPatScopeName(scope, language);

  return (
    <Badge
      variant="outline"
      data-testid={`pat-scope-pill-${scope.code}`}
      className={cn(
        "h-auto inline-flex items-center gap-1.5 rounded-md border py-0.5 ps-2 pe-1 text-[11px] font-medium transition-colors",
        tierBadgeClass,
        "hover:border-nx-line-hi focus-within:border-nx-line-hi"
      )}
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
        <code dir="ltr" className="text-[10px] font-mono opacity-75 border-s border-current/20 ps-1.5">
          {scope.code}
        </code>
      )}
      <PatScopeInfoInspector
        scope={scope}
        language={language}
        t={t}
        align="start"
        side="top"
        testId={`pat-scope-pill-info-${scope.code}`}
        triggerClassName="h-5 w-5 text-current/70 hover:text-nx-ink hover:bg-nx-raised/80"
      />
    </Badge>
  );
}
